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
      if (window.matchMedia("(min-width: 861px)").matches) {
        setOpen(false);
      }
    });
  } else {
    window.addEventListener("resize", syncHeaderDock);
  }

  const form = document.querySelector(".lead-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
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

  initScrollReveal();
  initHeroEntrance();

  if (!reduceMotion) {
    initHeroMeshCanvas();
    initHeroParallax();
    initMagnetic();
    initTiltCards();
    initRipple();
    initFieldGlow();
  }
})();
