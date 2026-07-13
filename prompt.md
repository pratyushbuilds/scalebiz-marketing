# Scalebiz — Final Polish Brief

Prior HARD CONSTRAINTS apply: typography immutable, design tokens frozen, no new libraries.

---

## ⚠️ 1. SUPABASE KEYS — read this before doing anything

The client asked to gitignore the Supabase **Project URL** and **anon key** because they're "public."

**Do NOT do that. It's the wrong fix, and it will break the deployed site.**

The Supabase **anon key is designed to be public.** It ships in client-side JS by design. Gitignoring it provides zero security (anyone can read it in DevTools on the live site) while breaking the build, since the static site needs it to run. What actually secures the data is **Row Level Security**, not key secrecy.

**Do this instead:**

1. **Verify RLS is enabled and insert-only** on the `submissions` table. Confirm from the client (browser) context that SELECT, UPDATE, and DELETE are all denied and only INSERT succeeds. Paste the policy. **This is the actual security control — if it's not right, fix it now.**
2. **Search the entire repo AND the full git history for a `service_role` key.** That key bypasses RLS entirely and must never be committed or exposed. If one is found anywhere (source, `.env`, commit history), flag it immediately — it must be **rotated in the Supabase dashboard**, not just deleted from the file.
3. **Add a `.gitignore`** covering `.env`, `.env.local`, `node_modules`, editor/OS files, and any build artefacts. Good hygiene, but do not move the anon key into it.
4. Report back plainly on whether the current setup is secure, and what (if anything) needs rotating.

---

## 2. IMAGES

- **Homepage → "Who You Work With" section:** two image placeholders. Add both team photos from `assets/images`.
- **About page → Team section:** one photo is already set; add the second team member's photo from `assets/images`.
- Match the existing image treatment exactly (grayscale/hover, scale-in, aspect ratio, sizing). The two portraits must look like a matched pair, not two different crops.
- Serve them properly: correct dimensions, compressed, with `alt` text (each person's name + role). Do not ship uncompressed full-size photos.

---

## 3. BRAND NAME CONSISTENCY

- Search **every page, plus the legal pages, footer, nav, meta tags, OG tags, and page titles** for standalone uses of "**Scalebiz**".
- Replace with "**Scalebiz Marketing**".
- Exception: leave it as-is where it's part of a URL, a slug, a file path, an email address, or a social handle.

---

## 4. NAV BUTTON COPY

- The nav CTA button currently reads "**Get Audit →**". Change the **text only** to "**Let's Connect →**".
- Destination is unchanged (contact page).
- Apply across **all 5 pages** and the legal pages — anywhere the nav appears.
- Do not change the button's styling, size, or position.

---

## 5. FOOTER SOCIAL LINKS

Wire these across **all 5 pages AND the 3 legal pages**:

- **Instagram:** https://www.instagram.com/scalebizmarketing/
- **LinkedIn:** https://www.linkedin.com/company/scalebiz-marketing/
- **Facebook:** https://www.facebook.com/pratyush.kumar.24/

All external links: `target="_blank"` + `rel="noopener noreferrer"`.

**⚠️ Flag for the client:** the Facebook link is a **personal profile**, sitting alongside two company pages. On an agency footer this reads as inconsistent and slightly unprofessional. Recommend either omitting Facebook until a company page exists, or creating one. Build it as instructed, but surface this.

---

## 6. CONTACT PAGE — direct channels

Fill in the placeholders:

- **WhatsApp:** +91 63862 76008 — as a `wa.me` click-to-chat link (`https://wa.me/916386276008`). Give this real visual weight; it's the highest-converting channel for this audience.
- **Email:** leave as a clearly labelled placeholder for now.
- **LinkedIn:** https://www.linkedin.com/in/pratyush-kumar-218915337
- **Location:**
  > Civil Lines, New Delhi – 110054
  > North Delhi, Delhi, India

Keep the existing styling. Don't add a map or new components.

---

## 7. FOOTER ON LEGAL PAGES

Confirm the 3 legal pages carry the **same footer** as the rest of the site (all links, socials, and the brand name fix). If the footer is duplicated markup rather than a shared component/include, **refactor it into a shared one now** — it's about to be edited on 8 pages and something will get missed otherwise.

---

## REPORT BACK
1. **RLS status: the exact policy, and confirmation that only INSERT is permitted from the client. Plus: was a `service_role` key found anywhere in the repo or git history?**
2. Both team photos placed on both pages, matched treatment, compressed, alt text.
3. Count of "Scalebiz" → "Scalebiz Marketing" replacements, and where.
4. Nav button updated on all 8 pages (5 + 3 legal).
5. Socials wired on all 8 pages; is the footer now a shared component?
6. Contact page channels wired; WhatsApp link tested.