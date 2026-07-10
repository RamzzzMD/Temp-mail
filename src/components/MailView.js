import { formatFullTime, formatBytes } from '../utils/helpers.js';

export function MailView({ onDelete, onBack } = {}) {
  const el = document.createElement('div');
  // Styling parent dari App.js
  
  const contentEl = document.createElement('div');
  contentEl.className = 'flex-1 overflow-y-auto w-full relative';
  el.appendChild(contentEl);

  let currentId = null;

  function renderEmpty() {
    return `
      <div class="flex flex-col items-center justify-center h-full text-center bg-[#050505]">
        <div class="w-16 h-16 border border-neutral-800 flex items-center justify-center text-neutral-700 mb-4 bg-neutral-900">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"></path></svg>
        </div>
        <p class="text-neutral-600 font-mono text-xs uppercase tracking-widest">Select file to read</p>
      </div>
    `;
  }

  function renderMail(mail) {
    const fromName = mail.fromName || mail.from.split('@')[0];
    const dateStr = new Date(mail.createdAt).toLocaleString();

    return `
      <!-- Header Bar -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-[#0a0a0a] sticky top-0 z-20">
        <button type="button" class="md:hidden flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-neutral-100 transition-none uppercase" id="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="m15 18-6-6 6-6"/></svg> Back
        </button>
        <div class="hidden md:block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">READING_MODE</div>
        
        <!-- Tombol Hapus Diperbaiki -->
        <button type="button" class="flex items-center gap-2 text-[10px] font-mono font-bold text-red-500 hover:bg-red-950 border border-red-900 px-3 py-1.5 transition-none ml-auto" id="btn-delete">
          [ PURGE ]
        </button>
      </div>

      <!-- Detail Info -->
      <div class="px-6 md:px-8 py-6 border-b border-neutral-800 bg-[#0a0a0a]">
        <h1 class="text-xl font-bold font-mono text-neutral-100 mb-4 uppercase">${mail.subject || 'UNTITLED_FILE'}</h1>
        
        <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
          <div class="font-mono font-bold text-neutral-300 text-sm truncate">${fromName}</div>
          <div class="text-[10px] font-mono text-neutral-600">${dateStr}</div>
        </div>
        <div class="text-xs font-mono text-neutral-500 truncate"><span class="text-neutral-600">SRC:</span> &lt;${mail.from}&gt;</div>
      </div>

      <!-- Isi Email dengan Perbaikan Warna Link (Biru Terang + Garis Bawah) -->
      <div class="p-6 md:p-8 bg-[#050505] min-h-[400px]">
        <!-- Kelas Tailwnind yang mengubah semua elemen <a> menjadi biru ditambahkan di parent div ini -->
        <div class="bg-[#0a0a0a] p-6 border border-neutral-800 font-mono text-sm text-neutral-300 break-words leading-relaxed [&_a]:text-[#3b82f6] [&_a]:underline hover:[&_a]:text-[#60a5fa] [&_a]:transition-colors">
          ${mail.html 
            ? mail.html 
            : `<div class="whitespace-pre-wrap">${mail.text || mail.body || 'NO_CONTENT'}</div>`
          }
        </div>
      </div>
    `;
  }

  // Menggunakan event delegation di level parent untuk menjamin klik tidak terlewat
  el.addEventListener('click', (e) => {
    // Tombol Back
    if (e.target.closest('#btn-back')) {
      e.preventDefault();
      onBack?.();
    }
    // Tombol Delete
    if (e.target.closest('#btn-delete')) {
      e.preventDefault();
      if (currentId) {
        onDelete?.(currentId);
      }
    }
  });

  return {
    el,
    update({ email, loading } = {}) {
      if (loading) {
        contentEl.innerHTML = `<div class="flex justify-center items-center h-full text-neutral-500 font-mono text-xs uppercase animate-pulse">Decrypting...</div>`;
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
