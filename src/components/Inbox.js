import { MailItem } from './MailItem.js';
import { Loader } from './Loader.js';
import { debounce } from '../utils/helpers.js';

export function Inbox({ onSelect, onDelete, onSearch } = {}) {
  const el = document.createElement('div');
  // Styling diaplikasikan dari App.js

  el.innerHTML = `
    <div class="p-4 border-b border-neutral-800 flex-shrink-0 bg-[#0a0a0a]">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-mono font-bold text-neutral-300 uppercase tracking-widest">
          INBOX_LOG
        </h2>
        <span class="inbox-count text-xs font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 border border-neutral-700">0</span>
      </div>
      <input type="text" id="inbox-search" placeholder="Search parameters..." class="w-full px-4 py-2 bg-[#050505] border border-neutral-800 focus:border-neutral-500 text-sm outline-none font-mono text-neutral-300 placeholder:text-neutral-700 rounded-none" />
    </div>
    <div class="list-container flex-1 overflow-y-auto bg-[#050505]"></div>
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
        <div class="w-16 h-16 bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-neutral-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><rect width="20" height="16" x="2" y="4"></rect></svg>
        </div>
        <h3 class="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-1">${hasSearch ? 'NO DATA FOUND' : 'WAITING FOR DATA...'}</h3>
      </div>
    `;
  }

  return {
    el,
    update({ emails = [], total = 0, activeId = null, loading = false, hasSearch = false } = {}) {
      countEl.textContent = total;

      if (loading && !emails.length) {
        listContainer.innerHTML = `<div class="p-8 text-center text-neutral-500 font-mono text-xs uppercase animate-pulse">Loading data...</div>`;
        return;
      }

      if (!emails.length) { listContainer.innerHTML = renderEmpty(hasSearch); return; }

      listContainer.innerHTML = emails.map(mail => {
        const isActive = mail._id === activeId; const isRead = mail.read;
        return `
          <button type="button" class="mail-item w-full text-left p-4 border-b border-neutral-800/50 transition-none ${isActive ? 'bg-neutral-900 border-l-2 border-l-neutral-100' : 'bg-transparent hover:bg-neutral-900 border-l-2 border-l-transparent'}" data-id="${mail._id}">
            <div class="flex justify-between items-baseline mb-2">
              <span class="font-mono text-sm truncate ${isActive || !isRead ? 'text-neutral-100 font-bold' : 'text-neutral-500'}">
                ${mail.fromName || mail.from.split('@')[0]}
              </span>
            </div>
            <div class="text-xs font-mono truncate mb-1 ${isActive || !isRead ? 'text-neutral-300' : 'text-neutral-600'}">
              ${mail.subject || 'UNTITLED_FILE'}
            </div>
          </button>
        `;
      }).join('');
    }
  };
}
