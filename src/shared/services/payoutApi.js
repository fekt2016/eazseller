import api from './api';

const payoutApi = {
  // Get seller balance (includes withdrawable balance)
  getBalance: async () => {
    try {
      const response = await api.get('/seller/payout/balance');
      console.log('[payoutApi.getBalance] Full axios response:', response);
      console.log('[payoutApi.getBalance] Response data:', response.data);
      // Return the full response object (like balanceApi does) for consistency
      return response;
    } catch (error) {
      console.error('[payoutApi] Error fetching balance:', error);
      throw error;
    }
  },

  // Create withdrawal request (now uses payment-requests endpoint)
  createWithdrawalRequest: async (data) => {
    try {
      // Transform payoutMethod to paymentMethod for the new endpoint
      const requestData = {
        ...data,
        paymentMethod: data.payoutMethod || data.paymentMethod,
      };
      // Remove payoutMethod if it exists (use paymentMethod instead)
      if (requestData.payoutMethod && !requestData.paymentMethod) {
        requestData.paymentMethod = requestData.payoutMethod;
        delete requestData.payoutMethod;
      }
      const response = await api.post('/paymentrequest', requestData);
      return response.data;
    } catch (error) {
      console.error('[payoutApi] Error creating withdrawal request:', error);
      throw error;
    }
  },

  // Get seller's withdrawal requests
  getWithdrawalRequests: async (params = {}) => {
    try {
      const response = await api.get('/seller/payout/requests', { params });
      return response.data;
    } catch (error) {
      console.error('[payoutApi] Error fetching withdrawal requests:', error);
      throw error;
    }
  },

  // Cancel withdrawal request
  cancelWithdrawalRequest: async (requestId) => {
    try {
      const response = await api.patch(`/seller/payout/request/${requestId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('[payoutApi] Error cancelling withdrawal request:', error);
      throw error;
    }
  },

  // Delete withdrawal request
  deleteWithdrawalRequest: async (requestId) => {
    try {
      const response = await api.delete(`/seller/payout/request/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('[payoutApi] Error deleting withdrawal request:', error);
      throw error;
    }
  },

  // Submit PIN for withdrawal request (mobile money transfers)
  submitPinForWithdrawal: async (requestId, pin) => {
    try {
      const response = await api.post(`/seller/payout/request/${requestId}/submit-pin`, { pin });
      return response.data;
    } catch (error) {
      console.error('[payoutApi] Error submitting PIN:', error);
      throw error;
    }
  },
};

export default payoutApi;

