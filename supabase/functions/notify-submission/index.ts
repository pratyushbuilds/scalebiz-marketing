// ============================================================
// Edge Function: notify-submission
//
// Emails a notification whenever a new row is inserted into
// `submissions`, so leads are never missed. Wire it up as a
// Supabase Database Webhook (Database → Webhooks → HTTP Request)
// on INSERT of public.submissions, pointing at this function.
//
// It uses Resend (https://resend.com, generous free tier) for
// delivery — swap for any transactional email API you prefer.
//
// SECRETS (set via `supabase secrets set` — NEVER hard-code):
//   RESEND_API_KEY   your Resend API key
//   NOTIFY_TO        ⚠️ TODO: the inbox that should receive leads
//   NOTIFY_FROM      a verified Resend sender, e.g. "leads@yourdomain.com"
// ============================================================
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

interface Submission {
  id?: string;
  name?: string;
  email?: string;
  company_stage?: string | null;
  growth_blocker?: string | null;
  enquiry_type?: string | null;
  message?: string | null;
  form_type?: string;
  source_page?: string | null;
  entry_source?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  created_at?: string;
}

serve(async (req) => {
  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFY_TO = Deno.env.get('NOTIFY_TO');
    const NOTIFY_FROM = Deno.env.get('NOTIFY_FROM') ?? 'leads@example.com';
    if (!RESEND_API_KEY || !NOTIFY_TO) {
      return new Response('Missing RESEND_API_KEY or NOTIFY_TO secret', { status: 500 });
    }

    // Supabase Database Webhooks send { type, table, record, old_record }.
    const payload = await req.json();
    const r: Submission = payload.record ?? payload;

    // Submission fields are attacker-controlled — escape before putting
    // them in the notification email's HTML so a crafted value can't
    // inject markup/links into the inbox message.
    const esc = (s: unknown) =>
      String(s ?? '').replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
      );

    const rows = (
      [
        ['Form', r.form_type],
        ['Name', r.name],
        ['Email', r.email],
        ['Enquiry type', r.enquiry_type],
        ['Message', r.message],
        ['Company stage', r.company_stage],
        ['Growth blocker', r.growth_blocker],
        ['Entry source', r.entry_source],
        ['Source page', r.source_page],
        ['Referrer', r.referrer],
        ['UTM', [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(' / ')]
      ] as [string, unknown][]
    )
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#5b6475">${esc(k)}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`)
      .join('');

    const subject = `New ${r.form_type === 'contact' ? 'contact' : 'audit'} lead — ${r.name ?? 'unknown'}`;
    const html = `<h2 style="font-family:sans-serif">New form submission</h2>
      <table style="font-family:sans-serif;font-size:14px">${rows}</table>
      <p style="font-family:sans-serif;color:#5b6475;font-size:12px">Reply directly to ${esc(r.email)}.</p>`;

    const send = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: NOTIFY_TO,
        reply_to: r.email,
        subject,
        html
      })
    });

    if (!send.ok) {
      return new Response(`Email send failed: ${await send.text()}`, { status: 502 });
    }
    return new Response('ok', { status: 200 });
  } catch (err) {
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }
});
