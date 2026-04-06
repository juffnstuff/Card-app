const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('ck_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
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

  // Dates
  createDate: (body) => request('/dates', { method: 'POST', body: JSON.stringify(body) }),
  updateDate: (id, body) => request(`/dates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDate: (id) => request(`/dates/${id}`, { method: 'DELETE' }),

  // Cards
  searchCards: (params) => request(`/cards/search?${new URLSearchParams(params)}`),

  // Orders
  getOrders: () => request('/orders'),
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Subscription
  getSubscription: () => request('/subscription'),
  createCheckout: (interval) => request('/subscription/checkout', { method: 'POST', body: JSON.stringify({ interval }) }),
  createPortal: () => request('/subscription/portal', { method: 'POST' }),
};
