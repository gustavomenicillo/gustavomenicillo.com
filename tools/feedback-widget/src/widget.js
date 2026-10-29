/* Feedback widget: botón flotante para marcar, dictar y escribir correcciones sobre la página.
   Lo inyecta el Worker solo en los dominios configurados (preview). Requiere window.modernScreenshot. */
(function () {
  if (window.__fbWidget) return;
  window.__fbWidget = true;

  var CFG = Object.assign({ api: '/__feedback/api', lang: '', color: '#e11d48' }, window.FB_CONFIG || {});
  var T = {
    es: {
      open: 'Dar feedback', capturing: 'Capturando pantalla…', draw: 'Marcá sobre la pantalla con el dedo',
      undo: 'Deshacer', clear: 'Borrar', cancel: 'Cancelar', send: 'Enviar', sending: 'Enviando…',
      placeholder: 'Escribí o dictá el cambio que querés…', mic: 'Dictar', stop: 'Parar',
      micHint: 'Tu navegador no dicta acá: usá el micrófono del teclado.',
      sent: 'Listo, comentario guardado.', error: 'No se pudo guardar. Probá de nuevo.',
      empty: 'Escribí, dictá o marcá algo antes de enviar.', inbox: 'Ver comentarios',
      noShot: 'Sin captura: igual se guarda la página y el elemento.'
    },
    en: {
      open: 'Give feedback', capturing: 'Capturing screen…', draw: 'Draw on the screen with your finger',
      undo: 'Undo', clear: 'Clear', cancel: 'Cancel', send: 'Send', sending: 'Sending…',
      placeholder: 'Type or dictate the change you want…', mic: 'Dictate', stop: 'Stop',
      micHint: 'Dictation is not available here: use your keyboard microphone.',
      sent: 'Done, comment saved.', error: 'Could not save. Try again.',
      empty: 'Type, dictate or draw something before sending.', inbox: 'See comments',
      noShot: 'No screenshot: page and element are still saved.'
    }
  };
  var lang = (CFG.lang || navigator.language || 'es').slice(0, 2);
  var t = T[lang] || T.es;
  var speechLang = lang === 'en' ? 'en-US' : 'es-AR';

  var css = '' +
    '.fbw,.fbw *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:normal;text-transform:none}' +
    '.fbw-fab{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147483646;width:56px;height:56px;border-radius:50%;border:0;background:var(--fbc);color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation}' +
    '.fbw-fab svg{width:26px;height:26px}' +
    '.fbw-layer{position:fixed;inset:0;z-index:2147483647;background:#111;display:flex;flex-direction:column}' +
    '.fbw-top{display:flex;gap:8px;align-items:center;padding:8px 12px;padding-top:calc(8px + env(safe-area-inset-top));background:#111;color:#fff;font-size:14px}' +
    '.fbw-top span{flex:1;opacity:.85}' +
    '.fbw-stage{position:relative;flex:1;overflow:hidden;touch-action:none}' +
    '.fbw-stage canvas{position:absolute;inset:0;width:100%;height:100%}' +
    '.fbw-sheet{background:#fff;color:#111;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:8px;border-radius:14px 14px 0 0}' +
    '.fbw-sheet textarea{width:100%;min-height:72px;max-height:30vh;font-size:16px;padding:10px;border:1px solid #ccc;border-radius:10px;resize:vertical;color:#111;background:#fff}' +
    '.fbw-row{display:flex;gap:8px;align-items:center}' +
    '.fbw-btn{border:1px solid #ccc;background:#fff;color:#111;border-radius:10px;padding:10px 14px;font-size:15px;cursor:pointer;touch-action:manipulation}' +
    '.fbw-top .fbw-btn{background:#222;color:#fff;border-color:#444;padding:8px 12px;font-size:14px}' +
    '.fbw-btn.pri{background:var(--fbc);border-color:var(--fbc);color:#fff;margin-left:auto;font-weight:600}' +
    '.fbw-btn.rec{background:#111;color:#fff}' +
    '.fbw-btn[disabled]{opacity:.5}' +
    '.fbw-msg{font-size:13px;color:#555;min-height:1em}' +
    '.fbw-toast{position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483647;background:#111;color:#fff;padding:10px 16px;border-radius:10px;font-size:14px}';

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toast(msg) {
    var x = el('div', { class: 'fbw fbw-toast' }); x.textContent = msg;
    document.body.appendChild(x); setTimeout(function () { x.remove(); }, 2600);
  }

  var style = el('style'); style.textContent = css; document.head.appendChild(style);
  var fab = el('button', { class: 'fbw fbw-fab', 'aria-label': t.open, title: t.open, style: '--fbc:' + CFG.color },
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></svg>');
  document.body.appendChild(fab);
  fab.addEventListener('click', start);

  function device() {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Otro';
    var br = /Edg\//.test(ua) ? 'Edge' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Otro';
    var w = window.innerWidth;
    return {
      type: w < 768 ? 'celular' : w < 1100 ? 'tablet' : 'compu', os: os, browser: br,
      viewport: w + 'x' + window.innerHeight, screen: screen.width + 'x' + screen.height,
      dpr: window.devicePixelRatio || 1, dark: !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches),
      lang: navigator.language, ua: ua
    };
  }

  function selectorOf(node) {
    if (!node || node.nodeType !== 1) return '';
    var parts = [];
    while (node && node.nodeType === 1 && node !== document.body && parts.length < 5) {
      var s = node.tagName.toLowerCase();
      if (node.id) { parts.unshift(s + '#' + node.id); break; }
      var cls = (node.getAttribute('class') || '').trim().split(/\s+/).filter(function (c) { return c && c.length < 30; }).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      var p = node.parentElement;
      if (p) {
        var same = Array.prototype.filter.call(p.children, function (c) { return c.tagName === node.tagName; });
        if (same.length > 1) s += ':nth-of-type(' + (same.indexOf(node) + 1) + ')';
      }
      parts.unshift(s);
      node = p;
    }
    return parts.join(' > ');
  }

  function elementInfo(x, y) {
    var n = document.elementFromPoint(x, y);
    if (!n) return null;
    var txt = (n.innerText || n.alt || n.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    var heading = null, h = n;
    while (h && h !== document.body) {
      var prev = h;
      while (prev) {
        if (/^H[1-3]$/.test(prev.tagName)) { heading = prev.innerText.trim().slice(0, 120); break; }
        prev = prev.previousElementSibling;
      }
      if (heading) break;
      h = h.parentElement;
    }
    var r = n.getBoundingClientRect();
    return { selector: selectorOf(n), tag: n.tagName.toLowerCase(), text: txt, section: heading, area: r.width * r.height };
  }

  async function capture() {
    var ms = window.modernScreenshot;
    if (!ms) return null;
    var w = window.innerWidth, h = window.innerHeight, sx = window.scrollX, sy = window.scrollY;
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    // Al desplazar la raíz, lo fijo (menú, botones) se correría: se compensa durante la captura.
    var fixed = Array.prototype.filter.call(document.body.querySelectorAll('*'), function (n) {
      return !n.classList.contains('fbw') && getComputedStyle(n).position === 'fixed';
    });
    var saved = fixed.map(function (n) { var v = n.style.transform; n.style.transform = 'translate(' + sx + 'px,' + sy + 'px) ' + (v || ''); return v; });
    try {
      return await ms.domToCanvas(document.documentElement, {
        width: w, height: h, scale: scale, timeout: 8000,
        backgroundColor: getComputedStyle(document.body).backgroundColor || '#fff',
        style: { transform: 'translate(' + (-sx) + 'px,' + (-sy) + 'px)', transformOrigin: '0 0' },
        filter: function (n) { return !(n.classList && n.classList.contains('fbw')); }
      });
    } catch (e) { console.warn('[feedback] captura falló', e); return null; }
    finally { fixed.forEach(function (n, i) { n.style.transform = saved[i]; }); }
  }

  async function start() {
    var meta = { url: location.href, path: location.pathname, title: document.title, scrollY: Math.round(scrollY), device: device() };
    fab.style.display = 'none';
    var tmp = el('div', { class: 'fbw fbw-toast' }); tmp.textContent = t.capturing; document.body.appendChild(tmp);
    var shot = await capture();
    tmp.remove();
    openEditor(shot, meta);
  }

  function openEditor(shot, meta) {
    var layer = el('div', { class: 'fbw fbw-layer', style: '--fbc:' + CFG.color });
    var top = el('div', { class: 'fbw-top' });
    var hint = el('span'); hint.textContent = shot ? t.draw : t.noShot;
    var bUndo = el('button', { class: 'fbw-btn', type: 'button' }); bUndo.textContent = t.undo;
    var bClear = el('button', { class: 'fbw-btn', type: 'button' }); bClear.textContent = t.clear;
    top.append(hint, bUndo, bClear);
    var stage = el('div', { class: 'fbw-stage' });
    var base = el('canvas'), ink = el('canvas');
    stage.append(base, ink);
    var sheet = el('div', { class: 'fbw-sheet' });
    var ta = el('textarea', { placeholder: t.placeholder, rows: '3' });
    var row = el('div', { class: 'fbw-row' });
    var bMic = el('button', { class: 'fbw-btn', type: 'button' }); bMic.textContent = '🎤 ' + t.mic;
    var bCancel = el('button', { class: 'fbw-btn', type: 'button' }); bCancel.textContent = t.cancel;
    var bSend = el('button', { class: 'fbw-btn pri', type: 'button' }); bSend.textContent = t.send;
    var msg = el('div', { class: 'fbw-msg' });
    row.append(bMic, bCancel, bSend);
    sheet.append(ta, row, msg);
    layer.append(top, stage, sheet);
    document.body.appendChild(layer);
    var prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    // El lienzo replica la captura con su proporción; los trazos se guardan en coordenadas de la página.
    var vw = window.innerWidth, vh = window.innerHeight, box, ratio;
    function layout() {
      var r = stage.getBoundingClientRect();
      ratio = Math.min(r.width / vw, r.height / vh);
      box = { w: vw * ratio, h: vh * ratio, x: (r.width - vw * ratio) / 2, y: (r.height - vh * ratio) / 2 };
      var d = window.devicePixelRatio || 1;
      [base, ink].forEach(function (c) { c.width = r.width * d; c.height = r.height * d; c.getContext('2d').setTransform(d, 0, 0, d, 0, 0); });
      var bc = base.getContext('2d');
      bc.fillStyle = '#222'; bc.fillRect(0, 0, r.width, r.height);
      if (shot) bc.drawImage(shot, box.x, box.y, box.w, box.h);
      else { bc.fillStyle = '#fff'; bc.fillRect(box.x, box.y, box.w, box.h); }
      redraw();
    }
    var strokes = [], cur = null;
    function toPage(e) {
      var r = ink.getBoundingClientRect();
      return { x: (e.clientX - r.left - box.x) / ratio, y: (e.clientY - r.top - box.y) / ratio };
    }
    function drawStroke(ctx, s, k, ox, oy) {
      ctx.strokeStyle = CFG.color; ctx.lineWidth = 4 * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      s.forEach(function (p, i) { var X = ox + p.x * k, Y = oy + p.y * k; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      if (s.length === 1) ctx.lineTo(ox + s[0].x * k + 0.1, oy + s[0].y * k);
      ctx.stroke();
    }
    function redraw() {
      var c = ink.getContext('2d'); c.clearRect(0, 0, ink.width, ink.height);
      strokes.concat(cur ? [cur] : []).forEach(function (s) { drawStroke(c, s, ratio, box.x, box.y); });
    }
    ink.addEventListener('pointerdown', function (e) { e.preventDefault(); ink.setPointerCapture(e.pointerId); cur = [toPage(e)]; redraw(); });
    ink.addEventListener('pointermove', function (e) { if (!cur) return; cur.push(toPage(e)); redraw(); });
    function endStroke() { if (cur) { strokes.push(cur); cur = null; redraw(); } }
    ink.addEventListener('pointerup', endStroke);
    ink.addEventListener('pointercancel', endStroke);
    bUndo.onclick = function () { strokes.pop(); redraw(); };
    bClear.onclick = function () { strokes = []; redraw(); };
    window.addEventListener('resize', layout);
    layout();

    // Dictado por voz (Web Speech API). Si no está, queda el micrófono del teclado.
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition, rec = null;
    bMic.onclick = function () {
      if (!SR) { msg.textContent = t.micHint; ta.focus(); return; }
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = speechLang; rec.interimResults = true; rec.continuous = true;
      var baseText = ta.value ? ta.value.replace(/\s*$/, ' ') : '';
      rec.onresult = function (ev) {
        var fin = '', tmp = '';
        for (var i = 0; i < ev.results.length; i++) (ev.results[i].isFinal ? (fin += ev.results[i][0].transcript) : (tmp += ev.results[i][0].transcript));
        ta.value = baseText + fin + tmp;
      };
      rec.onerror = function (ev) { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') msg.textContent = t.micHint; };
      rec.onend = function () { rec = null; bMic.classList.remove('rec'); bMic.textContent = '🎤 ' + t.mic; };
      try { rec.start(); bMic.classList.add('rec'); bMic.textContent = '■ ' + t.stop; msg.textContent = ''; }
      catch (e) { rec = null; msg.textContent = t.micHint; }
    };

    function close() {
      if (rec) try { rec.abort(); } catch (e) {}
      window.removeEventListener('resize', layout);
      layer.remove();
      document.documentElement.style.overflow = prevOverflow;
      fab.style.display = '';
    }
    bCancel.onclick = close;

    bSend.onclick = async function () {
      var text = ta.value.trim();
      if (!text && !strokes.length) { msg.textContent = t.empty; return; }
      if (rec) try { rec.stop(); } catch (e) {}
      bSend.disabled = true; bSend.textContent = t.sending; msg.textContent = '';
      // Imagen final: captura + marcas, a tamaño de la pantalla (máx. 1200 px de ancho).
      var image = null;
      if (shot || strokes.length) {
        var k = Math.min(1, 1200 / vw), out = document.createElement('canvas');
        out.width = Math.round(vw * k); out.height = Math.round(vh * k);
        var oc = out.getContext('2d');
        oc.fillStyle = '#fff'; oc.fillRect(0, 0, out.width, out.height);
        if (shot) oc.drawImage(shot, 0, 0, out.width, out.height);
        strokes.forEach(function (s) { drawStroke(oc, s, k, 0, 0); });
        image = out.toDataURL('image/jpeg', 0.75);
      }
      // Elemento marcado: el que está debajo del primer trazo.
      var element = null;
      if (strokes.length) {
        layer.style.display = 'none';
        document.documentElement.style.overflow = prevOverflow;
        window.scrollTo(0, meta.scrollY);
        // Se elige el elemento más chico bajo los trazos (no el contenedor general).
        var best = null;
        strokes.forEach(function (st) {
          for (var i = 0; i < st.length; i += Math.max(1, Math.floor(st.length / 6))) {
            var info = elementInfo(st[i].x, st[i].y);
            if (info && info.tag !== 'body' && info.tag !== 'html' && (!best || info.area < best.area)) best = info;
          }
        });
        if (!best) {
          // Trazo en un margen: se busca el elemento más cercano por encima.
          var q = strokes[0][0];
          for (var dy = 0; dy < 200 && !best; dy += 10) { var inf = elementInfo(q.x, q.y - dy); if (inf && inf.tag !== 'body' && inf.tag !== 'html' && inf.tag !== 'section' && inf.tag !== 'main') best = inf; }
        }
        element = best;
        if (element) delete element.area;
        layer.style.display = '';
      }
      var marks = strokes.map(function (s) {
        var xs = s.map(function (p) { return p.x; }), ys = s.map(function (p) { return p.y; });
        return { x: Math.round(Math.min.apply(null, xs)), y: Math.round(Math.min.apply(null, ys) + meta.scrollY), w: Math.round(Math.max.apply(null, xs) - Math.min.apply(null, xs)), h: Math.round(Math.max.apply(null, ys) - Math.min.apply(null, ys)) };
      });
      try {
        var res = await fetch(CFG.api, {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(Object.assign({}, meta, { text: text, image: image, element: element, marks: marks, createdAt: new Date().toISOString() }))
        });
        if (!res.ok) throw new Error(res.status);
        close(); toast(t.sent);
      } catch (e) {
        console.warn('[feedback] envío falló', e);
        bSend.disabled = false; bSend.textContent = t.send; msg.textContent = t.error;
      }
    };
  }
})();
