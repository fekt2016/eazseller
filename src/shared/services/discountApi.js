import api from './api';
const discountApi = {
  createDiscount: async (data) => {
    const response = await api.post("/seller/discount", data);
    return response;
  },
  getSellerDiscount: async () => {
    const response = await api.get("/seller/discount");
    return response;
  },
  deleteDiscount: async (id) => {
    const response = await api.delete(`/seller/discount/${id}`);
    return response;
  },
  updateDiscount: async ({ id, data }) => {
    console.log("api data", data);
    const response = await api.patch(`/seller/discount/${id}`, data);
    return response;
  },
};
export default discountApi;
