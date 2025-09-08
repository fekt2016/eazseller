import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import addressApi from "../service/addressApi";

export const useGetUserAddress = () => {
  return useQuery({
    queryKey: ["address"],
    queryFn: async () => {
      const res = await addressApi.getUserAddresses();
      return res;
    },
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (addressData) => addressApi.createUserAddress(addressData),
    onSuccess(data) {
      console.log("address created succesfully!!!!", data);
      queryClient.invalidateQueries(["address"]);
    },
  });
};

export const useDeleteAddress = (addressId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addressApi.deleteUserAddress(addressId),
    onSuccess(data) {
      console.log(data);
      queryClient.getQueryData(["address"]);
    },
  });
};

export const useUpdateAddress = () => {};
