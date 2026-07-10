import { ThemeToggle } from './ThemeToggle.js';

export function Header() {
  const el = document.createElement('header');
  el.className = 'w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300';

  const { el: themeBtn } = ThemeToggle();

  el.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-2 cursor-pointer">
        <div class="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl text-white shadow-sm shadow-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
        </div>
        <span class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          TempMail<span class="text-blue-600 dark:text-blue-400">Pro</span>
        </span>
      </div>
      <div class="flex items-center gap-3" id="header-actions">
        <!-- Tombol Tema akan dimasukkan ke sini oleh JavaScript -->
        <a href="https://github.com" target="_blank" class="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all">
          GitHub
        </a>
      </div>
    </div>
  `;

  // Memasukkan Theme Toggle ke dalam Header
  el.querySelector('#header-actions').prepend(themeBtn);

  return { el };
}
