# Scalebiz Marketing — form backend (Supabase)

Both site forms — the **split-CTA** (home, services, case study, about) and the
**contact page** form — write to one Supabase table, `submissions`. Formspree has
been removed. Until the two steps marked **⚠️ REQUIRED** below are done, every form
will show its error state on submit (by design — nothing is silently dropped).

## What's already in the repo

| File | Purpose |
|---|---|
| `assets/js/common/form-backend.js` | Shared browser client. Holds the Supabase URL + anon key and the `SBForms.submit()` helper. **This is the only file with keys to edit.** |
| `supabase/schema.sql` | Table + Row Level Security (INSERT-only for the browser). |
| `supabase/functions/notify-submission/index.ts` | Emails you on each new lead. |

## Setup

### 1. Create the project & table
1. Create a free project at https://supabase.com.
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, run it.
3. Run the two verify queries at the bottom of that file and confirm:
   - `relrowsecurity = true`
   - exactly one policy: `INSERT` for `{anon}`.

### 2. ⚠️ REQUIRED — wire the keys into the site
1. In Supabase go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key (NOT `service_role`).
3. Open `assets/js/common/form-backend.js` and replace:
   ```js
   const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
   ```
   The anon key is meant to be public; RLS is what protects the data. **Never**
   put the `service_role` key in this file or anywhere in the site.

### 3. Notifications (so leads aren't missed)
1. Install the Supabase CLI, then:
   ```bash
   supabase functions deploy notify-submission
   supabase secrets set RESEND_API_KEY=... NOTIFY_TO=... NOTIFY_FROM=...
   ```
   - `NOTIFY_TO` — ⚠️ **TODO:** the inbox that should receive leads (still a placeholder).
   - Uses [Resend](https://resend.com) for delivery; swap in the function if you prefer another provider.
2. In Supabase: **Database → Webhooks → Create** an HTTP Request webhook on
   `INSERT` of `public.submissions` pointing at the `notify-submission` function.
   (Alternative with zero code: a **Zapier/Make** "new Supabase row → email" zap.)

### 4. Spam protection
- A **honeypot** field (`company_website`) is already on both forms; bot-filled
  submissions are dropped client-side and never reach the DB.
- **Captcha:** not added. Worth adding **hCaptcha/Cloudflare Turnstile** only if
  the honeypot proves insufficient after launch — it adds friction, so start without it.

## Testing (do before calling this done)

Submit a real test message from **every** form and confirm each row lands in
`Table Editor → submissions` with a valid `email` and the right tags:

| Where you submit | form_type | source_page | entry_source |
|---|---|---|---|
| Home split-CTA form | `split_cta` | `home` | `form_direct` |
| Services split-CTA form | `split_cta` | `services` | `form_direct` |
| Case-study split-CTA form | `split_cta` | `case_study` | `form_direct` |
| About split-CTA form | `split_cta` | `about` | `form_direct` |
| Contact form via a "Let's Figure It Out" button | `contact` | (originating page) | `cta_unsure` |
| Contact form via footer "Get in touch" | `contact` | (originating page) | `footer` |
| Contact form direct (typed URL) | `contact` | `contact` | `direct` |

`entry_source` is captured from the `?src=` param on the link that was clicked —
it is a recorded fact, never inferred from which form was used.
