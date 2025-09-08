import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import couponApi from "../service/couponApi";

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  const { mutate: createMutation } = useMutation({
    mutationFn: async (data) => {
      const response = await couponApi.createCoupon(data);
      return response;
    },
    onSuccess: (data) => {
      console.log("discount created successfully!!!", data);
      queryClient.invalidateQueries("coupon");
    },
  });
  return { createMutation };
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  const { mutate: couponDeleteMutation } = useMutation({
    mutationFn: async (data) => {
      const response = await couponApi.deleteCoupon(data);
      return response;
    },
    onSuccess: (data) => {
      console.log("discount deleted successfully!!!", data);
      queryClient.invalidateQueries("coupon");
    },
  });
  return { couponDeleteMutation };
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  const { mutate: updateMutation } = useMutation({
    mutationFn: async (data) => {
      const response = await couponApi.updateCoupon(data);
      return response;
    },
    onSuccess: (data) => {
      console.log("discount updated successfully!!!", data);
      queryClient.invalidateQueries("coupon");
    },
  });
  return { updateMutation };
};

export const useGetCouponBatch = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coupon"],

    queryFn: async () => {
      try {
        const response = await couponApi.getCoupons();
        console.log("response", response);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: (data) => {
      console.log("discount created successfully!!!", data);
    },
  });

  return { data, isLoading, isError };
};
export const useGetSellerCoupon = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sellerCoupons"],
    queryFn: async () => {
      try {
        const response = await couponApi.getSellerCoupon();

        return response;
      } catch (error) {
        console.log(error);
      }
    },
    onSuccess: (data) => {
      console.log("discount created successfully!!!", data);
    },
  });

  return { data, isLoading, isError };
};
