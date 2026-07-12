---
name: verify
description: How to run and visually verify this static site (no build step) with headless Chrome.
---

# Verifying this site

Static HTML/CSS/JS site — no build step, no framework. Pages load CSS from
`assets/css/...` and JS from `assets/js/...` with relative paths, so serve
over HTTP (some pages lazy-load CDN libs: GSAP/ScrollTrigger and Matter.js
on service.html).

## Recipe that works

1. Serve: write a tiny node static server (see scratchpad `serve.js` pattern)
   rooted at the repo dir on a free port. `python` is NOT installed here;
   node is (v24). No npx downloads needed.
2. Drive: `npm i puppeteer-core` in the scratchpad and launch installed
   Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`
   (`headless: 'new'`, viewport 1440x900 desktop / 390x844 mobile).
3. Capture screenshots + evaluate geometry (getBoundingClientRect) rather
   than eyeballing alone. Collect `pageerror`/console errors.

## Flows worth driving

- Hero fold: hero fills 100svh, CTA `.ed-link` above fold, next section below.
- index.html pills: the "What We Run" pill-box section lives on the HOMEPAGE
  (swapped from services 2026-07-11); index.html loads services-v2.css and
  services.js for it.
- index.html section 2 (2026-07-12): skiper104 scroll-reveal grid. home.js
  lazy-loads GSAP, adds `.edge-104` (520vh `.edge-track` + sticky centred
  `.edge-sticky`), scrubs per-column reveals + the accent `.edge-line`.
  Check: `.edge-sticky` top stays constant (~179px @900h) through the
  track; columns activate sequentially; reduced-motion/no-JS = static
  grid; ≤1024px = static vertical list w/ left line, no GSAP.
- index.html section 3 is the original growth timeline (steps reveal via
  observer.js `.visible`).
- root.css uses `#page{overflow-x:hidden;overflow-x:clip}` — `clip` keeps
  position:sticky working (nav header, edge grid). Plain `hidden` breaks
  all sticky descendants site-wide; never revert it.
- services-v2.css sets `html{scroll-behavior:auto}` on index+service: CSS
  smooth-scroll reproducibly corrupts ScrollTrigger measurements (starts
  offset by scroll distance, worst on reload with restored scroll).
  In-page anchors are smooth-scrolled by JS in services.js instead.
  Regression test: reload deep inside the edge track / sv-stack several
  times → every `ScrollTrigger.getAll()` start must be > 0 (assert no
  start < -innerHeight).
- service.html section 3 is the "What We Do" deliverables grid (from the
  homepage); it must sit adjacent to `.sv-phases` so the
  `.sv-phases + .deliverables-section` cover rules apply — check the pinned
  panels are hidden once it scrolls over them.
- service.html phases: GSAP pins `.sv-panel`s below the 70px sticky nav
  (desktop offsets 86/110/134/158; mobile 80/94/108/122), earlier panels
  scale to 0.94. Scroll stepwise through `.sv-stack` and screenshot.
  Runs on mobile too (client asked for mobile animations 2026-07-11).
- service.html pills: `.sv-pit` gets `sv-physics-on` on desktop AND mobile;
  pills settle inside the box (bottom ≈ box height). Drag via
  mouse.down/move/up, or `page.touchscreen.touchStart/Move/End` with
  `hasTouch: true` in the viewport. A touch-swipe on EMPTY box area must
  scroll the page (touch drag engages only when the finger hits a pill).
- Fallback: `page.emulateMediaFeatures([{name: 'prefers-reduced-motion',
  value:'reduce'}])` must load NO gsap/Matter and keep static layouts.
- Hero ring on mobile: `.ed-circle` must hug the `.ed-ring` span around
  "end to end" (services-v2.css sizes it to the span; homepage.css and the
  inline critical CSS both carry competing `.ed-circle` rules — cascade
  order decides, services-v2.css loads last).

## Gotchas

- root.css puts `transform: translateZ(0)` on `<body>` — breaks
  `position: fixed` (and ScrollTrigger pinning). services-v2.css overrides it
  with `body{transform:none}` on the services page. Don't reintroduce.
- The critical hero/nav CSS is inlined in each page's `<head>`; page CSS
  files (loaded after) can override it with equal-or-higher specificity.
- Kill stray `node.exe` servers when done (`taskkill //F //IM node.exe`).
