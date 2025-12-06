import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { variantService } from '../../services/variantApi';

const useVariants = () => {
  const queryClient = useQueryClient();

  // Get all variants for a product
  const getVariants = (productId) => {
    return useQuery({
      queryKey: ["variants", productId],
      queryFn: async () => {
        if (!productId) return null;
        try {
          const response = await variantService.getVariants(productId);
          return response.data || response;
        } catch (error) {
          console.error(`Failed to fetch variants for product ${productId}:`, error);
          throw new Error(`Failed to load variants: ${error.message}`);
        }
      },
      enabled: !!productId,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    });
  };

  // Get single variant by ID
  const getVariant = (productId, variantId) => {
    return useQuery({
      queryKey: ["variants", productId, variantId],
      queryFn: async () => {
        if (!productId || !variantId) return null;
        try {
          const response = await variantService.getVariant(productId, variantId);
          return response.data || response;
        } catch (error) {
          console.error(`Failed to fetch variant ${variantId}:`, error);
          throw new Error(`Failed to load variant: ${error.message}`);
        }
      },
      enabled: !!productId && !!variantId,
      staleTime: 1000 * 60 * 5,
      retry: 2,
    });
  };

  // Create variant mutation
  const createVariant = useMutation({
    mutationFn: ({ productId, body }) => variantService.createVariant(productId, body),
    onSuccess: (data, variables) => {
      // Invalidate variants list for the product
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      // Also invalidate product queries to update total stock
      queryClient.invalidateQueries({ queryKey: ["products", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Create variant error:", error);
    },
  });

  // Update variant mutation
  const updateVariant = useMutation({
    mutationFn: ({ productId, variantId, body }) =>
      variantService.updateVariant(productId, variantId, body),
    onSuccess: (data, variables) => {
      // Invalidate specific variant
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.productId, variables.variantId],
      });
      // Invalidate variants list
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      // Invalidate product queries
      queryClient.invalidateQueries({ queryKey: ["products", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Update variant error:", error);
    },
  });

  // Delete variant mutation
  const deleteVariant = useMutation({
    mutationFn: ({ productId, variantId }) =>
      variantService.deleteVariant(productId, variantId),
    onSuccess: (data, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: ["variants", variables.productId, variables.variantId],
      });
      // Invalidate variants list
      queryClient.invalidateQueries({ queryKey: ["variants", variables.productId] });
      // Invalidate product queries
      queryClient.invalidateQueries({ queryKey: ["products", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("Delete variant error:", error);
    },
  });

  return {
    getVariants,
    getVariant,
    createVariant: {
      mutate: createVariant.mutate,
      mutateAsync: createVariant.mutateAsync,
      isPending: createVariant.isPending,
      error: createVariant.error,
      data: createVariant.data,
    },
    updateVariant: {
      mutate: updateVariant.mutate,
      mutateAsync: updateVariant.mutateAsync,
      isPending: updateVariant.isPending,
      error: updateVariant.error,
      data: updateVariant.data,
    },
    deleteVariant: {
      mutate: deleteVariant.mutate,
      mutateAsync: deleteVariant.mutateAsync,
      isPending: deleteVariant.isPending,
      error: deleteVariant.error,
      data: deleteVariant.data,
    },
  };
};

export default useVariants;

