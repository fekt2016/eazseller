import axios from "axios";

// Determine base URL based on subdomain
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== "undefined") {
    const hostParts = window.location.hostname.split(".");

    // Local development
    if (hostParts.includes("localhost")) {
      return "http://localhost:4000/api/v1";
    }

    // Seller subdomain handling
    const subdomain = hostParts[0];
    if (subdomain === "seller") {
      return "https://eazworld.com/api/v1";
    }

    // Default production API
    return "https://eazworld.com/api/v1";
  }

  return "http://localhost:4000/api/v1";
};

const baseURL = getBaseURL();

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/seller/login",
  "/seller/register",
  "/seller/send-otp",
  "/seller/verify-otp",
  "/categories/parents",
];

const PUBLIC_GET_ENDPOINTS = [
  /^\/seller\/[^/]+\/public-profile$/,
  /^\/seller\/public\/[^/]+$/,
  /^\/product\/[a-fA-F\d]{24}$/,
  /^\/category\/[^/]+$/,
];

// Helper functions
const getRelativePath = (url) => {
  try {
    if (url.startsWith("http")) {
      const parsedUrl = new URL(url);
      const baseUrlObj = new URL(baseURL);
      let path = parsedUrl.pathname;

      if (path.startsWith(baseUrlObj.pathname)) {
        path = path.substring(baseUrlObj.pathname.length);
      }

      return path;
    }
    return url.split("?")[0];
  } catch (e) {
    console.error("Error parsing URL:", e);
    return url;
  }
};

const normalizePath = (path) => {
  if (!path) return "/";
  let normalized = path.split("?")[0].split("#")[0];
  normalized = normalized.replace(/\/+$/, "") || "/";
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

const isPublicRoute = (normalizedPath, method) => {
  // Check exact path matches
  if (PUBLIC_ROUTES.includes(normalizedPath)) {
    return true;
  }

  // Check regex patterns for GET requests
  if (method === "get") {
    return PUBLIC_GET_ENDPOINTS.some((pattern) => pattern.test(normalizedPath));
  }

  return false;
};

// Create axios instance with cookie-based authentication
const api = axios.create({
  baseURL,
  withCredentials: true, // Enable cookie-based authentication
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";

  console.debug(`[API] ${method.toUpperCase()} ${normalizedPath}`);

  // Skip authentication for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // Cookie-based authentication: JWT is automatically sent via withCredentials: true
  // Backend will read from req.cookies.jwt (or req.cookies.seller_jwt for seller routes)
  // No need to manually attach Authorization header - cookie is sent automatically
  console.debug(`[API] Cookie will be sent automatically for ${method.toUpperCase()} ${normalizedPath}`);

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle session expiration
    if (error.response?.status === 401) {
      console.warn("[API] Session expired or unauthorized - cookie may be missing or invalid");
      
      // Clear any stale auth data from React Query
      // Note: We don't clear localStorage tokens here since we're using cookies
      // The cookie is cleared by the backend on logout
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message || error.message || "Request failed";

    console.error(`[API] Error: ${errorMessage}`, {
      url: error.config?.url,
      status: error.response?.status,
    });

    return Promise.reject(error);
  }
);

export default api;
