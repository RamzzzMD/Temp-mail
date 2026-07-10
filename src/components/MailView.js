import { formatFullTime, formatBytes } from '../utils/helpers.js';

export function MailView({ onDelete, onBack } = {}) {
  const el = document.createElement('section');
  el.className = 'mail-view glass-panel';

  renderEmptyState();

  function renderEmptyState() {
    el.innerHTML = `
      <div class="mail-view__empty">
        <span class="mail-view__empty-mark" aria-hidden="true">◈</span>
        <p>Select a message to read it here.</p>
      </div>
    `;
  }

  function renderLoading() {
    el.innerHTML = `<div class="mail-view__empty"><p>Tuning in…</p></div>`;
  }

  function renderEmail(email) {
    el.innerHTML = `
      <div class="mail-view__header">
        <button type="button" class="btn btn--ghost mail-view__back" data-action="back" aria-label="Back to inbox">←</button>
        <div class="mail-view__header-main">
          <h2 class="mail-view__subject"></h2>
          <p class="mail-view__meta">
            <span class="mail-view__from"></span>
            <span class="mail-view__separator">·</span>
            <span class="mail-view__to"></span>
          </p>
          <p class="mail-view__time"></p>
        </div>
        <button type="button" class="btn btn--ghost mail-view__delete" data-action="delete">Delete</button>
      </div>
      <div class="mail-view__attachments"></div>
      <div class="mail-view__frame-wrap">
        <iframe class="mail-view__frame" title="Email content" sandbox="allow-same-origin" referrerpolicy="no-referrer"></iframe>
      </div>
    `;

    el.querySelector('.mail-view__subject').textContent = email.subject || '(no subject)';
    el.querySelector('.mail-view__from').textContent = email.fromName
      ? `${email.fromName} <${email.from}>`
      : email.from;
    el.querySelector('.mail-view__to').textContent = `to ${email.to}`;
    el.querySelector('.mail-view__time').textContent = formatFullTime(email.createdAt);

    const attachmentsEl = el.querySelector('.mail-view__attachments');
    if (email.attachments?.length) {
      attachmentsEl.innerHTML = email.attachments
        .map(
          (a) =>
            `<span class="attachment-chip">📎 ${escapeHtml(a.filename)} <span class="attachment-chip__size">${formatBytes(a.size)}</span></span>`
        )
        .join('');
    } else {
      attachmentsEl.remove();
    }

    const iframe = el.querySelector('.mail-view__frame');
    const body = email.html
      ? email.html
      : `<pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(email.text || '(empty message)')}</pre>`;
    iframe.srcdoc = wrapHtmlDocument(body);

    el.querySelector('[data-action="delete"]').addEventListener('click', () => onDelete?.(email._id));
    el.querySelector('[data-action="back"]').addEventListener('click', () => onBack?.());
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Sandbox note: "allow-same-origin" WITHOUT "allow-scripts" is intentional and safe —
  // it lets the iframe render normally but makes it impossible for anything embedded in
  // the email (including a <script> that slipped past backend sanitization) to execute.
  function wrapHtmlDocument(bodyHtml) {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base target="_blank" />
    <style>
      html,body{margin:0;padding:16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;background:#fff;}
      img{max-width:100%;height:auto;}
      a{color:#2563eb;}
    </style>
  </head>
  <body>${bodyHtml}</body>
</html>`;
  }

  return {
    el,
    update({ email, loading } = {}) {
      if (loading) return renderLoading();
      if (email === null) return renderEmptyState();
      if (email) return renderEmail(email);
    },
  };
}
