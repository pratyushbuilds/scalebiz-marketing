// ================================================
// Site Navbar — shared component + interactions
//
// The nav markup used to be copy-pasted into every page. It is now
// rendered from here into each page's
// <header class="nav-header" data-site-nav> mount, so the brand,
// links and CTA copy live in exactly ONE place (same pattern as
// assets/js/common/footer.js). The mount keeps its 70px height from
// the inlined critical CSS, so injecting the content causes no CLS.
//
// URLs are ROOT-RELATIVE ("/contact.html") so the same markup works
// at any directory depth (root, /legal/, /blog/) — the site deploys
// at the domain root (see _redirects / sitemap.xml).
// ================================================
function renderNav() {
  const mounts = document.querySelectorAll('header[data-site-nav]');
  if (!mounts.length) return;

  const html = `
      <nav class="navbar">
        <!-- Brand (text wordmark until Scalebiz logo asset is ready) -->
        <a href="/index.html" class="nav-logo">
          Scalebiz <span class="nav-logo__accent">Marketing</span><span class="nav-logo__dot">.</span>
        </a>

        <!-- Menu Toggle (Mobile) -->
        <button class="nav-toggle" aria-label="Toggle Menu" aria-expanded="false">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>

        <!-- Nav Links -->
        <ul class="nav-menu">
          <li><a href="/index.html">Home</a></li>
          <li><a href="/service.html">Services</a></li>
          <li><a href="/case-study.html">Case Study</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/blog/index.html">Blog</a></li>
          <li><a href="/contact.html?src=nav" class="nav-cta">Let's Connect →</a></li>
        </ul>
      </nav>`;

  mounts.forEach((el) => {
    el.innerHTML = html;
  });
}

// This script is loaded WITHOUT defer, immediately after the nav mount,
// so the nav is injected during HTML parsing and lands in the first
// paint (keeps the nav an LCP-friendly, no-pop-in element). If the
// mount isn't in the DOM yet (script moved into <head>), fall back to
// DOMContentLoaded.
if (document.querySelector('header[data-site-nav]')) {
  renderNav();
  initNavigation();
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    initNavigation();
  });
} else {
  renderNav();
  initNavigation();
}

function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const body = document.body;

  // Exit early if elements don't exist
  if (!toggle || !menu) return;

  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  let isDragging = false;

  // Toggle open/close
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    
    requestAnimationFrame(() => {
      const isOpen = menu.classList.contains('open');
      
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('open')) return;
    
    const isClickInsideMenu = menu.contains(e.target);
    const isClickOnToggle = toggle.contains(e.target);
    
    if (!isClickInsideMenu && !isClickOnToggle) {
      closeMenu();
    }
  }, { passive: true });

  // Handle touch gestures for swipe close
  menu.addEventListener('touchstart', (e) => {
    if (!menu.classList.contains('open')) return;
    
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
    isDragging = false;
  }, { passive: true });

  menu.addEventListener('touchmove', (e) => {
    if (!isSwiping || !menu.classList.contains('open')) return;
    
    currentX = e.touches[0].clientX;
    // The menu slides in from the right (closed = translateX(100%)),
    // so the closing gesture is a RIGHT swipe (towards where it exits)
    const diff = currentX - startX;

    if (diff > 0) {
      isDragging = true;

      // Cap maximum drag distance to menu width
      const clampedDiff = Math.min(diff, 300); // 300px max drag

      // Apply transform with clamping
      requestAnimationFrame(() => {
        menu.style.transform = `translateX(${clampedDiff}px)`;
      });

      // Prevent page scroll while dragging menu
      if (diff > 10) {
        e.preventDefault();
      }
    } else {
      // Reset if user tries to swipe left (wrong direction)
      menu.style.transform = '';
    }
  }, { passive: false }); // passive: false allows preventDefault

  menu.addEventListener('touchend', () => {
    if (!isSwiping) return;

    const diff = currentX - startX;

    requestAnimationFrame(() => {
      // Threshold for closing (60px swipe)
      if (diff > 60 && isDragging) {
        closeMenu();
      } else {
        // Reset transform smoothly
        menu.style.transition = 'transform 0.2s ease-out';
        menu.style.transform = '';
        
        // Remove transition after animation completes
        setTimeout(() => {
          menu.style.transition = '';
        }, 200);
      }
    });

    isSwiping = false;
    isDragging = false;
  }, { passive: true });

  // Handle touchcancel (when touch is interrupted)
  menu.addEventListener('touchcancel', () => {
    if (isSwiping) {
      requestAnimationFrame(() => {
        menu.style.transition = 'transform 0.2s ease-out';
        menu.style.transform = '';
        setTimeout(() => {
          menu.style.transition = '';
        }, 200);
      });
      isSwiping = false;
      isDragging = false;
    }
  }, { passive: true });

  // Close the menu when a nav link is tapped (matters for same-page links)
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('open')) closeMenu();
    });
  });

  function openMenu() {
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('open');
    body.classList.add('no-scroll', 'menu-open');
    menu.style.transform = '';
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    body.classList.remove('no-scroll', 'menu-open');

    // Ensure transform is reset
    menu.style.transform = '';
    menu.style.transition = '';
  }
}