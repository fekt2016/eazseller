import { Navigate } from "react-router-dom";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import useAuth from '../shared/hooks/useAuth';
import { LoadingState } from '../shared/components/ui/LoadingComponents';
import { PATHS } from './routePaths';

const ProtectedRoutes = ({ children }) => {
  const { seller, isLoading, error } = useAuth();

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

  if (localAuthCheck && isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (error) {
    console.error("[ProtectedRoute] Error fetching seller data:", error);
    return (
      <Navigate
        to={PATHS.LOGIN}
        state={{ error: "Error fetching seller data" }}
        replace
      />
    );
  }

  if (!seller || seller.role !== "seller") {
    console.warn("[ProtectedRoute] No seller or invalid role - redirecting to login", {
      hasSeller: !!seller,
      role: seller?.role,
    });
    return <Navigate to={PATHS.LOGIN} replace />;
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
