// Pruebas del buzón de feedback (functions/__buzon/feedback.js) y del paso por functions/_middleware.js.
// Se corren con `node --test test/` (Node 22). Sin red, sin cuenta de Cloudflare y sin tokens reales: el par de
// claves RSA se genera en cada corrida y la JWKS de GitHub se simula con un fetch falso.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { onRequest, _paraPruebas } from "../functions/__buzon/feedback.js";
import { onRequest as puerta } from "../functions/_middleware.js";

const JWKS_URL = "https://token.actions.githubusercontent.com/.well-known/jwks";
const WF = "gustavomenicillo/panel-base/.github/workflows/buzon-feedback.yml@refs/heads/main";
const enc = new TextEncoder();
const b64u = (u8) => Buffer.from(u8).toString("base64url");

// --- claves generadas en la prueba ---
const par = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const otro = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwkPub = await crypto.subtle.exportKey("jwk", par.publicKey);
const KID = "kid-prueba";

let ahoraMs = Date.UTC(2026, 10, 8, 18, 0, 0);
let jwksPedidos = [];
let jwksFetches = 0, jwksFalla = false, jwksKeys = [{ kty: "RSA", kid: KID, use: "sig", alg: "RS256", n: jwkPub.n, e: jwkPub.e }];
let jwksRedirige = false;
globalThis.fetch = async (u, opciones = {}) => {
  if (String(u) !== JWKS_URL) throw new Error("fetch inesperado: " + u);
  // Igual que workerd (Cloudflare): solo "follow" o "manual". Con "error" lanza TypeError antes de pedir nada.
  if (opciones.redirect !== undefined && !["follow", "manual"].includes(opciones.redirect)) {
    throw new TypeError('Invalid redirect value, must be one of "follow" or "manual"');
  }
  jwksFetches++;
  jwksPedidos.push(opciones);
  if (jwksRedirige) return new Response("Found", { status: 302, headers: { location: "https://otro.example/jwks" } });
  if (jwksFalla) return new Response("no", { status: 503 });
  return new Response(JSON.stringify({ keys: jwksKeys }), { headers: { "content-type": "application/json" } });
};

function claimsBase(extra = {}) {
  const iat = Math.floor(ahoraMs / 1000);
  return {
    iss: "https://token.actions.githubusercontent.com", aud: "buzon-feedback-web",
    repository: "gustavomenicillo/panel-base", repository_id: "1437345795", repository_owner: "gustavomenicillo", repository_owner_id: "327982824",
    sub: "repo:gustavomenicillo/panel-base:ref:refs/heads/main", ref: "refs/heads/main", ref_type: "branch",
    event_name: "schedule", workflow_ref: WF, job_workflow_ref: WF, runner_environment: "github-hosted",
    iat, nbf: iat - 5, exp: iat + 300, jti: crypto.randomUUID(), ...extra,
  };
}
async function firmar(claims, { alg = "RS256", kid = KID, clave = par.privateKey, cab = {} } = {}) {
  const h = b64u(enc.encode(JSON.stringify({ alg, typ: "JWT", kid, ...cab })));
  const p = b64u(enc.encode(JSON.stringify(claims)));
  const s = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", clave, enc.encode(h + "." + p)));
  return `${h}.${p}.${b64u(s)}`;
}

// --- KV simulado, con el orden lexicográfico y el cursor de Cloudflare KV ---
function kvFalso() {
  const m = new Map();
  return {
    m,
    async get(k, o) {
      if (!m.has(k)) return null;
      const v = m.get(k).v;
      if (o && o.type === "arrayBuffer") return v instanceof Uint8Array ? v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength) : enc.encode(v).buffer;
      return typeof v === "string" ? v : new TextDecoder().decode(v);
    },
    async put(k, v, o = {}) { m.set(k, { v, metadata: o.metadata, ttl: o.expirationTtl }); },
    async list({ prefix = "", limit = 1000, cursor } = {}) {
      const ks = [...m.keys()].filter((k) => k.startsWith(prefix)).sort();
      const i = cursor ? Number(cursor) : 0;
      const keys = ks.slice(i, i + limit).map((name) => ({ name, metadata: m.get(name).metadata }));
      const fin = i + limit >= ks.length;
      return { keys, list_complete: fin, cursor: fin ? undefined : String(i + limit) };
    },
  };
}
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]);
function guardar(kv, { ms, text = "hola", marks = [], image = false, extra = {} }) {
  const id = `${String(9999999999999 - ms).padStart(13, "0")}-${Math.random().toString(16).slice(2, 10).padEnd(8, "0")}`;
  const item = { id, author: "prueba", createdAt: new Date(ms).toISOString(), status: "nuevo", text, url: "https://staging.gustavomenicillo.com/sobre-mi/", path: "/sobre-mi/", marks, hasImage: image, ...extra };
  if (image) kv.m.set("b:" + id, { v: JPEG });
  kv.m.set("c:" + id, { v: JSON.stringify(item), metadata: { createdAt: item.createdAt } });
  return id;
}

