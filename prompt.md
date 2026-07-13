# Scalebiz — Backend, Data Model, Link Wiring & Blog Template

Five jobs:
A. Wire all footer/CTA links to their correct destinations.
B. Reorganise the legal pages into a folder.
C. Build the blog page as an empty, reusable template.
D. **Add an email field to the split-CTA form on all 4 pages.**
E. Set up the backend (Supabase) and the form data model.

Prior HARD CONSTRAINTS still apply: typography immutable, design tokens frozen, no new animation libraries.

---

## A. LINK WIRING

### Homepage
- CTA button `→ See how we apply this to your brand` → **Services page, "How We Work" section** (fragment link to that section's id, e.g. `/services.html#how-we-work`). Not the top of the page.

### Footer — Company
- **About** → About page hero (`/about.html`)
- **Team** → About page, **team section** (`/about.html#team`)
- **Contact** → Contact page (`/contact.html`)

### Footer — Services
Add **Influencer Marketing** to the existing list. All five service links (Paid Media, SEO, Social & Content, Web & Funnels, Influencer Marketing) → **Services page, "What We Do" section** (`/services.html#what-we-do`).
- If the service cards are individually addressable, deep-link each to its own card (e.g. `#what-we-do-seo`) and auto-expand that card on arrival. If that's not clean, all five pointing at `#what-we-do` is acceptable.

### Footer — Resources
- **Case Studies** → case study page
- **Blog** → blog page (see section C)

### Footer — Legal
- **Privacy Policy**, **Terms of Use**, **Cookie Policy** → their existing pages (see section B for new paths)

### Footer — Follow Us
- Add **Facebook** alongside Instagram and LinkedIn.
- Wire each to its real URL. **Leave all three as clearly labelled placeholders — do NOT invent or guess social URLs.**
- Use the existing icon set; keep the three consistent.

**All fragment links must actually resolve.** Add the required `id` attributes to the target sections, and confirm each link scrolls to the right place (accounting for any sticky header offset).

---

## B. REORGANISE LEGAL PAGES

Currently `privacy`, `terms`, and `cookie` HTML files sit in the root next to `index.html`.

- Create a `/legal/` folder in the root and move all three files into it.
- **Update every reference to them** across the entire site (footer links, the duplicate Privacy/Terms/Cookies links in the footer bottom bar, any inline links, sitemap, anything else).
- ⚠️ This changes their URLs. Since the site isn't live yet this is safe — but if any of these pages are already indexed or linked externally, add redirects from the old paths. Confirm which applies.
- Verify no 404s anywhere after the move.

---

## C. BLOG PAGE — empty template

The client will publish posts later when they start SEO work. Build the scaffolding, not content.

1. **Blog index page** (`/blog.html` or `/blog/index.html`)
   - Empty state that doesn't look broken: heading, one line ("We're publishing soon" or similar), and the shared CTA.
   - A post-card grid component, ready to populate. Leave one commented-out example card showing the expected markup.

2. **A single post template** (e.g. `/blog/post-template.html`)
   - Reusable layout: title, date, author, body, back-to-blog link.
   - Styled with existing tokens and typography. Readable body width (~65–75 chars per line).
   - Include a commented block at the top explaining exactly how to duplicate it for a new post and what to update. The client and their teammate are not full-time devs — make it obvious.

3. Basic SEO scaffolding on both: title, meta description, OG tags. Leave as templated placeholders.

No animations on either. These pages should be fast and plain.

---

## D. ⚠️ ADD EMAIL FIELD TO THE SPLIT-CTA FORM (all 4 pages)

**Bug:** the split-CTA form currently collects Name / Company's current stage / What's stopping your growth? — **and no contact details.** Every submission is currently unreachable. Fix this first; it's the highest-priority item in this brief.

**Change:** add an **Email** field (type=email, required, validated) to the split-CTA form.

**New field order:**
1. Name (text, required)
2. **Email (email, required)** ← NEW
3. Company's current stage
4. What's stopping your growth? (textarea, required)
5. Submit (or whatever the button we already have).

- The split CTA is a **shared component** — make this change once, in the component, so it applies to all 4 pages (home, case study, services, about). If it was duplicated per page, refactor it into a shared component now.
- Keep the form light. Do not add any further fields.
- Use the existing input styling and validation patterns.

---

## E. BACKEND — Supabase + form data model
Right now the site uses formspree or may be google sheet somewhere, remove those entirely and use supabase (Rest of the details are below).
### Setup
- Use **Supabase** (Postgres). Free tier is sufficient.
- **⚠️ SECURITY — non-negotiable:** the site is static, so Supabase is called from the browser. Use the **anon public key ONLY**, with **Row Level Security enabled** and a policy allowing **INSERT only** on the submissions table (no SELECT, no UPDATE, no DELETE from the client). **Never put a service-role key in client-side JS.** Confirm RLS is on before shipping.
- Add basic spam protection (honeypot field at minimum; note whether a captcha is worth adding).

### Table: `submissions`

| column | type | notes |
|---|---|---|
| `id` | uuid, PK | default gen_random_uuid() |
| `created_at` | timestamptz | default now() |
| `name` | text | **required — both forms** |
| `email` | text | **required — both forms** (split CTA now collects it; see D) |
| `company_stage` | text | split-CTA form only; null for contact submissions |
| `growth_blocker` | text | "what's stopping your growth?" — split-CTA form only |
| `enquiry_type` | text | contact form's "What's this about?" select; null for split-CTA |
| `message` | text | contact form only |
| `form_type` | text | `split_cta` or `contact` |
| `source_page` | text | page the form was submitted from (`home`, `case_study`, `services`, `about`, `contact`) |
| `entry_source` | text | **see below — this is the important one** |
| `referrer` | text | document.referrer, if available |
| `utm_source` / `utm_medium` / `utm_campaign` | text | capture if present in URL; nullable |

**Add a NOT NULL constraint on `email`.** Every lead must be reachable — that's the whole point of the form.

### ⚠️ `entry_source` — capture intent EXPLICITLY, do not infer it

The client's original idea was to infer intent from which form was used: split-CTA form = "knows their problem", contact page = "doesn't know". **This inference is unreliable and must not be used**, because the contact page is reachable from many places: the footer "Get in touch" button, the footer Contact link, the nav, and direct navigation. Treating every contact-page submission as "didn't know their problem" will corrupt the data.

**Instead:** capture the intent at the moment of the click.

- The **"Let's Figure It Out"** (the right half of every split CTA — change service page Run My Free Audit cta button to lets figure it out as well so to stay consistent) must append a query param when it navigates to the contact page:
  `/contact.html?src=cta_unsure&from=<page>`
  where `<page>` is the page they clicked from (`home`, `case_study`, `services`, `about`).
- The contact page reads those params on load and includes them in the submission as `entry_source` (e.g. `cta_unsure`) and `source_page` (the originating page).
- Any other route to the contact page (footer, nav, direct) submits with `entry_source = 'direct'` or `'footer'` as appropriate — tag the footer "Get in touch" button too.
- Submissions from the split-CTA **form itself** get `form_type = 'split_cta'` and `entry_source = 'form_direct'`.

Result: intent is a recorded fact, not a guess. The contact form's `enquiry_type` select handles the rest of the triage.

### Notification
- On successful insert, send an email notification so submissions aren't missed. Simplest route: a Supabase Edge Function or a webhook to the client's email. Flag the option chosen.
- **A form that silently stores data nobody looks at is the failure mode here.** Make sure a submission is visible somewhere the client will actually see it.

### Testing
Before this is considered done: submit a **real test message from every form on every page** (4 split CTAs + the contact form) and confirm each row lands in `submissions` with a valid `email`, and the correct `form_type`, `source_page`, and `entry_source`.

---

## REPORT BACK
1. Email field added to the shared split-CTA component and live on all 4 pages.
2. Every fragment link tested and resolving to the correct section.
3. Legal pages moved, all references updated, no 404s (and whether redirects were needed).
4. Blog index + post template built, with the duplication instructions in comments.
5. Supabase: table created, **RLS on with insert-only policy confirmed**, anon key only, honeypot in place, `email` NOT NULL.
6. `entry_source` correctly recorded from all routes — paste the test rows.
7. Where notifications land.