import api from './api';

const balanceApi = {
  getBalance: async () => {
    const response = await api.get("/seller/me/balance");
    return response;
  },
  
  getTransactions: async (params = {}) => {
    const response = await api.get("/seller/me/transactions", { params });
    return response;
  },
  
  getEarnings: async (params = {}) => {
    const response = await api.get("/seller/me/earnings", { params });
    return response;
  },
  
  getEarningsByOrder: async (orderId) => {
    const response = await api.get(`/seller/me/earnings/order/${orderId}`);
    return response;
  },

  getBalanceHistory: async (params = {}) => {
    const response = await api.get('/seller/me/balance-history', { params });
    return response;
  },

  getTransactionById: async (transactionId) => {
    try {
      // Backend may not have a single transaction endpoint
      // For now, we'll fetch and filter on the frontend
      // If backend adds this endpoint later, update this
      const response = await api.get(`/seller/me/transactions/${transactionId}`);
      return response;
    } catch (error) {
      // If endpoint doesn't exist, return null and let hook handle it
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

export default balanceApi;

