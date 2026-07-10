import { ThemeToggle } from './ThemeToggle.js';

export function Header() {
  const el = document.createElement('header');
  el.className = 'w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50';

  el.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Logo & Nama (Kotak Tegas) -->
      <div class="flex items-center gap-3 cursor-pointer">
        <div class="bg-neutral-100 p-2 border-b-2 border-r-2 border-neutral-500 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter"><rect width="20" height="16" x="2" y="4"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
        </div>
        <span class="text-xl font-bold text-neutral-100 tracking-widest uppercase">
          Temp<span class="text-neutral-500">Mail</span>
        </span>
      </div>

      <!-- Tombol Github (Dark Elegant) -->
      <div class="flex items-center gap-3">
        <a href="https://github.com" target="_blank" class="flex items-center gap-2 px-5 py-2 text-sm font-bold text-[#0a0a0a] bg-neutral-100 hover:bg-neutral-300 border border-transparent transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
          <span class="hidden sm:inline">Star us</span>
        </a>
      </div>
    </div>
  `;

  return { el };
}
