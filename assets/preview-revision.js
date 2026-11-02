/* SOLO PREVIEW: aprobar o comentar cada resaltado (rosa y azul). Guarda en la bandeja de feedback.
   Quitar antes de publicar, junto con los estilos revisar-preview y v2-preview. */
(function () {
  if (location.hostname === 'gustavomenicillo.com' || location.hostname === 'www.gustavomenicillo.com') return;
  var API = '/__feedback/api';
  var css = '.rvc{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0 18px;font:600 13px/1.3 system-ui,sans-serif;position:relative;z-index:60}'
    + '.rvc button{font:inherit;border-radius:6px;padding:9px 12px;min-height:40px;cursor:pointer;border:1.5px solid currentColor;background:#fff}'
    + '.rvc .ok{color:#0a7a3d}.rvc .cm{color:#333}.rvc .st{font-weight:500;color:#555}'
    + '.rvc textarea{flex:1 1 100%;min-height:70px;font:400 15px/1.4 system-ui,sans-serif;padding:8px;border:1px solid #aaa;border-radius:6px;color:#111;background:#fff}'
    + '.rvc .send{color:#fff;background:#111;border-color:#111}'
    + '[data-rv-ok]{outline-color:#0a7a3d!important;outline-style:solid!important}'
    + '[data-rv-ok]::before{background:#0a7a3d!important}'
    + '.leyenda-preview .rvc{margin:8px 0 0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function kind(el) { return el.hasAttribute('data-revisar') ? 'Revisar' : 'V2'; }
  function label(el) { return kind(el) + ' · ' + (el.getAttribute('data-revisar') || el.getAttribute('data-v2')); }
  function device() {
    var ua = navigator.userAgent;
    return { type: matchMedia('(pointer:coarse)').matches ? 'celular' : 'compu', os: /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Win/.test(ua) ? 'Windows' : '', browser: /CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : '', w: innerWidth, h: innerHeight };
  }
  function send(el, text) {
    var sec = el.closest('section');
    var h = sec && sec.querySelector('h1,h2');
    return fetch(API, {
      method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: text, url: location.href, path: location.pathname, title: document.title, scrollY: scrollY,
        element: { selector: '[data-' + (el.hasAttribute('data-revisar') ? 'revisar' : 'v2') + ']', tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 200), section: h ? h.textContent.trim().slice(0, 160) : '' },
        marks: [], device: device() })
    }).then(function (r) { if (!r.ok) throw r.status; return r.json(); });
  }
  var FAIL = 'No se pudo guardar. Usá el botón de feedback de la página.';

  function controls(el) {
    var box = document.createElement('div'); box.className = 'rvc';
    var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'ok'; ok.textContent = '✓ Aprobar';
    var cm = document.createElement('button'); cm.type = 'button'; cm.className = 'cm'; cm.textContent = 'Comentar';
    var s = document.createElement('span'); s.className = 'st';
    box.append(ok, cm, s);
    ok.addEventListener('click', function () {
      ok.disabled = true; s.textContent = 'Guardando…';
      send(el, '[APROBADO] ' + label(el)).then(function () { mark(el, box, 'Aprobado. Queda registrado.'); })
        .catch(function () { ok.disabled = false; s.textContent = FAIL; });
    });
    cm.addEventListener('click', function () {
      if (box.querySelector('textarea')) return;
      var ta = document.createElement('textarea'); ta.placeholder = 'Escribí o dictá con el micrófono del teclado';
      var go = document.createElement('button'); go.type = 'button'; go.className = 'send'; go.textContent = 'Enviar comentario';
      box.append(ta, go); ta.focus();
      go.addEventListener('click', function () {
        var t = ta.value.trim(); if (!t) { ta.focus(); return; }
        go.disabled = true; s.textContent = 'Guardando…';
        send(el, '[COMENTARIO] ' + label(el) + ' — ' + t).then(function () { ta.remove(); go.remove(); s.textContent = 'Comentario guardado. Gracias.'; })
          .catch(function () { go.disabled = false; s.textContent = FAIL; });
      });
    });
    return box;
  }
  function mark(el, box, msg) {
    el.setAttribute('data-rv-ok', '');
    var b = box.querySelector('.ok'); if (b) b.remove();
    box.querySelector('.st').textContent = msg;
  }

  var items = [];
  document.querySelectorAll('[data-revisar],[data-v2]').forEach(function (el) {
    var box = controls(el);
    if (el.closest('header')) { var lg = document.getElementById('leyenda-preview'); if (lg) { var p = document.createElement('p'); p.textContent = label(el) + ':'; p.style.marginTop = '8px'; lg.append(p, box); } }
    else if (el.tagName === 'LI') el.appendChild(box);
    else if (el.tagName === 'SECTION') { var w = document.createElement('div'); w.className = 'wrap'; w.appendChild(box); el.insertAdjacentElement('afterend', w); }
    else el.insertAdjacentElement('afterend', box);
    items.push({ el: el, box: box });
  });

  // Lo ya aprobado queda marcado en verde al volver a entrar.
  fetch(API, { credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.items) return;
    var done = {};
    d.items.forEach(function (it) { if (it.path === location.pathname && it.text && it.text.indexOf('[APROBADO] ') === 0 && it.status !== 'descartado') done[it.text.slice(11)] = 1; });
    items.forEach(function (x) { var l = label(x.el).slice(0, 149); if (done[l]) mark(x.el, x.box, 'Ya aprobado.'); });
  }).catch(function () {});
})();
