// ================================================
// Contact page — lightweight form handling.
//
// This is intentionally NOT the split-CTA component
// (assets/js/common/audit-split-cta.js). It's a plainer,
// standalone form. It submits to Supabase through the shared
// SBForms client (assets/js/common/form-backend.js), then shows
// a real inline confirmation — no redirect, no faked success.
//
// entry_source / source_page are read from the URL (?src, ?from)
// set by whichever link the visitor clicked, so intent is a
// recorded fact rather than something inferred from the form used.
// ================================================
(() => {
  const form = document.getElementById('ct-form');
  if (!form) return;

  const success = document.getElementById('ct-success');
  const formError = document.getElementById('ct-formerror');
  const submitBtn = form.querySelector('.ct-submit');
  const honeypot = form.querySelector('[name="company_website"]');

  const fields = Array.from(form.querySelectorAll('[required]'));
  const wrap = (el) => el.closest('.ct-field');

  const check = (el) => {
    const ok = el.checkValidity();
    const w = wrap(el);
    if (w) w.classList.toggle('ct-field--error', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  };

  // Clear a field's error as soon as the user fixes it.
  fields.forEach((el) => {
    el.addEventListener('input', () => {
      const w = wrap(el);
      if (w && w.classList.contains('ct-field--error')) check(el);
    });
  });

  const showSuccess = () => {
    form.classList.add('is-sent');
    success.style.display = 'block';
    success.focus?.();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.style.display = 'none';

    const bad = fields.filter((el) => !check(el));
    if (bad.length) {
      bad[0].focus();
      return;
    }

    // Bot filled the honeypot → act successful, store nothing.
    if (honeypot && honeypot.value.trim()) {
      showSuccess();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const topic = document.getElementById('ct-topic');
      await window.SBForms.submit({
        name: document.getElementById('ct-name').value.trim(),
        email: document.getElementById('ct-email').value.trim(),
        company_stage: null,
        growth_blocker: null,
        enquiry_type: topic && topic.value ? topic.value : null,
        message: document.getElementById('ct-message').value.trim(),
        form_type: 'contact',
        source_page: window.SBForms.sourcePage('contact'),
        entry_source: window.SBForms.entrySource('direct'),
        ...window.SBForms.context()
      });
      showSuccess();
    } catch (err) {
      // No faked success — surface the failure and re-enable the button.
      formError.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send';
    }
  });
})();
