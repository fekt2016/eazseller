import api from '../../shared/services/api';

export const productService = {
  getProductById: async (id) => {
    // Example implementation - replace with your actual API call
    const response = await api.get(`/product/${id}`);
    return response;
  },

  // Additional common product service methods
  getAllProducts: async () => {
    const response = await api.get("/product");
    return response.data;
  },

  getAllProductsBySeller: async () => {
    const response = await api.get("/seller/me/products");
    return response.data;
  },
  createProduct: async (formData) => {
    try {
      const response = await api.post("product", formData, {
        timeout: 60000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status < 200 || response.status >= 300) {
        const errorData = response.data?.error || response.data;
        const error = new Error(
          errorData?.message || `Request failed with status ${response.status}`
        );
        error.details = errorData?.errors;
        throw error;
      }

      return response.data;
    } catch (err) {
      const apiError = new Error(err.response?.data?.message || err.message);
      apiError.status = err.response?.status || 500;
      apiError.details = err.response?.data?.errors;
      throw apiError;
    }
  },
  updateProduct: async (id, productData) => {
    const response = await api.patch(`/product/${id}`, productData);

    // Axios handles status codes differently than Fetch API
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Axios response data is in response.data
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/product/${id}`);
    return response;
  },

  searchProducts: async (query) => {
    const response = await api.get(`/product/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  getProductCountByCategory: async () => {
    const response = await api.get("/product/category-counts");
    return response.data;
  },
  getAllPublicProductsBySeller: async (sellerId) => {
    const response = await api.get(`/product/${sellerId}/public`);
    return response.data;
  },
  getProductsByCategory: async (categoryId, queryParams) => {
    const response = await api.get(
      `/product/category/${categoryId}?${queryParams.toString()}`
    );
    return response.data;
  },
};
