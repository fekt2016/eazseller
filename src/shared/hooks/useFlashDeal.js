import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import flashDealApi from "../services/flashDealApi";

export function useGetActiveFlashDeals() {
  return useQuery({
    queryKey: ["sellerFlashDeals"],
    queryFn: async () => {
      const res = await flashDealApi.getActiveFlashDeals();
      return res?.flashDeals ?? [];
    },
  });
}

export function useSubmitProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => flashDealApi.submitProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sellerFlashDeals"] });
      qc.invalidateQueries({ queryKey: ["myFlashSubmissions"] });
    },
  });
}

export function useGetMySubmissions(params) {
  return useQuery({
    queryKey: ["myFlashSubmissions", params],
    queryFn: async () => {
      const res = await flashDealApi.getMySubmissions(params);
      return res?.submissions ?? [];
    },
  });
}

export function useWithdrawSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (submissionId) =>
      flashDealApi.withdrawSubmission(submissionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myFlashSubmissions"] });
      qc.invalidateQueries({ queryKey: ["sellerFlashDeals"] });
    },
  });
}
