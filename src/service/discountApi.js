import api from "./api";
const discountApi = {
  createDiscount: async (data) => {
    const response = await api.post("/discount", data);
    return response;
  },
  getSellerDiscount: async () => {
    const response = await api.get("/discount");
    return response;
  },
  deleteDiscount: async (id) => {
    const response = await api.delete(`/discount/${id}`);
    return response;
  },
  updateDiscount: async ({ id, data }) => {
    console.log("api data", data);
    const response = await api.patch(`/discount/${id}`, data);
    return response;
  },
};
export default discountApi;
