// ======================================================
// Case study: efficiency chart hover layer
// (crosshair + tooltip; reveals/counters come from home.js)
// ======================================================
(() => {
  const wrap = document.getElementById('cs-chart');
  if (!wrap) return;

  const svg = wrap.querySelector('svg');
  const tip = wrap.querySelector('.cs-tooltip');
  const cross = svg.querySelector('.cs-cross');
  if (!svg || !tip || !cross) return;

  const VIEW_W = 720;
  const points = [
    { month: 'January',   cpm: 85,  cpl: 105, x: 50 },
    { month: 'February',  cpm: 125, cpl: 75,  x: 122.5 },
    { month: 'March',     cpm: 110, cpl: 50,  x: 195 },
    { month: 'April',     cpm: 120, cpl: 47,  x: 267.5 },
    { month: 'May',       cpm: 155, cpl: 48,  x: 340 },
    { month: 'June',      cpm: 125, cpl: 37,  x: 412.5 },
    { month: 'July',      cpm: 85,  cpl: 43,  x: 485 },
    { month: 'August',    cpm: 89,  cpl: 46,  x: 557.5 },
    { month: 'September', cpm: 86,  cpl: 43,  x: 630 }
  ];

  const show = (i) => {
    const p = points[i];
    cross.setAttribute('x1', p.x);
    cross.setAttribute('x2', p.x);
    cross.style.opacity = '1';

    tip.innerHTML =
      '<strong>' + p.month + '</strong>' +
      '<div class="cs-tip-row"><span class="cs-dot cs-dot--cpm"></span>CPM ₹' + p.cpm + '</div>' +
      '<div class="cs-tip-row"><span class="cs-dot cs-dot--cpl"></span>CPL ₹' + p.cpl + '</div>';
    tip.hidden = false;

    const pct = (p.x / VIEW_W) * 100;
    tip.style.left = pct + '%';
    // keep the tooltip inside the card at both edges
    tip.style.transform = i === 0 ? 'translateX(8px)'
      : i === points.length - 1 ? 'translateX(calc(-100% - 8px))'
      : 'translateX(-50%)';
  };

  const hide = () => {
    cross.style.opacity = '0';
    tip.hidden = true;
  };

  svg.querySelectorAll('.cs-hit').forEach((rect, i) => {
    rect.addEventListener('pointerenter', () => show(i));
    rect.addEventListener('pointerdown', () => show(i));
  });
  svg.addEventListener('pointerleave', hide);
})();
