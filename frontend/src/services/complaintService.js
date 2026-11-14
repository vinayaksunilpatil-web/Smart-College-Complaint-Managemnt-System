import api from './api';

export const complaintService = {
  // Student
  createComplaint: (formData) => api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyComplaints:  (params) => api.get('/complaints/my', { params }),
  submitFeedback:   (id, data) => api.post(`/complaints/${id}/feedback`, data),
  predictDepartment: (data) => api.post('/complaints/predict-department', data),

  // Shared
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  updateStatus:     (id, data) => api.put(`/complaints/${id}/status`, data),
  addComment:       (id, data) => api.post(`/complaints/${id}/comments`, data),

  // Staff
  getDepartmentComplaints: (params) => api.get('/staff/complaints', { params }),
  getStaffAnalytics:       () => api.get('/staff/analytics'),

  // Admin
  getAllComplaints:     (params) => api.get('/admin/complaints', { params }),
  exportComplaintsCSV: () => api.get('/admin/complaints/export', { responseType: 'blob' }),
  getDashboardOverview:() => api.get('/admin/dashboard'),
  getFullAnalytics:    () => api.get('/admin/analytics'),

  // MongoDB DB Visualization
  getDbStats:          () => api.get('/admin/db/stats'),
  browseCollection:    (name, params) => api.get(`/admin/db/collection/${name}`, { params }),
  runAggregation:      (type) => api.get(`/admin/db/aggregation/${type}`),
  getIndexes:          (collection) => api.get(`/admin/db/indexes/${collection}`),

  // User Management
  getAllUsers:   (params) => api.get('/admin/users', { params }),
  getUserStats: () => api.get('/admin/users/stats'),
  createUser:   (data)   => api.post('/admin/users', data),
  updateUser:   (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:   (id) => api.delete(`/admin/users/${id}`),
};
