# Scalebiz — Fixes, Code Organisation & Performance

Work in this order. Sections 1 and 2 are correctness bugs and must be done first.

**GOLDEN RULE: do not break the UI/UX or the backend.** Every animation, interaction, form, and Supabase submission must work exactly as it does now. If any optimisation risks an interaction, skip it and flag it rather than guessing.

---

## 1. 🚨 CRITICAL — the `<head>` is still pointing at the old site

The `<head>` was carried over from the previous "Edge Storefronts" project and still references that domain and business. **This is not cosmetic — it can hand your SEO to a different site.** Fix on every page.

The live domain is: scalebizmarketing.com
This replaces every edgrstorefronts.in reference in the codebase.

- **`<link rel="canonical">` points to `https://edgrstorefronts.in/`.** A canonical tag tells search engines which URL is authoritative. Pointing every page at the old domain risks Google crediting/indexing that domain instead of this one. **Update to the real Scalebiz Marketing domain, and make it page-specific** (each page canonicals to itself, not all to the homepage).
- **All `og:url` and `og:image` / `twitter:image` URLs** point at `edgrstorefronts.in`. Update to the real domain. Confirm the OG image actually exists at the new path — link previews break silently otherwise.
- **Schema markup address says Varanasi, UP.** The contact page says Civil Lines, New Delhi. **These contradict each other.** Confirm with the client which is the real business address and make schema, contact page, and footer agree.
- **`"alternateName": "Scalebiz"`** — left over from the brand-name pass. Decide with the client whether to keep it (it's legitimate as an alternate name) or remove.
- **Favicon is a TODO** pointing at old branding assets. Flag for the client to supply real favicon/branding files.
- Sweep every page for any other `edgrstorefronts` / Edge Storefronts reference in meta, schema, comments, or asset paths.

- You need to check each domain properly here, in final cta section of all 5 pages we have split cta, if the user clicks lets figure it out then they land on contact page with the url says src=cta_unsure&from=page there are the small details you need to check and work upon.

---

## 2. 🚨 CRITICAL — broken legal pages

- The footer links to Privacy / Terms / Cookies currently **404**. Fix the paths (they moved to `/legal/`). Test every link from every page, including the duplicate links in the footer bottom bar.
- **The legal pages have no navbar.** Add the site's standard nav to all 3, identical to the other pages (including the "Let's Connect" CTA).
- While there: confirm the legal pages carry the correct footer, brand name, and social links.
- If the nav and footer are still duplicated markup across 8 pages, **refactor them into shared includes/components now.** They've now been edited three separate times; this keeps costing.

---

## 3. CODE ORGANISATION

- Rename the CSS folders: `common (css)` and `pages (css)` have **spaces and parentheses in the path**. This is fragile (URL encoding, some build tools, some servers). Rename to `common/` and `pages/`, update all references.
- Consolidate duplicate/overlapping CSS. Establish a clear structure: tokens/root → shared components (nav, footer, buttons, forms, cards) → page-specific.
- Remove dead files, commented-out blocks, and any leftover Edge Storefronts assets.
- **Do not rename or restructure anything the JS depends on** (class names, ids, data attributes) without updating the JS in the same commit.
- Ensure after rename you must rename file calls in html as well.
---

## 4. UNUSED CSS/JS — ⚠️ HANDLE WITH CARE

**Read this before running any purge tool.**

Automated unused-CSS tools scan static HTML. They **cannot see classes applied at runtime by JavaScript.** This site is full of them: GSAP stacking-card states, Matter.js pill states, the expand/collapse service cards, the team photo hover reveal, the mobile nav open state, form error/success states.

A naive purge will delete those rules, the build will pass, and the animations will break silently.

**Required approach:**
1. **First, produce a report of what would be removed. Do NOT delete anything yet.** Show it to the client.
2. Build a **safelist** covering every JS-applied class, every animation state, every `:hover`/`:focus`/`.active`/`.open`/`.expanded`/error/success state, and anything injected by GSAP/Matter.js/Framer Motion.
3. Only then purge.
4. **Manually verify every interactive state afterwards:** stacking cards scroll, pill drag, service card expand/collapse, team hover, mobile nav, all 5 forms (including error and success states), all fallbacks under `prefers-reduced-motion` and at mobile widths.

Same care for JS: remove genuinely dead code, but don't strip anything an event listener or library depends on.

---

## 5. PERFORMANCE — the low-risk, high-value work

**Fonts**
- Currently Google Fonts via CDN with a preload + `media="print"` swap. **Self-host the two font families instead** (Manrope, Playfair Display) as `woff2`, subset to `latin`. Removes two third-party connections from the critical path and is faster and more private.
- Use `font-display: swap`, preload only the weights actually used above the fold.
- Audit which weights are genuinely used — loading unused weights is pure waste.

**Font Awesome — remove it**
- The whole Font Awesome CSS is being loaded for what is probably a handful of icons. **Replace with inline SVGs** for the icons actually used (socials, nav, cards). This is likely one of the biggest single wins available.

**Animation libraries — the biggest weight on the site**
- **Report the actual size of GSAP, Matter.js, and Framer Motion (if present), per page.** The client needs to see what the animations cost.
- Ensure each is loaded **only on the page that uses it**, deferred, and never in the critical path.
- Matter.js must remain **desktop-only** and lazy-loaded (already specified — verify it still is).
- If GSAP is loaded in full, import only the plugins used (ScrollTrigger) rather than the whole library.

**Images**
- Convert to **WebP** (with fallbacks), compress, and serve correctly sized. The team photos and any proof screenshots are the priority.
- Add `width`/`height` attributes to every image to prevent layout shift (CLS).
- `loading="lazy"` on everything below the fold; **never** on the hero/LCP image.
- The proof screenshots on the case study page must stay legible after compression — text in images degrades fast. Check them by eye.

**Scripts**
- `defer` on everything non-critical.
- GTM is currently a blocking inline script in `<head>`. Keep GTM (it's needed) but verify it isn't delaying first paint; consider loading it after the critical content.

**CSS delivery**
- The inlined critical CSS approach is good — keep it, but regenerate it so it matches the current above-the-fold content on each page (it was written for the old site).
- Everything else loads async.

**Other**
- Enable text compression (gzip/brotli) and sensible cache headers at the host.
- Add a `sitemap.xml` and `robots.txt` if not present.

---

## 6. Sitemap & robots
 
- Generate `sitemap.xml` listing all real pages, using the chosen canonical URL form.
- Add `robots.txt` pointing at the sitemap.
- Do NOT include the blog post *template* file in the sitemap (it's scaffolding, not a page).
---

## 7. Verify before launch
 
- Every canonical resolves and points to itself (not the old domain, not the homepage).
- `http://` and the non-canonical www/non-www variant both 301 correctly.
- Paste a link into WhatsApp and LinkedIn and confirm the preview card renders with the right title, description, and image.
- Zero occurrences of `edgrstorefronts` anywhere in the repo.
---

## 8. MEASURE — before and after

- Run **Lighthouse on every page, mobile profile, throttled**, before and after. Report both.
- Target: LCP under 2.5s, CLS under 0.1, and a real improvement in total page weight.
- **Test on a real mid-range Android over mobile data**, not just desktop DevTools. That's how most of this client's prospects will see the site.

---

## REPORT BACK
1. Canonical/OG/schema fixed on every page; confirmed no `edgrstorefronts` references remain anywhere.
2. Legal pages: links fixed, navbar added, footer correct.
3. Nav + footer now shared components?
4. **The unused-CSS removal report — BEFORE deleting anything.**
5. Per-page bundle size for GSAP / Matter.js / Framer Motion.
6. Lighthouse before/after, mobile, every page.
7. An explicit list of every interactive state you re-tested after the purge.