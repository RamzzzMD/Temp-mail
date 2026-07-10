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
  // Background gradient modern untuk seluruh halaman
  el.className = 'min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-blue-200';

  const state = {
    domains: [],
    address: '',
    emails: [],
    total: 0,
    activeId: null,
    search: '',
  };

  const { el: headerEl } = Header();

  const sidebar = Sidebar({
    onGenerate: handleGenerate,
    onClearInbox: handleClearInbox,
  });
  // Sidebar styling disesuaikan dengan kontainer baru
  sidebar.el.classList.add('w-full', 'md:w-[350px]', 'bg-white', 'border-r', 'border-slate-100', 'z-10');

  const inbox = Inbox({
    onSelect: handleSelectEmail,
    onDelete: handleDeleteEmail,
    onSearch: handleSearch,
  });
  inbox.el.classList.add('flex-1', 'md:max-w-sm', 'border-r', 'border-slate-100', 'bg-white', 'overflow-y-auto');

  const mailView = MailView({ onDelete: handleDeleteEmail, onBack: handleBack });
  mailView.el.classList.add('flex-1', 'bg-slate-50/50', 'overflow-y-auto');

  // Wadah utama aplikasi (Sidebar + Inbox + MailView)
  const appContainer = document.createElement('div');
  appContainer.className = 'flex flex-col md:flex-row w-full h-[600px] bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden ring-1 ring-slate-900/5';
  
  const main = document.createElement('main');
  main.className = 'flex-1 flex flex-col md:flex-row relative overflow-hidden';
  main.dataset.view = 'list';
  main.append(inbox.el, mailView.el);

  appContainer.append(sidebar.el, main);

  // MEMBUAT STRUKTUR LANDING PAGE
  const landingPage = document.createElement('div');
  landingPage.className = 'flex-1 flex flex-col relative';

  // Dekorasi Latar Belakang (Glow effect)
  const bgGlow = document.createElement('div');
  bgGlow.className = 'absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-500/10 blur-[100px] -z-10 pointer-events-none rounded-full';
  landingPage.appendChild(bgGlow);

  landingPage.innerHTML = `
    <!-- Bagian Hero (Judul Web) -->
    <section class="max-w-5xl mx-auto px-4 pt-16 pb-8 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6">
        <span class="relative flex h-2 w-2"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
        Layanan Aktif 100%
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
        Lindungi Privasimu dengan <br class="hidden md:block" /> <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Email Sementara</span>
      </h1>
      <p class="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
        Lupakan spam, iklan promosi, dan peretasan data. Dapatkan alamat email sementara yang aman, gratis, dan langsung bisa digunakan tanpa pendaftaran.
      </p>
    </section>
  `;

  // Bungkus container aplikasi agar rapi di tengah
  const appWrapper = document.createElement('section');
  appWrapper.className = 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-20';
  appWrapper.appendChild(appContainer);
  landingPage.appendChild(appWrapper);

  // Bagian Fitur / SEO Text di Bawah
  const featuresSection = document.createElement('section');
  featuresSection.className = 'bg-white border-t border-slate-200 py-16';
  featuresSection.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg></div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">Aman & Privat</h3>
          <p class="text-slate-500 font-medium leading-relaxed">Kami tidak melacak IP Anda. Semua pesan yang masuk akan dihapus secara otomatis dan permanen dari server kami.</p>
        </div>
        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100">
          <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg></div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">Instan & Cepat</h3>
          <p class="text-slate-500 font-medium leading-relaxed">Tidak perlu mengisi formulir panjang. Alamat email langsung siap dipakai dengan kecepatan terima pesan hitungan detik.</p>
        </div>
        <div class="p-6 rounded-2xl bg-slate-50 border border-slate-100">
          <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">Desain Responsif</h3>
          <p class="text-slate-500 font-medium leading-relaxed">Akses kotak masuk Anda dari PC, tablet, maupun smartphone dengan antarmuka yang sangat intuitif dan elegan.</p>
        </div>
      </div>
    </div>
  `;
  landingPage.appendChild(featuresSection);

  // Footer Sederhana
  const footer = document.createElement('footer');
  footer.className = 'bg-slate-900 text-slate-400 py-8 text-center text-sm font-medium';
  footer.innerHTML = `&copy; 2024 TempMail Pro. All rights reserved. <br/> Built with speed and privacy in mind.`;
  landingPage.appendChild(footer);

  el.append(headerEl, landingPage);

  init();

  async function init() {
    try {
      const { domains } = await api.getDomains();
      state.domains = domains;
      sidebar.update({ domains, domain: domains[0] });

      const saved = storage.getAddress();
      const savedDomain = saved?.split('@')[1];
      if (saved && domains.includes(savedDomain)) {
        setAddress(saved);
      } else {
        await handleGenerate({});
      }
    } catch (err) {
      showToast(err.message || 'Gagal menghubungi server.', { type: 'error' });
    }
  }

  async function handleGenerate({ username, domain } = {}) {
    try {
      const { address } = await api.createAddress(username, domain || state.domains[0]);
      setAddress(address);
      showToast('Email baru berhasil dibuat!', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Gagal membuat alamat email.', { type: 'error' });
    }
  }

  function setAddress(address) {
    state.address = address;
    state.activeId = null;
    main.dataset.view = 'list';
    storage.setAddress(address);
    sidebar.update({ address, domain: address.split('@')[1] });
    mailView.update({ email: null });
    watchAddress(address, handleIncomingMail);
    loadInbox();
  }

  async function loadInbox() {
    inbox.update({ loading: true });
    try {
      const { emails, total } = await api.getInbox(state.address, { search: state.search });
      state.emails = emails;
      state.total = total;
      inbox.update({ emails, total, activeId: state.activeId, hasSearch: !!state.search });
    } catch (err) {
      showToast(err.message || 'Gagal memuat kotak masuk.', { type: 'error' });
      inbox.update({ emails: [], total: 0, hasSearch: !!state.search });
    }
  }

  function handleIncomingMail(email) {
    state.emails = [email, ...state.emails];
    state.total += 1;
    inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId, hasSearch: !!state.search });
    showToast(`Pesan baru dari ${email.fromName || email.from}`, { type: 'success' });
  }

  async function handleSelectEmail(id) {
    state.activeId = id;
    main.dataset.view = 'detail';
    inbox.update({ emails: state.emails, total: state.total, activeId: id, hasSearch: !!state.search });
    mailView.update({ loading: true });
    try {
      const { email } = await api.getEmail(state.address, id);
      mailView.update({ email });
      state.emails = state.emails.map((m) => (m._id === id ? { ...m, read: true } : m));
      inbox.update({ emails: state.emails, total: state.total, activeId: id, hasSearch: !!state.search });
    } catch (err) {
      showToast(err.message || 'Gagal membuka pesan.', { type: 'error' });
    }
  }

  function handleBack() {
    main.dataset.view = 'list';
  }

  async function handleDeleteEmail(id) {
    try {
      await api.deleteEmail(state.address, id);
      state.emails = state.emails.filter((m) => m._id !== id);
      state.total = Math.max(0, state.total - 1);
      if (state.activeId === id) {
        state.activeId = null;
        mailView.update({ email: null });
        main.dataset.view = 'list';
      }
      inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId, hasSearch: !!state.search });
      showToast('Pesan dihapus', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Gagal menghapus pesan.', { type: 'error' });
    }
  }

  async function handleClearInbox() {
    if (!state.emails.length) return;
    try {
      await api.clearInbox(state.address);
      state.emails = [];
      state.total = 0;
      state.activeId = null;
      inbox.update({ emails: [], total: 0, activeId: null, hasSearch: !!state.search });
      mailView.update({ email: null });
      main.dataset.view = 'list';
      showToast('Seluruh pesan dihapus', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Gagal membersihkan kotak masuk.', { type: 'error' });
    }
  }

  function handleSearch(value) {
    state.search = value.trim();
    loadInbox();
  }

  return { el };
}
