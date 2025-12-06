import api from './api';

export const variantService = {
  // Get all variants for a product
  getVariants: async (productId) => {
    try {
      const response = await api.get(`/product/${productId}/variants`);
      return response.data;
    } catch (err) {
      console.error("Error fetching variants:", err);
      throw err;
    }
  },

  // Get single variant by ID
  getVariant: async (productId, variantId) => {
    try {
      const response = await api.get(`/product/${productId}/variants/${variantId}`);
      return response.data;
    } catch (err) {
      console.error("Error fetching variant:", err);
      throw err;
    }
  },

  // Create a new variant
  createVariant: async (productId, variantData) => {
    try {
      const formData = new FormData();
      
      // Append variant data
      formData.append("name", variantData.name || "");
      formData.append("price", variantData.price?.toString() || "0");
      formData.append("stock", variantData.stock?.toString() || "0");
      formData.append("sku", variantData.sku || "");
      formData.append("status", variantData.status || "active");
      
      if (variantData.discount) {
        formData.append("discount", variantData.discount.toString());
      }
      
      // Append attributes
      if (variantData.attributes && Array.isArray(variantData.attributes)) {
        formData.append("attributes", JSON.stringify(variantData.attributes));
      }
      
      // Append images (use 'newImages' to match multer configuration)
      if (variantData.images && Array.isArray(variantData.images)) {
        variantData.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append(`newImages`, image);
          }
        });
      }
      
      const response = await api.post(`/product/${productId}/variants`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });
      
      return response.data;
    } catch (err) {
      console.error("Error creating variant:", err);
      const apiError = new Error(err.response?.data?.message || err.message);
      apiError.status = err.response?.status || 500;
      apiError.details = err.response?.data?.errors;
      throw apiError;
    }
  },

  // Update a variant
  updateVariant: async (productId, variantId, variantData) => {
    try {
      const formData = new FormData();
      
      // Append variant data
      if (variantData.name !== undefined) {
        formData.append("name", variantData.name);
      }
      if (variantData.price !== undefined) {
        formData.append("price", variantData.price.toString());
      }
      if (variantData.stock !== undefined) {
        formData.append("stock", variantData.stock.toString());
      }
      if (variantData.sku !== undefined) {
        formData.append("sku", variantData.sku);
      }
      if (variantData.status !== undefined) {
        formData.append("status", variantData.status);
      }
      if (variantData.discount !== undefined) {
        formData.append("discount", variantData.discount.toString());
      }
      
      // Append attributes
      if (variantData.attributes && Array.isArray(variantData.attributes)) {
        formData.append("attributes", JSON.stringify(variantData.attributes));
      }
      
      // Append new images (use 'newImages' to match multer configuration)
      if (variantData.images && Array.isArray(variantData.images)) {
        variantData.images.forEach((image) => {
          if (image instanceof File) {
            formData.append(`newImages`, image);
          }
        });
      }
      
      // Append images to delete
      if (variantData.imagesToDelete && Array.isArray(variantData.imagesToDelete)) {
        formData.append("imagesToDelete", JSON.stringify(variantData.imagesToDelete));
      }
      
      const response = await api.patch(`/product/${productId}/variants/${variantId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });
      
      return response.data;
    } catch (err) {
      console.error("Error updating variant:", err);
      const apiError = new Error(err.response?.data?.message || err.message);
      apiError.status = err.response?.status || 500;
      apiError.details = err.response?.data?.errors;
      throw apiError;
    }
  },

  // Delete a variant
  deleteVariant: async (productId, variantId) => {
    try {
      const response = await api.delete(`/product/${productId}/variants/${variantId}`);
      return response.data;
    } catch (err) {
      console.error("Error deleting variant:", err);
      throw err;
    }
  },
};

