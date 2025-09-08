import api from "../service/api";
const authApi = {
  login: (credentials) => api.post("/seller/login", credentials),
  register: (userData) => api.post("/seller/register", userData),
  logout: () => api.post("/seller/logout"),
  getCurrentUser: async () => {
    const respone = await api.get("/seller/me");
    return respone;
  },
  forgotPassword: (email) => api.post("/seller/forgot-password", { email }),
  resetPassword: ({ token, password }) =>
    api.post(`/seller/reset-password/${token}`, { password }),
};

export default authApi;
