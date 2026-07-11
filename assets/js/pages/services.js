// ================================================================
// Services page animations.
// Both effects are enhancements: the page is fully readable with
// JS off, on mobile, and under prefers-reduced-motion.
// ================================================================

const svReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const svLoadScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

// CSS smooth-scrolling is disabled on the pages that load this file
// (it corrupts ScrollTrigger's measurements — see services-v2.css),
// so reproduce it for in-page anchor links here.
document.addEventListener('click', (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href === '#') return; // placeholder links
  const target = document.querySelector(href);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: svReduced ? 'auto' : 'smooth', block: 'start' });
  history.pushState(null, '', href);
});

// ----------------------------------------------------------------
// 1. Phases: GSAP ScrollTrigger stacking panels.
// Each panel pins below the nav; the panels behind scale down with
// a deeper shadow as the next one arrives (scrubbed). The pinned
// stack is then covered by the next section (.sv-run, z-index 2)
// before anything unpins, so there is no visible jump.
// ----------------------------------------------------------------
(() => {
  if (svReduced) return; // CSS fallback: plain colour stack

  const stack = document.querySelector('.sv-stack');
  const panels = stack ? Array.from(stack.querySelectorAll('.sv-panel')) : [];
  if (panels.length < 2) return;

  const GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  const ST_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';

  const init = () => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers resize the viewport when the URL bar collapses;
    // recalculating pins on that resize makes the stack jump mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true });
    // html{scroll-behavior:smooth} animates the instant jumps
    // ScrollTrigger makes while measuring, corrupting trigger
    // positions (worst on reload with restored scroll) — force
    // instant scrolling during every refresh
    ScrollTrigger.addEventListener('refreshInit', () => {
      document.documentElement.style.scrollBehavior = 'auto';
    });
    ScrollTrigger.addEventListener('refresh', () => {
      document.documentElement.style.scrollBehavior = '';
    });

    // Tail room so the finished stack holds on screen for a beat
    // before the next section slides over it (pin-mode only, so the
    // static fallbacks never see this space)
    stack.classList.add('sv-stack--pinned');

    const NAV_H = 70; // sticky header height
    const narrow = window.matchMedia('(max-width: 768px)').matches;
    // staggered pin line per card (tighter stagger on phones)
    const offset = narrow
      ? (i) => NAV_H + 10 + i * 14
      : (i) => NAV_H + 16 + i * 24;

    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: () => 'top ' + offset(i),
        endTrigger: stack,
        end: 'bottom top', // unpin only once the stack is fully covered
        pin: true,
        pinSpacing: false
      });

      // Depth cue: this card recedes while the next one slides over it
      if (i < panels.length - 1) {
        gsap.to(panel, {
          scale: 0.94,
          boxShadow: '0 28px 70px rgba(16,17,20,.32)',
          ease: 'none',
          scrollTrigger: {
            trigger: panels[i + 1],
            start: 'top bottom',
            end: () => 'top ' + offset(i + 1),
            scrub: 0.4
          }
        });
      }
    });

    // Settling refresh: after a reload, the browser keeps re-applying
    // the restored scroll position for a while, which can land in the
    // middle of any refresh and corrupt trigger measurements (starts
    // come out offset by the scroll distance). Timing can't be won —
    // so refresh, CHECK the measurements, and retry with backoff
    // until they're sane.
    let settleTries = 0;
    const settle = () => {
      settleTries++;
      window.ScrollTrigger.refresh();
      const insane = window.ScrollTrigger.getAll().some((t) => t.start < -window.innerHeight);
      if (insane && settleTries < 6) setTimeout(settle, 350 * settleTries);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(settle, 60));
    if (document.readyState === 'complete') {
      setTimeout(settle, 250);
    } else {
      window.addEventListener('load', () => setTimeout(settle, 250), { once: true });
    }
  };

  // Deferred + async injected: never blocks first paint
  svLoadScript(GSAP_SRC)
    .then(() => svLoadScript(ST_SRC))
    .then(init)
    .catch(() => {}); // load failed: the colour stack is still complete content
})();

