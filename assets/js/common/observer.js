  // Optimized Intersection Observer (single instance for all elements)
  document.addEventListener('DOMContentLoaded', function() {
    
    // Collect ALL animated elements at once
    const animatedElements = document.querySelectorAll(
      '.process-step, .edge-card, .phase-card, .philosophy-card, ' +
      '.methodology-step, .team-card, .trust-card, .homepage-growth-step, .homepage-edge-card'
    );
    
    // Single observer for everything (more efficient)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Unobserve immediately
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all at once
    animatedElements.forEach(el => observer.observe(el));
    
  });