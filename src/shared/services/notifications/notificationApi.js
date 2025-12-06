import api from '../api';

/**
 * Notification API Service for EazSeller (Seller App)
 * All endpoints use the shared backend notification API
 */

// Get all notifications for the authenticated seller
export const getNotifications = async (params = {}) => {
  const { type, read, page = 1, limit = 50 } = params;
  const queryParams = new URLSearchParams();
  
  if (type) queryParams.append('type', type);
  if (read !== undefined) queryParams.append('read', read);
  queryParams.append('page', page);
  queryParams.append('limit', limit);

  const response = await api.get(`/notifications?${queryParams.toString()}`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    console.log('[EazSeller NotificationAPI] 🔍 Fetching unread count...');
    const response = await api.get('/notifications/unread');
    console.log('[EazSeller NotificationAPI] ✅ getUnreadCount response:', {
      fullResponse: response,
      responseData: response.data,
      unreadCount: response.data?.data?.unreadCount,
      status: response.data?.status,
    });
    return response.data;
  } catch (error) {
    // Handle network errors gracefully
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('[EazSeller NotificationAPI] ❌ Network Error - Backend server may not be running:', {
        message: error.message,
        code: error.code,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          fullURL: `${error.config?.baseURL}${error.config?.url}`,
        },
      });
      // Return a default response instead of throwing to prevent UI crashes
      return {
        status: 'error',
        data: {
          unreadCount: 0,
        },
        message: 'Unable to connect to server. Please check if the backend is running.',
      };
    }
    
    console.error('[EazSeller NotificationAPI] ❌ Error fetching unread count:', {
      error,
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
      },
    });
    throw error;
  }
};

// Get single notification by ID
export const getNotification = async (id) => {
  const response = await api.get(`/notifications/${id}`);
  return response.data;
};

// Mark a notification as read
export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/read/${id}`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

// Delete a notification
export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

