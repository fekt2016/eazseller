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
};

export default balanceApi;

