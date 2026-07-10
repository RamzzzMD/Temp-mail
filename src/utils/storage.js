const KEYS = {
  ADDRESS: 'tempmail:address',
  THEME: 'tempmail:theme',
};

function safeGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode, etc.) — fail silently */
  }
}

function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export const storage = {
  getAddress: () => safeGet(KEYS.ADDRESS),
  setAddress: (address) => safeSet(KEYS.ADDRESS, address),
  clearAddress: () => safeRemove(KEYS.ADDRESS),

  getTheme: () => safeGet(KEYS.THEME),
  setTheme: (theme) => safeSet(KEYS.THEME, theme),
};
