// ================================================
// About Page: Unified Scroll Animation System
// ================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutAnimations);
} else {
  initAboutAnimations();
}

function initAboutAnimations() {
  // Collect all animated elements in one go
  const animatedElements = [
    ...document.querySelectorAll('.philosophy-card'),
    ...document.querySelectorAll('.methodology-step'),
    ...document.querySelectorAll('.team-card'),
    ...document.querySelectorAll('.trust-card')
  ];
  
  // Exit early if no elements found
  if (animatedElements.length === 0) return;
  
  // Single observer for all elements
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    // Batch all DOM updates in single animation frame
    requestAnimationFrame(() => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    });
  }, observerOptions);
  
  // Observe all elements at once
  animatedElements.forEach(element => observer.observe(element));
}