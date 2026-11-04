/* SOLO STAGING: los resaltados rosa (data-revisar) y azul (data-v2) ya no traen botones Aprobar ni Comentar.
   Pedido de Gustavo (4/11): un solo control para revisar, el botón de feedback de la página (texto, voz y dibujo).
   Este archivo solo muestra en verde lo que ya se aprobó antes con esos botones, leyendo la bandeja (no escribe nada).
   Quitar antes de publicar, junto con los estilos revisar-preview y v2-preview. */
(function () {
  if (location.hostname === 'gustavomenicillo.com' || location.hostname === 'www.gustavomenicillo.com') return;
  var API = '/__feedback/api';
  var css = '[data-rv-ok]{outline-color:#0a7a3d!important;outline-style:solid!important}'
    + '[data-rv-ok]::before{background:#0a7a3d!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function kind(el) { return el.hasAttribute('data-revisar') ? 'Revisar' : 'V2'; }
  function label(el) { return kind(el) + ' · ' + (el.getAttribute('data-revisar') || el.getAttribute('data-v2')); }

  var items = Array.prototype.slice.call(document.querySelectorAll('[data-revisar],[data-v2]'));
  if (!items.length) return;

  // Lo que ya se aprobó con los botones viejos queda marcado en verde, y la leyenda lo explica.
  fetch(API, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.items) return;
    var done = {};
    d.items.forEach(function (it) { if (it.path === location.pathname && it.text && it.text.indexOf('[APROBADO] ') === 0 && it.status !== 'descartado') done[it.text.slice(11)] = 1; });
    var n = 0;
    items.forEach(function (el) { if (done[label(el).slice(0, 149)]) { el.setAttribute('data-rv-ok', ''); n++; } });
    var lg = document.getElementById('leyenda-preview');
    if (n && lg && !lg.querySelector('.rv-verde')) {
      var p = document.createElement('p'); p.className = 'rv-verde';
      var i = document.createElement('i'); i.style.background = '#0a7a3d';
      p.append(i, document.createTextNode('Verde: ya aprobado'));
      var nota = lg.querySelector('p[style]');
      lg.insertBefore(p, nota || lg.querySelector('button'));
    }
  }).catch(function () {});
})();
