import api from './api';

export const productService = {
  uploadProductImage: async (file, onUploadProgress) => {
    const form = new FormData();
    form.append('image', file);
    const response = await api.post('/seller/products/upload-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      timeout: 60000,
    });
    return response?.data?.data;
  },

  getProductById: async (id) => {
    try {
      // Example implementation - replace with your actual API call
      const response = await api.get(`/product/${id}`);

      return response;
    } catch (err) {
      throw err; // Re-throw to allow calling code to handle
    }
  },

  // Additional common product service methods
  getAllProducts: async () => {
    const response = await api.get("/product");
    return response.data;
  },

  getAllProductsBySeller: async (sellerId, params = {}) => {
    const queryParams = { limit: params.limit ?? 200, page: params.page ?? 1 };
    const response = await api.get("/seller/me/products", { params: queryParams });
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
    try {
      // Check if productData is FormData (for image uploads)
      const isFormData = productData instanceof FormData;

      const response = await api.patch(`/product/${id}`, productData, {
        timeout: isFormData ? 120000 : 30000, // 2 minutes for FormData (images), 30s for regular updates
        headers: isFormData ? {
          "Content-Type": "multipart/form-data",
        } : undefined,
      });

      // Axios handles status codes differently than Fetch API
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Axios response data is in response.data
      return response.data;
    } catch (err) {
      throw err; // Re-throw for error boundary handling
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/seller/me/products/${id}`);

      return response;
    } catch (err) {
      throw err;
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await api.get(`/product/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
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
