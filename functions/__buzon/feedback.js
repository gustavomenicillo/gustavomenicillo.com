// Buzón de feedback sin la Mac (diseño de Ariel del 8/11, con las decisiones de Seguridad).
// GET /__buzon/feedback?desde=<ISO>&cursor=<cursor> devuelve el feedback del staging en solo lectura, para el
// workflow buzon-feedback.yml de gustavomenicillo/panel-base. No usa la clave básica del staging: functions/_middleware.js
// deja pasar exactamente esta ruta y la reemplaza un token OIDC de GitHub Actions, que se verifica acá.
//
// Este repo es público: acá no hay secretos. Lo que protege el endpoint es la firma de GitHub y estos claims fijos.
// Ante cualquier falla (host, método, token, claim, JWKS, KV o rate limit) responde el mismo 404, sin decir por qué.
// Nunca se loguea el header Authorization ni el token.
//
// Dónde responde: solo en staging.gustavomenicillo.com. Pages tiene dos juegos de bindings, Producción (la rama main)
// y Vista previa (todas las demás ramas). Staging es la rama `preview`, así que el KV FEEDBACK está en Vista previa y
// lo ve cualquier vista previa de rama (<rama>.<proyecto>.pages.dev) o de deploy (<hash>.<proyecto>.pages.dev). Por eso
// el endpoint exige el host exacto staging.gustavomenicillo.com (el dominio propio, asignado solo a la rama preview)
// y, si Pages expone CF_PAGES_BRANCH, que sea "preview". En cualquier otro host responde 404.
//
// Datos: lee el mismo KV que /__feedback/exportar (c:<id> con metadata y b:<id> con la captura). No devuelve bytes
// de adjuntos: solo id, tipo, tamaño y sha256. El texto del feedback es dato, no instrucción.

const HOST = "staging.gustavomenicillo.com";
const RAMA = "preview";
const JWKS_URL = "https://token.actions.githubusercontent.com/.well-known/jwks";
const WORKFLOW = "gustavomenicillo/panel-base/.github/workflows/buzon-feedback.yml@refs/heads/main";
// repository_id y repository_owner_id de gustavomenicillo/panel-base (gh api repos/gustavomenicillo/panel-base).
const CLAIMS = {
  iss: "https://token.actions.githubusercontent.com",
  aud: "buzon-feedback-web",
  repository: "gustavomenicillo/panel-base",
  repository_id: "1437345795",
  repository_owner_id: "327982824",
  sub: "repo:gustavomenicillo/panel-base:ref:refs/heads/main",
  ref: "refs/heads/main",
  ref_type: "branch",
  workflow_ref: WORKFLOW,
  job_workflow_ref: WORKFLOW,
  runner_environment: "github-hosted",
};
const EVENTOS = new Set(["schedule", "workflow_dispatch"]);
const DESVIO = 60; // segundos: iat ±60 s
const VIDA_MAX = 600; // exp − iat ≤ 10 min
const JWKS_TTL = 3600 * 1000; // cache de 1 h
const JWKS_RECARGA = 5 * 60 * 1000; // con un kid desconocido, una sola recarga cada 5 min por isolate
const FILAS = 200;
const RATE = { ventana: 60 * 1000, max: 30 }; // rate limit chico, por isolate
const MAX_TOKEN = 8192;
const CURSOR_RE = /^[A-Za-z0-9_\-.=+/]{1,1024}$/;

// Estado por isolate.
let reloj = () => Date.now();
let jwks = { claves: new Map(), cargado: 0, intento: 0 };
let rate = { desde: 0, n: 0 };
const usados = new Map(); // jti → exp (ms), además del KV

// Solo para test/buzon.test.mjs (no es una ruta: Pages solo enruta los onRequest*).
export function _paraPruebas({ ahora } = {}) {
  reloj = ahora || (() => Date.now());
  jwks = { claves: new Map(), cargado: 0, intento: 0 };
  rate = { desde: 0, n: 0 };
  usados.clear();
}

