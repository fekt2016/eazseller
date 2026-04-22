import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import paymentMethodApi from '../services/paymentMethodApi';
import { toast } from 'react-toastify';
import normalizeError from '../utils/normalizeError';
import useAuth from './useAuth';

/**
 * Get current user's payment methods from PaymentMethod model
 * SECURITY: Only runs when seller is authenticated
 */
export const useGetPaymentMethods = () => {
  const { seller, isLoading: isAuthLoading } = useAuth();
  
  // Only enable query when seller is authenticated
  const isEnabled = Boolean(
    !isAuthLoading && // Auth must be ready
    seller && // Seller must exist
    (seller.id || seller._id) // Seller must have an ID
  );
  
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      try {
        const response = await paymentMethodApi.getMyPaymentMethods();
        return response?.data?.paymentMethods || [];
      } catch (error) {
        // If 401, user is not authenticated - return empty array instead of throwing
        if (error.response?.status === 401) {
          console.warn('[useGetPaymentMethods] 401 error - seller not authenticated');
          return [];
        }
        // If 404 or no payment methods, return empty array (not an error)
        if (error.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: isEnabled, // Only run when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (auth failure) or 404 (no payment methods found)
      if (error.response?.status === 401 || error.response?.status === 404) {
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
      // Use a fixed toastId so React-Toastify collapses duplicates
      toast.success('Payment method added successfully', {
        toastId: 'payment-method-create-success',
      });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      // ✅ CRITICAL: Invalidate sellerStatus after payment method update
      queryClient.invalidateQueries({ queryKey: ['sellerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
    onError: (error) => {
      console.error('[useCreatePaymentMethod] Error creating payment method:', error);
      const { message } = normalizeError(error, {
        fallbackTitle: "Unexpected error",
        fallbackMessage: "We could not save this payment method. Please try again.",
        defaultCanRetry: true,
      });
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
      toast.success('Payment method updated successfully', {
        toastId: 'payment-method-update-success',
      });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      // ✅ CRITICAL: Invalidate sellerStatus after payment method update
      queryClient.invalidateQueries({ queryKey: ['sellerStatus'] });
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
    },
    onError: (error) => {
      console.error('[useUpdatePaymentMethod] Error updating payment method:', error);
      const { message } = normalizeError(error, {
        fallbackTitle: "Unexpected error",
        fallbackMessage: "We could not update this payment method. Please try again.",
        defaultCanRetry: true,
      });
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
      toast.success('Payment method deleted successfully', {
        toastId: 'payment-method-delete-success',
      });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
    onError: (error) => {
      console.error('[useDeletePaymentMethod] Error deleting payment method:', error);
      const { message } = normalizeError(error, {
        fallbackTitle: "Unexpected error",
        fallbackMessage: "We could not delete this payment method. Please try again.",
        defaultCanRetry: true,
      });
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
      toast.success('Default payment method updated', {
        toastId: 'payment-method-set-default-success',
      });
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
    },
    onError: (error) => {
      console.error('[useSetDefaultPaymentMethod] Error setting default payment method:', error);
      const { message } = normalizeError(error, {
        fallbackTitle: "Unexpected error",
        fallbackMessage: "We could not update your default payment method. Please try again.",
        defaultCanRetry: true,
      });
      toast.error(message);
    },
  });
};

