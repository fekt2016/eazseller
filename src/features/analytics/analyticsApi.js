import api from '../../shared/services/api';

export const analyticsApi = {
  getSellerProductViews: async (sellerId) =>
    await api.get(`analytics/seller/${sellerId}/views`),
  recordProductView: async (productId) => {
    return await api.post(`/analytics/views`, { productId });
  },
};
