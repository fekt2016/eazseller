import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../services/reviewApi";
import { toast } from "react-toastify";

export const useGetSellerReviews = (params = {}) => {
  return useQuery({
    queryKey: ["seller-reviews", params],
    queryFn: async () => {
      const response = await reviewService.getSellerReviews(params);
      return response?.results || response?.data?.reviews || [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

export const useReplyToReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reply }) => {
      return await reviewService.replyToReview(id, reply);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-reviews"] });
      toast.success("Reply posted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to post reply");
    },
  });
};

