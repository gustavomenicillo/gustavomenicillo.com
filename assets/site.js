(function () {
  var root = document.documentElement;
  document.body.classList.remove("no-js");
  root.classList.add("js");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id) { return document.getElementById(id); }

  // Encabezado y barra de progreso
  var bar = $("bar"), prog = $("progress"), hero = document.querySelector(".hero, .page-hero");
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.classList.toggle("solid", !hero || y > hero.offsetHeight - 80);
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Menú en celular
  var nav = $("nav"), mb = $("menu-btn");
  function closeMenu() { nav.classList.remove("open"); bar.classList.remove("open-menu"); mb.setAttribute("aria-expanded", "false"); }
  mb.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    bar.classList.toggle("open-menu", open);
    mb.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") closeMenu(); });

  // Aparición al hacer scroll
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });

  // Cifras que cuentan
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      if (reduce) return;
      var el = e.target, to = +el.dataset.count, t0 = null;
      function step(t) { if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1), k = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * k); if (p < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  }, { threshold: .6 });
  document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });

  // Línea de tiempo de empresas
  var gantt = $("gantt");
  if (gantt) {
    var A = Date.UTC(2001, 0), B = Date.UTC(2027, 0);
    var pos = function (s) { var p = s.split("-"); return (Date.UTC(+p[0], +p[1] - 1) - A) / (B - A) * 100; };
    var ticks = $("ticks");
    [2001, 2005, 2009, 2013, 2017, 2021, 2025].forEach(function (y) { var s = document.createElement("span"); s.textContent = y; s.style.left = pos(y + "-01") + "%"; ticks.appendChild(s); });
    gantt.querySelectorAll(".g-row").forEach(function (r, i) {
      var b = r.querySelector(".b"), l = pos(r.dataset.s);
      b.style.left = l + "%"; b.style.width = (pos(r.dataset.e) - l) + "%"; b.style.transitionDelay = (i * 0.06) + "s";
    });
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { gantt.classList.add("on"); o.disconnect(); } }, { threshold: .2 }).observe(gantt);
  }

  // Año fijo de la trayectoria
  var ty = $("tl-y"), tll = $("tl-l"), items = document.querySelectorAll(".tl-item");
  if (ty && items.length) {
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        items.forEach(function (i) { i.classList.remove("active"); });
        e.target.classList.add("active");
        ty.textContent = e.target.dataset.y; tll.textContent = e.target.dataset.l;
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    items.forEach(function (i) { tio.observe(i); });
  }

  // Pestañas
  var tabs = document.querySelectorAll('[role="tab"]');
  function select(t) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $(x.getAttribute("aria-controls")).hidden = !on; });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; select(n); n.focus(); }
    });
  });
  if (location.hash === "#personas" && tabs[1]) select(tabs[1]);

  // Testimonios
  var qm = $("q-more"), qr = $("quotes-rest");
  if (qm && qr) {
    qm.addEventListener("click", function () {
      var open = !qr.classList.toggle("collapsed");
      qm.setAttribute("aria-expanded", open);
      qm.textContent = open ? "Ver menos" : qm.dataset.label;
      if (open) qr.querySelectorAll(".rv").forEach(function (el) { el.classList.add("in"); });
    });
  }

  // Videos: se cargan recién al hacer clic
  document.querySelectorAll(".vid").forEach(function (v) {
    v.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + v.dataset.yt + "?autoplay=1&rel=0";
      f.title = v.getAttribute("aria-label").replace("Reproducir video: ", "");
      f.allow = "autoplay; encrypted-media; picture-in-picture"; f.allowFullscreen = true;
      v.replaceChildren(f); v.style.cursor = "default";
    }, { once: true });
  });
})();
