export function Header() {
  const el = document.createElement('header');
  el.className = 'w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50';

  el.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      
      <!-- Logo & Nama -->
      <div class="flex items-center gap-2.5 cursor-pointer">
        <div class="bg-blue-600 p-2 rounded-xl shadow-sm shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
        </div>
        <span class="text-xl font-extrabold text-slate-800 tracking-tight">
          TempMail<span class="text-blue-600">Pro</span>
        </span>
      </div>

      <!-- Menu Navigasi Desktop -->
      <nav class="hidden md:flex items-center gap-8">
        <a href="#fitur" class="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Fitur</a>
        <a href="#premium" class="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">Premium</a>
        <a href="#faq" class="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">FAQ</a>
      </nav>

      <!-- Tombol Aksi Kanan -->
      <div class="flex items-center gap-3">
        <button class="hidden md:block px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Log in</button>
        <a href="https://github.com" target="_blank" class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-md transition-all active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
          <span class="hidden sm:inline">Star us</span>
        </a>
      </div>
    </div>
  `;

  return { el };
}
