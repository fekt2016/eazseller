import api from './api';

const unwrap = (response) => response?.data?.data || response?.data || {};

const sellerPromoApi = {
  async getSellerPromos(params = {}) {
    const response = await api.get('/seller/promos/active', { params });
    return unwrap(response);
  },

  async getSellerPromo(promoId) {
    const response = await api.get(`/seller/promos/${promoId}`);
    return unwrap(response);
  },

  async getSellerPromoEligibleProducts(promoId, params = {}) {
    const response = await api.get(`/seller/promos/${promoId}/eligible-products`, {
      params,
    });
    return unwrap(response);
  },

  async submitSellerPromoProducts(promoId, payload) {
    const response = await api.post(`/seller/promos/${promoId}/submit`, payload);
    return unwrap(response);
  },

  async getMyPromoSubmissions(params = {}) {
    const response = await api.get('/seller/promos/my-submissions', { params });
    return unwrap(response);
  },

  async withdrawSubmission(submissionId) {
    const response = await api.patch(
      `/seller/promos/submissions/${submissionId}/withdraw`
    );
    return unwrap(response);
  },

  async updateSubmission(submissionId, payload) {
    const response = await api.patch(
      `/seller/promos/submissions/${submissionId}`,
      payload
    );
    return unwrap(response);
  },

  // Backward-compatible aliases for older callers.
  getPromos(params = {}) {
    return this.getSellerPromos(params);
  },
  getPromoById(promoId) {
    return this.getSellerPromo(promoId);
  },
  submitPromoProducts(promoId, payload) {
    return this.submitSellerPromoProducts(promoId, payload);
  },
  getMySubmissions(params = {}) {
    return this.getMyPromoSubmissions(params);
  },
  withdrawPromoSubmission(submissionId) {
    return this.withdrawSubmission(submissionId);
  },
  updatePromoSubmission(submissionId, payload) {
    return this.updateSubmission(submissionId, payload);
  },
};

export default sellerPromoApi;
