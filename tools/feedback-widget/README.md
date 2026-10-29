# Feedback sobre webs (preview)

Botón flotante para que Gustavo (o quien se designe) marque con el dedo, dicte o escriba correcciones sobre la web en revisión. Cada comentario guarda la página, la captura marcada, el elemento señalado, la sección y el dispositivo. Verónica y Ariel los ven en una bandeja.

- Botón: aparece solo en `preview.gustavomenicillo.com`, solo para los mails de `REVIEWERS`.
- Bandeja: `https://preview.gustavomenicillo.com/__feedback/` (estados nuevo / en curso / hecho / descartado, filtro por página, "Copiar tarea" en Markdown).
- Costo: USD 0 (Cloudflare Workers + KV en plan gratis: 100.000 pedidos y 1.000 escrituras por día).
- La web publicada no se toca: el Worker corre solo en la ruta del preview y no cambia el código del sitio.
- Seguridad: lo protege el mismo Cloudflare Access del preview. Con `ACCESS_TEAM` y `ACCESS_AUD` se verifica además la firma del JWT.

## Publicar (Ariel, 5 minutos)

1. `npm install`
2. `npx wrangler kv namespace create FEEDBACK` y copiar el `id` en `wrangler.toml`.
3. En Cloudflare Zero Trust > Access > Applications > la app del preview: copiar el "Application Audience (AUD) Tag" en `ACCESS_AUD` y el nombre del equipo (lo que va antes de `.cloudflareaccess.com`) en `ACCESS_TEAM`.
4. `npm run deploy`
5. Entrar a preview.gustavomenicillo.com desde el celular: abajo a la derecha aparece el botón rojo.

Para sumar a alguien: agregar su mail en la política de Access y en `REVIEWERS` (carga comentarios) o `TEAM` (ve la bandeja y cambia estados), y volver a publicar.
Para sacarlo: `npx wrangler delete` (el sitio queda igual que antes).

## Parámetros (`[vars]`)

| Variable | Qué hace |
|---|---|
| `ENABLED_HOSTS` | Dominios donde se activa (separados por coma). |
| `REVIEWERS` | Mails que ven el botón y cargan comentarios. Vacío = todos los que pasan Access. |
| `TEAM` | Mails que ven la bandeja y cambian estados. |
| `LANG` | `es` o `en` (vacío = idioma del navegador). |
| `COLOR` | Color del botón y del marcador. |
| `ORIGIN` | Opcional, solo para pruebas locales. |

## Probar en local

`npm run dev -- --var ENABLED_HOSTS:preview.gustavomenicillo.com --var ORIGIN:http://localhost:8081 --var DEV_USER:gustavomenicillo@gmail.com --var ACCESS_TEAM: --var ACCESS_AUD:` con una página servida en el 8081, y `node tests/e2e.cjs <carpeta>` (Playwright, celular y compu).

## Archivos

- `src/widget.js`: el botón (captura con modern-screenshot, MIT, incluido en `src/vendor-modern-screenshot.js`; dictado con Web Speech API; si el navegador no dicta, sirve el micrófono del teclado).
- `src/worker.js`: inyección, API, permisos y guardado.
- `src/inbox.html`: la bandeja.
- `build.mjs`: genera `src/assets.js`.
