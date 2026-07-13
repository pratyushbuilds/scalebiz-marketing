// ================================================
// Shared component: final CTA — 50/50 split
// (form | OR divider | escape hatch)
//
// The markup lives only here. Each page drops in a
// placeholder and supplies its own copy:
//
//   <section class="audit-cta" data-audit-split-cta
//     data-from="..."            page slug for attribution
//                                (home|case_study|services|about)
//     data-form-title="..."      left H2 above the form
//     data-form-lede="..."       optional line under the left H2
//     data-submit-label="..."    submit button text (default "Send It Over")
//     data-escape-title="..."    right H2
//     data-escape-line="..."     right supporting line (inline HTML ok)
//     data-escape-label="..."    right CTA button text
//     data-escape-href="..."     right CTA destination (default: the
//                                contact page, tagged ?src=cta_unsure&from=<page>)
//     data-eyebrow="..."         section eyebrow (default "Your Next Step")
//     data-reveal="..."          optional class added to titles/line
//                                (services page: "sv-cta-reveal")>
//     <noscript>…contact link fallback…</noscript>
//   </section>
//
// Submissions post to Supabase via the shared SBForms client
// (assets/js/common/form-backend.js — must load BEFORE this file).
// All copy is author-controlled static HTML; nothing user-supplied
// is injected. Load before any page script that reads the CTA's DOM.
// ================================================
(() => {
  const section = document.querySelector('[data-audit-split-cta]');
  if (!section) return;

  const d = section.dataset;
  const reveal = d.reveal ? ' ' + d.reveal : '';
  const from = d.from || '';
  // Relative by default so it works over file:// and at any deploy path.
  // Pages in a subfolder (e.g. /blog/) pass an explicit data-escape-href.
  const escapeHref =
    d.escapeHref ||
    'contact.html?src=cta_unsure' + (from ? '&from=' + encodeURIComponent(from) : '');

  section.innerHTML = `
    <div class="audit-inner audit-inner--split">
      <span class="sb-eyebrow">${d.eyebrow || 'Your Next Step'}</span>

      <div class="audit-split">

        <!-- Left half: the form (submits to Supabase via SBForms) -->
        <div class="audit-half audit-half--form${d.formLede ? ' audit-half--has-lede' : ''}">
          <h2 class="audit-half__title${reveal}">${d.formTitle}</h2>
          ${d.formLede ? `<p class="audit-half__lede">${d.formLede}</p>` : ''}
          <form class="audit-form" novalidate>

            <div class="af-field">
              <label for="af-name">Name</label>
              <input type="text" id="af-name" name="name" required autocomplete="name"
                placeholder="Your name" />
              <p class="af-error">Please enter your name.</p>
            </div>

            <div class="af-field">
              <label for="af-email">Email</label>
              <input type="email" id="af-email" name="email" required autocomplete="email"
                placeholder="you@company.com" />
              <p class="af-error">Please enter a valid email address.</p>
            </div>

            <div class="af-field">
              <label for="af-stage">Company's current stage</label>
              <select id="af-stage" name="company_stage" required>
                <option value="" selected disabled>Select a stage</option>
                <option value="Just starting">Just starting</option>
                <option value="Running ads already">Running ads already</option>
                <option value="Scaling">Scaling</option>
                <option value="Stuck">Stuck</option>
              </select>
              <p class="af-error">Please select your current stage.</p>
            </div>

            <div class="af-field">
              <label for="af-blocker">What's stopping your growth?</label>
              <textarea id="af-blocker" name="growth_blocker" rows="3" required
                placeholder="A sentence or two is plenty"></textarea>
              <p class="af-error">Tell us a little about what's in the way.</p>
            </div>

            <!-- Honeypot: real people leave this empty; bots fill it. Hidden from view + a11y tree. -->
            <div class="af-hp" aria-hidden="true">
              <label for="af-company-website">Company website</label>
              <input type="text" id="af-company-website" name="company_website" tabindex="-1" autocomplete="off" />
            </div>

            <button type="submit" class="audit-btn audit-form__submit">${d.submitLabel || 'Send It Over'}</button>
            <p class="audit-form__error" role="alert">Something went wrong sending that. Please try again, or email us directly.</p>
          </form>

          <!-- Real inline confirmation — shown only after Supabase accepts the row -->
          <div class="af-success" role="status" aria-live="polite">
            <strong>Thanks — we've got it.</strong><br />
            We'll read what you sent and reply, usually within 48 hours (working days).
          </div>
        </div>

        <!-- Divider: vertical on desktop, horizontal when stacked -->
        <div class="audit-or"><span>OR</span></div>

        <!-- Right half: the escape hatch (tags intent as cta_unsure) -->
        <div class="audit-half audit-half--escape">
          <h2 class="audit-half__title${reveal}">${d.escapeTitle}</h2>
          <p class="audit-escape__line${reveal}">${d.escapeLine}</p>
          <a href="${escapeHref}" class="audit-btn">${d.escapeLabel}</a>
        </div>

      </div>
    </div>`;

  // Inline validation. With JS off the component never renders and
  // the placeholder's <noscript> contact link shows instead.
  const form = section.querySelector('.audit-form');
  const success = section.querySelector('.af-success');
  const formError = section.querySelector('.audit-form__error');
  const submitBtn = form.querySelector('.audit-form__submit');
  const honeypot = form.querySelector('[name="company_website"]');

  const fields = Array.from(form.querySelectorAll('[required]'));
  const wrap = (el) => el.closest('.af-field');

  const check = (el) => {
    const ok = el.checkValidity();
    const w = wrap(el);
    if (w) w.classList.toggle('af-field--error', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  };

  fields.forEach((el) => {
    el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => {
      const w = wrap(el);
      if (w && w.classList.contains('af-field--error')) check(el);
    });
  });

  const showSuccess = () => {
    form.style.display = 'none';
    success.style.display = 'block';
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
    const label = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    try {
      await window.SBForms.submit({
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        company_stage: form.company_stage.value,
        growth_blocker: form.growth_blocker.value.trim(),
        enquiry_type: null,
        message: null,
        form_type: 'split_cta',
        source_page: from || null,
        entry_source: 'form_direct',
        ...window.SBForms.context()
      });
      showSuccess();
    } catch (err) {
      // No faked success — surface the failure, let them retry.
      formError.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  });
})();
