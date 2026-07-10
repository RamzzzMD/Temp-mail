import { showToast } from './Toast.js';

export function Sidebar({ domains = [], address = '', onGenerate, onClearInbox } = {}) {
  const el = document.createElement('aside');
  el.className = 'sidebar glass-panel';

  el.innerHTML = `
    <div class="sidebar__section">
      <p class="sidebar__eyebrow">Your frequency</p>
      <div class="address-display">
        <span class="address-display__pulse" aria-hidden="true"></span>
        <span class="address-display__text" title=""></span>
      </div>
      <div class="sidebar__row">
        <button type="button" class="btn btn--ghost" data-action="copy">Copy</button>
        <button type="button" class="btn btn--ghost" data-action="clear">Clear inbox</button>
      </div>
    </div>

    <div class="sidebar__section">
      <p class="sidebar__eyebrow">Tune a new frequency</p>
      <label class="field-label" for="username-input">Custom username (optional)</label>
      <input id="username-input" class="field-input" type="text" placeholder="e.g. budi.santoso" autocomplete="off" spellcheck="false" />

      <label class="field-label" for="domain-select">Domain</label>
      <select id="domain-select" class="field-input"></select>

      <button type="button" class="btn btn--primary sidebar__generate" data-action="generate">
        Generate address
      </button>
    </div>
  `;

  const textEl = el.querySelector('.address-display__text');
  const usernameInput = el.querySelector('#username-input');
  const domainSelect = el.querySelector('#domain-select');

  function renderDomains(list) {
    domainSelect.innerHTML = list.map((d) => `<option value="${d}">@${d}</option>`).join('');
  }

  function renderAddress(addr) {
    textEl.textContent = addr || 'Generating…';
    textEl.title = addr || '';
  }

  renderDomains(domains);
  renderAddress(address);

  el.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const current = textEl.textContent;
    if (!current || current === 'Generating…') return;
    try {
      await navigator.clipboard.writeText(current);
      showToast('Address copied', { type: 'success' });
    } catch {
      showToast('Could not copy — copy it manually', { type: 'error' });
    }
  });

  el.querySelector('[data-action="clear"]').addEventListener('click', () => {
    onClearInbox?.();
  });

  el.querySelector('[data-action="generate"]').addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const domain = domainSelect.value;
    onGenerate?.({ username, domain });
    usernameInput.value = '';
  });

  return {
    el,
    update(next = {}) {
      if (next.domains) renderDomains(next.domains);
      if ('address' in next) renderAddress(next.address);
      if (next.domain) domainSelect.value = next.domain;
    },
  };
}
