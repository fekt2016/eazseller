import api from './api';

export const orderService = {
  createOrder: async (data) => {
    const response = await api.post("/order", data);
    return response;
  },
  // NOTE: getAllOrders is admin-only. Sellers should use getSellersOrders instead.
  // Keeping this for backward compatibility but it will fail for sellers.
  getAllOrders: async () => {
    console.warn('[orderApi] getAllOrders is admin-only. Sellers should use getSellersOrders instead.');
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
      console.log("API Response - getSellerOrderById:", response);
      return response;
    } catch (error) {
      console.log("API Error - getSellerOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrderById: async (id) => {
    console.log(id);
    try {
      const response = await api.get(`/order/get-user-order/${id}`);
      return response.data;
    } catch (error) {
      console.log("API Error - getUserOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrders: async () => {
    try {
      const response = await api.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      console.log("API Error - getUserOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getOrderByTrackingNumber: async (trackingNumber) => {
    try {
      const response = await api.get(`/order/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order by tracking number:", error);
      throw error;
    }
  },
  addTrackingUpdate: async (orderId, trackingData) => {
    try {
      const response = await api.post(`/order/${orderId}/tracking`, trackingData);
      return response.data;
    } catch (error) {
      console.error("Error adding tracking update:", error);
      throw error;
    }
  },
};
