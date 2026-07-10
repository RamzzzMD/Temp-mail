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
  // Latar belakang bisa berubah dari putih bersih ke hitam elegan
  el.className = 'min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300';

  const state = { domains: [], address: '', emails: [], total: 0, activeId: null, search: '' };

  const { el: headerEl } = Header();
  const sidebar = Sidebar({ onGenerate: handleGenerate, onClearInbox: handleClearInbox });
  const inbox = Inbox({ onSelect: handleSelectEmail, onDelete: handleDeleteEmail, onSearch: handleSearch });
  const mailView = MailView({ onDelete: handleDeleteEmail, onBack: handleBack });

  // Update styling untuk mendukung Light/Dark Mode pada komponen anak
  sidebar.el.className = 'w-full md:w-[350px] bg-white dark:bg-[#0f0f11] border-r border-slate-200 dark:border-neutral-800 z-10 p-5 md:p-6 overflow-y-auto flex flex-col gap-8 transition-colors duration-300';
  inbox.el.className = 'flex-1 md:max-w-sm border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0f0f11] flex flex-col relative transition-colors duration-300';
  mailView.el.className = 'flex-1 bg-slate-50 dark:bg-[#0a0a0a] flex flex-col relative transition-colors duration-300';

  const appContainer = document.createElement('div');
  // Wadah aplikasi yang melayang dengan bayangan halus
  appContainer.className = 'flex flex-col md:flex-row w-full h-[650px] bg-white dark:bg-[#0f0f11] rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-neutral-800 overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5 transition-colors duration-300';
  
  const main = document.createElement('main');
  main.className = 'flex-1 flex flex-col md:flex-row relative overflow-hidden';
  main.dataset.view = 'list';
  main.append(inbox.el, mailView.el);

  appContainer.append(sidebar.el, main);

  const landingPage = document.createElement('div');
  landingPage.className = 'flex-1 flex flex-col relative w-full items-center';
  
  landingPage.innerHTML = `
    <!-- Latar Belakang Kotak-kotak (Grid) yang menyesuaikan tema -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] -z-10 pointer-events-none rounded-full"></div>

    <!-- Animasi Hero Section -->
    <section class="w-full max-w-5xl mx-auto px-4 pt-20 pb-16 text-center z-10">
      <div class="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 shadow-sm">
        <span class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span></span>
        Sistem 100% Aktif & Aman
      </div>
      
      <h1 class="animate-fade-up animation-delay-100 text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
        Email Sementara. <br/> 
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Desain Masa Depan.</span>
      </h1>
      
      <p class="animate-fade-up animation-delay-200 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mb-12">
        Hindari spam, jaga kotak masuk pribadimu tetap bersih. Dapatkan alamat email anonim gratis yang langsung siap digunakan.
      </p>
      
      <button id="scroll-to-app" class="animate-fade-up animation-delay-300 animate-float inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer">
        Mulai Gunakan
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m7 13 5 5 5-5"/><path d="M12 18V6"/></svg>
      </button>
    </section>
  `;

  const appWrapper = document.createElement('section');
  appWrapper.id = 'app-interface';
  appWrapper.className = 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-20 animate-fade-up animation-delay-300';
  appWrapper.appendChild(appContainer);
  landingPage.appendChild(appWrapper);

  el.append(headerEl, landingPage);

  // Tombol Scroll Lembut ke Bawah
  setTimeout(() => {
    landingPage.querySelector('#scroll-to-app')?.addEventListener('click', () => {
      appWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, 0);

  init();

  // (Fungsi-fungsi API JavaScript TETAP SAMA PERSIS)
  async function init() {
    try {
      const { domains } = await api.getDomains();
      state.domains = domains;
      sidebar.update({ domains, domain: domains[0] });
      const saved = storage.getAddress();
      const savedDomain = saved?.split('@')[1];
      if (saved && domains.includes(savedDomain)) setAddress(saved);
      else await handleGenerate({});
    } catch (err) { showToast(err.message || 'Error connecting to server.', { type: 'error' }); }
  }

  async function handleGenerate({ username, domain } = {}) {
    try {
      const { address } = await api.createAddress(username, domain || state.domains[0]);
      setAddress(address);
      showToast('Address generated.', { type: 'success' });
    } catch (err) { showToast(err.message || 'Failed to generate address.', { type: 'error' }); }
  }

  function setAddress(address) {
    state.address = address; state.activeId = null; main.dataset.view = 'list';
    storage.setAddress(address); sidebar.update({ address, domain: address.split('@')[1] });
    mailView.update({ email: null }); watchAddress(address, handleIncomingMail); loadInbox();
  }

  async function loadInbox() {
    inbox.update({ loading: true });
    try {
      const { emails, total } = await api.getInbox(state.address, { search: state.search });
      state.emails = emails; state.total = total;
      inbox.update({ emails, total, activeId: state.activeId, hasSearch: !!state.search });
    } catch (err) { showToast('Error loading inbox.', { type: 'error' }); inbox.update({ emails: [], total: 0 }); }
  }

  function handleIncomingMail(email) {
    state.emails = [email, ...state.emails]; state.total += 1;
    inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId, hasSearch: !!state.search });
    showToast(`New protocol from ${email.from}`, { type: 'success' });
  }

  async function handleSelectEmail(id) {
    state.activeId = id; main.dataset.view = 'detail';
    inbox.update({ emails: state.emails, total: state.total, activeId: id, hasSearch: !!state.search });
    mailView.update({ loading: true });
    try {
      const { email } = await api.getEmail(state.address, id);
      mailView.update({ email });
      state.emails = state.emails.map((m) => (m._id === id ? { ...m, read: true } : m));
      inbox.update({ emails: state.emails, total: state.total, activeId: id });
    } catch (err) { showToast('Error opening mail.', { type: 'error' }); }
  }

  function handleBack() { main.dataset.view = 'list'; }

  async function handleDeleteEmail(id) {
    try {
      await api.deleteEmail(state.address, id);
      state.emails = state.emails.filter((m) => m._id !== id);
      state.total = Math.max(0, state.total - 1);
      if (state.activeId === id) {
        state.activeId = null; mailView.update({ email: null }); main.dataset.view = 'list';
      }
      inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId });
      showToast('Data purged.', { type: 'success' });
    } catch (err) { showToast('Purge failed.', { type: 'error' }); }
  }

  async function handleClearInbox() {
    if (!state.emails.length) return;
    try {
      await api.clearInbox(state.address);
      state.emails = []; state.total = 0; state.activeId = null;
      inbox.update({ emails: [], total: 0 }); mailView.update({ email: null }); main.dataset.view = 'list';
      showToast('Inbox wiped.', { type: 'success' });
    } catch (err) { showToast('Wipe failed.', { type: 'error' }); }
  }

  function handleSearch(value) { state.search = value.trim(); loadInbox(); }

  return { el };
}
