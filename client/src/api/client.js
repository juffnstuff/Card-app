const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 30000;

async function request(path, options = {}) {
  const token = localStorage.getItem('ck_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    // Auto-logout on 401 (expired or invalid token)
    if (res.status === 401) {
      localStorage.removeItem('ck_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Contacts
  getContacts: () => request('/contacts'),
  getContact: (id) => request(`/contacts/${id}`),
  createContact: (body) => request('/contacts', { method: 'POST', body: JSON.stringify(body) }),
  updateContact: (id, body) => request(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteContact: (id) => request(`/contacts/${id}`, { method: 'DELETE' }),
  linkChild: (parentId, childId) => request(`/contacts/${parentId}/link-child`, { method: 'PUT', body: JSON.stringify({ childId }) }),
  unlinkChild: (parentId, childId) => request(`/contacts/${parentId}/unlink-child`, { method: 'PUT', body: JSON.stringify({ childId }) }),

  // Dates
  createDate: (body) => request('/dates', { method: 'POST', body: JSON.stringify(body) }),
  updateDate: (id, body) => request(`/dates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDate: (id) => request(`/dates/${id}`, { method: 'DELETE' }),

  // Cards
  searchCards: (params) => request(`/cards/search?${new URLSearchParams(params)}`),
  getRecommendations: (body) => request('/cards/recommend', { method: 'POST', body: JSON.stringify(body) }),

  // Orders
  getOrders: () => request('/orders'),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Import
  getGoogleImportUrl: () => request('/import/google/url'),
  getGoogleContacts: (code) => request(`/import/google/callback?code=${encodeURIComponent(code)}`),
  saveImportedContacts: (contacts) => request('/import/google/save', { method: 'POST', body: JSON.stringify({ contacts }) }),
  uploadCSV: async (file) => {
    const token = localStorage.getItem('ck_token');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/import/csv`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },

  // Subscription
  getSubscription: () => request('/subscription'),
  createCheckout: (interval) => request('/subscription/checkout', { method: 'POST', body: JSON.stringify({ interval }) }),
  createPortal: () => request('/subscription/portal', { method: 'POST' }),

  // Config
  getConfig: () => request('/config'),
};
