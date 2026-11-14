import api from './api';

export const metaService = {
  getDepartments: () => api.get('/meta/departments'),
  getCategories: () => api.get('/meta/categories'),
  getStaffList: () => api.get('/meta/staff'),

  // Admin Department Management
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  addCategoryToDepartment: (id, data) => api.post(`/admin/departments/${id}/categories`, data),
};
