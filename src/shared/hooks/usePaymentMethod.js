import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentMethodApi from '../services/paymentMethodApi';
import { toast } from 'react-toastify';

/**
 * Get current user's payment methods from PaymentMethod model
 */
export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      try {
        const response = await paymentMethodApi.getMyPaymentMethods();
        return response?.data?.paymentMethods || [];
      } catch (error) {
        // If 404 or no payment methods, return empty array (not an error)
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (no payment methods found)
      if (error.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

/**
 * Create payment method mutation
 */
export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentMethodApi.createPaymentMethod,
    onSuccess: () => {
      toast.success('Payment method added successfully');
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      // ✅ CRITICAL: Invalidate sellerStatus after payment method update
      queryClient.invalidateQueries({ queryKey: ['sellerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to add payment method';
      toast.error(message);
    },
  });
};

/**
 * Update payment method mutation
 */
export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => paymentMethodApi.updatePaymentMethod(id, data),
    onSuccess: () => {
      toast.success('Payment method updated successfully');
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      // ✅ CRITICAL: Invalidate sellerStatus after payment method update
      queryClient.invalidateQueries({ queryKey: ['sellerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to update payment method';
      toast.error(message);
    },
  });
};

/**
 * Delete payment method mutation
 */
export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentMethodApi.deletePaymentMethod,
    onSuccess: () => {
      toast.success('Payment method deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to delete payment method';
      toast.error(message);
    },
  });
};

/**
 * Set default payment method mutation
 */
export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentMethodApi.setDefaultPaymentMethod,
    onSuccess: () => {
      toast.success('Default payment method updated');
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to set default payment method';
      toast.error(message);
    },
  });
};

