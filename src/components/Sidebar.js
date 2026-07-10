import { showToast } from './Toast.js';

export function Sidebar({ domains = [], address = '', onGenerate, onClearInbox } = {}) {
  const el = document.createElement('aside');
  // Styling untuk container sidebar menggunakan Tailwind
  el.className = 'h-full p-5 md:p-6 overflow-y-auto flex flex-col gap-8';

  el.innerHTML = `
    <!-- Bagian Email Aktif -->
    <div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Email Aktif Kamu</p>
      
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        
        <!-- Layar Penampil Email -->
        <div class="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse shrink-0" aria-hidden="true"></span>
          <span class="address-display__text font-mono text-slate-800 font-semibold truncate select-all w-full text-base" title=""></span>
        </div>

        <!-- Tombol Aksi -->
        <div class="flex gap-2">
          <button type="button" class="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95" data-action="copy">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Salin
          </button>
          <button type="button" class="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95" data-action="clear">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Hapus
          </button>
        </div>
      </div>
    </div>

    <hr class="border-slate-200">

    <!-- Bagian Pembuat Email Baru -->
    <div>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Buat Email Baru</p>
      
      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2" for="username-input">Custom Username <span class="text-slate-400 font-normal">(Opsional)</span></label>
          <input id="username-input" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-slate-700 text-sm transition-all outline-none placeholder:text-slate-400 font-medium" type="text" placeholder="contoh: anonim123" autocomplete="off" spellcheck="false" />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2" for="domain-select">Pilih Domain</label>
          <div class="relative">
            <select id="domain-select" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-slate-700 text-sm transition-all outline-none appearance-none cursor-pointer font-medium"></select>
            <!-- Ikon Panah Bawah Custom -->
            <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <button type="button" class="w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]" data-action="generate">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          Ganti Alamat Email
        </button>
      </div>
    </div>
  `;

  // Logika DOM tetap sama persis
  const textEl = el.querySelector('.address-display__text');
  const usernameInput = el.querySelector('#username-input');
  const domainSelect = el.querySelector('#domain-select');

  function renderDomains(list) {
    domainSelect.innerHTML = list.map((d) => `<option value="${d}">@${d}</option>`).join('');
  }

  function renderAddress(addr) {
    textEl.textContent = addr || 'Sedang membuat...';
    textEl.title = addr || '';
  }

  renderDomains(domains);
  renderAddress(address);

  el.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    const current = textEl.textContent;
    if (!current || current === 'Sedang membuat...') return;
    try {
      await navigator.clipboard.writeText(current);
      showToast('Alamat berhasil disalin!', { type: 'success' });
    } catch {
      showToast('Gagal menyalin otomatis — salin secara manual', { type: 'error' });
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
