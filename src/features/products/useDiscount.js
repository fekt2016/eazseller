import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import discountApi from '../../shared/services/discountApi';
export const useGetsellerDiscount = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["discount"],

    queryFn: async () => {
      try {
        const response = await discountApi.getSellerDiscount();

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

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  const {
    mutate: createDiscount,
    isLoading,
    isError,
  } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
      const response = await discountApi.createDiscount(data);
      return response;
    },
    onSuccess: (data) => {
      console.log("discount created successfully!!!", data);
      queryClient.invalidateQueries("discounts");
    },
  });

  return { createDiscount, isLoading, isError };
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  const {
    mutate: updateDiscount,
    isLoading,
    isError,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log("data", data, id);
      const response = await discountApi.updateDiscount({ id, data });
      return response;
    },
    onSuccess: (data) => {
      console.log("discount updated successfully!!!", data);
      queryClient.invalidateQueries("discounts");
    },
  });

  return { updateDiscount, isLoading, isError };
};

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();
  const {
    mutate: deleteDiscount,
    isLoading,
    isError,
  } = useMutation({
    mutationFn: async (data) => {
      console.log("data", data);
      const response = await discountApi.deleteDiscount(data);
      return response;
    },
    onSuccess: (data) => {
      console.log("discount deleted successfully!!!", data);
      queryClient.invalidateQueries("discounts");
    },
  });

  return { deleteDiscount, isLoading, isError };
};

export const useGetDiscount = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["discount"],

    queryFn: async () => {
      try {
        const response = await discountApi.getDiscount();

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
