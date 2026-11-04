// Staging de gustavomenicillo.com: usuario y clave del navegador (autenticación básica).
// La clave NO está en el repo (es público): se lee de los secretos del proyecto de Pages
// STAGING_USER y STAGING_PASS. Sin esos secretos el staging queda cerrado.
// La web publicada (gustavomenicillo.com y www) no pasa por la puerta.
const PUBLICOS = new Set(["gustavomenicillo.com", "www.gustavomenicillo.com"]);
const VIEJO = "preview.gustavomenicillo.com";
const NUEVO = "staging.gustavomenicillo.com";

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
  return r;
}
