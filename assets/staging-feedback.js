/* SOLO STAGING: botón para dejar comentarios sobre la página. Guarda en /__feedback/api (KV FEEDBACK de Pages).
   En gustavomenicillo.com no aparece. Quitar antes de publicar. */
(function () {
  var h = location.hostname;
  if (h === 'gustavomenicillo.com' || h === 'www.gustavomenicillo.com') return;
  var API = '/__feedback/api';
  var css = '.sfb-btn{position:fixed;right:14px;bottom:14px;z-index:9999;background:#e11d48;color:#fff;border:0;border-radius:999px;padding:13px 18px;font:600 15px/1 system-ui,sans-serif;box-shadow:0 3px 12px rgba(0,0,0,.25);cursor:pointer}'
    + '.sfb-box{position:fixed;left:12px;right:12px;bottom:12px;z-index:10000;max-width:440px;margin-left:auto;background:#fff;color:#111;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.3);padding:14px;font:400 15px/1.4 system-ui,sans-serif}'
    + '.sfb-box p{margin:0 0 8px}.sfb-box small{color:#555}.sfb-box textarea{width:100%;box-sizing:border-box;min-height:110px;font:inherit;padding:8px;border:1px solid #aaa;border-radius:8px;color:#111;background:#fff}'
    + '.sfb-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}.sfb-row button{font:600 14px/1 system-ui,sans-serif;border-radius:8px;padding:11px 14px;cursor:pointer;border:1.5px solid #111;background:#fff;color:#111}'
    + '.sfb-row .go{background:#111;color:#fff}.sfb-st{font-size:13px;color:#555}'
    + '.sfb-pick *{cursor:crosshair!important}.sfb-sel{outline:3px solid #e11d48!important;outline-offset:3px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'sfb-btn'; btn.textContent = 'Comentar';
  document.body.appendChild(btn);
  var box, chosen = null;

  function sectionName(el) {
    var s = el && el.closest('section,article,header,footer'); var t = s && s.querySelector('h1,h2,h3');
    return t ? t.textContent.trim().slice(0, 160) : '';
  }
  function visible() {
    var best = null; document.querySelectorAll('section,article').forEach(function (s) { var r = s.getBoundingClientRect(); if (!best && r.top < innerHeight / 2 && r.bottom > innerHeight / 2) best = s; });
    return best;
  }
  function device() {
    var ua = navigator.userAgent;
    return { type: matchMedia('(pointer:coarse)').matches ? 'celular' : 'compu', os: /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Win/.test(ua) ? 'Windows' : '', browser: /CriOS|Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : /Firefox/.test(ua) ? 'Firefox' : '', w: innerWidth, h: innerHeight };
  }
  function close() { if (chosen) chosen.classList.remove('sfb-sel'); chosen = null; if (box) box.remove(); box = null; btn.hidden = false; }

  function open() {
    btn.hidden = true;
    box = document.createElement('div'); box.className = 'sfb-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Dejar un comentario');
    box.innerHTML = '<p><strong>Tu comentario sobre esta página</strong><br><small>Escribí o dictá con el micrófono del teclado. Si querés, señalá la parte de la página.</small></p>'
      + '<textarea></textarea><div class="sfb-row"><button type="button" class="pick">Señalar en la página</button><button type="button" class="go">Enviar</button><button type="button" class="x">Cerrar</button><span class="sfb-st"></span></div>';
    document.body.appendChild(box);
    var ta = box.querySelector('textarea'), s = box.querySelector('.sfb-st');
    ta.focus();
    box.querySelector('.x').onclick = close;
    box.querySelector('.pick').onclick = function () {
      box.style.display = 'none'; document.documentElement.classList.add('sfb-pick');
      setTimeout(function () {
        document.addEventListener('click', function pick(e) {
          e.preventDefault(); e.stopPropagation();
          document.removeEventListener('click', pick, true);
          document.documentElement.classList.remove('sfb-pick');
          if (chosen) chosen.classList.remove('sfb-sel');
          chosen = e.target; chosen.classList.add('sfb-sel');
          box.style.display = ''; s.textContent = 'Señalado: ' + (chosen.textContent || chosen.tagName).trim().slice(0, 60);
        }, true);
      }, 50);
    };
    box.querySelector('.go').onclick = function () {
      var t = ta.value.trim(); if (!t) { ta.focus(); return; }
      var el = chosen || visible();
      var go = this; go.disabled = true; s.textContent = 'Guardando…';
      fetch(API, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: t, url: location.href, path: location.pathname, title: document.title, scrollY: scrollY,
          element: el ? { selector: el.id ? '#' + el.id : el.tagName.toLowerCase(), tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 200), section: sectionName(el) } : null,
          device: device() }) })
        .then(function (r) { if (!r.ok) throw r.status; s.textContent = 'Guardado. Gracias.'; ta.value = ''; setTimeout(close, 1200); })
        .catch(function () { go.disabled = false; s.textContent = 'No se pudo guardar. Probá de nuevo en un rato.'; });
    };
  }
  btn.addEventListener('click', open);
})();
