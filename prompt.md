# Scalebiz Marketing — Services Page Brief (complete, replaces prior version)

Three jobs:
A. Build a new **Services page** (copy + layout below).
B. Add two **scroll/JS animations** to that page, with the performance guards specified.
C. Run a **global copy cleanup** on the existing homepage and case-study page.

---

## HARD CONSTRAINTS (apply to everything)

1. **Typography is immutable.** No change to any `font-family`, font stack, weight, or type-size token, on any page.
2. **Design tokens frozen.** Colours, spacing scale, buttons, and the existing component library stay as they are.
3. **Do NOT generate or invent images/illustrations.** Custom SVG and CSS/canvas animation is fine to code. For any raster asset, use only files already in the repo; if one is missing, leave a labelled placeholder. Never drop in stock or AI-looking art.
4. Every animation must have a **static fallback** and must respect **`prefers-reduced-motion`**. Site speed is a selling point for this client (they are a performance marketing agency); nothing here may block first paint or make the page feel slow.

Before building, confirm the frozen tokens and the existing components you will reuse.

---

## PART A — SERVICES PAGE

### Differentiation rule (look distinct without breaking the site)
- **Allowed to change:** section layout/rhythm and the two signature animated sections below. Make the section shapes here clearly different from the homepage's alternating blocks.
- **Not allowed to change:** fonts, type scale, colours, buttons, card styling, spacing tokens.
- Goal: same brand, different room. Not a different site.

### Page structure + COPY (use this copy close to as-is)

**1. Hero**
> Growth handled end to end.
>
> One team running your paid ads, social, and SEO, instead of four vendors pointing at each other. It starts with us finding what's actually holding your growth back.

**2. How we work — the four phases (STACKING CARDS animation, see Part B.1)**
> Every account we take on goes through the same four steps. We don't touch your ad budget until the first two are done.

- **1. Audit.** We map your offer, funnel, and competitors, and find where you're losing people. Usually it isn't the ads.
- **2. Fix the base.** We repair what's leaking first: the landing page, the offer, the follow-up. Running ads on a broken funnel just loses money faster.
- **3. Measure.** We set up tracking that tells us what's working before the budget runs out, not after.
- **4. Scale.** Once the funnel holds, we push spend into what's converting and cut what isn't.

**3. What we run — the services (DROP-AND-SETTLE animation, see Part B.2)**
> **Paid ads (Meta & Google).** This is our core. We've managed crores in ad spend and taken accounts from breaking even to steady profit. Every rupee is tracked to a real result, not a vanity number.
>
> **Social media.** We run the accounts start to finish, from content to posting to replies. Built to back up the paid side so your organic and paid pull the same direction.
>
> **SEO.** Traffic that doesn't switch off the day you pause ads. We go after the searches your buyers are already making.

**4. Why one team, not four**
> When your ads, social, and SEO sit with different people, nobody owns the result. Leads slip through gaps nobody's watching. We run all of it, so when something's off we can see the whole picture and fix it fast.

**5. CTA**
> Want to see where your funnel's leaking? [reuse the existing free-audit CTA]

---

## PART B — ANIMATIONS

### B.1 — Phases: stacking cards on scroll
- **Pattern:** sticky stacking cards. Each phase card uses `position: sticky` with a progressively larger `top` offset so they stack; as each card sticks, scale down the ones behind it slightly to create depth.
- **Build light:** prefer pure CSS `sticky` + a small amount of JS (Intersection Observer / scroll) for the scale. Do NOT pull in a heavy animation library just for this.
- **Fallback:** on `prefers-reduced-motion` and on narrow mobile, render the four cards as a normal vertical list with no pinning or scaling. The content must be fully readable and in order without the animation.
- **Accessibility:** cards must remain in DOM order and screen-reader legible; the animation is visual only.

### B.2 — Services: drop-and-settle (physics)
- **Pattern:** the three service cards (Paid / Social / SEO), as distinct coloured blocks, fall from the top under gravity and settle into a neat row. One small bounce on landing, then they come to rest. **No shatter.**
- **Library:** Matter.js, scoped to a canvas inside the services section only. Confine bodies with invisible ground + side walls so they settle into place.
- **Trigger:** start the sim when the section enters the viewport (Intersection Observer). **Stop the engine once the bodies settle** so it isn't burning CPU after the effect finishes.
- **Performance guards (all required):**
  - Load Matter.js **only on desktop** (min-width breakpoint) and **only when not** `prefers-reduced-motion`.
  - **Lazy-load / defer** the library so it never blocks first paint. It should not be in the initial critical bundle.
  - On mobile and on reduced-motion: skip the physics entirely and render the three services as a plain static grid using the existing card component. This static grid is the real content; the physics is an enhancement layered on top.
- **Semantics:** the settled state is a solid, aligned row (services that fit together). Do not leave cards scattered or broken.

---

## PART C — GLOBAL COPY CLEANUP (homepage + case-study page)

Rewrite existing copy on both pages to sound human, not AI-generated. Keep every claim and number identical. Change only the writing.

**Strip these patterns:**
- **Em-dashes:** remove most. Replace with a full stop, comma, or brackets. Where a dash is holding a real clause together, rewrite the sentence properly rather than just swapping the punctuation. Aim for zero to one per section.
- **The "it's not X, it's Y" construction:** rewrite as a plain statement.
- **Rule-of-three lists** used for rhythm ("faster, cleaner, smarter"): cut or rewrite.
- **Over-balanced, symmetrical sentences:** break the symmetry.
- **Buzzwords:** elevate, unlock, seamless, leverage, robust, empower, landscape, realm, supercharge, game-changer. Remove or replace with plain words.

**Do add:** contractions; sentence-length variety, including some very short sentences; plain verbs over impressive ones.

Do not touch numbers, claims, or meaning. Writing style only.

---

## DELIVERABLE / REPORT BACK
1. New Services page per Part A, with both animations per Part B.
2. Cleaned homepage + case-study copy per Part C.
3. Confirm: frozen tokens preserved; components reused; that Matter.js is desktop-only, lazy-loaded, and has a static mobile/reduced-motion fallback; and a short before/after copy sample so the register shift is visible.