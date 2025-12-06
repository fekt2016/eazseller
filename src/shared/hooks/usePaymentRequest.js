import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentRequestApi from '../services/paymentRequestApi';
import { toast } from 'react-toastify';

/**
 * Get seller's payment requests
 */
export const useGetPaymentRequests = () => {
  return useQuery({
    queryKey: ['paymentRequests'],
    queryFn: async () => {
      const response = await paymentRequestApi.getSellerRequests();
      // Backend returns: { status: 'success', data: { requests: [...] }, results, ... }
      // paymentRequestApi.getSellerRequests now returns response.data directly
      if (response?.data?.requests) {
        return { paymentRequests: response.data.requests };
      }
      // Fallback: if requests is at root level
      if (response?.requests) {
        return { paymentRequests: response.requests };
      }
      // Another fallback: if response is the array directly
      if (Array.isArray(response)) {
        return { paymentRequests: response };
      }
      console.warn('[useGetPaymentRequests] Unexpected response structure:', response);
      return { paymentRequests: [] };
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

/**
 * Create payment request mutation
 */
export const useCreatePaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await paymentRequestApi.createPaymentRequest(data);
    },
    onSuccess: (data) => {
      toast.success('Payment request created successfully');
      console.log('[useCreatePaymentRequest] Success, created request:', data);
      
      // Invalidate and refetch payment requests
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      queryClient.refetchQueries({ 
        queryKey: ['paymentRequests'],
        type: 'active'
      });
      
      // CRITICAL: Invalidate and refetch balance to update available balance immediately
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
      
      // Also invalidate withdrawal requests (they use the same data)
      queryClient.invalidateQueries({ queryKey: ['withdrawalRequests'] });
      queryClient.refetchQueries({ 
        queryKey: ['withdrawalRequests'],
        type: 'active'
      });
    },
    onError: (error) => {
      console.error('[useCreatePaymentRequest] Error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create payment request';
      toast.error(message);
    },
  });
};

/**
 * Delete payment request mutation
 */
export const useDeletePaymentRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId) => {
      return await paymentRequestApi.deletePaymentRequest(requestId);
    },
    onSuccess: () => {
      toast.success('Payment request cancelled successfully. Amount refunded to your balance.');
      // Invalidate and refetch to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      queryClient.refetchQueries({ 
        queryKey: ['paymentRequests'],
        type: 'active'
      });
      // Also invalidate balance to update available balance
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete payment request';
      toast.error(message);
    },
  });
};

/**
 * Request withdrawal reversal mutation
 */
export const useRequestReversal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, reason }) => {
      return await paymentRequestApi.requestReversal(requestId, reason);
    },
    onSuccess: (data) => {
      toast.success('Withdrawal reversal requested successfully. Amount refunded to your balance.');
      // Invalidate and refetch to update UI immediately
      queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
      queryClient.refetchQueries({ 
        queryKey: ['paymentRequests'],
        type: 'active'
      });
      // Also invalidate balance to update available balance
      queryClient.invalidateQueries({ queryKey: ['payoutBalance'] });
      queryClient.refetchQueries({ 
        queryKey: ['payoutBalance'],
        type: 'active'
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to request reversal';
      toast.error(message);
    },
  });
};

