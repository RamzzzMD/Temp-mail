import { MailItem } from './MailItem.js';
import { Loader } from './Loader.js';
import { debounce } from '../utils/helpers.js';

export function Inbox({ onSelect, onDelete, onSearch } = {}) {
  const el = document.createElement('div');
  // Styling kontainer utama diatur oleh App.js

  el.innerHTML = `
    <div class="p-4 md:p-5 border-b border-slate-100 dark:border-neutral-800 flex-shrink-0 bg-white dark:bg-[#0f0f11] transition-colors">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-extrabold text-slate-800 dark:text-neutral-100 tracking-tight flex items-center gap-2">
          Kotak Masuk
        </h2>
        <span class="inbox-count text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-800/50">0</span>
      </div>
      <div class="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
        <input type="text" id="inbox-search" placeholder="Cari pesan..." class="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 focus:bg-white dark:focus:bg-[#0a0a0a] focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/20 rounded-xl text-sm transition-all outline-none font-medium text-slate-700 dark:text-neutral-200 placeholder:text-slate-400 dark:placeholder:text-neutral-600" />
      </div>
    </div>
    <div class="list-container flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0a0a0a]"></div>
  `;

  const listContainer = el.querySelector('.list-container');
  const searchInput = el.querySelector('#inbox-search');
  const countEl = el.querySelector('.inbox-count');

  searchInput.addEventListener('input', (e) => onSearch?.(e.target.value));

  listContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.mail-item');
    if (btn) onSelect?.(btn.dataset.id);
  });

  function renderEmpty(hasSearch) {
    return `
      <div class="flex flex-col items-center justify-center h-full p-8 text-center">
        <div class="w-20 h-20 bg-white dark:bg-neutral-900 shadow-sm border border-slate-100 dark:border-neutral-800 rounded-full flex items-center justify-center mb-5 text-slate-300 dark:text-neutral-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"></path><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path><path d="m19 16 3 3-3 3"></path><path d="M22 19h-6"></path></svg>
        </div>
        <h3 class="text-base font-bold text-slate-700 dark:text-neutral-200 mb-1">${hasSearch ? 'Tidak ditemukan' : 'Kotak Masuk Kosong'}</h3>
        <p class="text-sm text-slate-500 dark:text-neutral-500 max-w-[200px] leading-relaxed">
          ${hasSearch ? 'Coba kata kunci lain.' : 'Menunggu pesan baru masuk...'}
        </p>
      </div>
    `;
  }

  return {
    el,
    update({ emails = [], total = 0, activeId = null, loading = false, hasSearch = false } = {}) {
      countEl.textContent = total;

      if (loading && !emails.length) {
        listContainer.innerHTML = `<div class="flex justify-center p-8"><svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>`;
        return;
      }

      if (!emails.length) { listContainer.innerHTML = renderEmpty(hasSearch); return; }

      listContainer.innerHTML = emails.map(mail => {
        const isActive = mail._id === activeId; 
        const isRead = mail.read;
        
        // Desain List: Biru jika aktif, Tebal jika belum dibaca
        return `
          <button type="button" class="mail-item w-full text-left p-4 md:p-5 border-b border-slate-100 dark:border-neutral-800 transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600 dark:border-l-blue-500' : 'bg-white dark:bg-[#0f0f11] hover:bg-slate-50 dark:hover:bg-neutral-900/50 border-l-4 border-l-transparent'}" data-id="${mail._id}">
            <div class="flex justify-between items-baseline mb-1.5 gap-2">
              <span class="truncate text-[15px] ${isActive || !isRead ? 'font-bold text-slate-900 dark:text-neutral-100' : 'font-semibold text-slate-600 dark:text-neutral-400'}">
                ${mail.fromName || mail.from.split('@')[0]}
              </span>
              <span class="text-[11px] font-bold whitespace-nowrap ${isActive || !isRead ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-neutral-500'}">
                ${new Date(mail.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div class="text-sm truncate mb-1 ${isActive || !isRead ? 'font-semibold text-slate-800 dark:text-neutral-200' : 'font-medium text-slate-500 dark:text-neutral-500'}">
              ${mail.subject || '(Tanpa Subjek)'}
            </div>
            <div class="text-[13px] text-slate-400 dark:text-neutral-600 truncate font-medium">
              ${mail.textPreview || 'Tidak ada pratinjau...'}
            </div>
          </button>
        `;
      }).join('');
    }
  };
}
