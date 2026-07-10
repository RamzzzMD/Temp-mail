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
  // Menambahkan Tailwind untuk layout utama yang bersih
  el.className = 'app-shell h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden';

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
  // Memberikan gaya bayangan dan batas halus pada Sidebar
  sidebar.el.classList.add('w-full', 'md:w-80', 'bg-white', 'border-r', 'border-slate-200', 'shadow-sm', 'z-10');

  const inbox = Inbox({
    onSelect: handleSelectEmail,
    onDelete: handleDeleteEmail,
    onSearch: handleSearch,
  });
  // Mempercantik area daftar email masuk
  inbox.el.classList.add('flex-1', 'md:max-w-md', 'border-r', 'border-slate-200', 'bg-white', 'overflow-y-auto');

  const mailView = MailView({ onDelete: handleDeleteEmail, onBack: handleBack });
  // Mempercantik area baca email
  mailView.el.classList.add('flex-1', 'bg-slate-50', 'overflow-y-auto');

  const main = document.createElement('main');
  // Memastikan Inbox dan MailView bersebelahan di desktop, dan bertumpuk di HP
  main.className = 'app-main flex-1 flex flex-col md:flex-row overflow-hidden relative w-full';
  main.dataset.view = 'list';
  main.append(inbox.el, mailView.el);

  const layout = document.createElement('div');
  // Bungkus utama di bawah Header
  layout.className = 'app-layout flex-1 flex flex-col md:flex-row overflow-hidden';
  layout.append(sidebar.el, main);

  el.append(headerEl, layout);

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
      showToast(err.message || 'Gagal menghubungi server. Periksa VITE_API_URL.', { type: 'error' });
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
      showToast(err.message || 'Gagal membuka email.', { type: 'error' });
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
      showToast('Email dihapus', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Gagal menghapus email.', { type: 'error' });
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
      showToast('Kotak masuk dibersihkan', { type: 'success' });
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
