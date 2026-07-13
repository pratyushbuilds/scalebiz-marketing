// ================================================
// Shared form backend — Supabase (replaces Formspree)
//
// Both site forms (the split-CTA component and the contact
// page) submit through this module so the data model, spam
// handling, and attribution logic live in exactly one place.
//
// ⚠️ SECURITY: the anon public key below is SAFE to ship in
// client-side JS — that is what it is for. All protection comes
// from Row Level Security on the `submissions` table (INSERT-only
// policy for the anon role). NEVER paste a service-role / secret
// key here. See supabase/README.md.
//
// Until the two constants below are filled in, submit() throws and
// the forms show their error state (no faked success) — Formspree
// has been removed, so nothing is silently swallowed.
// ================================================
window.SBForms = (() => {
  // ⚠️ TODO(setup): paste these from Supabase → Project Settings → API.
  const SUPABASE_URL = 'https://keckolxstvdpwgzdbqan.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_eOckoelHqzVN32V9v51X_g_0l5RrP3Q';

  const configured =
    !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
    !SUPABASE_ANON_KEY.includes('YOUR_');

  const params = new URLSearchParams(location.search);
  const pick = (k) => {
    const v = params.get(k);
    return v && v.trim() ? v.trim() : null;
  };

  // Attribution context, captured from the URL + referrer at load.
  const context = () => ({
    referrer: document.referrer || null,
    utm_source: pick('utm_source'),
    utm_medium: pick('utm_medium'),
    utm_campaign: pick('utm_campaign')
  });

  // Whitelists keep junk/spoofed query params out of the data model.
  const SRC_VALUES = ['cta_unsure', 'footer', 'nav', 'hero', 'service_card'];
  const PAGE_VALUES = ['home', 'case_study', 'services', 'about', 'contact', 'legal', 'blog'];

  // entry_source: an EXPLICIT record of how the visitor arrived at the
  // form — never inferred from which form was used. `?src=` is set by
  // the link they clicked; anything unknown/absent falls back to default.
  const entrySource = (fallback) => {
    const s = pick('src');
    return SRC_VALUES.includes(s) ? s : fallback;
  };

  // source_page: where the journey started (carried as `?from=`), else fallback.
  const sourcePage = (fallback) => {
    const f = pick('from');
    return PAGE_VALUES.includes(f) ? f : fallback;
  };

  async function submit(record) {
    if (!configured) {
      throw new Error(
        'Supabase not configured — set SUPABASE_URL and SUPABASE_ANON_KEY in assets/js/common/form-backend.js'
      );
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(record)
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Supabase insert failed (${res.status}) ${detail}`);
    }
    return true;
  }

  return { configured, submit, context, entrySource, sourcePage };
})();
