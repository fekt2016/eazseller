import api from "./api";

const couponApi = {
  createCoupon: async (couponData) => {
    const response = await api.post("/coupon", couponData);
    return response.data;
  },
  getCoupons: async () => {
    const response = await api.get("/coupon");
    return response.data;
  },
  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/coupon/${couponId}`);
    return response.data;
  },
  updateCoupon: async (data) => {
    console.log("couponData", data.id);
    const response = await api.patch(`/coupon/${data.id}`, data);
    return response.data;
  },
  getCouponById: async (couponId) => {
    const response = await api.get(`/coupon/${couponId}`);
    return response.data;
  },
  getSellerCoupon: async () => {
    const response = await api.get("/coupon/");
    return response.data;
  },
};
export default couponApi;
