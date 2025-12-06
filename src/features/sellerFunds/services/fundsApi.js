import api from '../../../shared/services/api';

/**
 * Seller Funds API Service
 * Handles all API calls for seller funds and wallet management
 */
const fundsApi = {
  /**
   * Get wallet summary for the current seller
   * @returns {Promise} API response with wallet summary
   */
  getWalletSummary: async () => {
    try {
      const response = await api.get('/seller/me/balance');
      return response.data;
    } catch (error) {
      console.error('[fundsApi] Error fetching wallet summary:', error);
      throw error;
    }
  },

  /**
   * Get transactions for the seller
   * @param {Object} params - Query parameters (page, limit, type, status)
   * @returns {Promise} API response with transactions array
   */
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/seller/me/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('[fundsApi] Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Request a withdrawal
   * @param {Object} data - Withdrawal data (amount, paymentMethod, etc.)
   * @returns {Promise} API response
   */
  requestWithdrawal: async (data) => {
    try {
      const response = await api.post('/seller/withdrawals', data);
      return response.data;
    } catch (error) {
      console.error('[fundsApi] Error requesting withdrawal:', error);
      throw error;
    }
  },

  /**
   * Delete a withdrawal request (only if not approved)
   * @param {string} withdrawalId - Withdrawal ID
   * @returns {Promise} API response
   */
  deleteWithdrawal: async (withdrawalId) => {
    try {
      const response = await api.delete(`/seller/withdrawals/${withdrawalId}`);
      return response.data;
    } catch (error) {
      console.error('[fundsApi] Error deleting withdrawal:', error);
      throw error;
    }
  },
};

export default fundsApi;

