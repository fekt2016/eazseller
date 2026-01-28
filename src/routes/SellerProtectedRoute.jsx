import { Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { LoadingState } from '../shared/components/ui/LoadingComponents';
import { PATHS } from './routePaths';
import useSellerStatus from '../shared/hooks/useSellerStatus';





/**
 * ✅ REFACTORED: Simplified route guard using backend-driven boolean flags
 * 
 * Rules:
 * - ✅ Read isSetupComplete from backend (no frontend computation)
 * - ✅ Read isVerified from onboardingStage
 * - ✅ Also check individual verification statuses as fallback
 * - ✅ Allow access if all 3 verifications are complete (documents, contact, payment method)
 */
const SellerProtectedRoute = ({ allowedStage = 'verified', children }) => {
  const {
    onboardingStage,
    isLoading,
    error,
    isVerified,
    isSetupComplete, // ✅ Backend-driven boolean
    verification,
    requiredSetup,
    businessDocumentsStatus,
    paymentMethodStatus,
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

  // Check if all 3 verifications are individually complete (fallback check)
  const allDocumentsVerified = requiredSetup?.hasBusinessDocumentsVerified || businessDocumentsStatus?.isVerified || false;
  const contactVerified = verification?.contactVerified || verification?.emailVerified || false;
  const paymentMethodVerified = requiredSetup?.hasPaymentMethodVerified || paymentMethodStatus?.isVerified || false;
  const allThreeVerificationsComplete = allDocumentsVerified && contactVerified && paymentMethodVerified;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('[SellerProtectedRoute] Access check:', {
      allowedStage,
      onboardingStage,
      isVerified,
      isSetupComplete, // ✅ Backend boolean
      allThreeVerificationsComplete,
      allDocumentsVerified,
      contactVerified,
      paymentMethodVerified,
    });
  }

  // ✅ SIMPLIFIED: Check boolean flags only
  // 1. If fully verified, always allow access
  if (isVerified) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[SellerProtectedRoute] ✅ Access granted - seller is verified');
    }
    return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
  }

  // 2. If setup is complete (but pending admin verification), allow access
  if (isSetupComplete) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[SellerProtectedRoute] ✅ Access granted - setup is complete (pending verification)');
    }
    return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
  }

  // 3. CRITICAL FALLBACK: If all 3 verifications are individually complete, allow access
  // This ensures sellers can access pages even if backend status flags aren't updated yet
  if (allThreeVerificationsComplete) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[SellerProtectedRoute] ✅ Access granted - all 3 verifications complete (fallback check)', {
        allDocumentsVerified,
        contactVerified,
        paymentMethodVerified,
      });
    }
    return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
  }

  // 4. Setup incomplete - redirect to Setup page
  if (process.env.NODE_ENV === 'development') {
    console.debug('[SellerProtectedRoute] ❌ Redirecting to Setup - setup incomplete', {
      isSetupComplete, // ✅ Backend boolean
      isVerified,
      onboardingStage,
      allThreeVerificationsComplete,
      allDocumentsVerified,
      contactVerified,
      paymentMethodVerified,
    });
  }
  return <Navigate to={PATHS.SETUP} replace />;
};

export default SellerProtectedRoute;

