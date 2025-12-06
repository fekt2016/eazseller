import api from './api';

const balanceApi = {
  getBalance: async () => {
    try {
      const response = await api.get("/seller/me/balance");
      console.log('[balanceApi] Balance response:', response);
      return response;
    } catch (error) {
      console.error('[balanceApi] Error fetching balance:', error);
      throw error;
    }
  },
  
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get("/seller/me/transactions", { params });
      return response;
    } catch (error) {
      console.error('[balanceApi] Error fetching transactions:', error);
      throw error;
    }
  },
  
  getEarnings: async (params = {}) => {
    try {
      const response = await api.get("/seller/me/earnings", { params });
      return response;
    } catch (error) {
      console.error('[balanceApi] Error fetching earnings:', error);
      throw error;
    }
  },
  
  getEarningsByOrder: async (orderId) => {
    try {
      const response = await api.get(`/seller/me/earnings/order/${orderId}`);
      return response;
    } catch (error) {
      console.error('[balanceApi] Error fetching earnings by order:', error);
      throw error;
    }
  },

  getBalanceHistory: async (params = {}) => {
    try {
      const response = await api.get('/seller/me/balance-history', { params });
      return response;
    } catch (error) {
      console.error('[balanceApi] Error fetching balance history:', error);
      throw error;
    }
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
      console.error('[balanceApi] Error fetching transaction by ID:', error);
      throw error;
    }
  },
};

export default balanceApi;

