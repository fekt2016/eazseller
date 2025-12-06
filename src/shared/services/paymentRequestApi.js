import api from './api';

const paymentRequestApi = {
  // Create a new payment request
  createPaymentRequest: async (data) => {
    try {
      const response = await api.post('/paymentrequest', data);
      // Return response.data to match the structure expected by hooks
      return response.data;
    } catch (error) {
      console.error('[paymentRequestApi] Error creating payment request:', error);
      throw error;
    }
  },

  // Get all payment requests for the current seller
  getSellerRequests: async () => {
    try {
      const response = await api.get('/paymentrequest');
      // axios returns { data: {...}, status: 200, ... }
      // Backend returns: { status: 'success', data: { requests: [...] }, results, ... }
      // So we return response.data which is the backend response object
      return response.data;
    } catch (error) {
      console.error('[paymentRequestApi] Error fetching payment requests:', error);
      throw error;
    }
  },

  // Get a specific payment request by ID
  getRequestById: async (id) => {
    const response = await api.get(`/paymentrequest/${id}`);
    return response;
  },

  // Delete payment request
  deletePaymentRequest: async (requestId) => {
    try {
      const response = await api.delete(`/paymentrequest/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('[paymentRequestApi] Error deleting payment request:', error);
      throw error;
    }
  },

  // Request reversal of a withdrawal
  requestReversal: async (requestId, reason) => {
    try {
      const response = await api.post(`/seller/payout/request/${requestId}/request-reversal`, {
        reason: reason
      });
      return response.data;
    } catch (error) {
      console.error('[paymentRequestApi] Error requesting reversal:', error);
      throw error;
    }
  },
};

export default paymentRequestApi;

