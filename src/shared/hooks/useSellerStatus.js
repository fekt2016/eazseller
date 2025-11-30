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
    businessVerified: false,
  };
  const requiredSetup = statusData?.requiredSetup || {
    hasAddedBusinessInfo: false,
    hasAddedBankDetails: false,
    hasAddedFirstProduct: false,
  };

  // Mutation to update onboarding status
  const updateOnboarding = useMutation({
    mutationFn: async () => {
      const response = await onboardingApi.updateOnboarding();
      return response?.data?.data || response?.data || response;
    },
    onSuccess: (data) => {
      // Update the cache with new status
      queryClient.setQueryData(['sellerStatus'], data);
      console.log('[useSellerStatus] Onboarding status updated:', data);
    },
    onError: (error) => {
      console.error('[useSellerStatus] Error updating onboarding:', error);
    },
  });

  // Check if seller is verified
  const isVerified = onboardingStage === 'verified';

  // Check if all required setup is complete (product not required for verification)
  const isSetupComplete =
    requiredSetup.hasAddedBusinessInfo &&
    requiredSetup.hasAddedBankDetails;

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
    isSetupComplete,
  };
};

export default useSellerStatus;

