# Scalebiz Homepage — Section 2 & 3 Redesign Brief

Upgrade the two weakest homepage sections. The homepage is the highest drop-off point, so it should carry the strongest interactions on the site. Sections 4 and 5 stay as they are.

All prior HARD CONSTRAINTS still apply: typography immutable, design tokens frozen, respect `prefers-reduced-motion`, static fallback for every animation, nothing blocks first paint.

---

## STEP 0 — Answer this before building

**Is this site React?**
- **If YES:** you may use Framer Motion / `motion` for the two components below.
- **If NO:** do NOT add React just to use these components. Rebuild both effects with **GSAP + ScrollTrigger**, which the site already loads for the service page. Same visual result, no new framework.

Report which path you took, and the total animation libraries the site now loads. We are trying to keep this lean; the site's speed is part of the client's pitch (they're a performance marketing agency).

---

## SECTION 2 — "Why More Ad Spend Won't Fix It"

**Problem:** currently four flat static cards in a row. Reads like a template.

**Change:** rebuild as a **scroll-reveal grid** in the style of Skiper UI `skiper104` (https://skiper-ui.com/v1/skiper104) — cards reveal with smooth staggered transitions as the section enters view.

- Keep the existing four cards' content exactly as-is (Upstream: Your Offer / Inside the Ad Account / Downstream: Your Follow-Up / Our Job: The Diagnosis). Copy does not change.
- Keep the existing card styling, colours, icons, and type tokens. Only the reveal motion and grid composition change.
- **Licensing:** skiper104's free version requires Skiper UI attribution. Either add the required attribution, or reimplement the effect independently. Do not ship it uncredited.
- **Fallback:** on `prefers-reduced-motion`, cards render immediately, no motion.

---

## SECTION 3 — the method / how-we-work teaser

**Problem:** currently flat and forgettable.

**Do NOT reuse the service page's stacking-cards animation here.** That is the service page's signature element; duplicating it makes the two pages look identical again and spends the payoff on the teaser.

**Change:** rebuild as a **sticky scroll text reveal with blur**, in the style of Skiper UI `skiper44` (https://skiper-ui.com/v1/skiper44) — statement copy pinned and revealed line by line on scroll, with scale/backdrop-blur transitions.

- This is a **teaser**, not the full walkthrough. Keep it short. State the method as a few punchy lines, then link out to the Services page for the full four-phase breakdown.
- Suggested lines to reveal in sequence (adjust to fit the component's rhythm):
  1. We audit before we spend.
  2. We fix what's leaking before we scale it.
  3. We measure early, not after the budget's gone.
  4. Then we pour fuel on what converts.
- End the section with a link: "See how we work →" pointing to the Services page.
- **Note:** skiper44 is a Pro component — copy/adapt the source rather than installing via CLI, and keep the attribution terms in mind.
- **Fallback:** on `prefers-reduced-motion` and narrow mobile, render the lines as a plain static list, fully readable, no pinning or blur.

---

## DO NOT TOUCH
- Section 4 (case study teaser) and Section 5 — leave exactly as they are.
- All copy claims and numbers across the page.

---

## REPORT BACK
1. React or not, and which animation path you took.
2. Total animation libraries the homepage now loads, and confirmation they're deferred/lazy-loaded so they don't block first paint.
3. Confirmation that the service page's stacking-cards animation was NOT reused on the homepage.
4. Typography tokens preserved.