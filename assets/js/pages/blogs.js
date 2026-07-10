// ================================================
// Blog Card Accordion System
// ================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogAccordion);
} else {
  initBlogAccordion();
}

function initBlogAccordion() {
  const blogCards = document.querySelectorAll(".blog-card");
  if (blogCards.length === 0) return;
  
  // Cache cards array to avoid repeated querySelectorAll
  const cardsArray = Array.from(blogCards);
  
  blogCards.forEach((card) => {
    const header = card.querySelector(".blog-header");
    if (!header) return;
    
    header.addEventListener("click", () => {
      const isExpanded = card.getAttribute("aria-expanded") === "true";
      
      // Batch all DOM updates in single animation frame
      requestAnimationFrame(() => {
        // Collapse all cards first
        cardsArray.forEach((c) => {
          if (c !== card) {
            c.setAttribute("aria-expanded", "false");
          }
        });
        
        // Toggle clicked card
        card.setAttribute("aria-expanded", String(!isExpanded));
      });
    });
  });
}