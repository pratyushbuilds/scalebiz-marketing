// ======================================================
// About page — team portrait scale-in: the skiper79
// treatment rebuilt independently with GSAP ScrollTrigger
// from its observed behaviour (no Skiper UI source code
// is shipped), reshaped for two large portraits. Same
// lazy-load + fallback recipe as home.js section 2.
// Desktop + motion-safe only: mobile, reduced-motion,
// no-JS and a failed GSAP download all keep the static
// full-colour portraits from about.css.
// ======================================================
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 1025px)').matches;
  const section = document.querySelector('.about-team');
  const portraits = section ? Array.from(section.querySelectorAll('.team-portrait')) : [];
  if (reduced || !desktop || !portraits.length) return;

  // Bridge: hide the portraits while GSAP downloads so nothing paints
  // once and then jumps back to a hidden state
  section.classList.add('team-motion');

  const loadScript = (src, isLoaded) =>
    isLoaded()
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
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
    // Same guard as home.js: root.css's html{scroll-behavior:smooth}
    // animates the instant jumps ScrollTrigger makes while measuring,
    // corrupting trigger positions — force instant scrolling for the
    // duration of every refresh.
    ScrollTrigger.addEventListener('refreshInit', () => {
      document.documentElement.style.scrollBehavior = 'auto';
    });
    ScrollTrigger.addEventListener('refresh', () => {
      document.documentElement.style.scrollBehavior = '';
    });

    const tweens = portraits.map((el, i) =>
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.9, y: 40 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          delay: i * 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true }
        }
      )
    );

    // fromTo applied the hidden "from" state on creation — the tweens
    // own the portraits now
    section.classList.remove('team-motion');

    // If the viewport crosses below the desktop breakpoint, tear down
    // cleanly — the static mobile layout must not inherit half-driven
    // transforms
    const mq = window.matchMedia('(min-width: 1025px)');
    const onBreak = (e) => {
      if (e.matches) return;
      mq.removeEventListener('change', onBreak);
      tweens.forEach((t) => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
      gsap.set(portraits, { clearProps: 'all' });
    };
    mq.addEventListener('change', onBreak);
  };

  loadScript(GSAP_SRC, () => !!window.gsap)
    .then(() => loadScript(ST_SRC, () => !!window.ScrollTrigger))
    .then(init)
    .catch(() => {
      // GSAP unavailable: fall back to the static portraits
      section.classList.remove('team-motion');
    });
})();
