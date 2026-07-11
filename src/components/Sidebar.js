import { showToast } from './Toast.js';

export function Sidebar({ domains = [], address = '', history = [], onGenerate, onClearInbox, onSelectHistory, onDeleteHistory } = {}) {
  const el = document.createElement('aside');

  el.innerHTML = `
    <!-- 1. BAGIAN EMAIL AKTIF -->
    <div class="flex flex-col gap-3">
      <p class="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Email Aktif Saat Ini</p>
      
      <div class="bg-slate-50 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-colors">
        
        <!-- Layar Penampil Email -->
        <div class="flex items-center gap-3 bg-white dark:bg-[#0a0a0a] p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-inner">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse shrink-0"></span>
          <span class="address-display__text font-mono text-slate-800 dark:text-neutral-200 font-semibold truncate select-all w-full text-[14px] md:text-[15px]" title=""></span>
        </div>

        <!-- Tombol Salin & Bersihkan Inbox -->
        <div class="flex gap-2">
          <button type="button" class="flex-1 flex justify-center items-center gap-1.5 bg-white dark:bg-[#111] hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm" data-action="copy">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Salin
          </button>
          <button type="button" class="flex-1 flex justify-center items-center gap-1.5 bg-white dark:bg-[#111] hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-neutral-700 hover:border-red-200 dark:hover:border-red-900 text-red-600 dark:text-red-500 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm" data-action="clear">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            Bersihkan
          </button>
        </div>
      </div>
    </div>

    <!-- 2. BAGIAN UBAH EMAIL MANUAL (LANGSUNG DI BAWAH EMAIL AKTIF) -->
    <div class="flex flex-col gap-3 mt-1">
      <p class="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Ubah / Kustom Alamat</p>
      
      <div class="bg-white dark:bg-neutral-900/30 border border-slate-200 dark:border-neutral-800 rounded-2xl p-3.5 flex flex-col gap-3 shadow-sm">
        <div class="flex flex-col sm:flex-row gap-2">
          <input id="username-input" class="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-slate-700 dark:text-neutral-200 text-xs transition-all outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-600 font-medium" type="text" placeholder="username custom..." autocomplete="off" spellcheck="false" />
          
          <div class="relative min-w-[130px]">
            <select id="domain-select" class="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-blue-500 dark:focus:border-blue-500 rounded-xl text-slate-700 dark:text-neutral-200 text-xs transition-all outline-none appearance-none cursor-pointer font-medium pr-8"></select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <button type="button" class="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm text-xs transition-all active:scale-[0.98]" data-action="generate">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
          Ganti Alamat Sekarang
        </button>
      </div>
    </div>

    <!-- 3. BAGIAN RIWAYAT ALAMAT EMAIL -->
    <div class="flex flex-col gap-2.5 mt-2 flex-1 overflow-hidden">
      <div class="flex justify-between items-center">
        <p class="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">Riwayat Alamat</p>
        <span class="text-[10px] text-slate-400 dark:text-neutral-600 font-medium">Klik untuk beralih</span>
      </div>
      
      <div class="history-list flex flex-col gap-1.5 overflow-y-auto max-h-[220px] pr-1"></div>
    </div>
  `;

  const textEl = el.querySelector('.address-display__text');
  const usernameInput = el.querySelector('#username-input');
  const domainSelect = el.querySelector('#domain-select');
  const historyListEl = el.querySelector('.history-list');

  function renderDomains(list) {
    domainSelect.innerHTML = list.map((d) => `<option value="${d}">@${d}</option>`).join('');
  }

  function renderAddress(addr) {
    textEl.textContent = addr || 'Membuat alamat...';
    textEl.title = addr || '';
  }

  function renderHistory(list = [], currentAddr) {
    if (!list.length) {
      historyListEl.innerHTML = `<div class="text-center py-4 text-xs text-slate-400 dark:text-neutral-600 font-medium">Belum ada riwayat email</div>`;
      return;
    }

    historyListEl.innerHTML = list.map((item) => {
      const isCurrent = item === currentAddr;
      return `
        <div class="group flex items-center justify-between p-2.5 rounded-xl border transition-all ${isCurrent ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50/50 dark:bg-neutral-900/30 hover:bg-slate-100 dark:hover:bg-neutral-800/50 border-slate-200/60 dark:border-neutral-800/60 text-slate-600 dark:text-neutral-400 font-medium'}">
          <button type="button" class="flex-1 text-left truncate font-mono text-xs cursor-pointer select-history-btn" data-address="${item}">
            ${item}
          </button>
          
          <div class="flex items-center gap-1 shrink-0 ml-2">
            ${isCurrent ? `<span class="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-sans">Aktif</span>` : ''}
            
            <button type="button" class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-opacity delete-history-btn" data-address="${item}" title="Hapus dari riwayat">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderDomains(domains);
  renderAddress(address);
  renderHistory(history, address);

  // Event Listeners
  el.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const current = textEl.textContent;
    if (!current || current === 'Membuat alamat...') return;
    try {
      await navigator.clipboard.writeText(current);
      showToast('Alamat disalin ke clipboard!', { type: 'success' });
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

  // Delegasi Event untuk Tombol Riwayat
  historyListEl.addEventListener('click', (e) => {
    const selectBtn = e.target.closest('.select-history-btn');
    const deleteBtn = e.target.closest('.delete-history-btn');

    if (deleteBtn) {
      e.stopPropagation();
      onDeleteHistory?.(deleteBtn.dataset.address);
      return;
    }

    if (selectBtn) {
      onSelectHistory?.(selectBtn.dataset.address);
    }
  });

  return {
    el,
    update(next = {}) {
      if (next.domains) renderDomains(next.domains);
      if ('address' in next) renderAddress(next.address);
      if (next.domain) domainSelect.value = next.domain;
      if (next.history || 'address' in next) {
        renderHistory(next.history || storage.getHistory(), next.address || textEl.textContent);
      }
    },
  };
}
