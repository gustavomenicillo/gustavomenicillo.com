// Staging: guarda lo que se manda con el botón de feedback (assets/staging-feedback.js carga el widget: texto, voz
// y dibujo). Usa el KV "FEEDBACK" del proyecto de Pages con el mismo formato que el Worker de feedback-widget
// (c:<id> con metadata y la captura en binario en b:<id>), así su bandeja lo lee igual. La clave la pide antes
// functions/_middleware.js, que marca ctx.data.staging solo después de validarla: sin esa marca responde 404
// (así la web publicada, gustavomenicillo.com y www con o sin punto final, nunca lo usa).
// Solo POST: la bandeja no se lee por acá (Seguridad, #5). Para bajarla está GET /__feedback/exportar (exportar.js),
// con las mismas dos llaves: la clave del staging y la marca ctx.data.staging.
const MAX_BODY = 3 * 1024 * 1024;
const MAX_IMG = 1800 * 1024;
// Tope diario de comentarios (cada uno usa hasta 3 escrituras de KV; el plan sin costo da 1.000 por día).
const TOPE_DIA = 200;
const IMG_RE = /^data:image\/jpeg;base64,(?:[A-Za-z0-9+/]{4})+(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const str = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });

function guard(data, env) {
  if (!data || data.staging !== true) return json({ error: "no encontrado" }, 404);
  if (!env.FEEDBACK) return json({ error: "falta el KV FEEDBACK en Pages" }, 503);
  return null;
}
const esJpeg = (u8) => u8.length > 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff;
function fromB64(s) {
  const b = atob(s), out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
function device(d) {
  if (!d || typeof d !== "object") return {};
  const out = {};
  for (const k of ["type", "os", "browser", "viewport", "screen", "lang", "ua"]) out[k] = str(d[k], k === "ua" ? 300 : 40);
  out.dpr = Number(d.dpr) || 1; out.dark = !!d.dark;
  return out;
}

export async function onRequestPost({ request, env, data }) {
  const g = guard(data, env); if (g) return g;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "origen inválido" }, 403);
  // Antes de leer el cuerpo: si declara más de lo permitido, se corta acá.
  const largo = Number(request.headers.get("content-length"));
  if (Number.isFinite(largo) && largo > MAX_BODY) return json({ error: "demasiado grande" }, 413);
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: "demasiado grande" }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: "datos inválidos" }, 400); }
  if (!b || typeof b !== "object") return json({ error: "datos inválidos" }, 400);
  let bin = null;
  if (typeof b.image === "string" && b.image.length <= MAX_IMG && IMG_RE.test(b.image)) {
    try { bin = fromB64(b.image.slice(b.image.indexOf(",") + 1)); } catch { bin = null; }
    if (bin && !esJpeg(bin)) bin = null; // tiene que empezar con FF D8 FF, no alcanza con el prefijo del data URL
  }
  const image = !!bin;
  const marks = Array.isArray(b.marks) ? b.marks.slice(0, 30).map((k) => ({ x: num(k && k.x), y: num(k && k.y), w: num(k && k.w), h: num(k && k.h) })) : [];
  const text = str(b.text, 4000);
  if (!text.trim() && !marks.length && !image) return json({ error: "vacío" }, 400);
  // Tope diario aproximado (KV es eventualmente consistente): alcanza para que un error no agote las escrituras.
  const dia = "n:" + new Date().toISOString().slice(0, 10);
  const hoy = Number(await env.FEEDBACK.get(dia)) || 0;
  if (hoy >= TOPE_DIA) return json({ error: "tope diario" }, 429);
  await env.FEEDBACK.put(dia, String(hoy + 1), { expirationTtl: 172800 });
  const id = `${String(9999999999999 - Date.now()).padStart(13, "0")}-${crypto.randomUUID().slice(0, 8)}`;
  const item = {
    id, author: String(env.STAGING_USER || "staging").toLowerCase(), createdAt: new Date().toISOString(), status: "nuevo",
    text, url: str(b.url, 1000), path: str(b.path, 500), title: str(b.title, 200), scrollY: num(b.scrollY),
    element: b.element && typeof b.element === "object" ? { selector: str(b.element.selector, 400), tag: str(b.element.tag, 20), text: str(b.element.text, 200), section: str(b.element.section, 160) } : null,
    marks, device: device(b.device), hasImage: !!image, imageDropped: typeof b.image === "string" && !image, note: "",
  };
  const meta = { createdAt: item.createdAt, status: item.status, author: item.author, path: item.path.slice(0, 100), text: item.text.slice(0, 160), device: `${item.device.type || ""} · ${item.device.os || ""} · ${item.device.browser || ""}`.slice(0, 60), hasImage: item.hasImage };
  // La captura primero: si falla, no queda un comentario que diga tener imagen sin tenerla.
  if (bin) await env.FEEDBACK.put("b:" + id, bin);
  await env.FEEDBACK.put("c:" + id, JSON.stringify(item), { metadata: meta });
  return json({ ok: true, id }, 201);
}
