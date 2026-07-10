import { storage } from '../utils/storage.js';

export function ThemeToggle({ onChange } = {}) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'theme-toggle';
  el.setAttribute('aria-label', 'Toggle dark or light mode');

  function render(theme) {
    el.textContent = theme === 'light' ? '☾' : '☀';
    el.dataset.theme = theme;
  }

  el.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    storage.setTheme(next);
    render(next);
    onChange?.(next);
  });

  render(document.documentElement.dataset.theme || 'dark');

  return { el };
}
