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
  el.className = 'app-shell';

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

  const inbox = Inbox({
    onSelect: handleSelectEmail,
    onDelete: handleDeleteEmail,
    onSearch: handleSearch,
  });

  const mailView = MailView({ onDelete: handleDeleteEmail, onBack: handleBack });

  const main = document.createElement('main');
  main.className = 'app-main';
  main.dataset.view = 'list';
  main.append(inbox.el, mailView.el);

  const layout = document.createElement('div');
  layout.className = 'app-layout';
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
      showToast(err.message || 'Could not reach the server. Check VITE_API_URL.', { type: 'error' });
    }
  }

  async function handleGenerate({ username, domain } = {}) {
    try {
      const { address } = await api.createAddress(username, domain || state.domains[0]);
      setAddress(address);
      showToast('New frequency generated', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Could not generate address.', { type: 'error' });
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
      showToast(err.message || 'Could not load inbox.', { type: 'error' });
      inbox.update({ emails: [], total: 0, hasSearch: !!state.search });
    }
  }

  function handleIncomingMail(email) {
    state.emails = [email, ...state.emails];
    state.total += 1;
    inbox.update({ emails: state.emails, total: state.total, activeId: state.activeId, hasSearch: !!state.search });
    showToast(`New mail from ${email.fromName || email.from}`, { type: 'mail' });
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
      showToast(err.message || 'Could not open email.', { type: 'error' });
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
      showToast('Email deleted', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Could not delete email.', { type: 'error' });
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
      showToast('Inbox cleared', { type: 'success' });
    } catch (err) {
      showToast(err.message || 'Could not clear inbox.', { type: 'error' });
    }
  }

  function handleSearch(value) {
    state.search = value.trim();
    loadInbox();
  }

  return { el };
}
