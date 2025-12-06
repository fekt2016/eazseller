import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApi from '../services/authApi';
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Cookie-based authentication: No need to check localStorage
  // Browser automatically sends cookie via withCredentials: true
  const {
    data: sellerData,
    isLoading: isSellerLoading,
    error: sellerError,
    refetch: refetchAuth,
  } = useQuery({
    queryKey: ["sellerAuth"],
    queryFn: async () => {
      try {
        // Cookie is automatically sent by browser via withCredentials: true
        // No need to read from localStorage
        const response = await authApi.getCurrentUser();
        // Handle nested response structures
        return response?.data?.data?.data || response?.data?.data || response?.data || response;
      } catch (error) {
        // Only clear auth data after server confirms 401 (not on network errors)
        if (error.response?.status === 401) {
          console.warn("[useAuth] Server confirmed 401 - clearing auth data");
          // Clear any stale auth data
          queryClient.setQueryData(["sellerAuth"], null);
        } else {
          // For network errors, don't clear auth - might be temporary
          console.warn("[useAuth] Network error (not 401) - keeping auth state");
        }
        // Return null instead of throwing - allows public pages to work
        return null;
      }
    },
    // Cache for 5 minutes
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error) => {
      // Retry network errors, but not 401s (server confirmed auth failure)
      if (error?.response?.status === 401) {
        return false; // Don't retry 401s
      }
      return failureCount < 2; // Retry network errors up to 2 times
    },
    // Reduce refetch frequency to prevent unnecessary auth checks
    refetchOnWindowFocus: false, // Was true - caused frequent refetches
    // Don't throw errors - return null instead (allows public pages)
    throwOnError: false,
  });

  // Extract seller from sellerData (handle nested structures)
  const seller = sellerData?.data?.data || sellerData?.data || sellerData || null;

  // CRITICAL: Verify the user is actually a seller, not a buyer
  // If the backend returns a user with role !== 'seller', reject it
  let validSeller = seller;
  if (seller && seller.role && seller.role !== 'seller') {
    console.error("[useAuth] SECURITY: Non-seller user detected in seller app", {
      role: seller.role,
      email: seller.email,
      phone: seller.phone,
    });
    // Clear the invalid auth data
    queryClient.setQueryData(["sellerAuth"], null);
    // Set seller to null to trigger ProtectedRoute redirect
    validSeller = null;
  }

  // Common auth success handler
  // Note: Token is now stored in HTTP-only cookie, not localStorage
  const handleAuthSuccess = (response) => {
    // Extract seller from response (token is in cookie, not in response)
    const responseData = response?.data || response;
    const seller = responseData?.data?.seller || responseData?.data?.data || responseData?.seller || responseData?.data || null;

    if (seller) {
      // Update React Query cache with seller data
      queryClient.setQueryData(["sellerAuth"], seller);
      console.log("[useAuth] Seller authenticated - cookie set by backend");
    }

    return seller;
  };

  // OTP-based authentication
  const sendOtp = useMutation({
    mutationFn: (loginId) => authApi.sendOtp(loginId),
    onSuccess: handleAuthSuccess,
  });

  const verifyOtp = useMutation({
    mutationFn: ({ loginId, otp, password, redirectTo = '/' }) =>
      authApi.verifyOtp(loginId, otp, password, redirectTo),
    onSuccess: (response) => {
      // Extract seller and redirectTo from response
      const responseData = response?.data || response;
      console.log("[useAuth] OTP verify response structure:", {
        responseData,
        hasData: !!responseData?.data,
        hasSeller: !!responseData?.data?.seller,
        sellerKeys: responseData?.data?.seller ? Object.keys(responseData.data.seller) : [],
      });
      
      const seller = responseData?.data?.seller || responseData?.data?.data || responseData?.seller || null;
      const redirectTo = responseData?.redirectTo || '/';

      console.log("[useAuth] Extracted seller:", {
        hasSeller: !!seller,
        sellerRole: seller?.role,
        sellerStatus: seller?.status,
        sellerId: seller?.id || seller?._id,
      });

      if (seller) {
        // Ensure seller has the correct structure for React Query cache
        const sellerData = {
          data: seller, // Wrap in data to match getCurrentUser structure
        };
        queryClient.setQueryData(["sellerAuth"], sellerData);
        console.log("[useAuth] OTP verified - seller cached, cookie set by backend");
        
        // FALLBACK: Store token in localStorage as backup (if provided in response)
        // This helps if cookies fail due to CORS or domain issues
        if (responseData?.token && typeof window !== 'undefined') {
          localStorage.setItem('seller_token', responseData.token);
          localStorage.setItem('sellerAccessToken', responseData.token);
          console.log("[useAuth] Token stored in localStorage as fallback");
        }
      } else {
        console.warn("[useAuth] No seller data in OTP verification response");
      }

      // Return redirectTo for navigation
      return { seller, redirectTo };
    },
    onError: (error) => {
      console.error("[useAuth] OTP verification error:", error);
      queryClient.setQueryData(["sellerAuth"], null);
    },
  });

  // Legacy login (keeping for backward compatibility)
  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const responseData = response?.data || response;
      const seller = responseData?.data?.seller || responseData?.data?.data || responseData?.seller || null;
      
      // FALLBACK: Store token in localStorage as backup (if provided in response)
      if (responseData?.token && typeof window !== 'undefined') {
        localStorage.setItem('seller_token', responseData.token);
        localStorage.setItem('sellerAccessToken', responseData.token);
        console.log("[useAuth] Token stored in localStorage as fallback (login)");
      }

      if (seller) {
        queryClient.setQueryData(["sellerAuth"], seller);
        console.log("[useAuth] Login successful - cookie set by backend");
      }
    },
    onError: (error) => {
      console.error("[useAuth] Login error:", error);
      queryClient.setQueryData(["sellerAuth"], null);
    },
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      const responseData = response?.data || response;
      const seller = responseData?.data?.seller || responseData?.data?.data || responseData?.seller || responseData?.data || null;

      if (seller) {
        queryClient.setQueryData(["sellerAuth"], seller);
        console.log("[useAuth] Registration successful - cookie set by backend");
      }
    },
    onError: (error) => {
      console.error("[useAuth] Register error:", error);
      queryClient.setQueryData(["sellerAuth"], null);
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Backend clears the cookie, we just clear local state
      queryClient.removeQueries(["sellerAuth"]);
      // No need to remove token from localStorage - we're using cookies now
      console.log("[useAuth] Logged out - cookie cleared by backend");
      navigate("/login");
    },
    onError: (error) => {
      console.error("[useAuth] Logout error:", error);
      // Force clear local state even on error
      queryClient.removeQueries(["sellerAuth"]);
      navigate("/login");
    },
  });

  const update = useMutation({
    mutationFn: async (data) => await authApi.update(data),
    onSuccess: (response) => {
      console.log("[useAuth] Update success:", response);
      const updatedSeller = response?.data?.seller || response?.data?.data || response?.data || null;
      
      if (updatedSeller) {
        queryClient.setQueryData(["sellerAuth"], (oldData) => ({
          ...oldData,
          ...updatedSeller,
        }));
      }
    },
    onError: (error) => {
      console.error("[useAuth] Update error:", error);
    },
  });

  const imageUpdate = useMutation({
    mutationFn: (formData) => {
      return authApi.updateSellerImage(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      console.log("[useAuth] Image update success:", response);
      const updatedSeller = response?.data?.data || response?.data || response || null;
      
      if (updatedSeller) {
        queryClient.setQueryData(["sellerAuth"], (oldData) => ({
          ...oldData,
          ...updatedSeller,
        }));
      }
    },
    onError: (error) => {
      console.error("[useAuth] Image update error:", error.response?.data || error.message);
    },
  });

  return {
    // Auth state
    seller: validSeller,
    sellerData: validSeller ? sellerData : null,

    // Auth operations
    sendOtp,
    verifyOtp,
    login, // Legacy - prefer sendOtp/verifyOtp
    register,
    logout,
    update,
    imageUpdate,
    refetchAuth,

    // Loading states
    isLoading: isSellerLoading,
    isSellerLoading,
    isSendingOtp: sendOtp.isPending,
    isVerifyingOtp: verifyOtp.isPending,
    isLoginLoading: login.isPending,
    isRegisterLoading: register.isPending,
    isLogoutLoading: logout.isPending,
    isUpdateLoading: update.isPending,
    isImageUpdateLoading: imageUpdate.isPending,

    // Error states
    error: sellerError,
    isError: login.isError || register.isError || sendOtp.isError || verifyOtp.isError,
    sendOtpError: sendOtp.error,
    verifyOtpError: verifyOtp.error,
    loginError: login.error,
    registerError: register.error,
    logoutError: logout.error,
    updateError: update.error,
    imageUpdateError: imageUpdate.error,

    // Auth status
    isAuthenticated: !!validSeller,
    isSeller: validSeller?.role === "seller",
    status: validSeller?.status || "pending",
  };
};

export default useAuth;