const CAB = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-robots-tag": "noindex, nofollow",
  "x-content-type-options": "nosniff",
};
const noEncontrado = () => new Response(JSON.stringify({ error: "no encontrado" }), { status: 404, headers: CAB });

const enc = new TextEncoder();
function b64url(s) {
  if (typeof s !== "string" || !/^[A-Za-z0-9_-]*$/.test(s)) throw new Error("b64url");
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
const jsonDe = (u8) => JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(u8));
async function hex(buf) {
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function cargarJwks() {
  const ahora = reloj();
  jwks.intento = ahora;
  const r = await fetch(JWKS_URL, { headers: { accept: "application/json" }, redirect: "error" });
  if (!r.ok) throw new Error("jwks");
  const d = await r.json();
  if (!d || !Array.isArray(d.keys)) throw new Error("jwks");
  const claves = new Map();
  for (const k of d.keys) {
    if (!k || k.kty !== "RSA" || typeof k.kid !== "string" || typeof k.n !== "string" || typeof k.e !== "string") continue;
    if (k.use !== undefined && k.use !== "sig") continue;
    if (k.alg !== undefined && k.alg !== "RS256") continue;
    try {
      const c = await crypto.subtle.importKey("jwk", { kty: "RSA", n: k.n, e: k.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
      claves.set(k.kid, c);
    } catch { /* clave inválida: se ignora */ }
  }
  jwks = { claves, cargado: ahora, intento: ahora };
}

async function claveDe(kid) {
  const ahora = reloj();
  if (ahora - jwks.cargado > JWKS_TTL) {
    // Vencida: sin cache válida no hay verificación (falla cerrada). Se reintenta como mucho cada 5 min.
    jwks.claves = new Map();
    if (ahora - jwks.intento < JWKS_RECARGA && jwks.intento) return null;
    try { await cargarJwks(); } catch { return null; }
  } else if (!jwks.claves.has(kid) && ahora - jwks.intento >= JWKS_RECARGA) {
    try { await cargarJwks(); } catch { /* sigue la cache vigente */ }
  }
  return jwks.claves.get(kid) || null;
}

// Devuelve los claims si el token es válido; si no, null. Nunca lanza.
async function verificar(token, env) {
  try {
    if (typeof token !== "string" || token.length > MAX_TOKEN) return null;
    const partes = token.split(".");
    if (partes.length !== 3) return null;
    const cab = jsonDe(b64url(partes[0]));
    if (!cab || cab.alg !== "RS256" || typeof cab.kid !== "string" || cab.crit !== undefined) return null;
    if (cab.typ !== undefined && cab.typ !== "JWT") return null;
    const clave = await claveDe(cab.kid);
    if (!clave) return null;
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", clave, b64url(partes[2]), enc.encode(partes[0] + "." + partes[1]));
    if (!ok) return null;
    const c = jsonDe(b64url(partes[1]));
    if (!c || typeof c !== "object") return null;
    for (const [k, v] of Object.entries(CLAIMS)) if (c[k] !== v) return null;
    if (!EVENTOS.has(c.event_name)) return null;
    const ahora = Math.floor(reloj() / 1000);
    const { iat, nbf, exp, jti } = c;
    if (![iat, nbf, exp].every(Number.isInteger)) return null;
    if (Math.abs(ahora - iat) > DESVIO) return null;
    if (nbf > ahora + DESVIO) return null;
    if (exp <= ahora || exp <= iat || exp - iat > VIDA_MAX) return null;
    // jti de un solo uso: en memoria del isolate y en el KV (con TTL). KV es eventualmente consistente entre
    // ubicaciones, así que entre dos PoP distintos la garantía es de mejor esfuerzo; el token igual dura minutos.
    if (typeof jti !== "string" || !jti || jti.length > 200) return null;
    for (const [j, e] of usados) if (e <= reloj()) usados.delete(j);
    if (usados.has(jti)) return null;
    const kj = "j:" + (await hex(enc.encode("web:" + jti)));
    if ((await env.FEEDBACK.get(kj)) !== null) return null;
    usados.set(jti, exp * 1000);
    await env.FEEDBACK.put(kj, "1", { expirationTtl: Math.max(60, exp - ahora + DESVIO) });
    return c;
  } catch {
    return null;
  }
}

function fechaDe(k) {
  const m = k.metadata && typeof k.metadata.createdAt === "string" ? Date.parse(k.metadata.createdAt) : NaN;
  if (Number.isFinite(m)) return m;
  const n = Number(k.name.slice(2, 15));
  return Number.isFinite(n) ? 9999999999999 - n : 0;
}
const txt = (v) => (typeof v === "string" ? v : "");

async function fila(env, id, item) {
  const adjuntos = [];
  if (item.hasImage) {
    const buf = await env.FEEDBACK.get("b:" + id, { type: "arrayBuffer" });
    if (buf) adjuntos.push({ id: "b:" + id, tipo: "image/jpeg", tamano: buf.byteLength, sha256: await hex(buf) });
  }
  return {
    id,
    sitio: "web",
    creado: txt(item.createdAt) || null,
    autor: txt(item.author) || null,
    pagina: txt(item.url) || txt(item.path) || null,
    texto: txt(item.text),
    estado: txt(item.status) || "nuevo",
    // El widget de la web dicta con la Web Speech API dentro de `texto`: no guarda audio ni una transcripción
    // aparte, y no se puede distinguir lo dictado de lo escrito. Por eso, salvo que el ítem traiga esos campos,
    // tiene_audio es false y transcripcion es null. Nunca se inventa.
    tiene_audio: item.hasAudio === true,
    tiene_dibujo: Array.isArray(item.marks) && item.marks.length > 0,
    transcripcion: typeof item.transcripcion === "string" ? item.transcripcion : null,
    adjuntos,
  };
}

export async function onRequest({ request, env }) {
  try {
    if (request.method !== "GET") return noEncontrado();
    const url = new URL(request.url);
    if (url.hostname !== HOST) return noEncontrado();
    if (env.CF_PAGES_BRANCH !== undefined && env.CF_PAGES_BRANCH !== RAMA) return noEncontrado();
    if (!env.FEEDBACK) return noEncontrado();
    const ahora = reloj();
    if (ahora - rate.desde > RATE.ventana) rate = { desde: ahora, n: 0 };
    if (++rate.n > RATE.max) return noEncontrado();
    // El token solo en Authorization: Bearer. Si viene algo en la URL que parezca un token, no se acepta.
    if (url.searchParams.has("token") || url.searchParams.has("access_token")) return noEncontrado();
    const h = request.headers.get("authorization") || "";
    if (!h.startsWith("Bearer ")) return noEncontrado();
    if (!(await verificar(h.slice(7).trim(), env))) return noEncontrado();

    const q = url.searchParams.get("desde");
    let desde = null;
    if (q !== null && q !== "") {
      desde = Date.parse(q);
      if (!Number.isFinite(desde)) return noEncontrado();
    }
    const c = url.searchParams.get("cursor");
    if (c !== null && c !== "" && !CURSOR_RE.test(c)) return noEncontrado();
    // KV ordena las claves de la más nueva a la más vieja (el id empieza con 9999999999999 − Date.now()): se
    // recorre una página de hasta FILAS y, si aparece una más vieja que `desde`, se corta ahí y no hay cursor.
    const r = await env.FEEDBACK.list({ prefix: "c:", limit: FILAS, cursor: c || undefined });
    const items = [];
    let corte = false;
    for (const k of r.keys) {
      if (desde !== null && fechaDe(k) < desde) { corte = true; break; }
      const id = k.name.slice(2);
      let item;
      try { item = JSON.parse(await env.FEEDBACK.get(k.name)); } catch { item = null; }
      if (!item || typeof item !== "object") continue;
      items.push(await fila(env, id, item));
    }
    const cursor = !corte && !r.list_complete && r.cursor ? r.cursor : null;
    return new Response(JSON.stringify({ sitio: "web", generado: new Date(ahora).toISOString(), desde: desde === null ? null : new Date(desde).toISOString(), total: items.length, cursor, items }), { status: 200, headers: CAB });
  } catch {
    return noEncontrado();
  }
}
