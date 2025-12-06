import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import returnApi from '../services/returnApi';

/**
 * React Query hook for managing seller returns
 * Provides CRUD operations with loading/error states and cache management
 */
export const useSellerReturns = () => {
  const queryClient = useQueryClient();

  /**
   * Get all returns for the seller
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Object} React Query result with returns data
   */
  const getAllSellerReturns = (params = {}) => {
    return useQuery({
      queryKey: ['sellerReturns', params],
      queryFn: async () => {
        const response = await returnApi.getSellerReturns(params);
        // Backend returns data.refunds (array of refund requests)
        // Each refund request can have multiple items, so we need to flatten them
        const refunds = response?.data?.refunds || response?.data?.returns || response?.data || [];
        
        // Ensure it's an array
        if (!Array.isArray(refunds)) {
          return [];
        }
        
        // Transform refund requests into individual return items
        // Each refund request item becomes a separate return entry
        const returns = refunds.flatMap((refund) => {
          // If refund has items array, create one return per item
          if (refund.items && Array.isArray(refund.items) && refund.items.length > 0) {
            return refund.items.map((item) => ({
              _id: item._id || `${refund._id}_${item.productId?._id || item.productId}`,
              returnId: refund._id,
              order: refund.order,
              orderId: refund.order?._id || refund.order,
              buyer: refund.buyer,
              user: refund.buyer,
              product: item.productId,
              productName: item.productId?.name,
              productId: item.productId?._id || item.productId,
              quantity: item.quantity || 1,
              reason: refund.reason,
              description: refund.description,
              status: item.status || refund.status || 'PENDING',
              photos: refund.photos || [],
              refundAmount: item.refundAmount || 0,
              createdAt: refund.createdAt,
              rejectionReason: refund.rejectionReason,
            }));
          }
          // If no items array, treat the refund itself as a return
          return [{
            _id: refund._id,
            returnId: refund._id,
            order: refund.order,
            orderId: refund.order?._id || refund.order,
            buyer: refund.buyer,
            user: refund.buyer,
            product: refund.items?.[0]?.productId,
            productName: refund.items?.[0]?.productId?.name,
            quantity: 1,
            reason: refund.reason,
            description: refund.description,
            status: refund.status || 'PENDING',
            photos: refund.photos || [],
            refundAmount: refund.totalRefundAmount || 0,
            createdAt: refund.createdAt,
            rejectionReason: refund.rejectionReason,
          }];
        });
        
        return returns;
      },
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: true,
    });
  };

  /**
   * Get a single return by ID
   * @param {string} returnId - Return ID
   * @returns {Object} React Query result with return data
   */
  const getReturnById = (returnId) => {
    return useQuery({
      queryKey: ['sellerReturn', returnId],
      queryFn: async () => {
        const response = await returnApi.getReturnById(returnId);
        return response?.data?.return || response?.data;
      },
      enabled: !!returnId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  /**
   * Approve a return request
   * @returns {Object} React Query mutation object
   */
  const approveReturn = () => {
    return useMutation({
      mutationFn: async ({ returnId, data = {} }) => {
        const response = await returnApi.approveReturn(returnId, data);
        return response?.data?.return || response?.data;
      },
      onMutate: async ({ returnId }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['sellerReturns'] });
        await queryClient.cancelQueries({ queryKey: ['sellerReturn', returnId] });

        // Snapshot previous values
        const previousReturns = queryClient.getQueryData(['sellerReturns']);
        const previousReturn = queryClient.getQueryData(['sellerReturn', returnId]);

        // Optimistically update
        queryClient.setQueryData(['sellerReturn', returnId], (old) => {
          if (!old) return old;
          return {
            ...old,
            status: 'APPROVED',
          };
        });

        queryClient.setQueryData(['sellerReturns'], (old) => {
          if (!old) return old;
          return old.map((ret) =>
            ret._id === returnId ? { ...ret, status: 'APPROVED' } : ret
          );
        });

        return { previousReturns, previousReturn };
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['sellerReturns'] });
        queryClient.invalidateQueries({ queryKey: ['sellerReturn', variables.returnId] });
        toast.success('Return approved successfully');
      },
      onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousReturns) {
          queryClient.setQueryData(['sellerReturns'], context.previousReturns);
        }
        if (context?.previousReturn) {
          queryClient.setQueryData(['sellerReturn', variables.returnId], context.previousReturn);
        }
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to approve return';
        toast.error(errorMessage);
      },
    });
  };

  /**
   * Reject a return request
   * @returns {Object} React Query mutation object
   */
  const rejectReturn = () => {
    return useMutation({
      mutationFn: async ({ returnId, data = {} }) => {
        const response = await returnApi.rejectReturn(returnId, data);
        return response?.data?.return || response?.data;
      },
      onMutate: async ({ returnId }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['sellerReturns'] });
        await queryClient.cancelQueries({ queryKey: ['sellerReturn', returnId] });

        // Snapshot previous values
        const previousReturns = queryClient.getQueryData(['sellerReturns']);
        const previousReturn = queryClient.getQueryData(['sellerReturn', returnId]);

        // Optimistically update
        queryClient.setQueryData(['sellerReturn', returnId], (old) => {
          if (!old) return old;
          return {
            ...old,
            status: 'REJECTED',
          };
        });

        queryClient.setQueryData(['sellerReturns'], (old) => {
          if (!old) return old;
          return old.map((ret) =>
            ret._id === returnId ? { ...ret, status: 'REJECTED' } : ret
          );
        });

        return { previousReturns, previousReturn };
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: ['sellerReturns'] });
        queryClient.invalidateQueries({ queryKey: ['sellerReturn', variables.returnId] });
        toast.success('Return rejected');
      },
      onError: (error, variables, context) => {
        // Rollback on error
        if (context?.previousReturns) {
          queryClient.setQueryData(['sellerReturns'], context.previousReturns);
        }
        if (context?.previousReturn) {
          queryClient.setQueryData(['sellerReturn', variables.returnId], context.previousReturn);
        }
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reject return';
        toast.error(errorMessage);
      },
    });
  };

  return {
    getAllSellerReturns,
    getReturnById,
    approveReturn,
    rejectReturn,
  };
};

export default useSellerReturns;

