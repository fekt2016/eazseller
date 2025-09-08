import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import authApi from "../service/authApi";

import { useNavigate } from "react-router-dom";

const validateToken = (token) => {
  if (!token) {
    console.log("No token found");
    return false;
  }
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    const isValid = exp * 1000 > Date.now();

    return isValid;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};
// const validateToken = (token) => {
//   if (!token) {
//     console.log("No token found");
//     return false;
//   }

//   try {
//     // Split token and decode payload
//     const parts = token.split(".");
//     if (parts.length !== 3) {
//       console.error("Invalid token format");
//       return false;
//     }

//     const payload = JSON.parse(atob(parts[1]));
//     if (!payload.exp) {
//       console.error("Token missing expiration");
//       return false;
//     }

//     // Check expiration
//     const isValid = payload.exp * 1000 > Date.now();
//     console.log(`Token valid: ${isValid}`);
//     return isValid;
//   } catch (error) {
//     console.error("Token validation error:", error);
//     return false;
//   }
// };

const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sellerTokenExists = !!localStorage.getItem("seller_token");

  const {
    data: seller,
    isLoading: isSellerLoading,
    error: sellerError,
  } = useQuery({
    queryKey: ["sellerAuth"],
    queryFn: async () => {
      const token = localStorage.getItem("seller_token");

      if (!token || !validateToken(token)) {
        localStorage.removeItem("seller_token");
        return null;
      }

      try {
        const response = await authApi.getCurrentUser();
        return response.data.data.data;
      } catch (error) {
        console.error("Get current user error:", error);
        throw error;
      }
    },
    enabled: sellerTokenExists, // Only run if token exists
    onSuccess: (data) => {
      console.log("User data:", data);
    },
    staleTime: Infinity,
    retry: false,
  });

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log("Login data", data);
      const { user: seller } = data.data.data;
      const token = data?.data.token;
      // Validate token before storing
      if (!validateToken(token)) {
        console.error("Received invalid token from server");
        return;
      }
      localStorage.removeItem("token");
      localStorage.removeItem("admin_token");
      localStorage.setItem("seller_token", token);
      localStorage.setItem("current_role", "seller"); // Push role to localStorage

      queryClient.setQueryData(["sellerAuth"], seller);

      console.log("Login successfully!!!:", seller);

      // localStorage.setItem("seller_token", data.data.token);
    },
    onError: (error) => {
      console.error("Login error:", error);
      queryClient.setQueryData(["sellerAuth"], null);
      localStorage.removeItem("seller_token");
    },
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      const { user } = data.data.data;
      const token = data?.data.token;
      console.log("Register successfully!!!:", user);

      localStorage.setItem("seller_token", token);
      queryClient.setQueryData(["sellerAuth"], user);
      navigate("/seller/dashboard");
      if (!validateToken(token)) {
        console.error("Received invalid token from server");
        return;
      }
    },
    onError: (error) => {
      console.error("Register error:", error);
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onMutate: () => {
      // Immediate UI update before request completes
      queryClient.setQueryData(["sellerAuth"], null);
    },
    onSuccess: (data) => {
      // Handle backend's clearLocalStorage action
      if (data.action === "clearLocalStorage") {
        localStorage.removeItem("seller_token");
        localStorage.removeItem("seller_refresh_token");
        localStorage.removeItem("seller_user");
      }

      // Clear all seller-related queries
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === "seller" || query.queryKey.includes("seller"),
      });

      // Redirect to login
      navigate("login");

      // Show success notification
      // toast.success(data.message || "Logged out successfully");
    },
    onError: (error) => {
      console.error("Logout error:", error);

      // Force clear local storage even on error
      localStorage.removeItem("seller_token");

      // Show error notification
      // toast.error(
      //   error.response?.data?.message || "Logout failed. Please try again."
      // );
    },
    onSettled: () => {
      // Final cleanup after success or error
      queryClient.removeQueries(["sellerAuth"]);
    },
  });

  const update = useMutation({
    mutationFn: (data) => authApi.update(data),
    onSuccess: (response) => {
      console.log("Update success:", response);
      const updatedSeller = response.data.seller;
      queryClient.setQueryData(["sellerAuth"], (oldData) => ({
        ...oldData,
        avatar: updatedSeller.avatar,
      }));
      queryClient.invalidateQueries(["seller", seller.id]);
    },
    onError: (error) => {
      console.error("Update error:", error);
    },
  });

  const imageUpdate = useMutation({
    mutationFn: (formData) => {
      return authApi.updateSellerImage(formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: (response) => {
      console.log("Image update success:", response);
      const updatedSeller = response?.data.data;
      queryClient.setQueryData(["sellerAuth"], (oldData) => ({
        ...oldData,
        avatar: updatedSeller.avatar,
      }));
    },
    onError: (error) => {
      console.error(
        "Image update error:",
        error.response?.data || error.message
      );
    },
  });

  return {
    seller,
    login,
    register,
    logout,
    update,
    isSellerLoading: isSellerLoading,
    isLoginLoading: login.isLoading,
    isRegisterLoading: register.isLoading,
    isLogoutLoading: logout.isLoading,
    isUpdateLoading: update.isLoading,
    isLoading:
      isSellerLoading ||
      login.isLoading ||
      register.isLoading ||
      logout.isLoading ||
      update.isLoading ||
      imageUpdate.isLoading,
    isImageUpdateLoading: imageUpdate.isLoading,
    isError: login.isError || register.isError,
    imageUpdate,
    isAuthenticated: !!seller,
    isSeller: seller?.role === "seller",
    status: seller?.status || "pending",
    error: sellerError,
  };
};

export default useAuth;
