// ================================================================
// Services page animations.
// Both effects are enhancements: the page is fully readable with
// JS off, on mobile, and under prefers-reduced-motion.
// ================================================================

// ----------------------------------------------------------------
// 1. Phases: sticky stacking cards — scale the pinned cards behind
// ----------------------------------------------------------------
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  if (reduced || narrow) return; // static list fallback (CSS handles layout)

  const phases = Array.from(document.querySelectorAll('.sv-phase'));
  if (phases.length < 2) return;

  const cards = phases.map(p => p.querySelector('.sv-phase-card'));
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    for (let i = 0; i < phases.length - 1; i++) {
      const myTop = parseFloat(getComputedStyle(phases[i]).top) || 96;
      const nextTop = phases[i + 1].getBoundingClientRect().top;
      // 0 while the next card is below the fold, 1 when it has fully
      // covered this one — drives the depth scale
      const progress = Math.min(1, Math.max(0, 1 - (nextTop - myTop) / (vh - myTop)));
      cards[i].style.transform = progress > 0 ? `scale(${1 - progress * 0.05})` : '';
    }
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();
})();

// ----------------------------------------------------------------
// 2. Services: drop-and-settle (Matter.js)
// Guards: desktop-only, no reduced motion, library lazy-loaded when
// the section approaches, engine stopped once the bodies settle.
// ----------------------------------------------------------------
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 1025px)').matches;
  if (reduced || !desktop) return; // static grid stays as-is

  const stage = document.querySelector('.sv-stage');
  const grid = document.querySelector('.sv-grid');
  if (!stage || !grid) return;
  const cardEls = Array.from(grid.querySelectorAll('.sv-svc'));
  if (cardEls.length === 0) return;

  const MATTER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
  let matterState = 'idle'; // idle | loading | ready | failed
  let started = false;

  const loadMatter = () => {
    if (matterState !== 'idle') return;
    matterState = 'loading';
    const s = document.createElement('script');
    s.src = MATTER_SRC;
    s.async = true;
    s.onload = () => { matterState = 'ready'; };
    s.onerror = () => { matterState = 'failed'; }; // static grid remains
    document.head.appendChild(s);
  };

  const startSim = () => {
    if (started || matterState !== 'ready' || !window.Matter) return;
    started = true;

    const { Engine, Bodies, Composite, Body } = window.Matter;

    // Measure the settled grid before switching to absolute positioning
    const stageRect = stage.getBoundingClientRect();
    const finals = cardEls.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - stageRect.left,
        y: r.top - stageRect.top,
        w: r.width,
        h: r.height
      };
    });
    const stageH = stage.offsetHeight;
    const stageW = stage.offsetWidth;

    stage.classList.add('sv-physics-on');
    grid.style.height = stageH + 'px';
    cardEls.forEach((el, i) => {
      el.style.width = finals[i].w + 'px';
      el.style.transform = `translate(${finals[i].x}px, ${-finals[i].h - 60 - i * 170}px)`;
    });

    const engine = Engine.create();
    const bodies = finals.map((f, i) =>
      Bodies.rectangle(
        f.x + f.w / 2,                       // drop straight into its slot
        -f.h / 2 - 60 - i * 170,             // staggered start above the stage
        f.w, f.h,
        {
          restitution: 0.26,                 // one small bounce
          friction: 0.9,
          frictionAir: 0.02,
          angle: (i - 1) * 0.035             // slight tilt for a natural fall
        }
      )
    );
    const ground = Bodies.rectangle(stageW / 2, stageH + 30, stageW + 200, 60, { isStatic: true });
    const wallL = Bodies.rectangle(-30, stageH / 2, 60, stageH * 4, { isStatic: true });
    const wallR = Bodies.rectangle(stageW + 30, stageH / 2, 60, stageH * 4, { isStatic: true });
    Composite.add(engine.world, [...bodies, ground, wallL, wallR]);

    let calmFrames = 0;
    let rafId = 0;
    let last = performance.now();
    const startedAt = last;

    const settle = () => {
      cancelAnimationFrame(rafId);
      Composite.clear(engine.world, false);
      Engine.clear(engine); // stop burning CPU once the effect is done
      cardEls.forEach((el, i) => {
        el.classList.add('sv-settled');
        el.style.transform = `translate(${finals[i].x}px, ${finals[i].y}px) rotate(0rad)`;
      });
    };

    const tick = (now) => {
      const dt = Math.min(now - last, 33);
      last = now;
      Engine.update(engine, dt);

      let calm = true;
      bodies.forEach((b, i) => {
        const x = b.position.x - finals[i].w / 2;
        const y = b.position.y - finals[i].h / 2;
        cardEls[i].style.transform = `translate(${x}px, ${y}px) rotate(${b.angle}rad)`;
        if (b.speed > 0.12 || Math.abs(b.angularVelocity) > 0.01) calm = false;
      });

      calmFrames = calm ? calmFrames + 1 : 0;
      if (calmFrames > 24 || now - startedAt > 8000) {
        settle(); // settled (or safety timeout): snap to the aligned row
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  };

  // Stage 1: pre-load the library well before the section is visible
  const preload = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) {
      loadMatter();
      preload.disconnect();
    }
  }, { rootMargin: '600px 0px' });
  preload.observe(stage);

  // Stage 2: run the drop when the section actually enters the viewport
  const trigger = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      if (matterState === 'ready') {
        trigger.disconnect();
        startSim();
      } else if (matterState === 'loading') {
        // library still on the wire: try again shortly, else stay static
        setTimeout(() => { if (matterState === 'ready' && !started) startSim(); }, 400);
        trigger.disconnect();
      } else {
        trigger.disconnect(); // failed/never loaded: static grid is the content
      }
    });
  }, { threshold: 0.3 });
  trigger.observe(stage);
})();
