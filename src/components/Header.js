import { ThemeToggle } from './ThemeToggle.js';

export function Header({ onThemeChange } = {}) {
  const el = document.createElement('header');
  el.className = 'app-header';

  el.innerHTML = `
    <div class="app-header__brand">
      <span class="app-header__mark" aria-hidden="true">◈</span>
      <span>Frequency<span class="app-header__name-accent">Mail</span></span>
    </div>
    <div class="app-header__actions"></div>
  `;

  const actions = el.querySelector('.app-header__actions');
  const { el: toggleEl } = ThemeToggle({ onChange: onThemeChange });
  actions.appendChild(toggleEl);

  return { el };
}
