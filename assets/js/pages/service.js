// ========================================
// 1. HERO EDITORIAL ANIMATION (SVG stroke)
// ========================================
(()=>{function attachDrawer(t,e={}){const n=document.querySelector(t);if(!n)return;const o=n.querySelector(".ed-stroke");if(!o)return;const i=Math.ceil(o.getTotalLength());o.style.strokeDasharray=i,o.style.strokeDashoffset=i;let r=!1,a=null;const s=e.duration??850,l=e.delay??50,c=e.ease??"cubic-bezier(.22,.61,.36,1)",d=e.threshold??.7,u=e.rootMargin??"-10% 0px 0px 0px";const p=()=>{if(r)return;r=!0,o.style.transition="none",o.style.strokeDashoffset=i,o.getBoundingClientRect(),requestAnimationFrame(()=>{o.style.transition=`stroke-dashoffset ${s}ms ${c} ${l}ms`,o.style.strokeDashoffset="0"}),window.clearTimeout(a),setTimeout(()=>{r=!1},s+l+60)},h=()=>{window.clearTimeout(a),a=setTimeout(()=>{o.style.transition="none",o.style.strokeDashoffset=i},120)};const f=new IntersectionObserver(([m])=>{m.isIntersecting&&m.intersectionRatio>=d?p():h()},{threshold:[0,d,1],rootMargin:u});f.observe(n);function y(){const m=n.getBoundingClientRect(),g=window.innerHeight||document.documentElement.clientHeight,T=Math.min(g,Math.max(0,g-Math.max(0,m.top))),b=Math.max(0,Math.min(1,T/Math.max(1,m.height)));b>=d&&p()}document.addEventListener("DOMContentLoaded",y,{once:!0}),window.addEventListener("load",y,{once:!0}),document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){const m=n.getBoundingClientRect();m.top<v()&&m.bottom>0&&(h(),requestAnimationFrame(()=>requestAnimationFrame(p)))}});function v(){return window.innerHeight||document.documentElement.clientHeight}}attachDrawer(".hero--editorial",{duration:850,threshold:.7,rootMargin:"-10% 0px 0px 0px"}),attachDrawer(".services-hero",{duration:850,threshold:.7,rootMargin:"-10% 0px 0px 0px"});})();

// ================================================
// 2. Tier Toggle Accordion
// ================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTierToggles);
} else {
  initTierToggles();
}

function initTierToggles() {
  const toggles = document.querySelectorAll(".tier-toggle");
  if (toggles.length === 0) return;
  
  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", !isExpanded);
      
      const controlsId = toggle.getAttribute("aria-controls");
      if (!controlsId) return;
      
      const content = document.getElementById(controlsId);
      if (!content) return;
      
      // Batch all DOM changes in single frame
      requestAnimationFrame(() => {
        if (isExpanded) {
          content.style.maxHeight = "0px";
          content.style.opacity = "0";
          setTimeout(() => {
            content.setAttribute("hidden", "");
          }, 300);
        } else {
          content.removeAttribute("hidden");
          content.style.maxHeight = content.scrollHeight + "px";
          content.style.opacity = "1";
        }
      });
    });
  });
}

// ================================================
// 3. Unified Scroll Animation System
// ================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
  initScrollAnimations();
}

function initScrollAnimations() {
  // Collect all animated elements
  const processSteps = document.querySelectorAll('.process-step');
  const diffCards = document.querySelectorAll('.diff-card');
  const phaseCards = document.querySelectorAll('.deliv-phase-card');
  
  // Combine all elements into single array
  const allElements = [
    ...Array.from(processSteps),
    ...Array.from(diffCards),
    ...Array.from(phaseCards)
  ];
  
  // Exit early if no elements
  if (allElements.length === 0) return;
  
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
  
  // Observe all elements with single observer
  allElements.forEach(element => observer.observe(element));
}