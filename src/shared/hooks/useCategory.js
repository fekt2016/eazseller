import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from '../services/categoryApi';
import api from '../services/api';

const useCategory = () => {
  const queryClient = useQueryClient();

  // Get all categories - fetch all pages to ensure we get everything
  const getCategories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        let allCategories = [];
        let page = 1;
        let hasMore = true;
        const limit = 1000; // Fetch 1000 per page

        // Fetch all pages until we get everything
        while (hasMore) {
          const response = await categoryService.getAllCategories({
            limit,
            page,
          });

          // Handle different response structures from handleFactory.getAll
          // Backend returns: { status: 'success', results: [...], meta: {...} }
          const categories = response?.data?.results ||
            response?.data?.data?.results ||
            response?.data?.data ||
            response?.results ||
            response?.data ||
            [];

          // Get pagination info from meta
          const meta = response?.data?.meta || response?.meta || {};
          const total = meta.total || categories.length;
          const totalPages = meta.totalPages || Math.ceil(total / limit) || 1;

          if (Array.isArray(categories) && categories.length > 0) {
            allCategories = [...allCategories, ...categories];

            // Check if there are more pages
            hasMore = page < totalPages && categories.length === limit;
            page++;


          } else {
            hasMore = false;
          }

          // Safety limit to prevent infinite loops
          if (page > 100) {
            hasMore = false;
          }
        }

        // Return in the expected format
        return {
          data: {
            results: allCategories,
            total: allCategories.length,
          }
        };
      } catch (error) {
        throw error;
      }
    },
    staleTime: Infinity,
    retry: 2,
  });

  // Custom hook to get single category by ID
  const useCategoryById = (id) =>
    useQuery({
      queryKey: ["category", id],
      queryFn: async () => {
        if (!id) return null;
        try {
          const { data } = await categoryService.getCategory(id);
          return data || null;
        } catch (error) {
          throw new Error(`Failed to load category: ${error.message}`);
        }
      },
      enabled: !!id,
      staleTime: Infinity,
      retry: 2,
    });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post(
        "categories", // Your API endpoint
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await api.patch(`/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", variables.id] });
    },
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.removeQueries({ queryKey: ["category", deletedId] });
    },
  });
  const getParentCategories = useQuery({
    queryKey: ["parentCategories"],
    queryFn: async () => {
      try {
        const response = await categoryService.getParentCategories();


        return response;
      } catch (error) {
        throw error;
      }
    },
    staleTime: Infinity,
    retry: 2,
  });

  return {
    getCategories,
    getParentCategories,
    useCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};

export default useCategory;
