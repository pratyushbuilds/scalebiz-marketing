// ========================================
// 1. HERO EDITORIAL ANIMATION (SVG stroke)
// ========================================
(() => {
  const section = document.querySelector('.hero--editorial');
  if (!section) return;

  const path = section.querySelector('.ed-stroke');
  if (!path) return;

  const len = Math.ceil(path.getTotalLength());
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;

  let playing = false;
  let resetTimer = null;
  const duration = 850;
  const delay = 50;
  const ease = 'cubic-bezier(.22,.61,.36,1)';
  const threshold = 0.7;
  const rootMargin = '-10% 0px 0px 0px';

  const play = () => {
    if (playing) return;
    playing = true;
    path.style.transition = 'none';
    path.style.strokeDashoffset = len;
    path.getBoundingClientRect(); // Force reflow
    
    // Use requestAnimationFrame for smoother animation trigger
    requestAnimationFrame(() => {
      path.style.transition = `stroke-dashoffset ${duration}ms ${ease} ${delay}ms`;
      path.style.strokeDashoffset = '0';
    });
    
    window.clearTimeout(resetTimer);
    setTimeout(() => { playing = false; }, duration + delay + 60);
  };

  const reset = () => {
    window.clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      path.style.transition = 'none';
      path.style.strokeDashoffset = len;
    }, 120);
  };

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
      play();
    } else {
      reset();
    }
  }, { threshold: [0, threshold, 1], rootMargin });

  io.observe(section);

  function maybePlayOnLoad() {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const visiblePx = Math.min(vh, Math.max(0, vh - Math.max(0, r.top)));
    const visibleRatio = Math.max(0, Math.min(1, visiblePx / Math.max(1, r.height)));
    if (visibleRatio >= threshold) play();
  }

  document.addEventListener('DOMContentLoaded', maybePlayOnLoad, { once: true });
  window.addEventListener('load', maybePlayOnLoad, { once: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const r = section.getBoundingClientRect();
      const vhNow = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vhNow && r.bottom > 0) {
        reset();
        requestAnimationFrame(() => requestAnimationFrame(play));
      }
    }
  });
})();

