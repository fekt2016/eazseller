import api from './api';

const authApi = {
  // OTP-based authentication
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

  // Login with email + password (new flow - matches buyer/saysayseller)
  login: async (email, password) => {
    // Normalize email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();
    console.log('🔐 [Seller Login] Attempting login with email:', normalizedEmail);
    const response = await api.post('/seller/login', { email: normalizedEmail, password });
    console.log('🔐 [Seller Login] Response status:', response.data?.status);
    return response.data;
  },

  // Verify 2FA code for login (matches buyer/saysayseller)
  verify2FALogin: async (loginSessionId, twoFactorCode) => {
    console.log('🔐 [Seller 2FA Login] Verifying 2FA code');
    const response = await api.post('/seller/verify-2fa-login', {
      loginSessionId,
      twoFactorCode,
    });
    console.log('🔐 [Seller 2FA Login] Response status:', response.data?.status);
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
  
  forgotPassword: (email) => api.post("/seller/forgot-password", { email }),
  resetPassword: ({ token, password }) =>
    api.post(`/seller/reset-password/${token}`, { password }),
};

export default authApi;
