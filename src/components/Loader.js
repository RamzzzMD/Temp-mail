export function Loader({ label = 'Loading…' } = {}) {
  const el = document.createElement('div');
  el.className = 'flex items-center justify-center gap-3 py-10';
  el.style.color = 'var(--color-text-muted)';
  el.innerHTML = `
    <span class="loader-ring" aria-hidden="true"></span>
    <span class="text-sm font-medium"></span>
  `;
  el.querySelector('span:last-child').textContent = label;
  return { el };
}
