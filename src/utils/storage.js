const KEY_ADDRESS = 'tempmail_current_address';
const KEY_HISTORY = 'tempmail_address_history';
const KEY_THEME = 'theme';

export const storage = {
  // --- Penambahan fungsi Theme agar tidak error 'is not a function' ---
  getTheme() {
    try {
      return localStorage.getItem(KEY_THEME) || 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme) {
    try {
      localStorage.setItem(KEY_THEME, theme);
    } catch (err) {
      console.error('Gagal menyimpan tema:', err);
    }
  },

  // --- Fungsi Address & History ---
  getAddress() {
    try {
      return localStorage.getItem(KEY_ADDRESS) || '';
    } catch {
      return '';
    }
  },

  setAddress(address) {
    if (!address) return;
    try {
      localStorage.setItem(KEY_ADDRESS, address);
      this.addHistory(address);
    } catch (err) {
      console.error('Gagal menyimpan ke storage:', err);
    }
  },

  getHistory() {
    try {
      const data = localStorage.getItem(KEY_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addHistory(address) {
    if (!address) return;
    try {
      let history = this.getHistory();
      history = history.filter((item) => item !== address);
      history.unshift(address);
      if (history.length > 10) {
        history = history.slice(0, 10);
      }
      localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
    } catch (err) {
      console.error('Gagal menyimpan riwayat:', err);
    }
  },

  removeHistory(address) {
    try {
      let history = this.getHistory();
      history = history.filter((item) => item !== address);
      localStorage.setItem(KEY_HISTORY, JSON.stringify(history));
      return history;
    } catch {
      return [];
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(KEY_HISTORY);
    } catch {}
  }
};
