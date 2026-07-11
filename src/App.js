import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { Inbox } from './components/Inbox.js';
import { MailView } from './components/MailView.js';
import { showToast } from './components/Toast.js';
import { api } from './api.js';
import { watchAddress } from './socket.js';
import { storage } from './utils/storage.js';

export function App() {
  const el = document.createElement('div');
  el.className = 'relative z-20 w-full min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300';

  const state = { domains: [], address: '', emails: [], total: 0, activeId: null, search: '' };

  const { el: headerEl } = Header();
  
  const sidebar = Sidebar({ 
    onGenerate: handleGenerate, 
    onClearInbox: handleClearInbox,
    onSelectHistory: handleSelectHistory,
    onDeleteHistory: handleDeleteHistory
  });
  
  const inbox = Inbox({ onSelect: handleSelectEmail, onDelete: handleDeleteEmail, onSearch: handleSearch });
  const mailView = MailView({ onDelete: handleDeleteEmail, onBack: handleBack });

  sidebar.el.className = 'w-full lg:w-[340px] xl:w-[360px] shrink-0 bg-white dark:bg-[#0f0f11] border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-neutral-800 z-10 p-4 lg:p-5 overflow-y-auto flex flex-col gap-5 transition-colors duration-300';
  
  const appContainer = document.createElement('div');
  appContainer.className = 'flex flex-col lg:flex-row w-full h-auto lg:h-[80vh] lg:min-h-[700px] bg-white dark:bg-[#0f0f11] rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-neutral-800 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 transition-colors duration-300';
  
  const main = document.createElement('main');
  main.className = 'flex-1 w-full h-[650px] lg:h-auto flex flex-row relative overflow-hidden';
  main.append(inbox.el, mailView.el);

  appContainer.append(sidebar.el, main);

  function updateMobileView() {
    if (state.activeId) {
      inbox.el.className = 'hidden lg:flex w-full lg:w-[320px] xl:w-[380px] shrink-0 lg:border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f11] flex-col relative transition-colors duration-300';
      mailView.el.className = 'flex flex-1 w-full bg-slate-50 dark:bg-[#0a0a0a] flex-col relative transition-colors duration-300 overflow-hidden';
    } else {
      inbox.el.className = 'flex w-full lg:w-[320px] xl:w-[380px] shrink-0 lg:border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f11] flex-col relative transition-colors duration-300';
      mailView.el.className = 'hidden lg:flex flex-1 w-full bg-slate-50 dark:bg-[#0a0a0a] flex-col relative transition-colors duration-300 overflow-hidden';
    }
  }

  const landingPage = document.createElement('div');
  landingPage.className = 'flex-1 flex flex-col relative w-full items-center';
  
  landingPage.innerHTML = `
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[350px] bg-blue-500/10 dark:bg-blue-600/15 blur-[100px] -z-10 pointer-events-none rounded-full"></div>

    <section class="w-full max-w-5xl mx-auto px-4 pt-12 md:pt-20 pb-10 md:pb-14 text-center z-10">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 text-xs md:text-sm font-bold mb-6 md:mb-8 shadow-sm">
        <span class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>
        Sistem 100% Aktif & Aman
      </div>
      
      <h1 class="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 md:mb-6 leading-tight text-slate-900 dark:text-white">
        Email Sementara. <br/> 
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Gratis.</span>
      </h1>
      
      <p class="text-base md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium mb-8 md:mb-10 leading-relaxed">
        Hindari spam dan lindungi privasimu. Dapatkan alamat email anonim gratis yang langsung siap digunakan dalam hitungan detik.
      </p>
      
      <button id="scroll-to-app" type="button" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer">
        Buka Kotak Masuk
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 13 5 5 5-5"/><path d="M12 18V6"/></svg>
      </button>
    </section>
  `;

  const appWrapper = document.createElement('section');
  appWrapper.id = 'app-interface';
  appWrapper.className = 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-20 z-10';
  appWrapper.appendChild(appContainer);
  landingPage.appendChild(appWrapper);

  const footer = document.createElement('footer');
  footer.className = 'w-full border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] py-8 transition-colors duration-300 mt-auto z-10 relative';
  footer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="text-sm font-medium text-slate-500 dark:text-neutral-500 text-center md:text-left">
        &copy; ${new Date().getFullYear()} TempMail Pro. All rights reserved. <br class="md:hidden"/> Dibuat oleh Ranzz.
      </div>
      
      <div class="flex items-center gap-6">
        <a href="https://wa.me/6281214300828" target="_blank" title="WhatsApp Developer" class="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
        </a>
        <a href="https://t.me/cangcuthideung" target="_blank" title="Telegram Developer" class="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        </a>
        <a href="https://instagram.com/rannzxyyy_" target="_blank" title="Instagram Developer" class="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 transition-colors transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
        </a>
        <a href="https://biolink.ranzzaja.web.id" target="_blank" title="Website Developer" class="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors transform hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </a>
      </div>
    </div>
  `;
  landingPage.appendChild(footer);

  el.append(headerEl, landingPage);

  setTimeout(() => {
    landingPage.querySelector('#scroll-to-app')?.addEventListener('click', () => {
      appWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, 0);

  init();

  async function init() {
    try {
      const { domains } = await api.getDomains();
      state.domains = domains;
      
      const history = storage.getHistory();
      sidebar.update({ domains, domain: domains[0], history });
      
      const saved = storage.getAddress();
      const savedDomain = saved?.split('@')[1];
      if (saved && domains.includes(savedDomain)) {
        setAddress(saved);
      } else {
        await handleGenerate({});
      }
    } catch (err) { 
      showToast(err.message || 'Gagal terhubung ke server.', { type: 'error' }); 
    }
  }

  async function handleGenerate({ username, domain } = {}) {
    try {
      const { address } = await api.createAddress(username, domain || state.domains[0]);
      setAddress(address);
      showToast('Alamat baru berhasil dibuat!', { type: 'success' });
    } catch (err) { 
      showToast(err.message || 'Gagal membuat alamat.', { type: 'error' }); 
    }
  }

  function handleSelectHistory(address) {
    if (address === state.address) return;
    setAddress(address);
    showToast(`Beralih ke alamat ${address}`, { type: 'success' });
  }

  function handleDeleteHistory(address) {
    const updatedHistory = storage.removeHistory(address);
    sidebar.update({ history: updatedHistory });
    showToast('Alamat deleted dari riwayat', { type: 'success' });
  }

  function setAddress(address) {
    state.address = address; 
    state.activeId = null; 
    storage.setAddress(address); 
    
    sidebar.update({ 
      address, 
      domain: address.split('@')[1],
      history: storage.getHistory() 
    });
    
    mailView.update({ email: null }); 
    updateMobileView();
    watchAddress(address, handleIncomingMail); 
    loadInbox();
  }

  async function loadInbox() {
    inbox.update({ loading: true });
    try {
      const { emails, total } = await api.getInbox(state.address, { search: state.search });
      state.emails = emails; state.total = total;
      inbox.update({ emails, total, activeId: state.activeId, hasSearch: !!state.search });
    } catch (err) { 
      showToast('Gagal memuat inbox.', { type: 'error' }); 
      inbox.update({ emails: [], total: 0 }); 
    }
  }

  function handleIncomingMail(email) {
    state.emails = [email, ...state.emails]; state.total += 1;
    inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId, hasSearch: !!state.search });
    showToast(`Pesan baru dari ${email.from}`, { type: 'success' });
  }

  // DI SINI PERBAIKANNYA: Menambahkan kata kunci 'async' agar tidak Syntax Error!
  async function handleSelectEmail(id) {
    state.activeId = id; 
    updateMobileView(); 
    inbox.update({ emails: state.emails, total: state.total, activeId: id, hasSearch: !!state.search });
    mailView.update({ loading: true });
    try {
      const { email } = await api.getEmail(state.address, id);
      mailView.update({ email });
      state.emails = state.emails.map((m) => (m._id === id ? { ...m, read: true } : m));
      inbox.update({ emails: state.emails, total: state.total, activeId: id });
    } catch (err) { 
      showToast('Gagal membuka email.', { type: 'error' }); 
    }
  }

  function handleBack() { 
    state.activeId = null; 
    mailView.update({ email: null });
    updateMobileView(); 
  }

  async function handleDeleteEmail(id) {
    try {
      await api.deleteEmail(state.address, id);
      state.emails = state.emails.filter((m) => m._id !== id);
      state.total = Math.max(0, state.total - 1);
      if (state.activeId === id) {
        state.activeId = null; 
        mailView.update({ email: null }); 
        updateMobileView(); 
      }
      inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId });
      showToast('Pesan dihapus.', { type: 'success' });
    } catch (err) { 
      showToast('Gagal menghapus pesan.', { type: 'error' }); 
    }
  }

  async function handleClearInbox() {
    if (!state.emails.length) return;
    try {
      await api.clearInbox(state.address);
      state.emails = []; state.total = 0; state.activeId = null;
      inbox.update({ emails: [], total: 0 }); 
      mailView.update({ email: null }); 
      updateMobileView(); 
      showToast('Seluruh pesan dibersihkan.', { type: 'success' });
    } catch (err) { 
      showToast('Gagal membersihkan inbox.', { type: 'error' }); 
    }
  }

  function handleSearch(value) { state.search = value.trim(); loadInbox(); }

  return { el };
}
