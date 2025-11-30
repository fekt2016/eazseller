import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from '../../shared/services/analyticsApi';

export default function useAnalytics() {
  const useGetSellerProductViews = (sellerId, options = {}) => {
    return useQuery({
      queryKey: ["productViews", sellerId],
      queryFn: async () => {
        const { data } = await analyticsApi.getSellerProductViews(sellerId);
        return data;
      },
      ...options,
    });
  };
  const useGetProductViews = (productId, options = {}) => {
    return useQuery({
      queryKey: ["productViews", productId],
      queryFn: async () => {
        const { data } = await analyticsApi.getProductViews(productId);
        return data;
      },
      ...options,
    });
  };

  return {
    useGetProductViews,
    useGetSellerProductViews,
  };
}
