import api from './api';

const paymentMethodApi = {
  // Get current user's payment methods
  getMyPaymentMethods: async () => {
    try {
      const response = await api.get('/paymentmethod/me');
      return response.data;
    } catch (error) {
      console.error('[paymentMethodApi] Error fetching payment methods:', error);
      throw error;
    }
  },

  // Create a new payment method
  createPaymentMethod: async (data) => {
    try {
      const response = await api.post('/paymentmethod', data);
      return response.data;
    } catch (error) {
      console.error('[paymentMethodApi] Error creating payment method:', error);
      throw error;
    }
  },

  // Update a payment method
  updatePaymentMethod: async (id, data) => {
    try {
      const response = await api.patch(`/paymentmethod/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('[paymentMethodApi] Error updating payment method:', error);
      throw error;
    }
  },

  // Delete a payment method
  deletePaymentMethod: async (id) => {
    try {
      const response = await api.delete(`/paymentmethod/${id}`);
      return response.data;
    } catch (error) {
      console.error('[paymentMethodApi] Error deleting payment method:', error);
      throw error;
    }
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id) => {
    try {
      const response = await api.patch(`/paymentmethod/set-Default/${id}`);
      return response.data;
    } catch (error) {
      console.error('[paymentMethodApi] Error setting default payment method:', error);
      throw error;
    }
  },
};

export default paymentMethodApi;

