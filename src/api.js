const API_BASE = import.meta.env.VITE_API_URL || 'https://backendtemp-production.up.railway.app/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  getDomains: () => request('/domains'),

  createAddress: (username, domain) =>
    request('/address', {
      method: 'POST',
      body: JSON.stringify({ username, domain }),
    }),

  getInbox: (address, { search = '', page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    return request(`/mail/${encodeURIComponent(address)}?${params.toString()}`);
  },

  getEmail: (address, id) => request(`/mail/${encodeURIComponent(address)}/${id}`),

  deleteEmail: (address, id) =>
    request(`/mail/${encodeURIComponent(address)}/${id}`, { method: 'DELETE' }),

  clearInbox: (address) => request(`/mail/${encodeURIComponent(address)}`, { method: 'DELETE' }),
};
