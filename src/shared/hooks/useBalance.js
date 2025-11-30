import { useQuery } from "@tanstack/react-query";
import balanceApi from '../services/balanceApi';

export const useGetSellerBalance = () => {
  return useQuery({
    queryKey: ["sellerBalance"],
    queryFn: async () => {
      try {
        const response = await balanceApi.getBalance();
        console.log('[useGetSellerBalance] Raw response:', response);
        
        // Handle different response structures
        const balanceData = response?.data?.data || response?.data || response;
        console.log('[useGetSellerBalance] Parsed balance data:', balanceData);
        
        return balanceData;
      } catch (error) {
        console.error('[useGetSellerBalance] Error:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 1, // 1 minute - balance should update frequently
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
  });
};

export const useGetSellerTransactions = (params = {}) => {
  return useQuery({
    queryKey: ["sellerTransactions", params],
    queryFn: async () => {
      const response = await balanceApi.getTransactions(params);
      return response?.data?.data || response?.data || response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

export const useGetSellerEarnings = (params = {}) => {
  return useQuery({
    queryKey: ["sellerEarnings", params],
    queryFn: async () => {
      const response = await balanceApi.getEarnings(params);
      return response?.data?.data || response?.data || response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

export const useGetEarningsByOrder = (orderId) => {
  return useQuery({
    queryKey: ["sellerEarnings", orderId],
    queryFn: async () => {
      const response = await balanceApi.getEarningsByOrder(orderId);
      return response?.data?.data || response?.data || response;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5,
  });
};

