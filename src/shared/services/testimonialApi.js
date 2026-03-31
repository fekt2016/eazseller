import api from "./api";

export const testimonialService = {
  getMyTestimonial: async () => {
    const response = await api.get("/seller/testimonials/me");
    return response.data;
  },

  createTestimonial: async (data) => {
    const response = await api.post("/seller/testimonials", data);
    return response.data;
  },

  updateTestimonial: async (id, data) => {
    const response = await api.patch(`/seller/testimonials/${id}`, data);
    return response.data;
  },

  deleteTestimonial: async (id) => {
    const response = await api.delete(`/seller/testimonials/${id}`);
    return response.data;
  },

  getPublicTestimonials: async (params = {}) => {
    const response = await api.get("/seller/testimonials/public", { params });
    return response.data;
  },
};
