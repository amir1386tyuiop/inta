const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || data.errors?.[0]?.msg || 'خطایی رخ داده');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth
export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/me', { method: 'PUT', body: JSON.stringify(body) }),
};

// AI
export const ai = {
  chat: (body) => request('/ai/chat', { method: 'POST', body: JSON.stringify(body) }),
  sessions: () => request('/ai/sessions'),
  sessionMessages: (id) => request(`/ai/sessions/${id}`),
  search: (body) => request('/ai/search', { method: 'POST', body: JSON.stringify(body) }),
};

// Blog
export const blog = {
  list: (params = '') => request(`/blog${params ? '?' + params : ''}`),
  get: (slug) => request(`/blog/${slug}`),
  create: (body) => request('/blog', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/blog/${id}`, { method: 'DELETE' }),
};

// Contact
export const contact = {
  submit: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
  list: (params = '') => request(`/contact${params ? '?' + params : ''}`),
  reply: (id, body) => request(`/contact/${id}/reply`, { method: 'POST', body: JSON.stringify(body) }),
};

// Lawyers
export const lawyers = {
  search: (params = '') => request(`/lawyers${params ? '?' + params : ''}`),
  get: (id) => request(`/lawyers/${id}`),
  createProfile: (body) => request('/lawyers/profile', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/lawyers/profile', { method: 'PUT', body: JSON.stringify(body) }),
};

// Cases
export const cases = {
  list: (params = '') => request(`/cases${params ? '?' + params : ''}`),
  get: (id) => request(`/cases/${id}`),
  create: (body) => request('/cases', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  analyze: (id, body = {}) => request(`/cases/${id}/analyze`, { method: 'POST', body: JSON.stringify(body) }),
  summarize: (id) => request(`/cases/${id}/summarize`, { method: 'POST', body: JSON.stringify({}) }),
  assignLawyer: (id, lawyerId) => request(`/cases/${id}/assign-lawyer`, { method: 'PATCH', body: JSON.stringify({ lawyerId }) }),
};

// Verdicts
export const verdicts = {
  listByCase: (caseId) => request(`/verdicts/case/${caseId}`),
  get: (id) => request(`/verdicts/${id}`),
  create: (body) => request('/verdicts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/verdicts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  analyze: (id) => request(`/verdicts/${id}/analyze`, { method: 'POST', body: JSON.stringify({}) }),
};

// Documents
export const documents = {
  upload: (formData) => request('/documents/upload', { method: 'POST', body: formData }),
  listByCase: (caseId) => request(`/documents/case/${caseId}`),
  get: (id) => request(`/documents/${id}`),
  analyze: (id, body = {}) => request(`/documents/${id}/analyze`, { method: 'POST', body: JSON.stringify(body) }),
  remove: (id) => request(`/documents/${id}`, { method: 'DELETE' }),
};

// Calendar
export const calendar = {
  list: (params = '') => request(`/calendar${params ? '?' + params : ''}`),
  today: () => request('/calendar/today'),
  range: (from, to) => request(`/calendar/range?from=${from}&to=${to}`),
  get: (id) => request(`/calendar/${id}`),
  create: (body) => request('/calendar', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`/calendar/${id}`, { method: 'DELETE' }),
};

// Notifications
export const notifications = {
  list: (params = '') => request(`/notifications${params ? '?' + params : ''}`),
  unreadCount: () => request('/notifications/unread-count'),
  get: (id) => request(`/notifications/${id}`),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
};

// Search
export const search = {
  global: (q, type = '') => request(`/search?q=${encodeURIComponent(q)}${type ? '&type=' + type : ''}`),
};
