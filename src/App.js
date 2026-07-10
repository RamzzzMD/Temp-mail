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
  // Latar belakang hitam pekat dengan pola tekstur grid kotak-kotak (Minecraft Obsidian vibe)
  el.className = 'min-h-screen bg-[#050505] text-neutral-200 font-sans flex flex-col selection:bg-neutral-700 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]';

  const state = { domains: [], address: '', emails: [], total: 0, activeId: null, search: '' };

  const { el: headerEl } = Header();
  const sidebar = Sidebar({ onGenerate: handleGenerate, onClearInbox: handleClearInbox });
  const inbox = Inbox({ onSelect: handleSelectEmail, onDelete: handleDeleteEmail, onSearch: handleSearch });
  const mailView = MailView({ onDelete: handleDeleteEmail, onBack: handleBack });

  // Sudut kotak tegas (rounded-none), warna hitam elegan
  sidebar.el.className = 'w-full md:w-[350px] bg-[#0a0a0a] border-r border-neutral-800 z-10 p-5 md:p-6 overflow-y-auto flex flex-col gap-8';
  inbox.el.className = 'flex-1 md:max-w-sm border-r border-neutral-800 bg-[#0a0a0a] flex flex-col relative';
  mailView.el.className = 'flex-1 bg-[#050505] flex flex-col relative';

  const appContainer = document.createElement('div');
  appContainer.className = 'flex flex-col md:flex-row w-full h-[650px] bg-[#0a0a0a] border border-neutral-800 shadow-2xl overflow-hidden';
  
  const main = document.createElement('main');
  main.className = 'flex-1 flex flex-col md:flex-row relative overflow-hidden';
  main.dataset.view = 'list';
  main.append(inbox.el, mailView.el);

  appContainer.append(sidebar.el, main);

  const landingPage = document.createElement('div');
  landingPage.className = 'flex-1 flex flex-col relative';
  
  landingPage.innerHTML = `
    <section class="max-w-5xl mx-auto px-4 pt-20 pb-12 text-center">
      <div class="inline-flex items-center gap-2 px-4 py-1 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono mb-6 uppercase tracking-widest">
        <span class="w-2 h-2 bg-emerald-500 animate-pulse"></span> SYSTEM SECURE
      </div>
      <h1 class="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 uppercase" style="font-family: monospace;">
        ANONYMOUS <br/> <span class="text-neutral-500">TERMINAL</span>
      </h1>
      <p class="text-neutral-400 max-w-2xl mx-auto font-mono text-sm uppercase tracking-wide">
        Disposable mailbox infrastructure. Drop trackers, bypass spam, and protect your primary identity.
      </p>
    </section>
  `;

  const appWrapper = document.createElement('section');
  appWrapper.className = 'max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-20';
  appWrapper.appendChild(appContainer);
  landingPage.appendChild(appWrapper);

  el.append(headerEl, landingPage);
  init();

  // (Fungsi-fungsi JavaScript bawahnya TETAP SAMA PERSIS seperti sebelumnya)
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