// ----------------------------------------------------------------
// 2. What we run: service pills drop into a bounded box (Matter.js)
// and are draggable via a MouseConstraint (mouse + touch).
// Guards: no reduced motion, library lazy-loaded when the section
// approaches, engine parked once the pills settle and woken again
// by a grab. Touch drag only engages when the finger lands ON a
// pill, so swiping the box never hijacks page scrolling.
// ----------------------------------------------------------------
(() => {
  if (svReduced) return; // static pill cluster stays as-is

  const pit = document.querySelector('.sv-pit');
  const pillEls = pit ? Array.from(pit.querySelectorAll('.sv-pill')) : [];
  if (!pit || pillEls.length === 0) return;

  const MATTER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
  let matterPromise = null;
  let started = false;

  const loadMatter = () => {
    if (!matterPromise) matterPromise = svLoadScript(MATTER_SRC);
    return matterPromise;
  };

  const startSim = () => {
    if (started || !window.Matter) return;
    started = true;

    const { Engine, Bodies, Composite, Mouse, MouseConstraint, Query } = window.Matter;

    // Measure the static pills before switching to absolute layout
    const sizes = pillEls.map((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    const W = pit.clientWidth;
    const H = pit.clientHeight;

    pit.classList.add('sv-physics-on');
    pillEls.forEach((el, i) => {
      el.style.width = sizes[i].w + 'px';
      el.style.transform = 'translate(' + (W / 2 - sizes[i].w / 2) + 'px, ' + -sizes[i].h * 2 + 'px)';
    });

    const engine = Engine.create();

    // Invisible walls on all four sides. The roof sits above the box so
    // the pills can drop in from outside the visible area (the box has
    // overflow:hidden) but a hard toss can never escape.
    const T = 200;    // wall thickness — thick enough that nothing tunnels
    const CEIL = 320; // headroom between box top and the roof
    const walls = [
      Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, { isStatic: true }),         // ground
      Bodies.rectangle(W / 2, -CEIL - T / 2, W + T * 2, T, { isStatic: true }),     // roof
      Bodies.rectangle(-T / 2, (H - CEIL) / 2, T, H + CEIL + T * 2, { isStatic: true }), // left
      Bodies.rectangle(W + T / 2, (H - CEIL) / 2, T, H + CEIL + T * 2, { isStatic: true }) // right
    ];

    // Rounded-rectangle bodies, spread across the width, staggered above
    const bodies = pillEls.map((el, i) => {
      const { w, h } = sizes[i];
      const pad = w / 2 + 16;
      const usable = Math.max(1, W - pad * 2);
      const x = pad + usable * ((i + 0.5) / pillEls.length);
      const y = -(30 + i * 55) - h / 2;
      return Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: h / 2 - 1 }, // capsule-like, matches the CSS pill
        restitution: 0.3, // one soft bounce
        friction: 0.6,
        frictionAir: 0.02,
        angle: (i % 2 ? 1 : -1) * 0.08
      });
    });

    // Drag-and-toss
    const mouse = Mouse.create(pit);
    // Matter's own wheel/touch listeners would hijack page scrolling —
    // drop them all; touch is re-added selectively below
    ['wheel', 'mousewheel', 'DOMMouseScroll'].forEach((ev) =>
      pit.removeEventListener(ev, mouse.mousewheel)
    );
    pit.removeEventListener('touchmove', mouse.mousemove);
    pit.removeEventListener('touchstart', mouse.mousedown);
    pit.removeEventListener('touchend', mouse.mouseup);

    const grab = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, damping: 0.12 }
    });

    // Touch drag: engage Matter only when the finger lands on a pill;
    // a swipe on empty box area falls through and scrolls the page
    const touchHitsPill = (e) => {
      const t = e.changedTouches[0];
      const r = pit.getBoundingClientRect();
      return Query.point(bodies, { x: t.clientX - r.left, y: t.clientY - r.top }).length > 0;
    };
    pit.addEventListener('touchstart', (e) => {
      if (!touchHitsPill(e)) return;
      wake();
      mouse.mousedown(e); // preventDefaults internally for touches
    }, { passive: false });
    pit.addEventListener('touchmove', (e) => {
      if (!grab.body) return;
      mouse.mousemove(e);
    }, { passive: false });
    const endTouch = (e) => {
      if (grab.body || mouse.button === 0) mouse.mouseup(e);
    };
    pit.addEventListener('touchend', endTouch);
    pit.addEventListener('touchcancel', endTouch);

    Composite.add(engine.world, [...bodies, ...walls, grab]);

    let rafId = 0;
    let running = false;
    let calmFrames = 0;
    let last = 0;
    let wokeAt = 0;

    const render = () => {
      bodies.forEach((b, i) => {
        const { w, h } = sizes[i];
        pillEls[i].style.transform =
          'translate(' + (b.position.x - w / 2) + 'px, ' + (b.position.y - h / 2) + 'px) ' +
          'rotate(' + b.angle + 'rad)';
      });
    };

    const tick = (now) => {
      const dt = Math.min(now - last, 33);
      last = now;
      Engine.update(engine, dt);
      render();

      const dragging = !!grab.body;
      let calm = !dragging;
      if (calm) {
        for (const b of bodies) {
          if (b.speed > 0.14 || Math.abs(b.angularVelocity) > 0.012) {
            calm = false;
            break;
          }
        }
      }
      calmFrames = calm ? calmFrames + 1 : 0;

      // Park the engine once everything has settled (safety cap: 15s),
      // keeping the world intact so a grab can wake it back up
      if (calmFrames > 45 || (!dragging && now - wokeAt > 15000)) {
        running = false;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (running) return;
      running = true;
      calmFrames = 0;
      last = wokeAt = performance.now();
      rafId = requestAnimationFrame(tick);
    };

    // Release the grabbed pill if the cursor leaves the box mid-drag
    pit.addEventListener('mouseleave', () => {
      if (grab.body) mouse.button = -1;
    });
    pit.addEventListener('mousedown', wake);
    wake(); // the initial drop
  };

  // Stage 1: fetch the library well before the section is visible
  const preload = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      preload.disconnect();
      loadMatter().catch(() => {});
    }
  }, { rootMargin: '600px 0px' });
  preload.observe(pit);

  // Stage 2: run the drop when the box actually enters the viewport
  const trigger = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    trigger.disconnect();
    loadMatter().then(startSim).catch(() => {}); // failed: static pills remain
  }, { threshold: 0.35 });
  trigger.observe(pit);
})();
