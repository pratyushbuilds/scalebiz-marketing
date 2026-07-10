// ================================================
// Footer JavaScript - Optimized
// ================================================

// 1) Set current year in copyright
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setFooterYear);
} else {
  setFooterYear();
}

function setFooterYear() {
  const yearEl = document.getElementById('ef-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// 2) Footer accordion system using event delegation
// Markup requirements:
// <button class="ef-acc-trigger" aria-expanded="false" aria-controls="ef-acc-panel">Title</button>
// <div id="ef-acc-panel" hidden> ... </div>

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.ef-acc-trigger');
  if (!btn) return;

  const panelId = btn.getAttribute('aria-controls');
  if (!panelId) return;
  
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const isExpanded = btn.getAttribute('aria-expanded') === 'true';
  
  // Batch DOM updates in single animation frame
  requestAnimationFrame(() => {
    btn.setAttribute('aria-expanded', String(!isExpanded));
    panel.hidden = isExpanded;
  });
}, { passive: true });