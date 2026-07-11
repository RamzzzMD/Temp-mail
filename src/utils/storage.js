const KEY_ADDRESS = 'tempmail_current_address';
const KEY_HISTORY = 'tempmail_address_history';

export const storage = {
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
      // Hapus alamat jika sudah ada di dalam daftar agar tidak duplikat
      history = history.filter((item) => item !== address);
      // Masukkan alamat baru ke urutan paling atas
      history.unshift(address);
      // Batasi riwayat maksimal 10 email terakhir
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
