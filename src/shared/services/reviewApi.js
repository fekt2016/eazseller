import api from "./api";

export const reviewService = {
  /**
   * Get reviews for seller's products
   * GET /api/v1/seller/reviews
   */
  getSellerReviews: async (params = {}) => {
    try {
      const response = await api.get("/seller/reviews", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching seller reviews:", error);
      throw error;
    }
  },

  /**
   * Reply to a review
   * POST /api/v1/review/:id/reply
   */
  replyToReview: async (id, reply) => {
    try {
      const response = await api.post(`/review/${id}/reply`, { reply });
      return response.data;
    } catch (error) {
      console.error(`Error replying to review ${id}:`, error);
      throw error;
    }
  },
};

