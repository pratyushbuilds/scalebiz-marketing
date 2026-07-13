// ================================================
// Site Footer — shared component
//
// The footer used to be ~70 lines of markup copy-pasted into every
// page. It is now rendered from here into each page's
// <footer class="ef-footer" data-site-footer data-page="..."> mount,
// so brand name, nav links and social URLs live in exactly ONE place.
// (Same JS-component pattern as assets/js/common/audit-split-cta.js.)
//
// URLs are ROOT-RELATIVE ("/contact.html") so the same markup works at
// any directory depth (root, /legal/, /blog/) — the site deploys at the
// domain root (see _redirects / sitemap.xml).
// ================================================
(function () {
  // ---- Real social profiles (wire once here) ----
  const SOCIALS = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/scalebizmarketing/',
      path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m5 5a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7m0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M18 6.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2'
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/company/scalebiz-marketing/',
      path: 'M6.94 6.5A1.94 1.94 0 1 1 5 4.56 1.94 1.94 0 0 1 6.94 6.5ZM7 8.75H4V20h3ZM20 20h-3v-5.5c0-1.31-.47-2.2-1.65-2.2-.9 0-1.43.61-1.67 1.2-.09.22-.11.53-.11.83V20h-3s.04-9.77 0-10.75h3v1.52a2.97 2.97 0 0 1 2.68-1.48c1.96 0 3.45 1.28 3.45 4.04Z'
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/pratyush.kumar.24/',
      path: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z'
    }
  ];

  // Attribution page keys must match form-backend.js PAGE_VALUES.
  const PAGE_VALUES = ['home', 'case_study', 'services', 'about', 'contact', 'legal', 'blog'];

  const socialLi = (s) =>
    `<li><a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="${s.path}" /></svg> ${s.name}</a></li>`;

  function footerHTML(page) {
    const from = PAGE_VALUES.includes(page) ? page : 'home';
    const contactHref = `/contact.html?src=footer&from=${from}`;
    return `
      <div class="ef-footer__top">
        <a href="/index.html" class="ef-footer__brand" aria-label="Scalebiz Marketing home">
          <span class="ef-logo">Scalebiz Marketing</span>
        </a>

        <nav class="ef-footer__nav" aria-label="Footer">
          <div class="ef-col">
            <h3 class="ef-col__title">Company</h3>
            <ul class="ef-links">
              <li><a href="/about.html">About</a></li>
              <li><a href="/about.html#team">Team</a></li>
              <li><a href="${contactHref}">Contact</a></li>
            </ul>
          </div>

          <div class="ef-col">
            <h3 class="ef-col__title">Services</h3>
            <ul class="ef-links">
              <li><a href="/service.html#what-we-do">Paid Media</a></li>
              <li><a href="/service.html#what-we-do">SEO</a></li>
              <li><a href="/service.html#what-we-do">Social &amp; Content</a></li>
              <li><a href="/service.html#what-we-do">Web &amp; Funnels</a></li>
              <li><a href="/service.html#what-we-do">Influencer Marketing</a></li>
            </ul>
          </div>

          <div class="ef-col">
            <h3 class="ef-col__title">Resources</h3>
            <ul class="ef-links">
              <li><a href="/case-study.html">Case Studies</a></li>
              <li><a href="/blog/index.html">Blog</a></li>
            </ul>
          </div>

          <div class="ef-col">
            <h3 class="ef-col__title">Legal</h3>
            <ul class="ef-links">
              <li><a href="/legal/privacy.html">Privacy Policy</a></li>
              <li><a href="/legal/terms.html">Terms of Use</a></li>
              <li><a href="/legal/cookies.html">Cookie Policy</a></li>
            </ul>
          </div>

          <div class="ef-col ef-col--social">
            <h3 class="ef-col__title">Follow us</h3>
            <ul class="ef-social">
              ${SOCIALS.map(socialLi).join('\n              ')}
            </ul>
          </div>
        </nav>
      </div>

      <div class="ef-footer__cta">
        <div class="ef-cta__inner">
          <p class="ef-cta__text">Not ready for the audit yet?</p>
          <a class="ef-cta__btn" href="${contactHref}">Get in touch →</a>
        </div>
      </div>

      <div class="ef-footer__bottom">
        <p>© <span id="ef-year"></span> Scalebiz Marketing. All rights reserved.</p>
        <ul class="ef-inline">
          <li><a href="/legal/privacy.html">Privacy</a></li>
          <li><a href="/legal/terms.html">Terms</a></li>
          <li><a href="/legal/cookies.html">Cookies</a></li>
        </ul>
      </div>`;
  }

  function renderFooters() {
    const mounts = document.querySelectorAll('footer[data-site-footer]');
    mounts.forEach((el) => {
      el.innerHTML = footerHTML(el.getAttribute('data-page') || 'home');
    });
    setFooterYear();
  }

  // 1) Render the footer, then stamp the copyright year.
  function setFooterYear() {
    const yearEl = document.getElementById('ef-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderFooters);
  } else {
    renderFooters();
  }

  // 2) Footer accordion system using event delegation.
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

    requestAnimationFrame(() => {
      btn.setAttribute('aria-expanded', String(!isExpanded));
      panel.hidden = isExpanded;
    });
  }, { passive: true });
})();
