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

  // Legacy login (keeping for backward compatibility if needed)
  login: async(credentials) => await api.post("/seller/login", credentials),
  
  register: async(userData) => await api.post("/seller/register", userData),
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
