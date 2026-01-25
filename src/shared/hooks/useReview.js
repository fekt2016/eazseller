import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../services/reviewApi";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

/**
 * Hook to get seller reviews
 * SECURITY: Only runs when seller is authenticated
 */
export const useGetSellerReviews = (params = {}) => {
  const { seller, sellerData, isLoading: isSellerLoading } = useAuth();
  
  // Extract seller from sellerData if seller is not directly available
  // This handles cases where seller might be nested in the response
  const actualSeller = seller || sellerData?.data?.data || sellerData?.data || sellerData || null;
  
  // Ensure enabled is always a boolean - check seller exists and has valid ID
  const hasValidSeller = actualSeller && 
                        typeof actualSeller === 'object' && 
                        !Array.isArray(actualSeller) &&
                        (actualSeller.id || actualSeller._id) &&
                        (actualSeller.email || actualSeller.name || actualSeller.phone);
  
  const isEnabled = Boolean(!isSellerLoading && hasValidSeller);
  
  // Debug logging in development
  if (import.meta.env.DEV) {
    console.debug('[useGetSellerReviews] Auth check:', {
      isSellerLoading,
      hasSeller: !!seller,
      hasSellerData: !!sellerData,
      hasActualSeller: !!actualSeller,
      hasValidSeller,
      isEnabled,
      sellerId: actualSeller?._id || actualSeller?.id,
    });
  }
  
  return useQuery({
    queryKey: ["seller-reviews", params],
    queryFn: async () => {
      // Double-check authentication before making the request
      if (!actualSeller || (!actualSeller._id && !actualSeller.id)) {
        console.warn('[useGetSellerReviews] Query function called but seller not authenticated');
        return [];
      }
      
      try {
        const response = await reviewService.getSellerReviews(params);
        return response?.results || response?.data?.reviews || [];
      } catch (error) {
        // If 401, user is not authenticated - return empty array instead of throwing
        if (error?.response?.status === 401) {
          console.warn('[useGetSellerReviews] 401 error - seller not authenticated', {
            sellerId: actualSeller?._id || actualSeller?.id,
            isEnabled,
            isSellerLoading,
            hasSeller: !!seller,
            hasSellerData: !!sellerData,
          });
          return [];
        }
        throw error;
      }
    },
    enabled: isEnabled, // Only run when authenticated
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (auth failure)
      if (error?.response?.status === 401) {
        if (import.meta.env.DEV) {
          console.warn('[useGetSellerReviews] Not retrying 401 error');
        }
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useReplyToReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reply }) => {
      return await reviewService.replyToReview(id, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-reviews"] });
      toast.success("Reply posted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to post reply");
    },
  });
};