let env;
beforeEach(() => {
  ahoraMs = Date.UTC(2026, 10, 8, 18, 0, 0);
  _paraPruebas({ ahora: () => ahoraMs });
  jwksFetches = 0; jwksFalla = false; jwksRedirige = false; jwksPedidos = [];
  jwksKeys = [{ kty: "RSA", kid: KID, use: "sig", alg: "RS256", n: jwkPub.n, e: jwkPub.e }];
  env = { FEEDBACK: kvFalso() };
});
const pedir = (token, { host = "staging.gustavomenicillo.com", ruta = "/__buzon/feedback", method = "GET", e = env, auth } = {}) =>
  onRequest({ request: new Request(`https://${host}${ruta}`, { method, headers: auth !== undefined ? { authorization: auth } : token ? { authorization: "Bearer " + token } : {} }), env: e });
// Para las pruebas que mandan muchos pedidos: cada uno arranca con el rate limit (30 por minuto por isolate) en cero,
// así un 404 es por el claim y nunca por el tope (QA, #19). También vacía la cache de la JWKS y la memoria de jti; el
// KV sigue guardando los jti usados.
async function pedirSinTope(token, opciones) {
  _paraPruebas({ ahora: () => ahoraMs });
  return pedir(token, opciones);
}
async function es404(r) {
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), { error: "no encontrado" });
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
}

test("token válido: 200, cabeceras y formato de cada ítem (audio, dibujo, transcripción y adjuntos)", async () => {
  const capturaSola = guardar(env.FEEDBACK, { ms: ahoraMs - 4000, text: "captura sin dibujo", image: true });
  const conDibujo = guardar(env.FEEDBACK, { ms: ahoraMs - 3000, text: "con dibujo", marks: [{ x: 1, y: 2, w: 3, h: 4 }], image: true });
  const soloTexto = guardar(env.FEEDBACK, { ms: ahoraMs - 2000, text: "solo texto" });
  const conAudio = guardar(env.FEEDBACK, { ms: ahoraMs - 1000, text: "", extra: { hasAudio: true, transcripcion: "lo que se dictó" } });
  const r = await pedir(await firmar(claimsBase()));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("cache-control"), "no-store");
  assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("access-control-allow-origin"), null);
  const d = await r.json();
  assert.equal(d.sitio, "web");
  assert.equal(d.cursor, null);
  assert.deepEqual(d.items.map((i) => i.id), [conAudio, soloTexto, conDibujo, capturaSola]); // del más nuevo al más viejo
  for (const i of d.items) {
    assert.deepEqual(Object.keys(i).sort(), ["adjuntos", "autor", "creado", "estado", "id", "pagina", "sitio", "texto", "tiene_audio", "tiene_dibujo", "transcripcion"].sort());
    assert.equal(i.sitio, "web"); assert.equal(i.autor, "prueba"); assert.equal(i.estado, "nuevo");
    assert.equal(i.pagina, "https://staging.gustavomenicillo.com/sobre-mi/");
  }
  const [a, t, dib, cap] = d.items;
  assert.deepEqual([cap.tiene_audio, cap.tiene_dibujo, cap.transcripcion, cap.adjuntos.length], [false, false, null, 1]); // captura sin trazos no es dibujo
  assert.deepEqual([a.tiene_audio, a.tiene_dibujo, a.transcripcion], [true, false, "lo que se dictó"]);
  assert.deepEqual([t.tiene_audio, t.tiene_dibujo, t.transcripcion], [false, false, null]); // nunca se inventa
  assert.deepEqual([dib.tiene_audio, dib.tiene_dibujo, dib.transcripcion], [false, true, null]);
  assert.equal(dib.texto, "con dibujo");
  const sha = Buffer.from(await crypto.subtle.digest("SHA-256", JPEG)).toString("hex");
  assert.deepEqual(dib.adjuntos, [{ id: "b:" + conDibujo, tipo: "image/jpeg", tamano: JPEG.length, sha256: sha }]);
  assert.deepEqual(t.adjuntos, []);
  assert.ok(!JSON.stringify(d).includes("base64"), "sin bytes de adjuntos");
});

