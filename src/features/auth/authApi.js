import api from '../../shared/services/api';

const authApi = {
  // Login with email + password (new flow - matches EazMain/Saysay)
  login: async (email, password) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    
    // SECURITY: Ensure we're sending a proper JSON object
    // Validate inputs before creating the object
    if (!normalizedEmail || typeof normalizedEmail !== 'string') {
      throw new Error('Email must be a valid string');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a valid string');
    }
    
    const loginData = {
      email: normalizedEmail,
      password: password,
    };
    
    // SECURITY: Verify loginData is an object before sending
    if (typeof loginData !== 'object' || Array.isArray(loginData) || loginData === null) {
      throw new Error('Login data must be a plain object');
    }
    
    if (import.meta.env.DEV) {
      console.log('[Seller AuthAPI] Login request:', { 
        email: normalizedEmail, 
        endpoint: '/seller/login',
        dataType: typeof loginData,
        isObject: typeof loginData === 'object' && !Array.isArray(loginData),
        hasEmail: 'email' in loginData,
        hasPassword: 'password' in loginData,
        keys: Object.keys(loginData),
      });
    }
    
    try {
      // SECURITY: Explicitly ensure data is sent as JSON object
      // Do NOT stringify - axios will handle JSON serialization
      const response = await api.post("/seller/login", loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (import.meta.env.DEV) {
        console.log('[Seller AuthAPI] Login response:', response.data?.status || 'success');
      }
      return response;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Seller AuthAPI] Login error details:', {
          message: error.message,
          dataType: typeof loginData,
          isObject: typeof loginData === 'object',
          config: error.config ? {
            url: error.config.url,
            method: error.config.method,
            dataType: typeof error.config.data,
            dataPreview: typeof error.config.data === 'string' 
              ? error.config.data.substring(0, 100) 
              : error.config.data,
          } : null,
        });
      }
      throw error;
    }
  },

  // Verify 2FA code for login (matches EazMain/Saysay)
  verify2FALogin: async (loginSessionId, twoFactorCode) => {
    console.log('[Seller AuthAPI] Verify 2FA request');
    const response = await api.post("/seller/verify-2fa-login", {
      loginSessionId,
      twoFactorCode,
    });
    console.log('[Seller AuthAPI] Verify 2FA response:', response.data?.status || 'success');
    return response;
  },

  // OTP-based authentication (kept for backward compatibility - used for password reset, etc.)
  sendOtp: async (loginId) => {
    try {
      console.log('[Seller AuthAPI] Sending OTP request:', { loginId, endpoint: '/seller/send-otp' });
      const response = await api.post("/seller/send-otp", { loginId });
      console.log('[Seller AuthAPI] OTP send success:', response.data);
      return response;
    } catch (error) {
      console.error('[Seller AuthAPI] OTP send error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      });
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

  // Verify account with email and OTP (for new signups)
  verifyAccount: async (email, otp) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    const response = await api.post("/seller/verify-account", {
      email: normalizedEmail,
      otp,
    });
    return response;
  },
  
  // Resend OTP for account verification
  resendOtp: async (email) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    const response = await api.post("/seller/resend-otp", { email: normalizedEmail });
    return response;
  },

  register: async (userData) => {
    // Normalize email to lowercase to match database storage
    const normalizedData = {
      ...userData,
      email: userData.email?.toLowerCase().trim(),
    };
    const response = await api.post("/seller/signup", normalizedData);
    return response; // Return full axios response
  },

  logout: () => api.post("/seller/logout"),
  
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
  
  updateSellerImage: async (formData) => {
    return await api.patch("/seller/updateSellerImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  
  // ==================================================
  // UNIFIED EMAIL-ONLY PASSWORD RESET FLOW
  // ==================================================
  
  /**
   * Request Password Reset (Email Only)
   * POST /api/v1/seller/forgot-password
   * Body: { email: "seller@example.com" }
   */
  requestPasswordReset: async (email) => {
    const response = await api.post("/seller/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset Password with Token
   * POST /api/v1/seller/reset-password
   * Body: { token: "reset_token", newPassword: "newpass123", confirmPassword: "newpass123" }
   */
  resetPasswordWithToken: async (token, newPassword, confirmPassword) => {
    const response = await api.post("/seller/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Legacy endpoints (kept for backward compatibility)
  forgotPassword: (email) => api.post("/seller/forgotPassword", { email }),
  resetPassword: ({ token, password }) =>
    api.post(`/seller/reset-password/${token}`, { password }),

  // Legacy OTP-based password reset (deprecated)
  sendPasswordResetOtp: async (loginId) => {
    const response = await api.post("/seller/forgot-password", { loginId });
    return response.data;
  },

  verifyPasswordResetOtp: async (loginId, otp) => {
    const response = await api.post("/seller/verify-reset-otp", {
      loginId,
      otp,
    });
    return response.data;
  },

  resetPasswordWithOtp: async (loginId, newPassword, resetToken = null) => {
    const payload = { loginId, newPassword };
    if (resetToken) {
      payload.resetToken = resetToken;
    }
    const response = await api.post("/seller/reset-password", payload);
    return response.data;
  },
};

export default authApi;
