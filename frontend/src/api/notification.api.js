import apiClient from './client';

export const notificationApi = {
  /**
   * List my notifications
   * GET /api/notifications?page=...&size=...
   */
  getNotifications: async ({ page = 0, size = 20 } = {}) => {
    const response = await apiClient.get('/notifications', {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Mark single notification as read
   * PATCH /api/notifications/{id}/read
   */
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },
};

export default notificationApi;
