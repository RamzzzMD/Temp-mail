import { formatFullTime, formatBytes } from '../utils/helpers.js';

export function MailView({ onDelete, onBack } = {}) {
  const el = document.createElement('div');
  el.className = 'flex flex-col h-full bg-white relative';

  // Area Render Konten
  const contentEl = document.createElement('div');
  contentEl.className = 'flex-1 overflow-y-auto w-full';
  
  el.appendChild(contentEl);

  let currentId = null;

  function renderEmpty() {
    return `
      <div class="flex flex-col items-center justify-center h-full text-center bg-slate-50/50">
        <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-6 text-slate-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"></path><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-slate-700 mb-2">Pilih Pesan</h3>
        <p class="text-slate-500 font-medium">Pilih salah satu email di daftar sebelah kiri untuk mulai membaca.</p>
      </div>
    `;
  }

  function renderMail(mail) {
    const fromName = mail.fromName || mail.from.split('@')[0];
    const initial = fromName.charAt(0).toUpperCase();
    const dateStr = new Date(mail.createdAt).toLocaleString();

    return `
      <!-- Header Bar Aksi -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10">
        <button type="button" class="md:hidden flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all" data-action="back">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Kembali
        </button>
        <div class="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Pesan</div>
        
        <button type="button" class="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all ml-auto" data-action="delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          <span class="hidden sm:inline">Hapus</span>
        </button>
      </div>

      <!-- Detail Pengirim & Subjek -->
      <div class="px-6 md:px-8 py-6 border-b border-slate-100 bg-white">
        <h1 class="text-2xl font-extrabold text-slate-900 mb-6 leading-tight">${mail.subject || '(Tanpa Subjek)'}</h1>
        
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/20 shrink-0">
            ${initial}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div class="font-bold text-slate-900 text-base truncate">${mail.fromName || mail.from}</div>
              <div class="text-xs font-medium text-slate-400 whitespace-nowrap">${dateStr}</div>
            </div>
            <div class="text-sm font-medium text-slate-500 truncate"><span class="text-slate-400">Dari:</span> &lt;${mail.from}&gt;</div>
          </div>
        </div>
      </div>

      <!-- Isi Pesan -->
      <div class="p-6 md:p-8 bg-slate-50 min-h-[400px]">
        <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
          ${mail.html 
            ? `<div class="prose max-w-none text-slate-800 break-words">${mail.html}</div>` 
            : `<div class="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm">${mail.text || mail.body || 'Email kosong.'}</div>`
          }
        </div>
      </div>
    `;
  }

  // Event Listener
  contentEl.addEventListener('click', (e) => {
    const btnBack = e.target.closest('[data-action="back"]');
    const btnDelete = e.target.closest('[data-action="delete"]');

    if (btnBack) onBack?.();
    if (btnDelete && currentId) onDelete?.(currentId);
  });

  return {
    el,
    update({ email, loading } = {}) {
      if (loading) {
        contentEl.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
            <svg class="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span class="text-sm font-bold animate-pulse">Memuat pesan...</span>
          </div>
        `;
        return;
      }

      if (!email) {
        currentId = null;
        contentEl.innerHTML = renderEmpty();
        return;
      }

      currentId = email._id;
      contentEl.innerHTML = renderMail(email);
    }
  };
}
