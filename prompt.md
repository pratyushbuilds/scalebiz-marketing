# Scalebiz Services Page — Revision Brief (fix the broken build)

The current Services page has three problems: the hero has no fixed height (section 2 bleeds into it), the stacking cards aren't rendering as a stack, and the physics drop looks generic. Fix all three as below. All prior HARD CONSTRAINTS still apply: typography immutable, design tokens frozen, respect `prefers-reduced-motion`, nothing blocks first paint.

---

## FIX 1 — Hero must fill the screen

- The hero section gets `min-height: 100svh` (use `svh`, not `vh`, so mobile browser chrome doesn't cause overflow).
- Lay it out so the CTA ("See how we work") is the last element visible before the fold. The next section ("How we work" / the phases) must start BELOW the fold, not peek into the hero.
- Do not shrink the hero type to fit; give it room.

---

## FIX 2 — Stacking cards (the four phases): rebuild with GSAP, as rich panels

**Switch the build method.** Drop the pure-CSS-sticky approach; it's why the stack isn't working. Use **GSAP + ScrollTrigger with pinning** (the standard for this effect). Load GSAP for this page.

**Each card is a full, designed panel, not a plain white card.** Per card:
- A distinct aesthetic background pulled from the existing site palette (a solid brand colour or a subtle gradient per card; 4 different tones so the stack has variety). No new colours outside the existing tokens.
- A large phase number (`01`, `02`, `03`, `04`) as a design element.
- An engaging headline (suggested below), with the explanatory line as supporting text over the background.

**Motion:** as the user scrolls, each card pins to the top and the card(s) behind scale down slightly with a soft shadow, so the stack reads as physical layers. Smooth scrub, not jumpy.

**Card content (headline + supporting line):**
- **01 — "We find the leak first."** We map your offer, funnel, and competitors and find where you're losing people. Usually it isn't the ads.
- **02 — "Fix the base before the spend."** We repair the landing page, offer, and follow-up first. Ads on a broken funnel just lose money faster.
- **03 — "Know what's working before the money's gone."** We set up tracking that tells us early, not after the budget's spent.
- **04 — "Pour fuel on what converts."** Once the funnel holds, we push spend into what's working and cut what isn't.

**Fallback:** on `prefers-reduced-motion` and narrow mobile, render the four panels as a normal vertical stack (full colour, readable, in order), no pinning or scaling.

---

## FIX 3 — Services: pills in a bounded box, split layout

Rebuild the drop section as a **two-column split**:

- **One side (≈55%): a physics container.** A clearly bounded box (invisible walls on all four sides: ground, roof, left, right) sized to that column. Service-name **pills** drop into it when the section scrolls into view, bounce once, and settle inside the box. They do NOT fall down the whole screen.
  - Pills are rounded-rectangle Matter.js bodies (high corner radius), each labelled with one service name only: **Paid Media, SEO, Social Media, Web, Funnel, Influencer Marketing**. (If Web and Funnel are one offering, merge to a single "Web & Funnel" pill.)
  - Pill colours come from the existing palette; keep them consistent and legible.
  - **Draggable:** add a Matter.js `MouseConstraint` so the user can grab and toss the pills. This interactivity is what makes it feel premium instead of generic.
- **Other side (≈45%): editorial copy.** The section headline and a short line. Keep paid media framed as the core:
  > **Everything your growth needs, in one place.**
  > Paid media is our core. Social, SEO, web, funnel, and influencer work all plug into it, so one team owns the whole result.

**Performance guards (unchanged, all required):**
- Matter.js loads **desktop only** (min-width breakpoint) and **only when not** `prefers-reduced-motion`.
- **Lazy-load / defer** Matter.js so it never blocks first paint.
- Stop the engine once the pills settle (until a drag wakes them).
- **Fallback (mobile + reduced-motion):** render the same service names as a static row/cluster of styled pills (plain CSS, no physics) beside or under the copy. This static version is the real content.

---

## REPORT BACK
Confirm: hero fills the screen with the CTA above the fold; stacking cards use GSAP ScrollTrigger with pinning and render as coloured panels with phase numbers; pills are bounded in a box, draggable, split-layout, with the desktop-only + lazy-load + static-fallback guards in place; typography tokens untouched.