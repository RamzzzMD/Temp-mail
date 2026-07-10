import { MailItem } from './MailItem.js';
import { Loader } from './Loader.js';
import { debounce } from '../utils/helpers.js';

export function Inbox({ onSelect, onDelete, onSearch } = {}) {
  const el = document.createElement('div');
  el.className = 'flex flex-col h-full bg-white relative';

  // Kerangka dasar Kotak Masuk
  el.innerHTML = `
    <div class="p-4 md:p-5 border-b border-slate-100 flex-shrink-0 bg-white">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-extrabold text-slate-800 flex items-center gap-2 tracking-tight">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
          Kotak Masuk
        </h2>
        <span class="inbox-count text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">0</span>
      </div>
      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        <input type="text" id="inbox-search" placeholder="Cari pesan..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl text-sm transition-all outline-none font-medium placeholder:text-slate-400" />
      </div>
    </div>
    <div class="list-container flex-1 overflow-y-auto bg-slate-50/50"></div>
  `;

  const listContainer = el.querySelector('.list-container');
  const searchInput = el.querySelector('#inbox-search');
  const countEl = el.querySelector('.inbox-count');

  searchInput.addEventListener('input', (e) => {
    onSearch?.(e.target.value);
  });

  // Fungsi Event Listener Delegasi
  listContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.mail-item');
    if (btn) {
      const id = btn.dataset.id;
      onSelect?.(id);
    }
  });

  function renderEmpty(hasSearch) {
    return `
      <div class="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
        <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
        </div>
        <h3 class="text-base font-bold text-slate-700 mb-1">${hasSearch ? 'Pesan tidak ditemukan' : 'Kotak Masuk Kosong'}</h3>
        <p class="text-sm text-slate-500 max-w-[200px] leading-relaxed">
          ${hasSearch ? 'Coba kata kunci lain.' : 'Menunggu pesan baru masuk secara otomatis...'}
        </p>
      </div>
    `;
  }

  return {
    el,
    update({ emails = [], total = 0, activeId = null, loading = false, hasSearch = false } = {}) {
      countEl.textContent = total;

      if (loading && !emails.length) {
        listContainer.innerHTML = `
          <div class="flex justify-center p-8">
            <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        `;
        return;
      }

      if (!emails.length) {
        listContainer.innerHTML = renderEmpty(hasSearch);
        return;
      }

      listContainer.innerHTML = emails.map(mail => {
        const isActive = mail._id === activeId;
        const isRead = mail.read;
        return `
          <button type="button" class="mail-item w-full text-left p-4 md:p-5 border-b border-slate-100 transition-all ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'}" data-id="${mail._id}">
            <div class="flex justify-between items-baseline mb-1 gap-2">
              <span class="font-bold truncate ${isActive || !isRead ? 'text-slate-900' : 'text-slate-600'}">
                ${mail.fromName || mail.from.split('@')[0]}
              </span>
              <span class="text-[11px] font-semibold whitespace-nowrap ${isActive || !isRead ? 'text-blue-600' : 'text-slate-400'}">
                ${new Date(mail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div class="text-sm font-semibold truncate mb-1 ${isActive || !isRead ? 'text-slate-800' : 'text-slate-500'}">
              ${mail.subject || '(Tanpa Subjek)'}
            </div>
            <div class="text-xs text-slate-400 truncate font-medium">
              ${mail.textPreview || 'Tidak ada pratinjau teks...'}
            </div>
          </button>
        `;
      }).join('');
    }
  };
}
