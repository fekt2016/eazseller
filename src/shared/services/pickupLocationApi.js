import api from './api';

/**
 * Pickup Location API Service
 * Handles all API calls for seller pickup location management
 * 
 * TODO: Backend integration required
 * - Endpoint: GET /seller/me/pickup-locations
 * - Endpoint: GET /seller/me/pickup-locations/:id
 * - Endpoint: POST /seller/me/pickup-locations
 * - Endpoint: PATCH /seller/me/pickup-locations/:id
 * - Endpoint: DELETE /seller/me/pickup-locations/:id
 * - Endpoint: PATCH /seller/me/pickup-locations/:id/set-default
 */

const pickupLocationApi = {
  /**
   * Get all pickup locations for the current seller
   * @returns {Promise} API response with locations array
   */
  getLocations: async () => {
    try {
      const response = await api.get('/seller/me/pickup-locations');
      return response;
    } catch (error) {
      console.error('[pickupLocationApi] Error fetching locations:', error);
      throw error;
    }
  },

  /**
   * Get a single pickup location by ID
   * @param {string} id - Location ID
   * @returns {Promise} API response with location object
   */
  getLocationById: async (id) => {
    try {
      const response = await api.get(`/seller/me/pickup-locations/${id}`);
      return response;
    } catch (error) {
      console.error('[pickupLocationApi] Error fetching location:', error);
      throw error;
    }
  },

  /**
   * Create a new pickup location
   * @param {Object} locationData - Location data object
   * @returns {Promise} API response with created location
   */
  createLocation: async (locationData) => {
    try {
      const response = await api.post('/seller/me/pickup-locations', locationData);
      return response;
    } catch (error) {
      console.error('[pickupLocationApi] Error creating location:', error);
      throw error;
    }
  },

  /**
   * Update an existing pickup location
   * @param {string} id - Location ID
   * @param {Object} locationData - Updated location data
   * @returns {Promise} API response with updated location
   */
  updateLocation: async (id, locationData) => {
    try {
      const response = await api.patch(`/seller/me/pickup-locations/${id}`, locationData);
      return response;
    } catch (error) {
      console.error('[pickupLocationApi] Error updating location:', error);
      throw error;
    }
  },

  /**
   * Delete a pickup location
   * @param {string} id - Location ID
   * @returns {Promise} API response
   */
  deleteLocation: async (id) => {
    try {
      const response = await api.delete(`/seller/me/pickup-locations/${id}`);
      return response;
    } catch (error) {
      console.error('[pickupLocationApi] Error deleting location:', error);
      throw error;
    }
  },

  /**
   * Set a location as the default pickup location
   * @param {string} id - Location ID
   * @returns {Promise} API response
   */
  setDefaultLocation: async (id) => {
    try {
      const response = await api.patch(`/seller/me/pickup-locations/${id}/set-default`);
      return response;
    } catch (error) {
      console.error('[pickupLocationApi] Error setting default location:', error);
      throw error;
    }
  },
};

export default pickupLocationApi;

