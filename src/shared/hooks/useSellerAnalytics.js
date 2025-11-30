import { useQuery } from '@tanstack/react-query';
import sellerAnalyticsApi from '../services/sellerAnalyticsApi';

/**
 * Get Seller KPI Cards
 */
export const useSellerKPICards = () => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'kpi'],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getKPICards();
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Revenue Analytics
 */
export const useSellerRevenueAnalytics = (range = 30) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'revenue', range],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getRevenueAnalytics(range);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Order Status Analytics
 */
export const useSellerOrderStatusAnalytics = () => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'orders', 'status'],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getOrderStatusAnalytics();
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Top Products
 */
export const useSellerTopProducts = (limit = 10) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'products', 'top', limit],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getTopProducts(limit);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Traffic Analytics
 */
export const useSellerTrafficAnalytics = (range = 30) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'traffic', range],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getTrafficAnalytics(range);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Payout Analytics
 */
export const useSellerPayoutAnalytics = (range = 30) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'payouts', range],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getPayoutAnalytics(range);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Tax Analytics
 */
export const useSellerTaxAnalytics = (range = 30) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'tax', range],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getTaxAnalytics(range);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Inventory Analytics
 */
export const useSellerInventoryAnalytics = () => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'inventory'],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getInventoryAnalytics();
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Refund Analytics
 */
export const useSellerRefundAnalytics = (range = 30) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'refunds', range],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getRefundAnalytics(range);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

/**
 * Get Seller Performance Score
 */
export const useSellerPerformanceScore = (range = 30) => {
  return useQuery({
    queryKey: ['sellerAnalytics', 'performance', range],
    queryFn: async () => {
      const response = await sellerAnalyticsApi.getPerformanceScore(range);
      return response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

