import { formatRelativeTime, truncate, initials } from '../utils/helpers.js';

export function MailItem(email, { active = false, onSelect, onDelete } = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `mail-item${active ? ' mail-item--active' : ''}${email.read ? '' : ' mail-item--unread'}`;
  el.dataset.id = email._id;

  el.innerHTML = `
    <span class="mail-item__avatar" aria-hidden="true"></span>
    <span class="mail-item__body">
      <span class="mail-item__row">
        <span class="mail-item__from"></span>
        <span class="mail-item__time"></span>
      </span>
      <span class="mail-item__subject"></span>
      <span class="mail-item__preview"></span>
    </span>
    <span class="mail-item__delete" data-action="delete" title="Delete" role="button" aria-label="Delete email">✕</span>
  `;

  el.querySelector('.mail-item__avatar').textContent = initials(email.fromName, email.from);
  el.querySelector('.mail-item__from').textContent = email.fromName || email.from;
  el.querySelector('.mail-item__time').textContent = formatRelativeTime(email.createdAt);
  el.querySelector('.mail-item__subject').textContent = email.subject || '(no subject)';
  el.querySelector('.mail-item__preview').textContent = truncate(email.text || '', 90);

  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="delete"]')) {
      e.stopPropagation();
      onDelete?.(email._id);
      return;
    }
    onSelect?.(email._id);
  });

  return { el };
}
