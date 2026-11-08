// Staging de gustavomenicillo.com: usuario y clave del navegador (autenticación básica).
// La clave NO está en el repo (es público): se lee de los secretos del proyecto de Pages
// STAGING_USER y STAGING_PASS. Sin esos secretos el staging queda cerrado.
// La web publicada (gustavomenicillo.com y www) no pasa por la puerta.
const PUBLICOS = new Set(["gustavomenicillo.com", "www.gustavomenicillo.com"]);
const VIEJO = "preview.gustavomenicillo.com";
const NUEVO = "staging.gustavomenicillo.com";
// Igual que _headers, salvo el micrófono, que se abre solo para el propio sitio (self), nunca para terceros.
const STAGING_PERMISOS = "camera=(), microphone=(self), geolocation=()";
const BEACON = 'script[src*="cloudflareinsights.com"], script[data-cf-beacon]';

const enc = new TextEncoder();
async function digest(s) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));
}
function iguales(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i];
  return d === 0;
}
function pedir() {
  return new Response("Staging privado: ingresá usuario y clave.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Staging", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  // Las pruebas del repo (test/) no se publican en ningún host: la raíz del repo es la salida de Pages.
  if (url.pathname.startsWith("/test/")) {
    return new Response("No encontrado", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
  // Buzón de feedback (functions/__buzon/feedback.js): esa ruta exacta no usa la clave básica, la reemplaza un token
  // OIDC de GitHub Actions que verifica la propia función (y que responde 404 fuera de staging.gustavomenicillo.com).
  // No marca ctx.data.staging, así que no abre ninguna otra función. Todo lo demás sigue igual.
  if (url.pathname === "/__buzon/feedback") return next();
  if (PUBLICOS.has(host)) return next();
  // El 301 se activa con la variable REDIRIGIR_PREVIEW=1, cuando staging ya responde.
  if (host === VIEJO && env.REDIRIGIR_PREVIEW === "1") {
    url.hostname = NUEVO;
    return Response.redirect(url.toString(), 301);
  }
  const usuario = env.STAGING_USER, clave = env.STAGING_PASS;
  if (!usuario || !clave) return pedir();
  const h = request.headers.get("Authorization") || "";
  if (!h.startsWith("Basic ")) return pedir();
  let txt;
  try { txt = atob(h.slice(6).trim()); } catch { return pedir(); }
  if (txt.length > 300) return pedir();
  const ok = iguales(await digest(txt), await digest(`${usuario}:${clave}`));
  if (!ok) return pedir();
  // Solo después de la clave: las funciones del staging (/__feedback/api) exigen esta marca, así no dependen de
  // comparar el host (por ejemplo «gustavomenicillo.com.» con punto final, que entra por la rama pública).
  ctx.data.staging = true;
  const res = await next();
  const r = new Response(res.body, res);
  r.headers.set("Cache-Control", "private, no-store");
  r.headers.set("X-Robots-Tag", "noindex, nofollow");
  // Solo staging (y las vistas previas de Pages, detrás de esta misma puerta): el dictado del botón de feedback
  // necesita el micrófono del propio sitio. Producción no pasa por acá y sigue con microphone=() de _headers.
  r.headers.set("Permissions-Policy", STAGING_PERMISOS);
  // Con el micrófono abierto para el sitio, ningún script de terceros corre en staging: se saca el beacon de
  // Cloudflare Web Analytics (Seguridad, #6). Producción lo conserva: no pasa por acá.
  if ((r.headers.get("Content-Type") || "").includes("text/html")) {
    return new HTMLRewriter().on(BEACON, { element: (e) => e.remove() }).transform(r);
  }
  return r;
}
