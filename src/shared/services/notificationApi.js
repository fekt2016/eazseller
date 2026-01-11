import api from './api';

const notificationApi = {
  getSettings: async () => {
    const response = await api.get('/seller/me/notification-settings');
    return response;
  },

  updateSettings: async (settings) => {
    const response = await api.patch('/seller/me/notification-settings', {
      settings,
    });
    return response;
  },
};

export default notificationApi;

