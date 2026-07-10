import { showToast } from './Toast.js';

export function Sidebar({ domains = [], address = '', onGenerate, onClearInbox } = {}) {
  const el = document.createElement('aside');
  // Styling kontainer utama diatur oleh App.js, kita fokus ke isinya

  el.innerHTML = `
    <!-- Bagian Email Aktif -->
    <div class="flex flex-col gap-3">
      <p class="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Email Aktif</p>
      
      <div class="bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 shadow-sm transition-colors">
        
        <!-- Layar Penampil Email -->
        <div class="flex items-center gap-3 bg-white dark:bg-[#0a0a0a] p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-inner">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse shrink-0"></span>
          <span class="address-display__text font-mono text-slate-800 dark:text-neutral-200 font-semibold truncate select-all w-full text-[15px]" title=""></span>
        </div>

        <!-- Tombol Aksi (Copy & Wipe) -->
        <div class="flex gap-2">
          <button type="button" class="flex-1 flex justify-center items-center gap-2 bg-white dark:bg-[#111] hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm" data-action="copy">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Salin
          </button>
          <button type="button" class="flex-1 flex justify-center items-center gap-2 bg-white dark:bg-[#111] hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-900 text-red-600 dark:text-red-500 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm" data-action="clear">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            Bersihkan
          </button>
        </div>
      </div>
    </div>

    <hr class="border-slate-100 dark:border-neutral-800 my-2">

    <!-- Bagian Pembuat Email Baru -->
    <div class="flex flex-col gap-4">
      <p class="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Ganti Identitas</p>
      
      <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-neutral-400 mb-2" for="username-input">Custom Username (Opsional)</label>
        <input id="username-input" class="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 rounded-xl text-slate-700 dark:text-neutral-200 text-sm transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-600 font-medium" type="text" placeholder="contoh: anonim123" autocomplete="off" spellcheck="false" />
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 dark:text-neutral-400 mb-2" for="domain-select">Pilih Domain</label>
        <div class="relative">
          <select id="domain-select" class="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 rounded-xl text-slate-700 dark:text-neutral-200 text-sm transition-all outline-none appearance-none cursor-pointer font-medium"></select>
          <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      </div>

      <button type="button" class="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]" data-action="generate">
        Buat Alamat Baru
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
    textEl.textContent = addr || 'Membuat alamat...';
    textEl.title = addr || '';
  }

  renderDomains(domains);
  renderAddress(address);

  el.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const current = textEl.textContent;
    if (!current || current === 'Membuat alamat...') return;
    try {
      await navigator.clipboard.writeText(current);
      showToast('Alamat disalin!', { type: 'success' });
    } catch {
      showToast('Gagal menyalin otomatis', { type: 'error' });
    }
  });

  el.querySelector('[data-action="clear"]').addEventListener('click', () => onClearInbox?.());

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
