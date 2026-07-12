# Scalebiz Services Page — Redesign Brief (v2)

Two changes: reorder the page, and rebuild the "What We Do" section as expandable cards.

All prior HARD CONSTRAINTS apply: typography immutable, design tokens frozen, `prefers-reduced-motion` respected, static fallback for every animation, nothing blocks first paint.

---

## STEP 0 — Answer before building

skiper23 depends on React + framer-motion. **Is this site React?**
- **If YES:** framer-motion is fine.
- **If NO:** do NOT add React for this. Rebuild the expand/collapse with GSAP (already loaded on this page) or plain CSS transitions + a height/FLIP animation. Same behaviour, no new framework.

Report which path you took and the total animation libraries this page now loads.

---

## 1. Section reorder

- **Section 2 = "What We Do"** (the services)
- **Section 3 = "How We Work"** (the four-phase stacking cards — unchanged, just moved down)

**Constraint:** the stacking-cards section is the page's signature moment and now sits below the services. Keep the services section vertically compact (collapsed cards must be tight) so users still reach the phases. Do not let the services block dominate the page.

---

## 2. "What We Do" — rebuild as expandable cards

**Pattern:** click-to-expand cards, in the style of Skiper UI `skiper23` (https://skiper-ui.com/v1/skiper23). Collapsed card shows the service name; clicking expands it with a smooth layout animation to reveal the detail; clicking outside collapses it.

- **Licensing:** skiper23's free version requires Skiper UI attribution. Either add it, or reimplement independently. Do not ship uncredited.
- **Reuse existing tokens only** — card styling, colours, radius, spacing, type. No new visual language.

### Card content (5 services)

**Collapsed state:** service name only. Keep it clean and compact — no tags, no body copy visible.

**Expanded state:** the copy below.

1. **Paid Media (Meta & Google)** — *the anchor service*
   > This is our core. We've managed crores in ad spend and taken accounts from breaking even to steady profit. Every rupee is tracked to a real result, not a vanity number. We audit the funnel before we touch the budget, then scale what actually converts.
   - **Anchor treatment:** this card is **expanded by default** on load, and carries visibly more substance than the others (keep its supporting tags/detail). It should read as the main offering without breaking the visual system.

2. **SEO**
   > Traffic that doesn't switch off the day you pause ads. We go after the searches your buyers are already making, and build pages that actually rank for them.

3. **Social Media**
   > We run the accounts start to finish, from content to posting to replies. Built to back the paid side, so your organic and paid pull in the same direction.

4. **Web & Funnel**
   > Landing pages and funnels built to convert the traffic you're already paying for. Most growth leaks happen here, not in the ad account.

5. **Influencer Marketing** *(NEW)*
   > Creators who actually move product, not just rack up views. We pick them on fit and performance, brief them properly, and track what each one returns.

### Supporting tags
The client asked to remove supporting tags from all services except Paid Media.
- **Implement as:** collapsed cards show no tags (clean, title-only). Paid Media keeps its fuller detail in the expanded state.
- **⚠️ Flag for client:** do NOT leave the other four services with bare titles and no detail anywhere. Four empty-looking services undercuts the "one team owns the whole result" argument. The expanded copy above is the substitute for the tags — keep it.

### Per-card CTA
Add a CTA at the bottom of **each expanded card** (in the space below the text):
- **Label:** "Talk to us about this →"
- **Links to:** the site's existing audit/contact CTA destination.
- Use an existing secondary/tertiary button or text-link style. It must not compete with the page's primary CTA.

### Fallback
On `prefers-reduced-motion` and narrow mobile: render all five cards expanded (or as a plain accordion with no layout animation), fully readable, in order. All copy and CTAs must be reachable without the animation.

---

## DO NOT TOUCH
- The hero, the four-phase copy, the physics-pills section, or the final CTA.
- Any claims or numbers.
- Typography tokens.

---

## REPORT BACK
1. React or not; which animation path you took; total animation libraries on this page.
2. Confirmation Paid Media is expanded by default and reads as the anchor.
3. Confirmation the page still reaches the stacking-cards section without excessive scroll.
4. Typography tokens preserved.