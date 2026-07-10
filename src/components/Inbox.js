import { MailItem } from './MailItem.js';
import { Loader } from './Loader.js';
import { debounce } from '../utils/helpers.js';

export function Inbox({ onSelect, onDelete, onSearch } = {}) {
  const el = document.createElement('section');
  el.className = 'inbox glass-panel';

  el.innerHTML = `
    <div class="inbox__toolbar">
      <div class="search-field">
        <span class="search-field__icon" aria-hidden="true">⌕</span>
        <input type="search" class="search-field__input" placeholder="Search inbox…" aria-label="Search inbox" />
      </div>
      <span class="inbox__count"></span>
    </div>
    <div class="inbox__list" role="list"></div>
  `;

  const listEl = el.querySelector('.inbox__list');
  const countEl = el.querySelector('.inbox__count');
  const searchInput = el.querySelector('.search-field__input');

  const debouncedSearch = debounce((value) => onSearch?.(value), 300);
  searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));

  function renderLoading() {
    listEl.innerHTML = '';
    listEl.appendChild(Loader({ label: 'Listening for mail…' }).el);
  }

  function renderEmpty(hasSearch) {
    listEl.innerHTML = `
      <div class="inbox__empty">
        <span class="inbox__empty-mark" aria-hidden="true">◇</span>
        <p>${hasSearch ? 'No messages match your search.' : 'No signal yet. Mail sent to this address will show up here in real time.'}</p>
      </div>
    `;
  }

  function renderList(emails, activeId) {
    listEl.innerHTML = '';
    emails.forEach((email) => {
      const { el: itemEl } = MailItem(email, {
        active: email._id === activeId,
        onSelect,
        onDelete,
      });
      listEl.appendChild(itemEl);
    });
  }

  return {
    el,
    update({ emails, total, loading, activeId, hasSearch } = {}) {
      if (typeof total === 'number') {
        countEl.textContent = `${total} message${total === 1 ? '' : 's'}`;
      }
      if (loading) return renderLoading();
      if (emails) {
        if (emails.length === 0) return renderEmpty(hasSearch);
        renderList(emails, activeId);
      }
    },
  };
}
