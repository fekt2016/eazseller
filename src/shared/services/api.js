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

// Ensure baseURL doesn't have trailing slash
const normalizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

// Create axios instance with cookie-based authentication
const api = axios.create({
  baseURL: normalizedBaseURL,
  withCredentials: true, // Enable cookie-based authentication
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";
  
  // Log full URL for debugging
  const fullURL = `${config.baseURL}${config.url}`;
  console.debug(`[API] ${method.toUpperCase()} ${normalizedPath} (Full URL: ${fullURL})`);
  
  // Special logging for send-otp requests
  if (normalizedPath.includes('send-otp')) {
    console.log('[API] 🔍 Send OTP Request Details:', {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: fullURL,
      method: method,
      normalizedPath: normalizedPath,
    });
  }

  // Skip authentication for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // Cookie-based authentication: JWT is automatically sent via withCredentials: true
  // Backend will read from req.cookies.jwt (or req.cookies.seller_jwt for seller routes)
  // FALLBACK: Also check localStorage for token and send as Authorization header
  // This provides redundancy in case cookies fail (CORS, domain issues, etc.)
  
  // Check if this is a seller route
  const isSellerRoute = normalizedPath.startsWith('/seller');
  
  // Try to get token from localStorage as fallback
  let token = null;
  if (typeof window !== 'undefined') {
    // Check for seller token
    if (isSellerRoute) {
      token = localStorage.getItem('seller_token') || 
              localStorage.getItem('sellerAccessToken') ||
              localStorage.getItem('seller_jwt') ||
              null;
    }
    
    // If token found in localStorage, add as Authorization header (fallback)
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] 🔑 Using localStorage token as Authorization header fallback for ${method.toUpperCase()} ${normalizedPath}`);
    }
  }
  
  console.debug(`[API] Cookie will be sent automatically for ${method.toUpperCase()} ${normalizedPath}`);
  if (token) {
    console.debug(`[API] Authorization header also attached (fallback from localStorage)`);
  }
  
  // Enhanced logging for verify-otp requests
  if (normalizedPath.includes('verify-otp')) {
    console.log(`[API] 🔍 Verify OTP request details:`, {
      withCredentials: config.withCredentials,
      baseURL: config.baseURL,
      hasAuthorizationHeader: !!config.headers.Authorization,
      hasTokenInLocalStorage: !!token,
      url: config.url,
      method: config.method
    });
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced logging for verify-otp errors
    const isVerifyOtpError = error.config?.url?.includes('verify-otp');
    
    if (isVerifyOtpError) {
      console.error('═══════════════════════════════════════════════════════════');
      console.error('[API Interceptor] ❌ FULL ERROR DETAILS FOR verify-otp');
      console.error('═══════════════════════════════════════════════════════════');
      console.error('[API Interceptor] Error Response:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data
      });
      console.error('[API Interceptor] Error Config:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: {
          ...error.config?.headers,
          Authorization: error.config?.headers?.Authorization ? 'Bearer ***' : 'missing'
        },
        withCredentials: error.config?.withCredentials
      });
      console.error('[API Interceptor] Full Error Object:', error);
      console.error('═══════════════════════════════════════════════════════════');
    }
    
    // Handle session expiration
    // if (error.response?.status === 401) {
    //   console.warn("[API] Session expired or unauthorized - cookie may be missing or invalid");
    //   console.warn("[API] ⚠️ 401 Error detected - DO NOT AUTO-LOGOUT (disabled for debugging)");
      
    //   // TEMPORARILY DISABLED - Don't clear auth data automatically
    //   // Clear any stale auth data from React Query
    //   // Note: We don't clear localStorage tokens here since we're using cookies
    //   // The cookie is cleared by the backend on logout
      
    //   // OLD CODE - COMMENTED OUT
    //   // queryClient.setQueryData(["sellerAuth"], null);
    // }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message || error.message || "Request failed";

    if (isVerifyOtpError) {
      console.error(`[API Interceptor] Error Message: ${errorMessage}`);
    } else {
      console.error(`[API] Error: ${errorMessage}`, {
        url: error.config?.url,
        status: error.response?.status,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
