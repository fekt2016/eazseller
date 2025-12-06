import api from '../../../shared/services/api';

/**
 * Seller Returns API Service
 * Handles all API calls for seller return management
 */
const returnApi = {
  /**
   * Get all returns for the current seller
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise} API response with returns array
   */
  getSellerReturns: async (params = {}) => {
    try {
      const response = await api.get('/seller/returns', { params });
      return response.data;
    } catch (error) {
      console.error('[returnApi] Error fetching seller returns:', error);
      throw error;
    }
  },

  /**
   * Get a single return by ID
   * @param {string} returnId - Return ID
   * @returns {Promise} API response with return object
   */
  getReturnById: async (returnId) => {
    try {
      const response = await api.get(`/seller/returns/${returnId}`);
      return response.data;
    } catch (error) {
      console.error('[returnApi] Error fetching return:', error);
      throw error;
    }
  },

  /**
   * Approve a return request
   * @param {string} returnId - Return ID
   * @param {Object} data - Optional approval data (notes, etc.)
   * @returns {Promise} API response
   */
  approveReturn: async (returnId, data = {}) => {
    try {
      const response = await api.patch(`/seller/returns/${returnId}/approve`, data);
      return response.data;
    } catch (error) {
      console.error('[returnApi] Error approving return:', error);
      throw error;
    }
  },

  /**
   * Reject a return request
   * @param {string} returnId - Return ID
   * @param {Object} data - Rejection data (reason, notes)
   * @returns {Promise} API response
   */
  rejectReturn: async (returnId, data = {}) => {
    try {
      const response = await api.patch(`/seller/returns/${returnId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('[returnApi] Error rejecting return:', error);
      throw error;
    }
  },
};

export default returnApi;

