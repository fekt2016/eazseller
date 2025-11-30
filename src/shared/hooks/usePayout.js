import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import payoutApi from '../services/payoutApi';
import { toast } from 'react-toastify';

/**
 * Get seller balance (including withdrawable balance)
 */
export const useGetPayoutBalance = () => {
  return useQuery({
    queryKey: ['payoutBalance'],
    queryFn: async () => {
      const response = await payoutApi.getBalance();
      console.log('[useGetPayoutBalance] Raw response:', response);
      
      // Handle different response structures
      // Axios response structure: { data: { status: 'success', data: { balance, withdrawableBalance, ... } } }
      // Backend returns: { status: 'success', data: { balance, withdrawableBalance, ... } }
      // So response.data = { status: 'success', data: { balance, ... } }
      // And response.data.data = { balance, withdrawableBalance, ... }
      const balanceData = response?.data?.data || response?.data || response;
      console.log('[useGetPayoutBalance] Parsed balance data:', balanceData);
      
      return balanceData;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

/**
 * Get seller's withdrawal requests
 */
export const useGetWithdrawalRequests = (params = {}) => {
  return useQuery({
    queryKey: ['withdrawalRequests', params],
    queryFn: async () => {
      const response = await payoutApi.getWithdrawalRequests(params);
      
      // Backend returns: { status: 'success', data: { withdrawalRequests: [...] }, results, total, ... }
      // API service already extracts response.data, so response is: { status, data: { withdrawalRequests }, ... }
      if (response?.data?.withdrawalRequests) {
        return response.data;
      }
      // Fallback: if withdrawalRequests is at root level (shouldn't happen but just in case)
      if (response?.withdrawalRequests) {
        return { withdrawalRequests: response.withdrawalRequests };
      }
      // Default fallback - return empty array
      console.warn('[useGetWithdrawalRequests] Unexpected response structure:', response);
      return { withdrawalRequests: [] };
    },
    staleTime: 1000 * 30, // 30 seconds (reduced for faster updates)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

/**
 * Create withdrawal request mutation
 */
export const useCreateWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await payoutApi.createWithdrawalRequest(data);
    },
    onSuccess: (data) => {
      toast.success('Withdrawal request created successfully');
      console.log('[useCreateWithdrawalRequest] Success, created request:', data);
      
      // Invalidate all queries that start with these keys (matches any params)
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      
      // Force immediate refetch to ensure UI updates instantly
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: ['withdrawalRequests'],
        type: 'active'
      });
    },
    onError: (error) => {
      console.error('[useCreateWithdrawalRequest] Error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create withdrawal request';
      toast.error(message);
    },
  });
};

/**
 * Cancel withdrawal request mutation
 */
export const useCancelWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId) => {
      return await payoutApi.cancelWithdrawalRequest(requestId);
    },
    onSuccess: () => {
      toast.success('Withdrawal request cancelled successfully');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      
      // Force immediate refetch to update UI instantly
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: ['withdrawalRequests'],
        type: 'active'
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel withdrawal request';
      toast.error(message);
    },
  });
};

/**
 * Delete withdrawal request mutation
 */
export const useDeleteWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId) => {
      return await payoutApi.deleteWithdrawalRequest(requestId);
    },
    onSuccess: () => {
      toast.success('Withdrawal request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete withdrawal request';
      toast.error(message);
    },
  });
};

/**
 * Submit PIN for withdrawal request mutation (mobile money transfers)
 */
export const useSubmitPinForWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, pin }) => {
      return await payoutApi.submitPinForWithdrawal(requestId, pin);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'PIN submitted successfully');
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      
      // Force immediate refetch to update UI instantly
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
      queryClient.refetchQueries({ 
        queryKey: ['withdrawalRequests'],
        type: 'active'
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to submit PIN';
      toast.error(message);
    },
  });
};

