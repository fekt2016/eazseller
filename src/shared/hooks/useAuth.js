import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApi from '../services/authApi';
import { useNavigate } from "react-router-dom";

// SECURITY: Cookie-only authentication - no token storage
// Tokens are in HTTP-only cookies set by backend
// No localStorage, sessionStorage, or any client-side token storage

const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // SECURITY: Cookie-only authentication - no token check needed
  // Backend reads from HTTP-only cookie automatically
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
        const seller = response?.data?.data?.data || response?.data?.data || response?.data || response;

        if (seller && (seller._id || seller.id)) {
          return seller;
        }

        // No seller data - cookie may be expired or missing
        return null;
      } catch (error) {
        const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
        const isNetworkError = error?.code === 'ERR_NETWORK' || !error?.response;
        const isUnauthorized = error?.response?.status === 401;

        if (isUnauthorized) {
          // 401 is expected when cookie is expired/missing - not an error, just unauthenticated state
          if (import.meta.env.DEV) {
            console.debug("[useAuth] Seller unauthenticated (401) - cookie may be expired or missing");
          }
          queryClient.setQueryData(["sellerAuth"], null);
          return null;
        }

        if (isTimeout || isNetworkError) {
          if (import.meta.env.DEV) {
            console.warn("[useAuth] Network/timeout error - cannot verify authentication");
          }
          // Return null on network errors - don't assume user is authenticated
          return null;
        }

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
    refetchOnWindowFocus: false,
    refetchOnMount: true,
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

  const isAuthenticated = !!validSeller && !sellerError;

  // Common auth success handler
  // SECURITY: Token is in HTTP-only cookie, NOT in response
  const handleAuthSuccess = (response) => {
    // Extract seller from response (token is in cookie, not in response)
    const responseData = response?.data || response;
    const seller = responseData?.data?.seller || responseData?.data?.data || responseData?.seller || responseData?.data || null;

    if (seller) {
      // Update React Query cache with seller data
      queryClient.setQueryData(["sellerAuth"], seller);
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Seller authenticated - cookie set by backend");
      }
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
      
      if (import.meta.env.DEV) {
        console.debug("[useAuth] OTP verify response structure:", {
          responseData,
          hasData: !!responseData?.data,
          hasSeller: !!responseData?.data?.seller,
          sellerKeys: responseData?.data?.seller ? Object.keys(responseData.data.seller) : [],
        });
      }
      
      const seller = responseData?.data?.seller || responseData?.data?.data || responseData?.seller || null;
      const redirectTo = responseData?.redirectTo || '/';

      if (import.meta.env.DEV) {
        console.debug("[useAuth] Extracted seller:", {
          hasSeller: !!seller,
          sellerRole: seller?.role,
          sellerStatus: seller?.status,
          sellerId: seller?.id || seller?._id,
        });
      }

      if (seller) {
        // Ensure seller has the correct structure for React Query cache
        const sellerData = {
          data: seller, // Wrap in data to match getCurrentUser structure
        };
        queryClient.setQueryData(["sellerAuth"], sellerData);
        if (import.meta.env.DEV) {
          console.debug("[useAuth] OTP verified - seller cached, cookie set by backend");
        }
        
        // Refetch notifications after successful OTP login
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } else {
        if (import.meta.env.DEV) {
          console.warn("[useAuth] No seller data in OTP verification response");
        }
      }

      // Return redirectTo for navigation
      return { seller, redirectTo };
    },
    onError: (error) => {
      console.error("[useAuth] OTP verification error:", error);
      queryClient.setQueryData(["sellerAuth"], null);
    },
  });

  // Login mutation - matches saysayseller pattern exactly
  const login = useMutation({
    mutationFn: async ({ email, password }) => {
      if (import.meta.env.DEV) {
        console.debug('🔐 [Seller Login] Starting login flow for email:', email);
      }
      const response = await authApi.login(email, password);

      if (response?.requires2FA || response?.status === '2fa_required') {
        if (import.meta.env.DEV) {
          console.debug('🔐 [Seller Login] 2FA required');
        }
        return {
          requires2FA: true,
          loginSessionId: response.loginSessionId,
          email: response.data?.email,
          userId: response.data?.userId,
        };
      }

      // SECURITY: Token is in HTTP-only cookie, NOT in response
      // Backend sets cookie automatically - no token storage needed
      const sellerData = response?.user || response?.data?.user;

      if (!sellerData || (!sellerData.id && !sellerData._id)) {
        throw new Error('Login failed: No seller data received');
      }

      if (import.meta.env.DEV) {
        console.debug('✅ [Seller Login] Login successful, cookie set by backend');
        console.debug('👤 [Seller Login] Seller logged in:', {
          id: sellerData.id || sellerData._id,
          email: sellerData.email,
          name: sellerData.name || sellerData.shopName,
          role: sellerData.role,
        });
      }

      return { success: true, seller: sellerData };
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.setQueryData(["sellerAuth"], data.seller);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        // Refetch auth to ensure ProtectedRoute sees the updated state
        queryClient.invalidateQueries({ queryKey: ['sellerAuth'] });
        if (import.meta.env.DEV) {
          console.debug('✅ [Seller Login] Auth state updated and queries invalidated');
        }
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          error?.toString() || 
                          'Unknown login error';
      const statusCode = error?.response?.status;
      const errorData = error?.response?.data;
      
      if (import.meta.env.DEV) {
        console.error('❌ [Seller Login] Login error:', {
          message: errorMessage,
          status: statusCode,
          error: errorData,
          code: error?.code,
        });
      }
    },
  });

  // Verify 2FA login - matches saysayseller pattern exactly
  const verify2FALogin = useMutation({
    mutationFn: async ({ loginSessionId, twoFactorCode }) => {
      if (import.meta.env.DEV) {
        console.debug('🔐 [Seller 2FA Login] Verifying 2FA code');
      }
      const response = await authApi.verify2FALogin(loginSessionId, twoFactorCode);

      // SECURITY: Token is in HTTP-only cookie, NOT in response
      const sellerData = response?.user || response?.data?.user;

      if (!sellerData || (!sellerData.id && !sellerData._id)) {
        throw new Error('2FA verification failed: No seller data received');
      }

      if (import.meta.env.DEV) {
        console.debug('✅ [Seller 2FA Login] 2FA verified, cookie set by backend');
        console.debug('👤 [Seller 2FA Login] Seller logged in:', {
          id: sellerData.id || sellerData._id,
          email: sellerData.email,
          name: sellerData.name || sellerData.shopName,
          role: sellerData.role,
        });
      }

      return { success: true, seller: sellerData };
    },
    onSuccess: (data) => {
      if (data?.success) {
        queryClient.setQueryData(["sellerAuth"], data.seller);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        if (import.meta.env.DEV) {
          console.debug('✅ [Seller 2FA Login] Auth state updated and queries invalidated');
        }
      }
    },
  });

  // Verify account with OTP (for new signups)
  const verifyAccount = useMutation({
    mutationFn: ({ email, otp }) => authApi.verifyAccount(email, otp),
    onSuccess: () => {
      // Invalidate auth query to refetch user data
      queryClient.invalidateQueries({ queryKey: ["sellerAuth"] });
    },
  });

  // Resend OTP
  const resendOtp = useMutation({
    mutationFn: ({ email }) => authApi.resendOtp(email),
    onError: (error) => {
      console.error("[useAuth] Error resending OTP:", error);
    },
  });

  const register = useMutation({
    mutationFn: async (registerData) => {
      const response = await authApi.register(registerData);
      return response; // Return full axios response
    },
    onSuccess: (response) => {
      // Axios response structure: response.data contains the API response
      const apiResponse = response?.data || response;
      const requiresVerification = apiResponse?.requiresVerification || apiResponse?.data?.requiresVerification;
      
      if (import.meta.env.DEV) {
        console.debug('[Seller Register] Registration response:', {
          requiresVerification,
          status: apiResponse?.status,
          message: apiResponse?.message,
        });
      }
      
      // If verification is required, don't set auth data yet
      if (!requiresVerification) {
        const seller = apiResponse?.data?.seller || apiResponse?.data?.data || apiResponse?.seller || apiResponse?.data || null;
        if (seller) {
          queryClient.setQueryData(["sellerAuth"], seller);
          if (import.meta.env.DEV) {
            console.debug("[useAuth] Registration successful - cookie set by backend");
          }
        }
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
      // SECURITY: Clear notification cache and cancel active queries on logout
      queryClient.removeQueries(["notifications"]);
      queryClient.cancelQueries({ queryKey: ["notifications"] });
      // SECURITY: No token storage to clear - cookies are managed by backend
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Logged out - cookie cleared by backend, notification cache cleared");
      }
      navigate("/login");
    },
    onError: (error) => {
      console.error("[useAuth] Logout error:", error);
      // Force clear local state even on error
      queryClient.removeQueries(["sellerAuth"]);
      queryClient.removeQueries(["notifications"]);
      queryClient.cancelQueries({ queryKey: ["notifications"] });
      navigate("/login");
    },
  });

  const update = useMutation({
    mutationFn: async (data) => await authApi.update(data),
    onSuccess: (response) => {
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Update success:", response);
      }
      const updatedSeller = response?.data?.seller || response?.data?.data || response?.data || null;
      
      if (updatedSeller) {
        queryClient.setQueryData(["sellerAuth"], (oldData) => ({
          ...oldData,
          ...updatedSeller,
        }));
      }
      
      // ✅ CRITICAL: Invalidate sellerStatus after update (documents/payment methods may have changed)
      queryClient.invalidateQueries({ queryKey: ['sellerStatus'] });
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Invalidated sellerStatus after update");
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
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Image update success:", response);
      }
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

  // ==================================================
  // UNIFIED EMAIL-ONLY PASSWORD RESET FLOW
  // ==================================================
  
  /**
   * Request Password Reset (Email Only)
   * Sends reset link to seller's email
   */
  const requestPasswordReset = useMutation({
    mutationFn: async (email) => {
      const response = await authApi.requestPasswordReset(email);
      return response;
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Password reset request sent:", data);
      }
    },
    onError: (error) => {
      console.error("[useAuth] Error requesting password reset:", error);
    },
  });

  /**
   * Reset Password with Token
   * Resets password using token from email link
   */
  const resetPasswordWithToken = useMutation({
    mutationFn: async ({ token, newPassword, confirmPassword }) => {
      const response = await authApi.resetPasswordWithToken(
        token,
        newPassword,
        confirmPassword
      );
      return response;
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Password reset successful:", data);
      }
      // Navigate to login page with success message
      navigate("/login", {
        state: {
          message:
            "Password reset successfully. Please login with your new password.",
        },
      });
    },
    onError: (error) => {
      console.error("[useAuth] Error resetting password:", error);
    },
  });

  // Legacy OTP-based password reset mutations (deprecated)
  const sendPasswordResetOtp = useMutation({
    mutationFn: async (loginId) => {
      const response = await authApi.sendPasswordResetOtp(loginId);
      return response;
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Password reset OTP sent:", data);
      }
    },
    onError: (error) => {
      console.error("[useAuth] Error sending password reset OTP:", error);
    },
  });

  const verifyPasswordResetOtp = useMutation({
    mutationFn: async ({ loginId, otp }) => {
      const response = await authApi.verifyPasswordResetOtp(loginId, otp);
      return response;
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Password reset OTP verified:", data);
      }
    },
    onError: (error) => {
      console.error("[useAuth] Error verifying password reset OTP:", error);
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ loginId, newPassword, resetToken }) => {
      const response = await authApi.resetPasswordWithOtp(
        loginId,
        newPassword,
        resetToken
      );
      return response;
    },
    onSuccess: (data) => {
      if (import.meta.env.DEV) {
        console.debug("[useAuth] Password reset successful:", data);
      }
    },
    onError: (error) => {
      console.error("[useAuth] Error resetting password:", error);
    },
  });

  return {
    // Auth state
    seller: validSeller,
    sellerData: validSeller ? sellerData : null,

    // Auth operations (mutation objects for components that need mutate/isPending/error)
    sendOtp,
    verifyOtp,
    login, // Mutation object with mutate, mutateAsync, isPending, error, etc.
    verify2FALogin, // Mutation object with mutate, mutateAsync, isPending, error, etc.
    verifyAccount,
    resendOtp,
    register,
    logout,
    update,
    imageUpdate,
    // Unified email-only password reset
    requestPasswordReset,
    resetPasswordWithToken,
    // Legacy OTP-based (deprecated)
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    refetchAuth,
    
    // Convenience functions for direct async calls
    loginAsync: async (email, password) => {
      return login.mutateAsync({ email, password });
    },
    verify2FALoginAsync: async (loginSessionId, twoFactorCode) => {
      return verify2FALogin.mutateAsync({ loginSessionId, twoFactorCode });
    },

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
    isSendingPasswordResetOtp: sendPasswordResetOtp.isPending,
    isVerifyingPasswordResetOtp: verifyPasswordResetOtp.isPending,
    isResettingPassword: resetPassword.isPending,
    isRequestingPasswordReset: requestPasswordReset.isPending,
    isResettingPasswordWithToken: resetPasswordWithToken.isPending,

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
    sendPasswordResetOtpError: sendPasswordResetOtp.error,
    verifyPasswordResetOtpError: verifyPasswordResetOtp.error,
    resetPasswordError: resetPassword.error,
    authError: sendPasswordResetOtp.error || verifyPasswordResetOtp.error || resetPassword.error,

    // Auth status
    isAuthenticated,
    isSeller: validSeller?.role === 'seller',
    status: validSeller?.status || 'pending',
  };
};

export default useAuth;
