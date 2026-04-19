import api from './api';

export const orderService = {
  /** Platform tax rates from admin (VAT, NHIL, GETFund) – used for product price preview */
  getTaxRates: async () => {
    const response = await api.get("/order/tax-rates");
    return response.data;
  },

  // NOTE: getAllOrders is admin-only. Sellers should use getSellersOrders instead.
  // Keeping this for backward compatibility but it will fail for sellers.
  getAllOrders: async () => {
    const response = await api.get("/order");
    return response;
  },
  getSellersOrders: async () => {
    const response = await api.get("/order/get-seller-orders");
    return response;
  },
  getSellerOrderById: async (orderId) => {
    try {
      const response = await api.get(`/order/seller-order/${orderId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrderById: async (id) => {
    try {
      const response = await api.get(`/order/get-user-order/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrders: async () => {
    try {
      const response = await api.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getOrderByTrackingNumber: async (trackingNumber) => {
    try {
      const response = await api.get(`/order/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  addTrackingUpdate: async (orderId, trackingData) => {
    try {
      const response = await api.post(`/order/${orderId}/tracking`, trackingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateSellerOrderStatus: async (orderId, status) => {
    const response = await api.post(`/order/${orderId}/status`, { status });
    return response.data;
  },
};
