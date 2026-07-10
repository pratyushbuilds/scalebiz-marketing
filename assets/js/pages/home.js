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
// 2. Section 2 and Section 3 (Scroll Trigger Animation)
// ======================================================
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

function initScrollAnimations() {
  
  // Section 2: Growth Steps
  const growthSteps = document.querySelectorAll('.homepage-growth-step');
  
  // Section 3: Edge Cards
  const edgeCards = document.querySelectorAll('.homepage-edge-card');
  
  // Exit early if no elements found
  if (growthSteps.length === 0 && edgeCards.length === 0) return;
  
  // Intersection Observer options
  const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  };
  
  // Single observer for all animations
  const observer = new IntersectionObserver((entries) => {
    // Use requestAnimationFrame to batch DOM changes
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    });
  }, observerOptions);
  
  // Observe all elements at once
  growthSteps.forEach(step => observer.observe(step));
  edgeCards.forEach(card => observer.observe(card));
  
}