import { Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LoadingState } from '../shared/components/ui/LoadingComponents';
import { PATHS } from './routePaths';
import useSellerStatus from '../shared/hooks/useSellerStatus';





const SellerProtectedRoute = ({ allowedStage = 'verified', children }) => {
  const {
    onboardingStage,
    isLoading,
    error,
    isVerified,
  } = useSellerStatus();

  // Show loading state while fetching status
  if (isLoading) {
    return <LoadingState message="Checking access..." />;
  }

  // Handle error state
  if (error) {
    console.error('[SellerProtectedRoute] Error fetching seller status:', error);
    // On error, redirect to setup to be safe
    return <Navigate to={PATHS.SETUP} replace />;
  }

  // Define stage hierarchy
  const stageHierarchy = {
    profile_incomplete: 0,
    pending_verification: 1,
    verified: 2,
  };

  const currentStageLevel = stageHierarchy[onboardingStage] || 0;
  const requiredStageLevel = stageHierarchy[allowedStage] || 2;

  // Check if seller has required stage
  // If seller is verified (onboardingStage === 'verified'), they have access to all pages
  if (currentStageLevel < requiredStageLevel && !isVerified) {
    // Redirect to setup page if not verified
    if (allowedStage === 'verified') {
      return <Navigate to={PATHS.SETUP} replace />;
    }
    // For other stages, redirect to setup
    return <Navigate to={PATHS.SETUP} replace />;
  }
  
  // Verified sellers have access to all pages regardless of required stage
  if (isVerified) {
    return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
  }

  // Access granted - render children
  return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
};

export default SellerProtectedRoute;

