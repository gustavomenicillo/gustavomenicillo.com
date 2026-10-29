// Worker de feedback: se pone delante de los dominios de revisión (preview), inyecta el botón
// en las páginas HTML y guarda los comentarios en KV. No cambia nada del sitio en sí.
import { WIDGET_JS, INBOX_HTML } from './assets.js';

const PREFIX = '/__feedback';
const STATUSES = ['nuevo', 'en curso', 'hecho', 'descartado'];
const MAX_BODY = 4 * 1024 * 1024;

const list = (v) => (v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const enabled = list(env.ENABLED_HOSTS).includes(url.hostname);
    if (!enabled) return fetch(req);
    // ORIGIN (opcional): de dónde traer las páginas; si no está, se pasa el pedido tal cual al sitio.
    const upstream = (r) => env.ORIGIN ? fetch(new Request(env.ORIGIN + url.pathname + url.search, r)) : fetch(r);

    const user = await identify(req, env);
    if (url.pathname === PREFIX || url.pathname.startsWith(PREFIX + '/')) {
      return handle(req, env, url, user).catch((e) => json({ error: String(e && e.message || e) }, 500));
    }

    const res = await upstream(req);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html') || !canReview(user, env)) return res;
    return new HTMLRewriter()
      .on('body', { element(e) { e.append(`<script src="${PREFIX}/widget.js" defer></script>`, { html: true }); } })
      .transform(res);
  },
};

