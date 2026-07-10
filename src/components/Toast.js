let container = null;

function ensureContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.className = 'toast-container';
  container.setAttribute('aria-live', 'polite');
  document.body.appendChild(container);
  return container;
}

export function showToast(message, { type = 'info', duration = 3500 } = {}) {
  const root = ensureContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${iconFor(type)}</span>
    <span class="toast__message"></span>
  `;
  toast.querySelector('.toast__message').textContent = message;

  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  const remove = () => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 250);
  };

  toast.addEventListener('click', remove);
  setTimeout(remove, duration);
}

function iconFor(type) {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '!';
    case 'mail':
      return '◈';
    default:
      return '•';
  }
}
