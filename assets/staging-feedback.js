/* SOLO STAGING: un solo botón de feedback (pedido de Gustavo, 4/11), con texto, voz y dibujo sobre la pantalla.
   Reemplaza al botón «Comentar», que solo dejaba escribir. Carga el mismo widget del panel (assets/feedback-widget.js,
   generado desde tools/feedback-widget) y guarda en /__feedback/api (KV FEEDBACK de Pages).
   En gustavomenicillo.com y www no aparece. Quitar antes de publicar. */
(function () {
  var h = location.hostname.toLowerCase().replace(/\.$/, '');
  if (h === 'gustavomenicillo.com' || h === 'www.gustavomenicillo.com') return;
  if (window.__fbWidget) return;
  window.FB_CONFIG = { api: '/__feedback/api', lang: 'es', color: '#e11d48' };
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/assets/feedback-widget.css?v=1';
  document.head.appendChild(css);
  var js = document.createElement('script'); js.src = '/assets/feedback-widget.js?v=1'; js.defer = true;
  document.body.appendChild(js);
})();
