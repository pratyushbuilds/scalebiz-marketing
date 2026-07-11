# Scalebiz Marketing — Case-Study Page Brief (for Claude Code)

Build a NEW case-study page for the existing Scalebiz site (the flagship Sharpener case).
This is a new **information architecture**, NOT a new design.

---

## HARD CONSTRAINTS — do not violate

1. **Reuse the homepage design system and components.** Build this page from the same component library, card styles, colours, and spacing already on the homepage. It must read as the same site.
2. **Typography is immutable.** Do NOT change any `font-family`, font stack, weight, or type-size token. Same lock as the homepage.
3. **New structure, reused design.** You are creating new sections/IA, styled entirely with existing primitives. Do not introduce new fonts, chart libraries, or CSS frameworks.
4. **Do NOT generate, fetch, or invent any images.** Use ONLY the real asset files in the `assets/images/results` folder. If a referenced asset is missing, leave a clearly labelled placeholder slot (e.g. `<!-- ASSET MISSING: spend-reduction.png -->`) — never substitute stock, AI-generated, or placeholder-proof imagery. These are real performance results; fabricating any of them is unacceptable.
5. Homepage Section 4 currently links here as a stub — wire that link to this page.

Before building, list the typography tokens and the homepage components you'll reuse, so I can confirm.

---

## POSITIONING (every section serves this)

- **Thesis:** *We fixed the funnel before running a single ad.* Diagnosis-first is the differentiator.
- **Range from one client:** each "move" below demonstrates a DIFFERENT muscle (credibility/offer, measurement, efficiency/ops). That's how one client proves breadth.
- **Told transferably:** Sharpener is edtech, but frame every insight so a non-edtech founder sees themselves. Lead with the mechanism, not the vertical.

---

## PAGE IA

### 1. Hero
- **Headline:** *We fixed the funnel before running a single ad.*
- **Subhead direction:** How we took one of our client from an underperforming account to 2.4x ROAS and climbing — while cutting monthly spend ~20%.
- Keep it one screen; no asset here, just the thesis.

### 2. The situation (set up the contrast)
- **Direction:** Most agencies would have just run ads on a broken base. We audited first and found the leaks weren't in the ad account — they were in the offer, the landing experience, and the follow-up.

### 3. What we found — the audit
- **Direction:** Diagnosis-first. We mapped the program, offer, competitors, and current funnel leaks before spending a rupee. The finding: the base had to be fixed before scale would work.

### 4. The moves — three capability cards (SELECTED, not a dump)
Each card = a different muscle. Do not add a fourth; do not list every action.

- **Card 1 — Fixed the base before scaling (offer + funnel).**
  Rebuilt the landing experience around the real friction: surfaced the deposit/refundable-security-deposit line up front to kill the "won't pay before placement" objection, and reordered sections using GA4 behaviour data (moved the highest-engagement sections to the top). Replaced unverified social proof with verified Google/Quora reviews. *(Tell the review fix in prose, softened — no before/after screenshot.)*

- **Card 2 — Built a measurement system (the signature move).**
  For a high-ticket, low-closure account, ROAS alone is too noisy to judge an adset. We built a lead-classification system: every lead scored on the sales team's first-impression, so we could decide keep-or-kill an adset without waiting on closures. This is the sharpest proof — give it the most weight.

- **Card 3 — Efficiency through proactive reporting.**
  Weekly + monthly reporting that flags funnel drift early instead of running until it breaks. Result: monthly spend cut ~20% (₹136k → ₹108k) while revenue and core metrics rose.

### 5. The proof (assets from `images/results`)
Slot the real assets, each in the site's card frame with a one-line caption:
- `efficiency-chart` — **hero visual, top of section.** (Rebuild as a native chart in site styling if possible, not a raw screenshot.) CPL −64% while CPM +47%.
- `spend-reduction` — before/after: ₹136k → ₹108k monthly spend, metrics up.
- `reporting-system` — cropped to show tracking STRUCTURE only (lead-temperature + adset-level ROAS). Keep weak cells (closure rate, 0.00-ROAS adsets) out of frame.
- `ads-manager-receipt` — small, "real account under management," adset names blurred. Legitimacy, not a results claim.

**Integrity note:** the ROAS visible in any screenshot is a public claim you stand behind. Use the realized figure (~2.4x), never a projection.

### 6. The outcome + the trust signal
- **Numbers:** 1.3x → 2.4x ROAS and climbing (cohort still closing), spend down ~20%, efficiency gains.
- **Trust signal (replaces a testimonial):** the client started with paid media and has since handed us their full social presence (Instagram to YouTube). A client expanding scope is stronger than a quote — state it plainly.
- No testimonials section, no logo wall (same as homepage).

### 7. CTA
- Same free-audit entry offer as the homepage.

---

## DELIVERABLE
Case-study page only. After the build, output: (1) typography tokens preserved, (2) homepage components reused, (3) which `assets/images/results` assets were found vs. left as labelled placeholders.
