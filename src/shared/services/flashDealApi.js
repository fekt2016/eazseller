import api from "./api";

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

const flashDealApi = {
  async getActiveFlashDeals() {
    const response = await api.get("/seller/flash-deals");
    return unwrap(response);
  },

  async submitProduct(data) {
    const response = await api.post("/seller/flash-deals/submit", data);
    return unwrap(response);
  },

  async getMySubmissions(params = {}) {
    const response = await api.get("/seller/flash-deals/my-submissions", {
      params,
    });
    return unwrap(response);
  },

  async withdrawSubmission(submissionId) {
    const response = await api.delete(
      `/seller/flash-deals/submissions/${submissionId}`
    );
    return unwrap(response);
  },
};

export default flashDealApi;
