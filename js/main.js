/* MazadPay — interactions */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    footerYear();
    navScroll();
    mobileMenu();
    langButtons();
    apkModal();
    reveals();
    counters();
    countdowns();
    contactForm();
  }

  /* footer year */
  function footerYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* sticky header shadow */
  function navScroll() {
    const nav = document.querySelector(".header");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* mobile menu */
  function mobileMenu() {
    const burger = document.querySelector(".header__burger");
    const menu = document.querySelector(".mobile-menu");
    if (!burger || !menu) return;

    const open = () => {
      menu.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
    };
    const close = () => {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    };

    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.contains("open") ? close() : open();
    });

    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !burger.contains(e.target)) close();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("open")) close();
    });
  }

  /* language toggle */
  function langButtons() {
    document.querySelectorAll("[data-lang-toggle]").forEach(btn =>
      btn.addEventListener("click", () => { if (window.toggleLang) window.toggleLang(); })
    );
  }

  /* APK modal — open triggers + close + backdrop + Escape */
  function apkModal() {
    const modal = document.getElementById("apk-modal");
    if (!modal) return;

    /* open: any element with data-open-modal="apk-modal" */
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-open-modal='apk-modal']");
      if (trigger) { modal.showModal(); return; }

      /* close button inside modal */
      if (e.target.closest("[data-close-modal]")) { modal.close(); return; }
    });

    /* backdrop click — click outside the inner box */
    modal.addEventListener("click", (e) => {
      const inner = modal.querySelector(".apk-modal__inner");
      if (inner && !inner.contains(e.target)) modal.close();
    });

    /* Escape is handled natively by <dialog> */
  }

  /* reveal on scroll */
  function reveals() {
    const els = [].slice.call(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    document.documentElement.classList.add("js-anim");
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.94 && r.bottom > 0;
    };
    requestAnimationFrame(() => els.forEach(el => { if (inView(el)) el.classList.add("in"); }));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
      els.forEach(el => io.observe(el));
    } else {
      els.forEach(el => el.classList.add("in"));
    }
    setTimeout(() => {
      const anyHidden = els.some(el => !el.classList.contains("in") && inView(el));
      if (anyHidden) document.documentElement.classList.add("reveal-safe");
    }, 1600);
    window.addEventListener("load", () => {
      setTimeout(() => els.forEach(el => { if (inView(el)) el.classList.add("in"); }), 200);
    });
  }

  /* animated counters */
  function counters() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    const fmt = (n) => n.toLocaleString("en-US");
    const run = (el) => {
      const target = parseFloat(el.getAttribute("data-count"));
      const prefix = el.getAttribute("data-prefix") || "";
      const dur = 1400, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + fmt(Math.round(target * e));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const seen = new WeakSet();
    const runOnce = (el) => { if (!seen.has(el)) { seen.add(el); run(el); } };
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.9 && r.bottom > 0;
    };
    nums.forEach(n => { if (inView(n)) runOnce(n); });
    if (!("IntersectionObserver" in window)) { nums.forEach(runOnce); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { runOnce(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nums.forEach(n => { if (!seen.has(n)) io.observe(n); });
  }

  /* live auction countdowns (data-ends = seconds from load) */
  function countdowns() {
    const els = [].slice.call(document.querySelectorAll("[data-ends]"));
    if (!els.length) return;
    const base = Date.now();
    const targets = els.map(el => ({ el, end: base + parseInt(el.getAttribute("data-ends"), 10) * 1000 }));
    const two = (n) => (n < 10 ? "0" + n : "" + n);
    const tick = () => {
      const now = Date.now();
      targets.forEach(t => {
        let s = Math.max(0, Math.round((t.end - now) / 1000));
        const d = Math.floor(s / 86400); s -= d * 86400;
        const h = Math.floor(s / 3600); s -= h * 3600;
        const m = Math.floor(s / 60); s -= m * 60;
        const valEl = t.el.querySelector(".cd");
        const txt = d > 0
          ? d + "ي " + two(h) + ":" + two(m)
          : two(h) + ":" + two(m) + ":" + two(s);
        if (valEl) valEl.textContent = txt;
        t.el.classList.toggle("ending", (t.end - now) < 3600 * 1000);
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* contact form (front-end only) */
  function contactForm() {
    const form = document.querySelector("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = form.querySelector(".form__ok");
      if (ok) ok.classList.add("show");
      form.reset();
      setTimeout(() => ok && ok.classList.remove("show"), 5000);
    });
  }
})();