// ======================================================
// 2. Section 2: scroll-reveal grid — the skiper104 recipe,
// rebuilt with GSAP from its observed scroll behaviour
// (no Skiper UI source code is shipped): a sticky centred
// grid inside a tall track; per column the visual drops in
// from y:-50, the numbered node pops from scale(0) and the
// text rises from y:+50 in lockstep, while the accent line
// grows scaleX across the grid — everything scrubbed to
// scroll, then a dwell before the grid releases.
// Desktop + motion-safe only: narrow screens use the static
// vertical-list variant (as skiper104 does), reduced-motion
// and no-JS get the complete static grid.
// ======================================================
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 1025px)').matches;
  const section = document.querySelector('.homepage-edge-section');
  const track = section ? section.querySelector('.edge-track') : null;
  const sticky = track ? track.querySelector('.edge-sticky') : null;
  if (reduced || !desktop || !track || !sticky) return;

  // Switch the motion layout on SYNCHRONOUSLY (before first paint /
  // scroll restoration) so the page height is final immediately.
  // Waiting for GSAP meant a reload mid-section restored scroll
  // against the short static layout, then everything below shifted
  // ~2000px when the tall track appeared.
  section.classList.add('edge-104');
  // Bridge: hide the reveal targets while GSAP downloads so nothing
  // paints once and then jumps back to a hidden state
  section.classList.add('edge-motion');

  // Centre the sticky grid by measurement (no translateY(-50%):
  // sticky release math ignores transforms and would detach the grid
  // half its height early, leaving a phantom gap before section 3)
  const centerSticky = () => {
    sticky.style.top = Math.max(84, (window.innerHeight - sticky.offsetHeight) / 2) + 'px';
  };
  centerSticky();

  // SRI pins the exact cdnjs bytes (supply-chain protection); crossOrigin
  // is required for the browser to verify a cross-origin script's integrity.
  const SRI = {
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js': 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js': 'sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d'
  };
  const loadScript = (src, isLoaded) =>
    isLoaded()
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
          if (SRI[src]) { s.integrity = SRI[src]; s.crossOrigin = 'anonymous'; }
          s.async = true;
          s.onload = resolve;
          s.onerror = reject;
          document.head.appendChild(s);
        });

  const GSAP_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  const ST_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';

  const init = () => {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    // root.css sets html{scroll-behavior:smooth}, which turns the
    // instant scroll jumps ScrollTrigger performs while measuring
    // into ANIMATED scrolls — rects get sampled mid-flight and the
    // trigger positions come out offset by the scroll distance
    // (reproduced on reload-with-restored-scroll). Force instant
    // scrolling for the duration of every refresh.
    ScrollTrigger.addEventListener('refreshInit', () => {
      document.documentElement.style.scrollBehavior = 'auto';
    });
    ScrollTrigger.addEventListener('refresh', () => {
      document.documentElement.style.scrollBehavior = '';
    });

    const cols = gsap.utils.toArray('.edge-col', track);
    const line = track.querySelector('.edge-line');
    const targets = [];
    cols.forEach((col) =>
      targets.push(col.querySelector('.edge-visual'), col.querySelector('.edge-node'), col.querySelector('.edge-text'))
    );
    if (line) targets.push(line);

    // Timing map sampled from the original: column i reveals over
    // [START + i*SEG, +LEN] of track progress, all three elements in
    // lockstep; the line's length tracks the whole run and its
    // thickness pops with the first column. Unlike the demo (which
    // parks a huge dwell after the reveal), the windows are spread
    // across almost the whole track so the section releases right
    // after the last card lands — no dead scrolling.
    const START = 0.05;
    const SEG = 0.2;
    const LEN = 0.28;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: track,
        start: 'top 50%', // the sticky grid centres right as the run begins
        end: 'bottom bottom',
        scrub: 0.8 // smoothing in place of the original's spring
      }
    });

    cols.forEach((col, i) => {
      const at = START + i * SEG;
      tl.fromTo(col.querySelector('.edge-visual'), { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: LEN, ease: 'none' }, at);
      tl.fromTo(col.querySelector('.edge-node'), { scale: 0 }, { scale: 1, duration: LEN, ease: 'none' }, at);
      tl.fromTo(col.querySelector('.edge-text'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: LEN, ease: 'none' }, at);
    });
    if (line) {
      tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: (cols.length - 1) * SEG + LEN, ease: 'none' }, START);
      tl.fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: LEN, ease: 'none' }, START);
    }
    tl.to({}, { duration: 0.07 }); // short beat on the finished grid, then release

    section.classList.remove('edge-motion'); // scrub owns the states now

    // Re-centre on every ScrollTrigger refresh (resize, orientation)
    ScrollTrigger.addEventListener('refreshInit', centerSticky);
    // Settling refresh: late font reflow moves everything above the
    // track, and after a reload the browser keeps re-applying the
    // restored scroll position for a while — either can land in the
    // middle of a refresh and corrupt trigger measurements (starts
    // come out offset by the scroll distance). Timing can't be won —
    // so refresh, CHECK the measurements, and retry with backoff
    // until they're sane.
    let settleTries = 0;
    const settle = () => {
      settleTries++;
      ScrollTrigger.refresh();
      const insane = ScrollTrigger.getAll().some((t) => t.start < -window.innerHeight);
      if (insane && settleTries < 6) setTimeout(settle, 350 * settleTries);
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(settle, 60));
    }
    if (document.readyState === 'complete') {
      setTimeout(settle, 250);
    } else {
      window.addEventListener('load', () => setTimeout(settle, 250), { once: true });
    }

    // If the viewport crosses below the desktop breakpoint, tear the
    // scrub down cleanly — the mobile layout must not inherit a tall
    // track and half-driven transforms
    const mq = window.matchMedia('(min-width: 1025px)');
    const onBreak = (e) => {
      if (e.matches) return;
      mq.removeEventListener('change', onBreak);
      ScrollTrigger.removeEventListener('refreshInit', centerSticky);
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      gsap.set(targets, { clearProps: 'all' });
      sticky.style.top = '';
      section.classList.remove('edge-104');
    };
    mq.addEventListener('change', onBreak);
  };

  loadScript(GSAP_SRC, () => !!window.gsap)
    .then(() => loadScript(ST_SRC, () => !!window.ScrollTrigger))
    .then(init)
    .catch(() => {
      // GSAP unavailable: fall all the way back to the static layout
      section.classList.remove('edge-motion');
      section.classList.remove('edge-104');
      sticky.style.top = '';
    });
})();

// ======================================================
// 3. Polish layer: scroll reveals + proof stat count-up
// ======================================================
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const counters = document.querySelectorAll('.count[data-target]');
  const reveals = document.querySelectorAll('.sb-reveal');

  const runCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (reduced || isNaN(target)) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const duration = 1300;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window) || reduced) {
    reveals.forEach(el => el.classList.add('visible'));
    return; // counters keep their final text from the HTML
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      if (entry.target.classList.contains('sb-reveal')) {
        entry.target.classList.add('visible');
      } else {
        runCount(entry.target);
      }
    });
  }, { threshold: 0.35 });

  counters.forEach(el => io.observe(el));
  reveals.forEach(el => io.observe(el));
})();

// ======================================================
// 4. Nav: soft shadow once the page is scrolled
// ======================================================
(() => {
  const header = document.querySelector('.nav-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('nav-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();