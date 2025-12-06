import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import fundsApi from '../services/fundsApi';
import { useSellerBalance } from '../../../shared/hooks/finance/useSellerBalance';

/**
 * React Query hook for managing seller funds
 * Provides wallet summary, transactions, and withdrawal operations
 */
export const useSellerFunds = () => {
  const queryClient = useQueryClient();

  /**
   * Get wallet summary
   * Uses the unified useSellerBalance hook for consistency
   * @returns {Object} Wallet summary data
   */
  const getWalletSummary = () => {
    return useSellerBalance();
  };

  /**
   * Get transactions for the seller
   * @param {Object} params - Query parameters (page, limit, type, status)
   * @returns {Object} React Query result with transactions data
   */
  const getTransactions = (params = {}) => {
    return useQuery({
      queryKey: ['sellerTransactions', params],
      queryFn: async () => {
        const response = await fundsApi.getTransactions(params);
        const transactions = response?.data?.transactions || response?.data || [];
        return {
          transactions,
          pagination: {
            page: response?.pagination?.page || params.page || 1,
            limit: response?.pagination?.limit || params.limit || 20,
            total: response?.pagination?.total || response?.total || transactions.length,
            totalPages: response?.pagination?.totalPages || Math.ceil((response?.total || transactions.length) / (params.limit || 20)),
          },
        };
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: true,
    });
  };

  /**
   * Request a withdrawal
   * @returns {Object} React Query mutation object
   */
  const requestWithdrawal = () => {
    return useMutation({
      mutationFn: async (withdrawalData) => {
        const response = await fundsApi.requestWithdrawal(withdrawalData);
        return response?.data?.withdrawal || response?.data;
      },
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['sellerBalance'] });
        await queryClient.cancelQueries({ queryKey: ['sellerTransactions'] });

        // Snapshot previous values
        const previousBalance = queryClient.getQueryData(['sellerBalance']);

        // Optimistically update balance (deduct withdrawal amount)
        queryClient.setQueryData(['sellerBalance'], (old) => {
          if (!old) return old;
          return {
            ...old,
            availableBalance: (old.availableBalance || 0) - (variables.amount || 0),
            pendingBalance: (old.pendingBalance || 0) + (variables.amount || 0),
          };
        });

        return { previousBalance };
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['sellerBalance'] });
        queryClient.invalidateQueries({ queryKey: ['sellerTransactions'] });
        queryClient.invalidateQueries({ queryKey: ['paymentRequests'] }); // Also invalidate payment requests
        toast.success('Withdrawal request submitted successfully');
      },
      onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousBalance) {
          queryClient.setQueryData(['sellerBalance'], context.previousBalance);
        }
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to request withdrawal';
        toast.error(errorMessage);
      },
    });
  };

  /**
   * Delete a withdrawal request
   * @returns {Object} React Query mutation object
   */
  const deleteWithdrawal = () => {
    return useMutation({
      mutationFn: async (withdrawalId) => {
        await fundsApi.deleteWithdrawal(withdrawalId);
        return withdrawalId;
      },
      onMutate: async (withdrawalId) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['paymentRequests'] });
        await queryClient.cancelQueries({ queryKey: ['sellerBalance'] });

        // Snapshot previous values
        const previousRequests = queryClient.getQueryData(['paymentRequests']);

        // Optimistically remove the withdrawal request
        queryClient.setQueryData(['paymentRequests'], (old) => {
          if (!old) return old;
          return old.filter((req) => req._id !== withdrawalId);
        });

        return { previousRequests };
      },
      onSuccess: (data, withdrawalId) => {
        queryClient.invalidateQueries({ queryKey: ['paymentRequests'] });
        queryClient.invalidateQueries({ queryKey: ['sellerBalance'] });
        queryClient.invalidateQueries({ queryKey: ['sellerTransactions'] });
        toast.success('Withdrawal request deleted');
      },
      onError: (error, withdrawalId, context) => {
        // Rollback on error
        if (context?.previousRequests) {
          queryClient.setQueryData(['paymentRequests'], context.previousRequests);
        }
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete withdrawal request';
        toast.error(errorMessage);
      },
    });
  };

  return {
    getWalletSummary,
    getTransactions,
    requestWithdrawal,
    deleteWithdrawal,
  };
};

export default useSellerFunds;

