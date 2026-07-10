import { showToast } from './Toast.js';

export function Sidebar({ domains = [], address = '', onGenerate, onClearInbox } = {}) {
  const el = document.createElement('aside');
  // Styling diaplikasikan langsung dari App.js

  el.innerHTML = `
    <div>
      <p class="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Current Identity</p>
      <div class="bg-neutral-900 border border-neutral-800 p-4 flex flex-col gap-4">
        
        <div class="flex items-center gap-3 bg-[#050505] p-3 border border-neutral-800">
          <span class="w-2 h-2 bg-emerald-500 shrink-0" aria-hidden="true"></span>
          <span class="address-display__text font-mono text-neutral-300 font-semibold truncate select-all w-full text-sm"></span>
        </div>

        <div class="flex gap-2">
          <button type="button" class="flex-1 flex justify-center items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2 text-xs font-mono uppercase tracking-wider transition-all" data-action="copy">
            [ COPY ]
          </button>
          <button type="button" class="flex-1 flex justify-center items-center gap-2 bg-neutral-950 hover:bg-red-950 border border-neutral-800 hover:border-red-900 text-red-500 py-2 text-xs font-mono uppercase tracking-wider transition-all" data-action="clear">
            [ WIPE ]
          </button>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <p class="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-4">Reconfigure Identity</p>
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-mono text-neutral-500 mb-2 uppercase" for="username-input">Username</label>
          <input id="username-input" class="w-full px-4 py-3 bg-[#050505] border border-neutral-800 focus:border-neutral-500 text-neutral-200 text-sm font-mono transition-none outline-none rounded-none placeholder:text-neutral-700" type="text" placeholder="custom_id" autocomplete="off" spellcheck="false" />
        </div>

        <div>
          <label class="block text-xs font-mono text-neutral-500 mb-2 uppercase" for="domain-select">Domain</label>
          <select id="domain-select" class="w-full px-4 py-3 bg-[#050505] border border-neutral-800 focus:border-neutral-500 text-neutral-200 text-sm font-mono outline-none appearance-none rounded-none cursor-pointer"></select>
        </div>

        <button type="button" class="w-full mt-2 flex justify-center items-center gap-2 bg-neutral-100 hover:bg-white text-[#0a0a0a] font-bold py-3 px-4 font-mono uppercase tracking-widest transition-none" data-action="generate">
          EXECUTE
        </button>
      </div>
    </div>
  `;

  // Logika DOM tetap sama persis
  const textEl = el.querySelector('.address-display__text');
  const usernameInput = el.querySelector('#username-input');
  const domainSelect = el.querySelector('#domain-select');

  function renderDomains(list) { domainSelect.innerHTML = list.map((d) => `<option value="${d}">@${d}</option>`).join(''); }
  function renderAddress(addr) { textEl.textContent = addr || 'AWAITING...'; textEl.title = addr || ''; }

  renderDomains(domains); renderAddress(address);

  el.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const current = textEl.textContent;
    if (!current || current === 'AWAITING...') return;
    try { await navigator.clipboard.writeText(current); showToast('Copied to clipboard.', { type: 'success' }); } 
    catch { showToast('Manual copy required.', { type: 'error' }); }
  });

  el.querySelector('[data-action="clear"]').addEventListener('click', () => onClearInbox?.());
  el.querySelector('[data-action="generate"]').addEventListener('click', () => {
    const username = usernameInput.value.trim(); const domain = domainSelect.value;
    onGenerate?.({ username, domain }); usernameInput.value = '';
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