test("jti de un solo uso: el mismo token dos veces da 404, también desde otro isolate (KV)", async () => {
  const tok = await firmar(claimsBase());
  assert.equal((await pedir(tok)).status, 200);
  await es404(await pedir(tok));
  _paraPruebas({ ahora: () => ahoraMs }); // isolate nuevo: sin memoria, queda el KV
  await es404(await pedir(tok));
  const j = [...env.FEEDBACK.m.entries()].find(([k]) => k.startsWith("j:"));
  assert.ok(j && j[1].ttl >= 60, "el jti se guarda con TTL");
});

test("cada claim obligatorio, cambiado o ausente, da 404", async () => {
  const cambios = {
    iss: "https://otro", aud: "buzon-feedback-panel", repository: "gustavomenicillo/otro", repository_id: "1", repository_owner_id: "2",
    ref: "refs/heads/x", ref_type: "tag", event_name: "push",
    workflow_ref: WF.replace("main", "x"), job_workflow_ref: WF.replace("buzon-feedback", "otro"), runner_environment: "self-hosted",
  };
  for (const [k, v] of Object.entries(cambios)) {
    await es404(await pedirSinTope(await firmar(claimsBase({ [k]: v }))));
    const sin = claimsBase(); delete sin[k];
    await es404(await pedirSinTope(await firmar(sin)));
  }
  for (const k of ["iat", "nbf", "exp", "jti"]) { const sin = claimsBase(); delete sin[k]; await es404(await pedirSinTope(await firmar(sin))); }
  assert.equal((await pedirSinTope(await firmar(claimsBase({ event_name: "workflow_dispatch" })))).status, 200);
  await es404(await pedirSinTope(await firmar(claimsBase({ event_name: "workflow_call" }))));
  await es404(await pedirSinTope(await firmar(claimsBase({ aud: ["buzon-feedback-web"] }))));
  // Control: con todos los claims exactos, 200.
  assert.equal((await pedirSinTope(await firmar(claimsBase()))).status, 200);
});

test("tiempos: iat ±60 s, nbf vigente, exp vigente y exp − iat ≤ 10 min", async () => {
  const s = Math.floor(ahoraMs / 1000);
  await es404(await pedir(await firmar(claimsBase({ iat: s - 120, nbf: s - 120 }))));
  await es404(await pedir(await firmar(claimsBase({ iat: s + 120 }))));
  await es404(await pedir(await firmar(claimsBase({ nbf: s + 300 }))));
  await es404(await pedir(await firmar(claimsBase({ exp: s - 1 }))));
  await es404(await pedir(await firmar(claimsBase({ exp: s + 601 }))));
  assert.equal((await pedir(await firmar(claimsBase({ iat: s - 50, exp: s + 500 })))).status, 200);
});

test("firma: solo RS256, kid en la JWKS, firma de otra clave o payload alterado dan 404", async () => {
  await es404(await pedir(await firmar(claimsBase(), { alg: "HS256" })));
  await es404(await pedir(await firmar(claimsBase(), { alg: "none" })));
  await es404(await pedir(await firmar(claimsBase(), { clave: otro.privateKey })));
  await es404(await pedir(await firmar(claimsBase(), { cab: { crit: ["x"] } })));
  const [h, , s] = (await firmar(claimsBase())).split(".");
  await es404(await pedir(`${h}.${b64u(enc.encode(JSON.stringify(claimsBase({ repository: "x/y" }))))}.${s}`));
  await es404(await pedir("a.b"));
  await es404(await pedir("x".repeat(9000)));
});

