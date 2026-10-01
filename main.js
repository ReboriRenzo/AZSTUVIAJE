(() => {
  const nav = document.getElementById("nav-principal");
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");
  const year = document.getElementById("year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const DOCK_SCROLL_Y = 28;

  const syncHeaderDock = () => {
    if (!header) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("is-docked", y > DOCK_SCROLL_Y);
  };

  syncHeaderDock();
  window.addEventListener("scroll", syncHeaderDock, { passive: true });

  if (nav && toggle) {
    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    window.addEventListener("resize", () => {
      syncHeaderDock();
      if (window.matchMedia("(min-width: 1025px)").matches) {
        setOpen(false);
      }
    });
  } else {
    window.addEventListener("resize", syncHeaderDock);
  }

  const WPP_PHONES = {
    zulema: "5493572612959",
    analia: "5493571355381",
  };

  const form = document.querySelector(".lead-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const value = (name) => String(data.get(name) || "").trim();
      const tipo = form.querySelector('[name="tipo"]');
      const tipoLabel =
        tipo instanceof HTMLSelectElement && tipo.selectedOptions[0] && tipo.value
          ? tipo.selectedOptions[0].textContent.trim()
          : "";

      const lines = ["Hola, quiero consultar un viaje con AZ TÚ VIAJE.", "", `Nombre: ${value("nombre")}`];
      const optional = [
        ["Destino", value("destino")],
        ["Fecha aproximada", value("fecha")],
        ["Pasajeros", value("pasajeros")],
        ["Tipo de viaje", tipoLabel],
      ];
      optional.forEach(([label, text]) => {
        if (text) lines.push(`${label}: ${text}`);
      });
      const notas = value("observaciones");
      if (notas) {
        lines.push("", `Observaciones: ${notas}`);
      }

      const phone = WPP_PHONES[value("asesor")] || WPP_PHONES.zulema;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
      const popup = window.open(url, "_blank");
      if (popup) popup.opener = null;
      else window.location.assign(url);
    });
  }

  /**
   * Patrones inspirados en colecciones tipo freefrontend.com/javascript-code-examples:
   * scroll reveal, entrada escalonada del hero, parallax suave, tilt 3D, botones magnéticos,
   * ripple al clic y realce en inputs.
   */
  const initScrollReveal = () => {
    const els = document.querySelectorAll(".js-reveal");
    if (!els.length) return;

    if (reduceMotion) {
      els.forEach((el) => el.classList.add("is-inview"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay) || 0;
          window.setTimeout(() => {
            el.classList.add("is-inview");
          }, delay);
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -7% 0px", threshold: 0.06 }
    );

    els.forEach((el) => io.observe(el));
  };

  const initHeroEntrance = () => {
    const lines = document.querySelectorAll(".js-hero-line[data-stagger]");
    if (!lines.length) return;

    if (reduceMotion) {
      document.body.classList.add("is-motion-ready");
      lines.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    requestAnimationFrame(() => {
      document.body.classList.add("is-motion-ready");
      lines.forEach((el) => {
        const step = Number(el.dataset.stagger) || 1;
        el.style.transitionDelay = `${(step - 1) * 95}ms`;
        el.classList.add("is-visible");
      });
    });
  };

  const initHeroMeshCanvas = () => {
    const hero = document.querySelector("[data-hero-parallax]");
    const canvas = hero?.querySelector(".hero-mesh-canvas");
    if (!hero || !canvas || !(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let tx = 0.5;
    let ty = 0.5;
    let mx = 0.5;
    let my = 0.5;

    const palette = [
      [118, 72, 178],
      [138, 88, 205],
      [95, 55, 155],
      [120, 175, 168],
      [152, 102, 210],
    ];

    const blobs = Array.from({ length: 7 }, (_, i) => ({
      nx: 0.08 + Math.random() * 0.84,
      ny: 0.08 + Math.random() * 0.84,
      baseR: 0.2 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.55,
      pi: i % palette.length,
    }));

    const specks = Array.from({ length: 52 }, () => ({
      nx: Math.random(),
      ny: Math.random(),
      r: 0.35 + Math.random() * 1.8,
      a: 0.1 + Math.random() * 0.16,
      ph: Math.random() * Math.PI * 2,
      sp: 0.2 + Math.random() * 0.5,
      col: Math.random() > 0.62 ? 1 : 0,
    }));

    /** Círculos solo borde: violeta, verde o casi negro, color fuerte, trayectoria suave. */
    const floaterRgb = [
      [88, 38, 158],
      [18, 112, 92],
      [12, 8, 22],
    ];
    const floaters = Array.from({ length: 24 }, () => ({
      kind: Math.floor(Math.random() * 3),
      r: 4.5 + Math.random() * 19,
      lw: 1.15 + Math.random() * 1.45,
      ox: Math.random(),
      oy: Math.random(),
      wx1: 0.13 + Math.random() * 0.38,
      wx2: 0.05 + Math.random() * 0.14,
      wy1: 0.12 + Math.random() * 0.36,
      wy2: 0.05 + Math.random() * 0.13,
      ax: 0.028 + Math.random() * 0.09,
      ay: 0.025 + Math.random() * 0.085,
      phx: Math.random() * Math.PI * 2,
      phy: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      if (w < 1 || h < 1) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const onPtr = (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
    };

    const draw = (now) => {
      const sec = now * 0.001;
      mx += (tx - mx) * 0.038;
      my += (ty - my) * 0.038;

      if (w < 2 || h < 2) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#d8c6ee";
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        const pullX = (mx - 0.5) * 0.08;
        const pullY = (my - 0.5) * 0.08;
        const bx =
          (b.nx +
            Math.sin(sec * (0.38 * b.speed + 0.22) + b.phase) * 0.065 +
            Math.sin(sec * 0.52 + b.phase * 2) * 0.028 +
            pullX) *
          w;
        const by =
          (b.ny +
            Math.cos(sec * (0.34 * b.speed + 0.18) + b.phase * 1.15) * 0.065 +
            pullY) *
          h;
        const radius =
          b.baseR * (0.9 + Math.sin(sec * 0.62 + b.phase) * 0.11) * Math.max(w, h) * 0.5;
        const [cr, cg, cb] = palette[b.pi];
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0.78)`);
        g.addColorStop(0.38, `rgba(${cr},${cg},${cb},0.32)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      for (const s of specks) {
        const px = (s.nx + Math.sin(sec * (0.55 * s.sp + 0.12) + s.ph) * 0.018) * w;
        const py = (s.ny + Math.cos(sec * (0.48 * s.sp + 0.1) + s.ph * 1.08) * 0.018) * h;
        const [r0, g0, b0] = s.col === 0 ? palette[0] : palette[3];
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r0},${g0},${b0},${s.a})`;
        ctx.fill();
      }

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const f of floaters) {
        const nx =
          f.ox +
          Math.sin(sec * f.wx1 + f.phx) * f.ax +
          Math.sin(sec * f.wx2 + f.phx * 1.31) * (f.ax * 0.38);
        const ny =
          f.oy +
          Math.cos(sec * f.wy1 + f.phy) * f.ay +
          Math.cos(sec * f.wy2 + f.phy * 1.17) * (f.ay * 0.36);
        const px = nx * w;
        const py = ny * h;
        const rr = f.r * (0.9 + Math.sin(sec * 0.55 + f.pulse) * 0.1);
        const [fr, fg, fb] = floaterRgb[f.kind];
        ctx.lineWidth = f.lw;
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgb(${fr},${fg},${fb})`;
        ctx.stroke();
      }

      const vg = ctx.createRadialGradient(
        w * 0.5,
        h * 0.35,
        0,
        w * 0.5,
        h * 0.55,
        Math.max(w, h) * 0.58
      );
      vg.addColorStop(0, "rgba(255,255,255,0)");
      vg.addColorStop(1, "rgba(255,255,255,0.08)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(hero);
    resize();
    hero.addEventListener("pointermove", onPtr, { passive: true });
    hero.addEventListener("pointerleave", () => {
      tx = 0.5;
      ty = 0.5;
    });
    requestAnimationFrame(draw);
  };

  /** Tarjeta de contacto: baja con el scroll hasta el final de la sección (desktop). */
  const initContactCardScrollFollow = () => {
    const section = document.getElementById("contacto");
    const inner = section?.querySelector(".section__inner--contact");
    const card = section?.querySelector("[data-contact-card]");
    const head = section?.querySelector(".contact__head");
    const formCol = section?.querySelector(".contact__form-col");
    const mq = window.matchMedia("(min-width: 880px)");

    if (!section || !inner || !card || !head || !formCol) return;

    let maxOffset = 0;
    let raf = 0;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    const measure = () => {
      if (!mq.matches) {
        maxOffset = 0;
        card.style.transform = "";
        return;
      }

      const innerRect = inner.getBoundingClientRect();
      const headRect = head.getBoundingClientRect();
      const formRect = formCol.getBoundingClientRect();
      const cardH = card.offsetHeight;
      const startY = headRect.top - innerRect.top;
      const endY = formRect.bottom - innerRect.top - cardH;

      maxOffset = Math.max(0, endY - startY);
    };

    const update = () => {
      raf = 0;

      if (!mq.matches || reduceMotion) {
        card.style.transform = "";
        return;
      }

      const innerStyles = getComputedStyle(inner);
      const stickyTop =
        parseFloat(innerStyles.getPropertyValue("--contact-sticky-top")) || 80;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = rect.top - stickyTop;
      const end = rect.bottom - vh * 0.88;
      const range = end - start;
      const progress = range > 0 ? clamp(-start / range, 0, 1) : 0;

      card.style.transform = `translate3d(0, ${progress * maxOffset}px, 0)`;
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    update();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      schedule();
    });

    mq.addEventListener("change", () => {
      measure();
      schedule();
    });

    const ro = new ResizeObserver(() => {
      measure();
      schedule();
    });
    ro.observe(section);
    ro.observe(card);
    ro.observe(formCol);
  };

  /** Puntos violetas flotantes en la tarjeta Contacto directo. */
  const initContactCardDotsCanvas = () => {
    const card = document.querySelector("[data-contact-card]");
    const canvas = card?.querySelector(".contact-card__dots-canvas");
    if (!card || !canvas || !(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const purples = [
      [155, 114, 203],
      [118, 72, 178],
      [138, 88, 205],
      [95, 55, 155],
    ];

    const dots = Array.from({ length: 32 }, () => ({
      nx: Math.random(),
      ny: Math.random(),
      r: 2.2 + Math.random() * 4.8,
      alpha: 0.22 + Math.random() * 0.38,
      ph: Math.random() * Math.PI * 2,
      sp: 0.35 + Math.random() * 0.65,
      pi: Math.floor(Math.random() * purples.length),
      drift: 0.004 + Math.random() * 0.01,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = card.clientWidth;
      h = card.clientHeight;
      if (w < 1 || h < 1) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const draw = (now) => {
      const t = now * 0.001;
      if (w < 2 || h < 2) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const d of dots) {
        const [pr, pg, pb] = purples[d.pi];
        const pulse = 0.82 + Math.sin(t * d.sp * 2.2 + d.ph) * 0.18;
        let x =
          (d.nx +
            Math.sin(t * d.sp + d.ph) * 0.09 +
            Math.cos(t * d.sp * 0.7 + d.ph * 1.4) * 0.04 +
            t * d.drift) %
          1;
        let y =
          (d.ny +
            Math.cos(t * d.sp * 0.9 + d.ph * 1.1) * 0.09 +
            Math.sin(t * d.sp * 0.55 + d.ph) * 0.04 +
            t * d.drift * 0.85) %
          1;
        if (x < 0) x += 1;
        if (y < 0) y += 1;

        ctx.beginPath();
        ctx.arc(x * w, y * h, d.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${d.alpha})`;
        ctx.fill();
      }

      requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(card);
    resize();
    requestAnimationFrame(draw);
  };

  /**
   * Fondo animado Experiencias: olas en capas con desplazamiento continuo (canvas).
   * Inspirado en wave / ocean backgrounds (freefrontend). Distinto al mesh del hero.
   */
  const initShowcaseBubblesCanvas = () => {
    const section = document.querySelector("[data-showcase-section]");
    const canvas = section?.querySelector(".showcase-bubbles-canvas");
    if (!section || !canvas || !(canvas instanceof HTMLCanvasElement)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = true;
    let mx = 0.5;
    let px = 0.5;

    const purple = [155, 114, 203];
    const teal = [120, 195, 185];

    const waveLayers = [
      { base: 0.52, amp: 0.11, freq: 0.0052, speed: 1.15, phase: 0, col: teal, fill: 0.1, stroke: 0.32, lw: 2 },
      { base: 0.62, amp: 0.09, freq: 0.0068, speed: -0.95, phase: 1.4, col: purple, fill: 0.09, stroke: 0.28, lw: 1.8 },
      { base: 0.72, amp: 0.075, freq: 0.0082, speed: 1.35, phase: 2.1, col: teal, fill: 0.11, stroke: 0.26, lw: 1.6 },
      { base: 0.82, amp: 0.06, freq: 0.0095, speed: -1.2, phase: 0.6, col: purple, fill: 0.12, stroke: 0.24, lw: 1.5 },
      { base: 0.9, amp: 0.045, freq: 0.011, speed: 1.55, phase: 3.2, col: teal, fill: 0.14, stroke: 0.22, lw: 1.35 },
    ];

    const waveY = (x, layer, sec, sway) => {
      const t = sec * layer.speed + layer.phase + sway;
      const baseY = h * layer.base;
      const ampPx = h * layer.amp;
      return (
        baseY +
        Math.sin(x * layer.freq + t) * ampPx +
        Math.sin(x * layer.freq * 2.15 + t * 1.25) * ampPx * 0.32 +
        Math.sin(x * layer.freq * 0.48 + t * 0.7) * ampPx * 0.18
      );
    };

    const traceWave = (layer, sec, sway, startX, endX, step) => {
      let first = true;
      for (let x = startX; x <= endX; x += step) {
        const y = waveY(x, layer, sec, sway);
        if (first) {
          ctx.moveTo(x, y);
          first = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = section.clientWidth;
      h = section.clientHeight;
      if (w < 1 || h < 1) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const drawWaves = (sec) => {
      const sway = (px - 0.5) * 0.35;
      const step = Math.max(3, w / 140);

      for (const layer of waveLayers) {
        const [r, g, b] = layer.col;
        ctx.beginPath();
        traceWave(layer, sec, sway, -12, w + 12, step);
        ctx.lineTo(w + 24, h + 32);
        ctx.lineTo(-24, h + 32);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r},${g},${b},${layer.fill})`;
        ctx.fill();
      }

      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      for (const layer of waveLayers) {
        const [r, g, b] = layer.col;
        ctx.beginPath();
        traceWave(layer, sec, sway, -12, w + 12, step);
        ctx.strokeStyle = `rgba(${r},${g},${b},${layer.stroke})`;
        ctx.lineWidth = layer.lw;
        ctx.stroke();
      }
    };

    const draw = (now) => {
      if (!running) return;

      const sec = now * 0.001;
      px += (mx - px) * 0.04;

      if (w < 2 || h < 2) {
        requestAnimationFrame(draw);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "rgba(246, 244, 251, 0.92)");
      bg.addColorStop(0.45, "rgba(246, 244, 251, 0.55)");
      bg.addColorStop(1, "rgba(228, 244, 240, 0.75)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      drawWaves(sec);

      requestAnimationFrame(draw);
    };

    const onPtr = (e) => {
      const r = section.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
    };

    const io = new IntersectionObserver(
      (entries) => {
        running = entries[0]?.isIntersecting ?? true;
        if (running) requestAnimationFrame(draw);
      },
      { threshold: 0.05 }
    );
    io.observe(section);

    const ro = new ResizeObserver(resize);
    ro.observe(section);
    resize();
    section.addEventListener("pointermove", onPtr, { passive: true });
    section.addEventListener("pointerleave", () => {
      mx = 0.5;
    });
    requestAnimationFrame(draw);
  };

  const initHeroParallax = () => {
    const root = document.querySelector("[data-hero-parallax]");
    if (!root) return;

    const layers = root.querySelectorAll("[data-parallax-layer]");
    if (!layers.length) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const loop = (now) => {
      const sec = now * 0.001;
      curX += (targetX - curX) * 0.1;
      curY += (targetY - curY) * 0.1;
      layers.forEach((layer) => {
        const s = Number(layer.dataset.parallaxLayer) || 0.08;
        const ptrX = curX * s * 56;
        const ptrY = curY * s * 56;
        const bobX = Math.sin(sec * (0.32 + s * 1.4)) * (2.2 + s * 16);
        const bobY = Math.cos(sec * (0.27 + s * 1.2)) * (1.9 + s * 14);
        layer.style.transform = `translate3d(${ptrX + bobX}px, ${ptrY + bobY}px, 0)`;
      });
      requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const r = root.getBoundingClientRect();
      targetX = (e.clientX - r.left) / r.width - 0.5;
      targetY = (e.clientY - r.top) / r.height - 0.5;
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    requestAnimationFrame(loop);
  };

  const bindMagnetic = (btn) => {
    const strength = 0.14;
    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      btn.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`;
    };
    const onLeave = () => {
      btn.style.transform = "";
    };
    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", onLeave);
  };

  const initMagnetic = () => {
    if (!finePointer) return;
    document.querySelectorAll(".js-magnetic").forEach(bindMagnetic);
  };

  const bindTilt = (el, maxDeg) => {
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(880px) rotateY(${x * maxDeg}deg) rotateX(${-y * maxDeg}deg) translateZ(0)`;
      el.classList.add("is-tilting");
    };
    const onLeave = () => {
      el.style.transform = "";
      el.classList.remove("is-tilting");
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  };

  const initTiltCards = () => {
    if (!finePointer) return;
    document.querySelectorAll(".js-tilt").forEach((el) => bindTilt(el, 11));
    document.querySelectorAll(".js-tilt-subtle").forEach((el) => bindTilt(el, 5));
  };

  const initRipple = () => {
    if (reduceMotion) return;

    document.querySelectorAll(".js-ripple").forEach((btn) => {
      btn.addEventListener(
        "click",
        (e) => {
          if (typeof e.clientX !== "number" || typeof e.clientY !== "number") return;
          if ("button" in e && e.button !== 0) return;
          const rect = btn.getBoundingClientRect();
          const ripple = document.createElement("span");
          ripple.className = "click-ripple";
          const size = Math.max(rect.width, rect.height) * 2.2;
          ripple.style.width = `${size}px`;
          ripple.style.height = `${size}px`;
          ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
          ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
          ripple.style.animation = "ripple-expand 0.58s ease-out forwards";
          btn.insertBefore(ripple, btn.firstChild);
          window.setTimeout(() => ripple.remove(), 600);
        },
        { passive: true }
      );
    });
  };

  const initFieldGlow = () => {
    if (reduceMotion) return;
    document.querySelectorAll(".field__input").forEach((input) => {
      input.addEventListener("focus", () => input.classList.add("is-focused"));
      input.addEventListener("blur", () => input.classList.remove("is-focused"));
    });
  };

  const initWhatsappWidget = () => {
    const root = document.querySelector("[data-wpp-widget]");
    if (!root) return;

    const openBtn = root.querySelector("[data-wpp-open]");
    const closeBtn = root.querySelector("[data-wpp-close]");
    const backdrop = root.querySelector("[data-wpp-backdrop]");
    const panel = document.getElementById("wpp-panel");
    if (!openBtn || !panel || !backdrop) return;

    let lastFocus = null;

    const setOpen = (open) => {
      root.classList.toggle("is-open", open);
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      backdrop.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";

      if (open) {
        lastFocus = document.activeElement;
        const first = panel.querySelector("a, button");
        if (first instanceof HTMLElement) first.focus();
      } else if (lastFocus instanceof HTMLElement) {
        lastFocus.focus();
        lastFocus = null;
      }
    };

    openBtn.addEventListener("click", () => {
      const isOpen = root.classList.contains("is-open");
      setOpen(!isOpen);
    });

    closeBtn?.addEventListener("click", () => setOpen(false));
    backdrop.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root.classList.contains("is-open")) {
        setOpen(false);
      }
    });
  };

  const initShowcaseCarousel = () => {
    const root = document.querySelector("[data-showcase-carousel]");
    if (!root) return;

    const slides = [...root.querySelectorAll("[data-showcase-slide]")];
    const dotsWrap = root.querySelector("[data-showcase-dots]");
    const prevBtn = root.querySelector("[data-showcase-prev]");
    const nextBtn = root.querySelector("[data-showcase-next]");
    const status = root.querySelector("[data-showcase-status]");
    const counter = root.querySelector("[data-showcase-counter]");
    if (!slides.length || !dotsWrap) return;

    let index = slides.findIndex((s) => s.classList.contains("is-active"));
    if (index < 0) index = 0;

    let timer = null;
    const intervalMs = reduceMotion ? 0 : 6500;

    const regionLabels = {
      nacional: "Viajes Nacionales",
      norteamerica: "Norteamérica",
      europa: "Europa",
      caribe: "Caribe",
    };

    const getRegionName = (slide) => {
      const region = slide?.getAttribute("data-showcase-region");
      return region ? regionLabels[region] : "";
    };

    const announce = (i) => {
      const slide = slides[i];
      const regionName = getRegionName(slide);
      const destinos = slide
        ? [...slide.querySelectorAll(".dest-card__title")]
            .map((el) => el.textContent?.trim())
            .filter(Boolean)
        : [];

      if (counter) {
        counter.textContent = `${i + 1} / ${slides.length}`;
      }
      if (!status) return;
      if (regionName && destinos.length) {
        status.textContent = `${regionName}: ${destinos.join(", ")}. Región ${i + 1} de ${slides.length}`;
      } else if (regionName) {
        status.textContent = `${regionName}. Región ${i + 1} de ${slides.length}`;
      } else {
        status.textContent = `Región ${i + 1} de ${slides.length}`;
      }
    };

    const renderDots = () => {
      dotsWrap.innerHTML = "";
      slides.forEach((slide, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = `showcase-carousel__dot${i === index ? " is-active" : ""}`;
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
        const regionName = getRegionName(slide);
        dot.setAttribute(
          "aria-label",
          regionName ? `Ir a ${regionName}` : `Ir a región ${i + 1}`,
        );
        dot.addEventListener("click", () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    };

    const goTo = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
      dotsWrap.querySelectorAll(".showcase-carousel__dot").forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-selected", i === index ? "true" : "false");
      });
      announce(index);
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    const stopAuto = () => {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    };

    const startAuto = () => {
      stopAuto();
      if (intervalMs > 0) {
        timer = window.setInterval(next, intervalMs);
      }
    };

    prevBtn?.addEventListener("click", () => {
      prev();
      startAuto();
    });
    nextBtn?.addEventListener("click", () => {
      next();
      startAuto();
    });

    root.addEventListener("mouseenter", stopAuto);
    root.addEventListener("mouseleave", startAuto);
    root.addEventListener("focusin", stopAuto);
    root.addEventListener("focusout", (e) => {
      if (!root.contains(e.relatedTarget)) startAuto();
    });

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        startAuto();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        startAuto();
      }
    });

    renderDots();
    goTo(index);
    startAuto();
  };

  initScrollReveal();
  initWhatsappWidget();
  initShowcaseCarousel();
  initHeroEntrance();

  initContactCardScrollFollow();

  if (!reduceMotion) {
    initHeroMeshCanvas();
    initContactCardDotsCanvas();
    initShowcaseBubblesCanvas();
    initHeroParallax();
    initMagnetic();
    initTiltCards();
    initRipple();
    initFieldGlow();
  }
})();
