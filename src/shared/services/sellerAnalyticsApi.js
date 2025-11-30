import api from './api';

const sellerAnalyticsApi = {
  /**
   * Get Seller KPI Cards
   * GET /seller/analytics/kpi
   */
  getKPICards: async () => {
    const response = await api.get('/seller/analytics/kpi');
    return response.data;
  },

  /**
   * Get Seller Revenue Analytics
   * GET /seller/analytics/revenue?range=7|30|90|365
   */
  getRevenueAnalytics: async (range = 30) => {
    const response = await api.get('/seller/analytics/revenue', {
      params: { range },
    });
    return response.data;
  },

  /**
   * Get Seller Order Status Analytics
   * GET /seller/analytics/orders/status
   */
  getOrderStatusAnalytics: async () => {
    const response = await api.get('/seller/analytics/orders/status');
    return response.data;
  },

  /**
   * Get Seller Top Products
   * GET /seller/analytics/products/top?limit=10
   */
  getTopProducts: async (limit = 10) => {
    const response = await api.get('/seller/analytics/products/top', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get Seller Traffic Analytics
   * GET /seller/analytics/traffic?range=30
   */
  getTrafficAnalytics: async (range = 30) => {
    const response = await api.get('/seller/analytics/traffic', {
      params: { range },
    });
    return response.data;
  },

  /**
   * Get Seller Payout Analytics
   * GET /seller/analytics/payouts?range=30
   */
  getPayoutAnalytics: async (range = 30) => {
    const response = await api.get('/seller/analytics/payouts', {
      params: { range },
    });
    return response.data;
  },

  /**
   * Get Seller Tax Analytics
   * GET /seller/analytics/tax?range=30
   */
  getTaxAnalytics: async (range = 30) => {
    const response = await api.get('/seller/analytics/tax', {
      params: { range },
    });
    return response.data;
  },

  /**
   * Get Seller Inventory Analytics
   * GET /seller/analytics/inventory
   */
  getInventoryAnalytics: async () => {
    const response = await api.get('/seller/analytics/inventory');
    return response.data;
  },

  /**
   * Get Seller Refund Analytics
   * GET /seller/analytics/refunds?range=30
   */
  getRefundAnalytics: async (range = 30) => {
    const response = await api.get('/seller/analytics/refunds', {
      params: { range },
    });
    return response.data;
  },

  /**
   * Get Seller Performance Score
   * GET /seller/analytics/performance?range=30
   */
  getPerformanceScore: async (range = 30) => {
    const response = await api.get('/seller/analytics/performance', {
      params: { range },
    });
    return response.data;
  },
};

export default sellerAnalyticsApi;

