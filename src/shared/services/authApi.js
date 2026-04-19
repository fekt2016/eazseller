import api from './api';

const authApi = {
  // OTP-based authentication
  sendOtp: async (loginId) => {
    try {
      const response = await api.post("/seller/send-otp", { loginId });
      return response;
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (loginId, otp, password, redirectTo = '/') => {
    const response = await api.post("/seller/verify-otp", {
      loginId,
      otp,
      password,
      redirectTo,
    });
    return response;
  },

  // Login with email + password (new flow - matches buyer/saysayseller)
  login: async (email, password) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    // Increase timeout for login requests (30 seconds) to handle slow device session creation
    const response = await api.post('/seller/login', { email: normalizedEmail, password }, {
      timeout: 30000, // 30 seconds for login
    });
    return response.data;
  },

  // Verify 2FA code for login (matches buyer/saysayseller)
  verify2FALogin: async (loginSessionId, twoFactorCode) => {
    const response = await api.post('/seller/verify-2fa-login', {
      loginSessionId,
      twoFactorCode,
    });
    return response.data;
  },
  
  // Verify account with email and OTP (for new signups)
  verifyAccount: async (email, otp) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    const response = await api.post('/seller/verify-account', {
      email: normalizedEmail,
      otp,
    });
    return response;
  },
  
  // Resend OTP for account verification
  resendOtp: async (email) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    const response = await api.post('/seller/resend-otp', { email: normalizedEmail });
    return response;
  },

  register: async (userData) => {
    // Normalize email to lowercase to match database storage
    const normalizedData = {
      ...userData,
      email: userData.email?.toLowerCase().trim(),
    };
    const response = await api.post('/seller/signup', normalizedData);
    return response; // Return full axios response
  },
  
  logout: () => api.post('/seller/logout'),
  
  getCurrentUser: async () => {
    const response = await api.get("/seller/me");
    return response;
  },
  
  update: async (data) => {
    // If data is FormData, let axios handle the Content-Type header automatically
    if (data instanceof FormData) {
      return api.patch("/seller/updateMe", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    // Otherwise, send as JSON
    return await api.patch("/seller/updateMe", data);
  },
  
  updateSellerImage: async(formData) => {
    return await api.patch("/seller/updateSellerImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // Unified email-only password reset API (used by shared useAuth hook)
  requestPasswordReset: async (email) => {
    const response = await api.post("/seller/forgot-password", { email });
    return response.data;
  },

  resetPasswordWithToken: async (token, newPassword, confirmPassword) => {
    const response = await api.post("/seller/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Legacy endpoints (kept for backward compatibility)
  forgotPassword: (email) => api.post("/seller/forgot-password", { email }),
  resetPassword: ({ token, password }) =>
    api.post(`/seller/reset-password/${token}`, { password }),

  // Legacy OTP-based password reset methods (used by deprecated hook paths)
  sendPasswordResetOtp: async (loginId) => {
    const response = await api.post("/seller/forgot-password", { loginId });
    return response.data;
  },

  verifyPasswordResetOtp: async (loginId, otp) => {
    const response = await api.post("/seller/verify-reset-otp", { loginId, otp });
    return response.data;
  },

  resetPasswordWithOtp: async (loginId, newPassword, resetToken = null) => {
    const payload = { loginId, newPassword };
    if (resetToken) payload.resetToken = resetToken;
    const response = await api.post("/seller/reset-password", payload);
    return response.data;
  },

  /** Seller settings: set own account status to deactive. Only 'deactive' is allowed. */
  updateMyStatus: async (status) => {
    const response = await api.patch("/seller/me/status", { status: status || "deactive" });
    return response.data;
  },
};

export default authApi;