test("JWKS: cache de 1 h, una sola recarga cada 5 min con kid desconocido y falla cerrada", async () => {
  assert.equal((await pedir(await firmar(claimsBase()))).status, 200);
  assert.equal((await pedir(await firmar(claimsBase()))).status, 200);
  assert.equal(jwksFetches, 1, "se usa la cache");
  await es404(await pedir(await firmar(claimsBase(), { kid: "nuevo" })));
  await es404(await pedir(await firmar(claimsBase(), { kid: "nuevo" })));
  assert.equal(jwksFetches, 1, "dentro de los 5 min no recarga");
  ahoraMs += 5 * 60 * 1000 + 1000;
  await es404(await pedir(await firmar(claimsBase(), { kid: "nuevo" })));
  assert.equal(jwksFetches, 2, "pasados 5 min recarga una vez");
  // Rotación: la clave nueva aparece en la JWKS.
  const jwkOtro = await crypto.subtle.exportKey("jwk", otro.publicKey);
  jwksKeys = [...jwksKeys, { kty: "RSA", kid: "nuevo", n: jwkOtro.n, e: jwkOtro.e }];
  ahoraMs += 5 * 60 * 1000 + 1000;
  assert.equal((await pedir(await firmar(claimsBase(), { kid: "nuevo", clave: otro.privateKey }))).status, 200);
  // Vencida la hora y con GitHub caído: falla cerrada.
  ahoraMs += 3600 * 1000 + 1000; jwksFalla = true;
  await es404(await pedir(await firmar(claimsBase())));
  _paraPruebas({ ahora: () => ahoraMs }); jwksFalla = true;
  await es404(await pedir(await firmar(claimsBase())));
});

test("solo GET, solo staging.gustavomenicillo.com y la rama preview, token solo en Bearer", async () => {
  const tok = () => firmar(claimsBase());
  for (const host of ["gustavomenicillo.com", "www.gustavomenicillo.com", "preview.gustavomenicillo.com", "preview.gustavomenicillo-com.pages.dev", "t1-x.gustavomenicillo-com.pages.dev", "staging.gustavomenicillo.com.", "STAGING.gustavomenicillo.com.evil.com"]) {
    await es404(await pedir(await tok(), { host }));
  }
  for (const method of ["POST", "PUT", "DELETE", "HEAD", "OPTIONS"]) {
    const r = await pedir(await tok(), { method });
    assert.equal(r.status, 404);
  }
  await es404(await pedir(await tok(), { e: { ...env, CF_PAGES_BRANCH: "t131-otra" } }));
  assert.equal((await pedir(await tok(), { e: { ...env, CF_PAGES_BRANCH: "preview" } })).status, 200);
  await es404(await pedir(null));
  await es404(await pedir(null, { auth: "Basic cHJ1ZWJhOmNsYXZl" }));
  const t = await tok();
  await es404(await pedir(t, { ruta: "/__buzon/feedback?token=" + t }));
  await es404(await pedir(await tok(), { e: {} })); // sin KV
});

test("desde y cursor: hasta 200 filas por página y corte por fecha", async () => {
  const ids = [];
  for (let i = 0; i < 205; i++) ids.push(guardar(env.FEEDBACK, { ms: ahoraMs - (205 - i) * 1000, text: "n" + i }));
  const p1 = await (await pedir(await firmar(claimsBase()))).json();
  assert.equal(p1.items.length, 200);
  assert.ok(p1.cursor);
  const p2 = await (await pedir(await firmar(claimsBase()), { ruta: "/__buzon/feedback?cursor=" + encodeURIComponent(p1.cursor) })).json();
  assert.equal(p2.items.length, 5);
  assert.equal(p2.cursor, null);
  assert.equal(new Set([...p1.items, ...p2.items].map((i) => i.id)).size, 205);
  const desde = new Date(ahoraMs - 10 * 1000).toISOString();
  const p3 = await (await pedir(await firmar(claimsBase()), { ruta: "/__buzon/feedback?desde=" + desde })).json();
  assert.equal(p3.items.length, 10);
  assert.equal(p3.cursor, null);
  assert.ok(p3.items.every((i) => i.creado >= desde));
  await es404(await pedir(await firmar(claimsBase()), { ruta: "/__buzon/feedback?desde=ayer" }));
  await es404(await pedir(await firmar(claimsBase()), { ruta: "/__buzon/feedback?cursor=%3Cscript%3E" }));
});

