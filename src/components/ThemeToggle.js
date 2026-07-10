export function ThemeToggle() {
  const el = document.createElement('button');
  el.className = 'p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95';
  el.title = 'Ganti Tema';

  const updateIcon = (isDark) => {
    el.innerHTML = isDark
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>` // Bulan (Dark)
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path></svg>`; // Matahari (Light)
  };

  const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (isDark) document.documentElement.classList.add('dark');
  updateIcon(isDark);

  el.addEventListener('click', () => {
    document.documentElement.classList.add('transition-theme');
    document.documentElement.classList.toggle('dark');
    const currentDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', currentDark ? 'dark' : 'light');
    updateIcon(currentDark);
    
    // Hapus class transisi setelah selesai agar tidak bentrok dengan efek lain
    setTimeout(() => document.documentElement.classList.remove('transition-theme'), 300);
  });

  return { el };
}
