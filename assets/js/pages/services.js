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

// Single shared GSAP+ScrollTrigger load, used by the phase pinning
// AND the final-CTA word reveal — each script is injected at most
// once no matter how many blocks ask for it.
const SV_GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
const SV_ST_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
let svGsapPromise = null;
const svGsapReady = () => {
  if (!svGsapPromise) {
    svGsapPromise = (window.gsap ? Promise.resolve() : svLoadScript(SV_GSAP_SRC))
      .then(() => (window.ScrollTrigger ? Promise.resolve() : svLoadScript(SV_ST_SRC)));
  }
  return svGsapPromise;
};

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
// 0. What We Do: expandable service cards (skiper23-style pattern,
// reimplemented independently — no Skiper source). The HTML ships
// every card OPEN so no-JS readers get all copy; this block
// collapses everything except the anchor card, then runs a one-open
// accordion. Clicking outside the cards collapses the open one.
// The animation itself is pure CSS (grid-template-rows transition,
// disabled under reduced motion and on narrow mobile) — no library.
// ----------------------------------------------------------------
(() => {
  const acc = document.querySelector('.sv-acc');
  if (!acc) return;
  const cards = Array.from(acc.querySelectorAll('.sv-acc-card'));

  // The accordion sits ABOVE the pinned phase stack: every expand/
  // collapse shifts the page height under ScrollTrigger's pins, so
  // remeasure once the CSS transition (.45s) has settled.
  let refreshTimer = null;
  const scheduleRefresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    }, 520);
  };

  const setOpen = (card, open) => {
    card.classList.toggle('is-open', open);
    const head = card.querySelector('.sv-acc-head');
    if (head) head.setAttribute('aria-expanded', String(open));
  };

  // Initial state: only the anchor card (Paid Media) stays expanded
  cards.forEach((card) => setOpen(card, card.classList.contains('sv-acc-card--anchor')));

  acc.addEventListener('click', (e) => {
    const head = e.target.closest('.sv-acc-head');
    if (!head) return;
    const card = head.closest('.sv-acc-card');
    const willOpen = !card.classList.contains('is-open');
    cards.forEach((c) => setOpen(c, false));
    if (willOpen) setOpen(card, true);
    scheduleRefresh();
  });

  // skiper23 behaviour: a click anywhere outside collapses the open card
  document.addEventListener('click', (e) => {
    if (e.target.closest('.sv-acc')) return;
    let changed = false;
    cards.forEach((c) => {
      if (c.classList.contains('is-open')) { setOpen(c, false); changed = true; }
    });
    if (changed) scheduleRefresh();
  });
})();

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
  svGsapReady()
    .then(init)
    .catch(() => {}); // load failed: the colour stack is still complete content
})();