test("rate limit chico: pasado el tope por minuto, 404", async () => {
  let ultimo;
  for (let i = 0; i < 31; i++) ultimo = await pedir(null);
  await es404(ultimo);
  await es404(await pedir(await firmar(claimsBase())));
  ahoraMs += 61 * 1000;
  assert.equal((await pedir(await firmar(claimsBase()))).status, 200);
});

test("nunca se loguea el token ni el header Authorization", async () => {
  const vistos = [];
  const orig = { ...console };
  for (const k of ["log", "info", "warn", "error", "debug"]) console[k] = (...a) => vistos.push(a.join(" "));
  try {
    const tok = await firmar(claimsBase());
    await pedir(tok); await pedir(tok); await pedir(await firmar(claimsBase({ aud: "x" })));
    jwksFalla = true; ahoraMs += 2 * 3600 * 1000; await pedir(await firmar(claimsBase()));
  } finally { Object.assign(console, orig); }
  assert.deepEqual(vistos, []);
});

test("JWKS: se pide con redirect manual (el runtime de Cloudflare rechaza error) y una redirección falla cerrada", async () => {
  assert.equal((await pedir(await firmar(claimsBase()))).status, 200);
  assert.equal(jwksPedidos.length, 1);
  assert.equal(jwksPedidos[0].redirect, "manual");
  _paraPruebas({ ahora: () => ahoraMs }); jwksRedirige = true;
  await es404(await pedir(await firmar(claimsBase())));
});

test("sub: la regla aprobada por Seguridad, no la comparación exacta", async () => {
  const pasan = [
    "repo:gustavomenicillo/panel-base:ref:refs/heads/main",
    "repo:Gustavomenicillo/Panel-Base:ref:refs/heads/main",
    "repo:gustavomenicillo@327982824/panel-base@1437345795:ref:refs/heads/main",
    "repo:gustavomenicillo/panel-base:ref:Refs/Heads/Main",
  ];
  for (const sub of pasan) assert.equal((await pedirSinTope(await firmar(claimsBase({ sub })))).status, 200, sub);
  const fallan = [
    "repo:gustavomenicillo/panel-base:environment:prod",
    "repo:gustavomenicillo/panel-base:ref:refs/heads/main:environment:prod",
    "repo:gustavomenicillo/panel-base:pull_request",
    "repo:gustavomenicillo/panel-base:ref:refs/heads/main:pull_request",
    "repo:gustavomenicillo/panel-base:ref:refs/heads/main:job_workflow_ref:x",
    "repo:gustavomenicillo/panel-base:ref:refs/heads/main:context:x",
    "gustavomenicillo/panel-base:ref:refs/heads/main",
    "Repo:gustavomenicillo/panel-base:ref:refs/heads/main",
    "repo:gustavomenicillo/panel-base:refs/heads/main",
    "repo:gustavomenicillo/panel-base:ref:refs/heads/main" + "x".repeat(210),
    "repo:gustavomenicillo/panel-base:ref:refs/heads/\nmain",
    "repo:gustavomenicillo/panel-base:ref:refs/heads/\u0000main",
    "",
  ];
  assert.ok(fallan[9].length > 256);
  for (const sub of fallan) await es404(await pedirSinTope(await firmar(claimsBase({ sub }))));
  for (const sub of [null, 1, true, ["repo:x:ref:y"], { s: "repo:x:ref:y" }]) await es404(await pedirSinTope(await firmar(claimsBase({ sub }))));
  const sin = claimsBase(); delete sin.sub; await es404(await pedirSinTope(await firmar(sin)));
  // Con un sub válido (y no el clásico), cada claim que identifica al workflow sigue siendo exacto.
  const sub = "repo:gustavomenicillo@327982824/panel-base@1437345795:ref:refs/heads/main";
  const otros = {
    repository_id: "1437345796", repository_owner_id: "327982825", repository: "gustavomenicillo/otro",
    job_workflow_ref: WF.replace("buzon-feedback.yml", "otro.yml"), workflow_ref: WF.replace("@refs/heads/main", "@refs/heads/x"),
    ref: "refs/heads/x", ref_type: "tag", event_name: "push", runner_environment: "self-hosted", aud: "buzon-feedback-panel",
  };
  for (const [k, v] of Object.entries(otros)) await es404(await pedirSinTope(await firmar(claimsBase({ sub, [k]: v }))));
  // Control: el mismo sub válido con todos los demás claims exactos, 200.
  assert.equal((await pedirSinTope(await firmar(claimsBase({ sub })))).status, 200);
});

