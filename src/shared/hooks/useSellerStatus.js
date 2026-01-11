import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import onboardingApi from '../services/onboardingApi';

/**
 * Hook to fetch and manage seller onboarding status
 * @returns {Object} - { onboardingStage, verification, requiredSetup, isLoading, error, refetch, updateOnboarding }
 */
export const useSellerStatus = () => {
  const queryClient = useQueryClient();

  // Fetch seller onboarding status
  const {
    data: statusData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sellerStatus'],
    queryFn: async () => {
      try {
        const response = await onboardingApi.getStatus();
        return response?.data?.data || response?.data || response;
      } catch (error) {
        console.error('[useSellerStatus] Error fetching status:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Extract status data
  const onboardingStage = statusData?.onboardingStage || 'profile_incomplete';
  const verification = statusData?.verification || {
    emailVerified: false,
    phoneVerified: false,
    contactVerified: false,
    businessVerified: false,
  };
  const requiredSetup = statusData?.requiredSetup || {
    hasAddedBusinessInfo: false,
    hasAddedBankDetails: false,
    hasAddedFirstProduct: false,
    hasPaymentMethodVerified: false,
    hasBusinessDocumentsVerified: false,
  };
  
  // ✅ BACKEND-DRIVEN: Read isSetupComplete directly from backend (no frontend computation)
  const isSetupComplete = statusData?.isSetupComplete ?? false;

  // Get detailed status from backend (if available) - for display purposes only
  const businessDocumentsStatus = statusData?.businessDocumentsStatus;
  const paymentMethodStatus = statusData?.paymentMethodStatus;

  // Mutation to update onboarding status
  const updateOnboarding = useMutation({
    mutationFn: async () => {
      const response = await onboardingApi.updateOnboarding();
      return response?.data?.data || response?.data || response;
    },
    onSuccess: (data) => {
      // Update the cache with new status
      queryClient.setQueryData(['sellerStatus'], data);
      // Invalidate seller auth query to refresh seller data
      queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
      // Invalidate seller status to force refetch
      queryClient.invalidateQueries({ queryKey: ['sellerStatus'] });
      console.log('[useSellerStatus] Onboarding status updated:', data);
    },
    onError: (error) => {
      console.error('[useSellerStatus] Error updating onboarding:', error);
    },
  });

  // Check if seller is verified (onboardingStage === 'verified')
  const isVerified = onboardingStage === 'verified';

  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && !isLoading && statusData) {
    console.debug('[useSellerStatus] Setup status (backend-driven):', {
      isSetupComplete, // ✅ From backend
      onboardingStage,
      isVerified,
      verification,
      requiredSetup,
    });
  }

  return {
    onboardingStage,
    verification,
    requiredSetup,
    isLoading,
    error,
    refetch,
    updateOnboarding: updateOnboarding.mutate,
    updateOnboardingAsync: updateOnboarding.mutateAsync,
    isUpdating: updateOnboarding.isPending,
    isVerified,
    isSetupComplete, // ✅ Backend-driven, no frontend computation
    // Export detailed status for display purposes (not for logic)
    businessDocumentsStatus,
    paymentMethodStatus,
  };
};

export default useSellerStatus;

