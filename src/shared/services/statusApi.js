import api from './api';

export const statusApi = {
  async getMyStatuses() {
    const response = await api.get('/seller/me/statuses');
    return response.data;
  },

  async createStatus({ file, caption, productId }) {
    const formData = new FormData();
    if (file) {
      formData.append('video', file);
    }
    if (caption) {
      formData.append('caption', caption);
    }
    if (productId) {
      formData.append('productId', productId);
    }

    const response = await api.post('/seller/statuses', formData, {
      timeout: 120000,
    });
    return response.data;
  },

  async deleteStatus(statusId) {
    const response = await api.delete(`/seller/statuses/${statusId}`);
    return response.data;
  },

  async repostStatus(statusId) {
    const response = await api.post(`/seller/statuses/${statusId}/repost`);
    return response.data;
  },
};

export default statusApi;