test("JWKS: se pide con un User-Agent fijo", async () => {
  assert.equal((await pedir(await firmar(claimsBase()))).status, 200);
  assert.equal(jwksPedidos[0].headers["user-agent"], "gustavomenicillo-buzon-verificador");
});

// --- functions/_middleware.js ---
const ENV_PUERTA = { STAGING_USER: "prueba", STAGING_PASS: "clave-de-prueba" };
async function porPuerta(ruta, { host = "staging.gustavomenicillo.com", auth } = {}) {
  let paso = null;
  const ctx = {
    request: new Request(`https://${host}${ruta}`, { headers: auth ? { authorization: auth } : {} }),
    env: ENV_PUERTA, data: {},
    next: async () => { paso = ctx.data; return new Response("ok", { headers: { "content-type": "application/json" } }); },
  };
  const r = await puerta(ctx);
  return { r, paso };
}
test("middleware: la clave básica no bloquea /__buzon/feedback, y solo esa ruta exacta", async () => {
  const b = await porPuerta("/__buzon/feedback?desde=2026-11-07T20:45:00Z");
  assert.equal(b.r.status, 200);
  assert.ok(b.paso && b.paso.staging !== true, "no marca ctx.data.staging");
  for (const ruta of ["/__buzon/feedback/", "/__buzon/feedbackx", "/__buzon/", "/__feedback/exportar", "/__feedback/api", "/", "/__BUZON/feedback"]) {
    const { r, paso } = await porPuerta(ruta);
    assert.equal(r.status, 401, ruta);
    assert.equal(paso, null, ruta);
  }
  const ok = await porPuerta("/__feedback/exportar", { auth: "Basic " + btoa("prueba:clave-de-prueba") });
  assert.equal(ok.r.status, 200);
  assert.equal(ok.paso.staging, true);
  const prod = await porPuerta("/", { host: "gustavomenicillo.com" });
  assert.equal(prod.r.status, 200);
});
test("middleware: test/, functions/ y .github/ no se publican en ningún host, tampoco con la ruta disfrazada", async () => {
  const rutas = [
    "/test/buzon.test.mjs", "/%74est/buzon.test.mjs", "//test/buzon.test.mjs", "/test%2Fbuzon.test.mjs", "/%2574est/buzon.test.mjs",
    "/TEST/buzon.test.mjs", "/test", "/x/..%2Ftest/buzon.test.mjs", "/%5Ctest/buzon.test.mjs", "/test%ZZ",
    "/functions/_middleware.js", "/functions/__buzon/feedback.js", "//functions/_middleware.js", "/%66unctions/_middleware.js", "/functions%2F_middleware.js",
    "/.github/workflows/pruebas.yml", "/%2Egithub/workflows/pruebas.yml", "//.github/workflows/pruebas.yml", "/.github%2Fworkflows%2Fpruebas.yml",
  ];
  for (const host of ["gustavomenicillo.com", "www.gustavomenicillo.com", "staging.gustavomenicillo.com"]) {
    for (const ruta of rutas) {
      const { r, paso } = await porPuerta(ruta, { host });
      assert.equal(r.status, 404, host + ruta);
      assert.equal(paso, null, host + ruta);
    }
  }
  // Lo que sí es del sitio sigue pasando.
  for (const ruta of ["/", "/notas/", "/testimonios/", "/functionsx", "/assets/site.css"]) {
    const { r } = await porPuerta(ruta, { host: "gustavomenicillo.com" });
    assert.equal(r.status, 200, ruta);
  }
});
