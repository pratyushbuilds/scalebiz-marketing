// ================================================
// Navigation Menu - Optimized & Fixed
// ================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigation);
} else {
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
    const diff = startX - currentX;

    // CRITICAL FIX: Only allow LEFT swipe (closing direction)
    // Prevent dragging menu off-screen to the right
    if (diff > 0) {
      isDragging = true;
      
      // Cap maximum drag distance to menu width
      const clampedDiff = Math.min(diff, 300); // 300px max drag
      
      // Apply transform with clamping
      requestAnimationFrame(() => {
        menu.style.transform = `translateX(-${clampedDiff}px)`;
      });
      
      // Prevent page scroll while dragging menu
      if (diff > 10) {
        e.preventDefault();
      }
    } else {
      // Reset if user tries to swipe right (wrong direction)
      menu.style.transform = '';
    }
  }, { passive: false }); // passive: false allows preventDefault

  menu.addEventListener('touchend', () => {
    if (!isSwiping) return;
    
    const diff = startX - currentX;

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

  function openMenu() {
    toggle.classList.add('active');
    menu.classList.add('open');
    body.classList.add('no-scroll', 'menu-open');
    menu.style.transform = '';
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.classList.remove('active');
    body.classList.remove('no-scroll', 'menu-open');
    
    // Ensure transform is reset
    menu.style.transform = '';
    menu.style.transition = '';
  }
}