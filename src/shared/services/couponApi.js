import api from './api';

const couponApi = {
  createCoupon: async (couponData) => {
    const response = await api.post("/seller/coupon", couponData);
    return response.data;
  },
  getCoupons: async () => {
    const response = await api.get("/seller/coupon");
    return response.data;
  },
  deleteCoupon: async (couponId) => {
    const response = await api.delete(`/seller/coupon/${couponId}`);
    return response.data;
  },
  updateCoupon: async (data) => {
    console.log("couponData", data.id);
    // Extract id and send rest as update data
    const { id, ...updateData } = data;
    const response = await api.patch(`/seller/coupon/${id}`, updateData);
    return response.data;
  },
  getCouponById: async (couponId) => {
    const response = await api.get(`/seller/coupon/${couponId}`);
    return response.data;
  },
  getSellerCoupon: async () => {
    const response = await api.get("/seller/coupon/");
    return response.data;
  },
  getEligibleBuyers: async () => {
    const response = await api.get("/seller/coupon/eligible-buyers");
    return response.data;
  },
  sendCouponEmail: async (data) => {
    const response = await api.post("/seller/coupon/send-email", data);
    return response.data;
  },
};
export default couponApi;
