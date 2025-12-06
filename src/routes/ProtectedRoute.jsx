import { Navigate } from "react-router-dom";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from '../shared/hooks/useAuth';
import { LoadingState } from '../shared/components/ui/LoadingComponents';
import { PATHS } from './routePaths';

const ProtectedRoutes = ({ children }) => {
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

  // Debug logging
  useEffect(() => {
    console.log("[ProtectedRoute] Auth State:", {
      isLoading,
      hasSeller: !!seller,
      sellerRole: seller?.role,
      sellerStatus: seller?.status,
      error: error?.message,
    });
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
    console.error("[ProtectedRoute] Error fetching seller data:", error);
    console.warn("REDIRECT TRIGGERED FROM: ProtectedRoute.jsx - Error state (line ~50)");
    console.warn("REDIRECT REASON: Error fetching seller data");
    console.warn("REDIRECT DETAILS:", {
      errorMessage: error?.message,
      errorType: error?.constructor?.name,
      hasSeller: !!seller,
      isLoading
    });
    
    // COMMENTED OUT - Redirect to login disabled for debugging
    // return (
    //   <Navigate
    //     to={PATHS.LOGIN}
    //     state={{ error: "Error fetching seller data" }}
    //     replace
    //   />
    // );
    
    // Instead, show error but don't redirect
    console.error("[ProtectedRoute] 🛑 REDIRECT DISABLED FOR DEBUGGING - Error:", error);
    return <div style={{ padding: '2rem', color: 'red' }}>
      <h2>DEBUG: ProtectedRoute Error</h2>
      <p>Error: {error?.message || 'Unknown error'}</p>
      <p>Check console for details. Redirect disabled for debugging.</p>
    </div>;
  }

  // CRITICAL: Verify user is a seller, not a buyer
  if (!seller) {
    console.warn("[ProtectedRoute] No seller found - redirecting to login");
    console.warn("REDIRECT TRIGGERED FROM: ProtectedRoute.jsx - No seller (line ~62)");
    console.warn("REDIRECT REASON: No seller found");
    console.warn("REDIRECT DETAILS:", {
      hasSeller: !!seller,
      isLoading,
      sellerData: sellerData,
      error: error
    });
    
    // COMMENTED OUT - Redirect to login disabled for debugging
    // return <Navigate to={PATHS.LOGIN} replace />;
    
    // Instead, show message but don't redirect
    console.error("[ProtectedRoute] 🛑 REDIRECT DISABLED FOR DEBUGGING - No seller");
    return <div style={{ padding: '2rem', color: 'orange' }}>
      <h2>DEBUG: ProtectedRoute - No Seller</h2>
      <p>No seller found. Check console for details. Redirect disabled for debugging.</p>
      <p>isLoading: {isLoading ? 'true' : 'false'}</p>
      <p>hasSeller: {seller ? 'true' : 'false'}</p>
    </div>;
  }

  // Double-check role - reject buyers trying to access seller routes
  if (seller.role !== "seller") {
    console.error("[ProtectedRoute] SECURITY: Buyer detected in seller app - redirecting to login", {
      hasSeller: !!seller,
      role: seller?.role,
      email: seller?.email,
      phone: seller?.phone,
    });
  
    
    // Clear any stale auth data
    queryClient.setQueryData(["sellerAuth"], null);
    
  
    return <Navigate to={PATHS.LOGIN} replace />;
    
    // Instead, show error but don't redirect
    console.error("[ProtectedRoute] 🛑 REDIRECT DISABLED FOR DEBUGGING - Wrong role");
    return <div style={{ padding: '2rem', color: 'red' }}>
      <h2>DEBUG: ProtectedRoute - Wrong Role</h2>
      <p>User role: {seller?.role} (expected: seller)</p>
      <p>Check console for details. Redirect disabled for debugging.</p>
    </div>;
  }

  if (seller.status !== "active") {
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