async function handle(req, env, url, user) {
  const path = url.pathname.slice(PREFIX.length) || '/';
  const m = req.method;

  if (!user) return json({ error: 'sin sesión' }, 401);

  if (path === '/widget.js' && m === 'GET') {
    if (!canReview(user, env)) return new Response('', { status: 403 });
    const cfg = { api: PREFIX + '/api', lang: env.LANG || '', color: env.COLOR || '#e11d48' };
    return new Response(`window.FB_CONFIG=${JSON.stringify(cfg)};\n${WIDGET_JS}`, {
      headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'private, max-age=300' },
    });
  }

  if (!canView(user, env)) return json({ error: 'sin permiso' }, 403);

  if (path === '/' && m === 'GET') {
    return new Response(INBOX_HTML, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-frame-options': 'DENY', 'referrer-policy': 'same-origin' },
    });
  }

  if (path === '/api' && m === 'GET') {
    const items = [];
    let cursor;
    do {
      const r = await env.FEEDBACK.list({ prefix: 'c:', cursor });
      r.keys.forEach((k) => items.push({ id: k.name.slice(2), ...(k.metadata || {}) }));
      cursor = r.list_complete ? null : r.cursor;
    } while (cursor && items.length < 5000);
    return json({ me: user, canEdit: canEdit(user, env), statuses: STATUSES, items });
  }

  if (path === '/api' && m === 'POST') {
    if (!canReview(user, env)) return json({ error: 'sin permiso' }, 403);
    if (!sameOrigin(req, url)) return json({ error: 'origen inválido' }, 403);
    const raw = await req.text();
    if (raw.length > MAX_BODY) return json({ error: 'demasiado grande' }, 413);
    const b = JSON.parse(raw);
    const id = `${String(9999999999999 - Date.now()).padStart(13, '0')}-${crypto.randomUUID().slice(0, 8)}`;
    const image = typeof b.image === 'string' && b.image.startsWith('data:image/jpeg;base64,') ? b.image : null;
    const item = {
      id,
      author: user,
      createdAt: new Date().toISOString(),
      status: 'nuevo',
      text: str(b.text, 4000),
      url: str(b.url, 1000),
      path: str(b.path, 500),
      title: str(b.title, 200),
      scrollY: num(b.scrollY),
      element: b.element ? { selector: str(b.element.selector, 400), tag: str(b.element.tag, 20), text: str(b.element.text, 200), section: str(b.element.section, 160) } : null,
      marks: Array.isArray(b.marks) ? b.marks.slice(0, 30).map((k) => ({ x: num(k.x), y: num(k.y), w: num(k.w), h: num(k.h) })) : [],
      device: clean(b.device),
      hasImage: !!image,
      note: '',
    };
    await env.FEEDBACK.put('c:' + id, JSON.stringify(item), { metadata: meta(item) });
    // La captura se guarda ya en binario: servirla no gasta CPU en decodificar base64.
    if (image) await env.FEEDBACK.put('b:' + id, fromB64(image.slice(image.indexOf(',') + 1)));
    return json({ ok: true, id }, 201);
  }

  const one = path.match(/^\/api\/([\w-]{10,40})$/);
  if (one && m === 'GET') {
    const item = await env.FEEDBACK.get('c:' + one[1], 'json');
    return item ? json(item) : json({ error: 'no existe' }, 404);
  }
  if (one && m === 'PATCH') {
    if (!canEdit(user, env)) return json({ error: 'sin permiso' }, 403);
    if (!sameOrigin(req, url)) return json({ error: 'origen inválido' }, 403);
    const item = await env.FEEDBACK.get('c:' + one[1], 'json');
    if (!item) return json({ error: 'no existe' }, 404);
    const b = await req.json();
    if (b.status && STATUSES.includes(b.status)) item.status = b.status;
    if (typeof b.note === 'string') item.note = str(b.note, 2000);
    item.updatedAt = new Date().toISOString();
    item.updatedBy = user;
    await env.FEEDBACK.put('c:' + item.id, JSON.stringify(item), { metadata: meta(item) });
    return json({ ok: true, item });
  }

  const img = path.match(/^\/img\/([\w-]{10,40})$/);
  if (img && m === 'GET') {
    let bin = await env.FEEDBACK.get('b:' + img[1], 'arrayBuffer');
    if (!bin) {
      // Capturas viejas (base64): se convierten una vez y quedan en binario.
      const data = await env.FEEDBACK.get('i:' + img[1]);
      if (!data) return new Response('', { status: 404 });
      bin = fromB64(data.slice(data.indexOf(',') + 1));
      await env.FEEDBACK.put('b:' + img[1], bin);
    }
    return new Response(bin, { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=31536000, immutable' } });
  }

  return json({ error: 'no encontrado' }, 404);
}

// --- Permisos (todo por parámetros del Worker) ---
// REVIEWERS: quienes ven el botón y cargan comentarios. TEAM: quienes ven la bandeja y cambian estados.
// Si una lista está vacía, vale cualquier usuario que haya pasado Cloudflare Access.
function canReview(u, env) { const l = list(env.REVIEWERS); return !!u && (!l.length || l.includes(u)); }
function canEdit(u, env) { const l = list(env.TEAM); return !!u && (!l.length || l.includes(u) || list(env.REVIEWERS).includes(u)); }
function canView(u, env) { return canReview(u, env) || canEdit(u, env); }

// Usuario: lo da Cloudflare Access. Si ACCESS_TEAM y ACCESS_AUD están configurados, se verifica la firma del JWT.
async function identify(req, env) {
  // Fail closed: solo se acepta un JWT de Access con firma verificada. DEV_USER solo sirve en local (wrangler dev).
  if (!env.ACCESS_TEAM || !env.ACCESS_AUD) return env.DEV_USER || null;
  const jwt = req.headers.get('cf-access-jwt-assertion') || cookie(req, 'CF_Authorization');
  if (!jwt) return null;
  const claims = await verifyAccessJwt(jwt, env).catch(() => null);
  return claims && claims.email ? claims.email.toLowerCase() : null;
}

let certCache = null;
async function verifyAccessJwt(token, env) {
  const [h, p, s] = token.split('.');
  const header = JSON.parse(b64urlDecode(h));
  const claims = JSON.parse(b64urlDecode(p));
  if (header.alg !== 'RS256') throw new Error('alg');
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!aud.includes(env.ACCESS_AUD)) throw new Error('aud');
  if (!claims.exp || claims.exp * 1000 < Date.now()) throw new Error('exp');
  if (claims.nbf && claims.nbf * 1000 > Date.now() + 60e3) throw new Error('nbf');
  const iss = `https://${env.ACCESS_TEAM}.cloudflareaccess.com`;
  if (claims.iss !== iss) throw new Error('iss');
  if (!certCache || certCache.at < Date.now() - 3600e3) {
    const r = await fetch(`${iss}/cdn-cgi/access/certs`);
    certCache = { at: Date.now(), keys: (await r.json()).keys };
  }
  const jwk = certCache.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const sig = Uint8Array.from(b64urlDecode(s), (c) => c.charCodeAt(0));
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, new TextEncoder().encode(`${h}.${p}`));
  if (!ok) throw new Error('firma');
  return claims;
}

// --- utilidades ---
function fromB64(s) {
  if (Uint8Array.fromBase64) return Uint8Array.fromBase64(s);
  const b = atob(s), out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}
function b64urlDecode(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return atob(s); }
function cookie(req, name) { const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')); return m ? m[1] : null; }
function sameOrigin(req, url) { const o = req.headers.get('origin'); return !o || o === url.origin; }
function str(v, n) { return typeof v === 'string' ? v.slice(0, n) : ''; }
function num(v) { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : 0; }
function clean(d) {
  if (!d || typeof d !== 'object') return {};
  const out = {};
  ['type', 'os', 'browser', 'viewport', 'screen', 'lang', 'ua'].forEach((k) => { out[k] = str(d[k], k === 'ua' ? 300 : 40); });
  out.dpr = Number(d.dpr) || 1; out.dark = !!d.dark;
  return out;
}
function meta(it) {
  // Metadata de KV (máx. 1024 bytes): lo justo para la lista de la bandeja.
  return { createdAt: it.createdAt, status: it.status, author: it.author, path: it.path.slice(0, 100), text: it.text.slice(0, 160), device: `${it.device.type || ''} · ${it.device.os || ''} · ${it.device.browser || ''}`.slice(0, 60), hasImage: it.hasImage };
}
function json(o, status = 200) { return new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } }); }
