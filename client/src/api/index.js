import api from './axiosInstance';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/me/password', data),
};

export const lostApi = {
  getAll: (params) => api.get('/lost', { params }),
  getMy: () => api.get('/lost/my'),
  getById: (id) => api.get(`/lost/${id}`),
  create: (data) => api.post('/lost', data),
  update: (id, data) => api.put(`/lost/${id}`, data),
  delete: (id) => api.delete(`/lost/${id}`),
  updateStatus: (id, status) => api.patch(`/lost/${id}/status`, { status }),
};

export const foundApi = {
  getAll: (params) => api.get('/found', { params }),
  getMy: () => api.get('/found/my'),
  getById: (id) => api.get(`/found/${id}`),
  create: (data) => api.post('/found', data),
  update: (id, data) => api.put(`/found/${id}`, data),
  delete: (id) => api.delete(`/found/${id}`),
  updateStatus: (id, status) => api.patch(`/found/${id}/status`, { status }),
};

export const matchApi = {
  getMyMatches: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  dismiss: (id) => api.patch(`/matches/${id}/dismiss`),
};

export const requestApi = {
  getMyRequests: () => api.get('/requests'),
  create: (data) => api.post('/requests', data),
  getById: (id) => api.get(`/requests/${id}`),
  accept: (id) => api.patch(`/requests/${id}/accept`),
  reject: (id, note) => api.patch(`/requests/${id}/reject`, { respondentNote: note }),
  resolve: (id) => api.patch(`/requests/${id}/resolve`),
  dispute: (id) => api.post(`/requests/${id}/dispute`),
};

export const messageApi = {
  getConversations: () => api.get('/messages'),
  getMessages: (requestId) => api.get(`/messages/request/${requestId}`),
  sendMessage: (requestId, content) => api.post(`/messages/request/${requestId}`, { content }),
};

export const notifApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const reportApi = {
  create: (data) => api.post('/reports', data),
  getMy: () => api.get('/reports/my'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id) => api.patch(`/admin/users/${id}/suspend`),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getLostItems: () => api.get('/admin/lost'),
  getFoundItems: () => api.get('/admin/found'),
  deleteItem: (type, id) => api.delete(`/admin/items/${type}/${id}`),
  getReports: () => api.get('/admin/reports'),
  reviewReport: (id, data) => api.patch(`/admin/reports/${id}`, data),
  getRequests: () => api.get('/admin/requests'),
};
