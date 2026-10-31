// Formulario «Conversemos»: llega ordenado por tipo al panel de Gustavo.
// Sin cookies ni rastreo: solo se envía lo que la persona escribe, la página desde la
// que llegó (para saber qué «Conversemos» funciona) y el tiempo de llenado (anti-robots).
(function () {
  var f = document.getElementById("formulario");
  if (!f) return;
  var t0 = Date.now();
  var estado = f.querySelector(".estado");
  var btn = f.querySelector("button[type=submit]");
  var desde = "";
  try { var r = new URL(document.referrer); if (r.origin === location.origin) desde = r.pathname; } catch (e) {}
  var q = new URLSearchParams(location.search).get("tema");
  function elegir(t) { var i = f.querySelector('input[name=tipo][value="' + t + '"]'); if (i) i.checked = true; }
  if (q) elegir(q);
  document.querySelectorAll("a.path[data-tipo]").forEach(function (a) {
    a.addEventListener("click", function () { elegir(a.dataset.tipo); setTimeout(function () { f.querySelector("input[name=nombre]").focus(); }, 300); });
  });
  function msg(t, cls) { estado.textContent = t; estado.className = "estado " + (cls || ""); }
  f.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var d = new FormData(f);
    var body = {
      tipo: d.get("tipo"), nombre: d.get("nombre"), email: d.get("email"), organizacion: d.get("organizacion"),
      mensaje: d.get("mensaje"), web: d.get("web"), acepta: !!d.get("acepta"),
      pagina: desde || location.pathname, ms: Date.now() - t0,
    };
    btn.disabled = true; msg("Enviando…");
    fetch(f.dataset.endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(body), credentials: "omit" })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (x) {
        if (x.s === 200 || x.s === 201) { f.reset(); msg("Gracias. Te llegó a mí directamente y te respondo personalmente.", "ok"); return; }
        if (x.s === 429) { msg("Recibí varias consultas seguidas desde tu conexión. Probá de nuevo en un rato o escribime al correo de abajo.", "err"); return; }
        if (x.s === 400) { msg("Revisá que estén completos el tipo, tu nombre, tu correo y el mensaje.", "err"); return; }
        msg("No se pudo enviar. Escribime a contacto@gustavomenicillo.com.", "err");
      })
      .catch(function () { msg("No se pudo enviar. Escribime a contacto@gustavomenicillo.com.", "err"); })
      .then(function () { btn.disabled = false; });
  });
})();
