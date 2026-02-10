import { Navigate } from "react-router-dom";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from '../shared/hooks/useAuth';
import { LoadingState } from '../shared/components/ui/LoadingComponents';
import { PATHS } from './routePaths';

const ProtectedRoutes = ({ children, allowPending = false }) => {
  const queryClient = useQueryClient();
  const { seller, sellerData, isLoading, error } = useAuth();

  // Cookie-based auth: No need to check localStorage
  // Authentication state is determined by useAuth hook which calls getCurrentUser()
  // Browser automatically sends cookie via withCredentials: true
  const [localAuthCheck, setLocalAuthCheck] = useState(() => {
    // Always return true initially - let useAuth determine actual auth state
    return true;
  });

  useEffect(() => {
    // Update based on actual auth state from useAuth
    if (!isLoading) {
      setLocalAuthCheck(!!seller);
    }
  }, [isLoading, seller]);

  // Debug logging (only in development)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[ProtectedRoute] Auth State:", {
        isLoading,
        hasSeller: !!seller,
        sellerRole: seller?.role,
        sellerStatus: seller?.status,
        error: error?.message,
      });
    }
  }, [isLoading, seller, error]);
  
  // IMPORTANT: Don't redirect during mutations/API calls
  // Only check auth state when component first mounts or auth state changes
  // This prevents redirects during OTP verification or other mutations

  if (localAuthCheck && isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (error) {
    // Only log errors in development
    if (import.meta.env.DEV) {
      console.error("[ProtectedRoute] Error fetching seller data:", error);
      console.warn("REDIRECT DETAILS:", {
        errorMessage: error?.message,
        errorType: error?.constructor?.name,
        hasSeller: !!seller,
        isLoading
      });
    }
    
    // In production, redirect to login on error
    // Network errors or 401s are expected when not authenticated
    return (
      <Navigate
        to={PATHS.LOGIN}
        state={{ error: "Error fetching seller data" }}
        replace
      />
    );
  }

  // CRITICAL: Verify user is a seller, not a buyer
  if (!seller) {
    if (import.meta.env.DEV) {
      console.warn("[ProtectedRoute] No seller found - redirecting to login");
      console.warn("REDIRECT DETAILS:", {
        hasSeller: !!seller,
        isLoading,
        sellerData: sellerData,
        error: error
      });
    }
    
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  // Double-check role - reject buyers; allow both 'seller' and 'eazshop_store' (platform store)
  const isSellerRole = seller.role === 'seller' || seller.role === 'eazshop_store';
  if (!isSellerRole) {
    if (import.meta.env.DEV) {
      console.error("[ProtectedRoute] SECURITY: Buyer detected in seller app - redirecting to login", {
        hasSeller: !!seller,
        role: seller?.role,
        email: seller?.email,
        phone: seller?.phone,
      });
    }
    
    // Clear any stale auth data
    queryClient.setQueryData(["sellerAuth"], null);
    
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  // Only allow sellers with status "active" into protected routes.
  // Pending or other statuses are redirected.
  // Exception: If allowPending is true, allow pending sellers (for onboarding flows like payment methods)
  if (seller.status !== "active") {
    if (allowPending && seller.status === "pending") {
      // Allow pending sellers to access this route (e.g., for adding payment methods during onboarding)
      return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
    }
    
    console.warn("[ProtectedRoute] Seller status is not active - redirecting", {
      status: seller.status,
    });
    return handleStatusRedirect(seller.status);
  }

  return <Suspense fallback={<LoadingState message="Loading..." />}>{children}</Suspense>;
};

const statusRedirectMap = {
  pending: "/account-pending",
  inactive: "/account-inactive",
  default: "/unauthorized",
};

const handleStatusRedirect = (status) => {
  const path = statusRedirectMap[status] || statusRedirectMap.default;
  return <Navigate to={path} replace />;
};

const MemoizedProtectedRoutes = memo(ProtectedRoutes);
export default MemoizedProtectedRoutes;
export { MemoizedProtectedRoutes as ProtectedRoute };