// ----------------------------------------------------------------
// 1b. Final CTA: scroll-scrubbed word-by-word text reveal
// (skiper70/72-style pattern, reimplemented independently — no
// Skiper source shipped). The HTML ships plain text; words are
// wrapped in spans only once GSAP is available and motion is
// allowed, so no-JS / reduced-motion / CDN-failure all read the
// plain copy. Runs on mobile too (house rule for this page).
// ----------------------------------------------------------------
(() => {
  if (svReduced) return;

  const section = document.querySelector('.audit-cta');
  const targets = section ? Array.from(section.querySelectorAll('.sv-cta-reveal')) : [];
  if (!targets.length) return;

  // Wrap each word in a span, walking text nodes so inline elements
  // (like the <em> in the escape line) survive intact
  const wrapWords = (el) => {
    const spans = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(' '));
            } else {
              const s = document.createElement('span');
              s.className = 'sv-word';
              s.textContent = part;
              frag.appendChild(s);
              spans.push(s);
            }
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
      });
    };
    walk(el);
    return spans;
  };

  svGsapReady()
    .then(() => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      if (!gsap || !ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      const words = targets.reduce((all, el) => all.concat(wrapWords(el)), []);
      if (!words.length) return;

      // Dim words brighten in DOM order as the section enters; the
      // window ends at 40% viewport so the reveal always completes
      // with the footer's scroll runway to spare
      gsap.fromTo(
        words,
        { opacity: 0.15, y: 8, skewX: -6 },
        {
          opacity: 1,
          y: 0,
          skewX: 0,
          ease: 'none',
          duration: 0.5,
          stagger: 0.06,
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 40%',
            scrub: 0.6
          }
        }
      );
    })
    .catch(() => {}); // no GSAP: the plain text was never touched
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
  // Runs on desktop AND mobile (client decision 2026-07-14, reaffirming
  // the 2026-07-13 mobile-animations request — overrides the perf
  // brief's desktop-only clause). Matter.js stays lazy: fetched only
  // when the pill box approaches the viewport.

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

    // Drop plan. The pills got ~18% bigger (2026-07-13), which makes
    // the box genuinely crowded (total pill width > box width) — a
    // naive spread drop left pills wedged near-vertical against the
    // walls and each other. So the drop is shelf-packed: pills are
    // taken widest-first and greedily grouped into rows that fit the
    // box width; each row is centred and released one row-height
    // above the previous, so every pill lands nearly flat either on
    // the floor or on a full row below it. Still real physics — the
    // bounce on landing and drag-and-toss are unchanged.
    const inset = 12; // row ends sit this close to the walls when justified
    const gap = 10;
    // First-fit decreasing: seed each row with the widest remaining
    // pill, then fill the leftover width with ANY remaining pill that
    // fits. Plain width-ordered rows left the narrow box (mobile) with
    // one pill per row and wall gaps beside them — the exact slots the
    // small pills wedged into on end.
    const byWidthDesc = sizes.map((s, i) => i).sort((a, b) => sizes[b].w - sizes[a].w);
    const usable = W - inset * 2;
    const remaining = byWidthDesc.slice();
    const rows = [];
    while (remaining.length) {
      const row = [remaining.shift()];
      let rowW = sizes[row[0]].w;
      for (let k = 0; k < remaining.length;) {
        const w = sizes[remaining[k]].w;
        if (rowW + gap + w <= usable) {
          rowW += gap + w;
          row.push(remaining.splice(k, 1)[0]);
        } else {
          k++;
        }
      }
      rows.push(row);
    }
    // Multi-pill rows are justified wall-to-wall: a centred row leaves
    // a wall-width gap that's narrower than a small pill's length but
    // wider than its height — exactly the slot the smallest pill kept
    // wedging into on end. Justified rows leave only wide mid-row gaps
    // (small pills lie flat in those) or slivers too thin to enter.
    const plan = {}; // dom index -> spawn {x, y, angle}
    rows.forEach((row, r) => {
      const pillSum = row.reduce((s, i) => s + sizes[i].w, 0);
      const justified = row.length > 1;
      const g = justified ? Math.max(0, W - inset * 2 - pillSum) / (row.length - 1) : 0;
      let cursor = justified ? inset : (W - pillSum) / 2;
      row.forEach((i, j) => {
        const { w, h } = sizes[i];
        plan[i] = {
          x: cursor + w / 2,
          y: -(30 + r * 150 + j * 18) - h / 2,
          angle: ((r + j) % 2 ? 1 : -1) * 0.04
        };
        cursor += w + g;
      });
    });

    // Invisible walls on all four sides. The roof sits above the box so
    // the pills can drop in from outside the visible area (the box has
    // overflow:hidden) but a hard toss can never escape. Headroom is
    // derived from the deepest spawn so no row starts inside the roof.
    const T = 200; // wall thickness — thick enough that nothing tunnels
    const CEIL = Math.max(...Object.keys(plan).map((i) => -plan[i].y)) + 100;
    const walls = [
      Bodies.rectangle(W / 2, H + T / 2, W + T * 2, T, { isStatic: true }),         // ground
      Bodies.rectangle(W / 2, -CEIL - T / 2, W + T * 2, T, { isStatic: true }),     // roof
      Bodies.rectangle(-T / 2, (H - CEIL) / 2, T, H + CEIL + T * 2, { isStatic: true }), // left
      Bodies.rectangle(W + T / 2, (H - CEIL) / 2, T, H + CEIL + T * 2, { isStatic: true }) // right
    ];

    const bodies = pillEls.map((el, i) => {
      const { w, h } = sizes[i];
      return Bodies.rectangle(plan[i].x, plan[i].y, w, h, {
        chamfer: { radius: h / 2 - 1 }, // capsule-like, matches the CSS pill
        restitution: 0.3, // one soft bounce
        friction: 0.3,
        frictionAir: 0.02,
        angle: plan[i].angle
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
