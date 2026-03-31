import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { testimonialService } from "../services/testimonialApi";
import { toast } from "react-toastify";

export const useGetMyTestimonial = () => {
  return useQuery({
    queryKey: ["my-testimonial"],
    queryFn: async () => {
      const response = await testimonialService.getMyTestimonial();
      return response?.data?.testimonial || null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => testimonialService.createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-testimonial"] });
      toast.success("Testimonial submitted! It will be visible once approved.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit testimonial");
    },
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => testimonialService.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-testimonial"] });
      toast.success("Testimonial updated! It will be re-reviewed.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update testimonial");
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => testimonialService.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-testimonial"] });
      toast.success("Testimonial deleted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete testimonial");
    },
  });
};

export const useGetPublicTestimonials = (params = {}) => {
  return useQuery({
    queryKey: ["public-testimonials", params],
    queryFn: async () => {
      const response = await testimonialService.getPublicTestimonials(params);
      return response?.data?.testimonials || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};
