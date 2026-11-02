// Staging: guarda las aprobaciones y comentarios de cada resaltado (botones de /assets/preview-revision.js).
// Usa el KV "FEEDBACK" del proyecto de Pages, con el mismo formato que el Worker de feedback-widget,
// así la bandeja de ese Worker los lee igual. La clave la pide antes functions/_middleware.js.
// La web publicada no lo usa: en gustavomenicillo.com y www responde 404.
const PUBLICOS = new Set(["gustavomenicillo.com", "www.gustavomenicillo.com"]);
const str = (v, n) => (typeof v === "string" ? v.slice(0, n) : "");
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" } });

function guard(request, env) {
  const host = new URL(request.url).hostname.toLowerCase();
  if (PUBLICOS.has(host)) return json({ error: "no encontrado" }, 404);
  if (!env.FEEDBACK) return json({ error: "falta el KV FEEDBACK en Pages" }, 503);
  return null;
}

export async function onRequestGet({ request, env }) {
  const g = guard(request, env); if (g) return g;
  const items = [];
  let cursor;
  do {
    const r = await env.FEEDBACK.list({ prefix: "c:", cursor });
    r.keys.forEach((k) => items.push({ id: k.name.slice(2), ...(k.metadata || {}) }));
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor && items.length < 5000);
  return json({ me: env.STAGING_USER || "", items });
}

export async function onRequestPost({ request, env }) {
  const g = guard(request, env); if (g) return g;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "origen inválido" }, 403);
  const raw = await request.text();
  if (raw.length > 20000) return json({ error: "demasiado grande" }, 413);
  let b; try { b = JSON.parse(raw); } catch { return json({ error: "datos inválidos" }, 400); }
  const id = `${String(9999999999999 - Date.now()).padStart(13, "0")}-${crypto.randomUUID().slice(0, 8)}`;
  const d = b.device && typeof b.device === "object" ? b.device : {};
  const item = {
    id, author: String(env.STAGING_USER || "staging").toLowerCase(), createdAt: new Date().toISOString(), status: "nuevo",
    text: str(b.text, 4000), url: str(b.url, 1000), path: str(b.path, 500), title: str(b.title, 200), scrollY: num(b.scrollY),
    element: b.element ? { selector: str(b.element.selector, 400), tag: str(b.element.tag, 20), text: str(b.element.text, 200), section: str(b.element.section, 160) } : null,
    marks: [], device: { type: str(d.type, 20), os: str(d.os, 20), browser: str(d.browser, 20), w: num(d.w), h: num(d.h) }, hasImage: false, note: "",
  };
  const meta = { createdAt: item.createdAt, status: item.status, author: item.author, path: item.path.slice(0, 100), text: item.text.slice(0, 160), device: `${item.device.type} · ${item.device.os} · ${item.device.browser}`.slice(0, 60), hasImage: false };
  await env.FEEDBACK.put("c:" + id, JSON.stringify(item), { metadata: meta });
  return json({ ok: true, id }, 201);
}
