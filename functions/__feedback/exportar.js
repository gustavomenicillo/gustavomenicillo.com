// Staging: «Descargar feedback». GET /__feedback/exportar baja todo lo que se mandó con el botón de feedback en un
// solo JSON adjunto: cada c:<id> completo y su captura (b:<id>) como data URL. Mismo modelo que la T-127 de Ando.
// Por qué existe, si Seguridad (#5) dijo que nadie del sitio necesita leer la bandeja: Gustavo y su equipo sí la
// necesitan para trabajar el feedback. Queda detrás de las mismas dos llaves que api.js: la clave del staging
// (functions/_middleware.js, que marca ctx.data.staging solo después de validarla) y, sin esa marca, 404; así en
// gustavomenicillo.com y www, con o sin punto final, no existe.
// Filtro opcional: ?desde=<fecha ISO> (inclusive). Orden: del más viejo al más nuevo.
// Límites: KV permite 1.000 operaciones por invocación; cada envío usa hasta 2 lecturas (c: y b:) y la lista una cada
// 1.000 claves, así que se exportan como mucho TOPE envíos. Si hay más, `truncado: true` y `continuar` dice con qué
// `desde` pedir la tanda siguiente (la fecha del primer envío que quedó afuera; si dos caen en el mismo milisegundo
// puede repetirse uno: se deduplica por id). Nunca se trunca en silencio.
// En memoria hay una sola captura por vez: el cuerpo se escribe en streaming.
const TOPE = 400;
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });

function guard(data, env) {
  if (!data || data.staging !== true) return json({ error: "no encontrado" }, 404);
  if (!env.FEEDBACK) return json({ error: "falta el KV FEEDBACK en Pages" }, 503);
  return null;
}
// El id empieza con 9999999999999 - Date.now(): sirve de respaldo si una clave no trae metadata.
function fechaDe(k) {
  const m = k.metadata && typeof k.metadata.createdAt === "string" ? Date.parse(k.metadata.createdAt) : NaN;
  if (Number.isFinite(m)) return m;
  const n = Number(k.name.slice(2, 15));
  return Number.isFinite(n) ? 9999999999999 - n : 0;
}
function aB64(buf) {
  const u8 = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
const esJpeg = (u8) => u8.length > 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff;

export async function onRequestGet({ request, env, data }) {
  const g = guard(data, env); if (g) return g;
  const q = new URL(request.url).searchParams.get("desde");
  let desde = null;
  if (q !== null && q !== "") {
    desde = Date.parse(q);
    if (!Number.isFinite(desde)) return json({ error: "desde inválido: usá una fecha ISO, por ejemplo 2026-11-01 o 2026-11-01T12:00:00Z" }, 400);
  }
  // La lista trae la metadata (createdAt), así se filtra por fecha sin leer cada comentario.
  const claves = [];
  let cursor;
  do {
    const r = await env.FEEDBACK.list({ prefix: "c:", cursor, limit: 1000 });
    for (const k of r.keys) {
      const t = fechaDe(k);
      if (desde === null || t >= desde) claves.push({ name: k.name, t });
    }
    cursor = r.list_complete ? undefined : r.cursor;
  } while (cursor);
  claves.sort((a, b) => a.t - b.t || (a.name < b.name ? 1 : -1));
  const truncado = claves.length > TOPE;
  const elegidas = claves.slice(0, TOPE);
  const exportado = new Date().toISOString();
  const cab = {
    sitio: "staging.gustavomenicillo.com", exportado, desde: desde === null ? null : new Date(desde).toISOString(),
    total: elegidas.length, truncado, continuar: truncado ? new Date(claves[TOPE].t).toISOString() : null,
  };
  const enc = new TextEncoder();
  let i = -1;
  const cuerpo = new ReadableStream({
    async pull(ctrl) {
      if (i === -1) { ctrl.enqueue(enc.encode(JSON.stringify(cab).slice(0, -1) + ',"items":[\n')); i = 0; return; }
      if (i >= elegidas.length) { ctrl.enqueue(enc.encode("\n]}\n")); ctrl.close(); return; }
      const nombre = elegidas[i].name, id = nombre.slice(2);
      let item;
      try { item = JSON.parse(await env.FEEDBACK.get(nombre)); } catch { item = null; }
      if (!item || typeof item !== "object") item = { id, error: "comentario ilegible o borrado" };
      let captura = null;
      if (item.hasImage) {
        const buf = await env.FEEDBACK.get("b:" + id, { type: "arrayBuffer" });
        if (buf && esJpeg(new Uint8Array(buf))) captura = "data:image/jpeg;base64," + aB64(buf);
      }
      ctrl.enqueue(enc.encode((i ? ",\n" : "") + JSON.stringify({ ...item, captura })));
      i++;
    },
  });
  return new Response(cuerpo, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="feedback-staging-${exportado.slice(0, 10)}.json"`,
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      "x-content-type-options": "nosniff",
    },
  });
}
