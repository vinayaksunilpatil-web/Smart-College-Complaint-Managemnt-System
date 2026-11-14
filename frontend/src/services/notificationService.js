import api from './api';

export const notificationService = {
  getNotifications:  (params) => api.get('/notifications', { params }),
  markAsRead:        (notification_ids) => api.put('/notifications/read', { notification_ids }),
  markAllRead:       () => api.put('/notifications/read', {}),
  deleteNotification:(id) => api.delete(`/notifications/${id}`)
};
