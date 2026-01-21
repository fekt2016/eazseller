import axios from "axios";

// Determine base URL based on environment and hostname
// In development (localhost), ALWAYS use local backend (http://localhost:4000/api/v1)
// In production, use VITE_API_BASE_URL / VITE_API_URL or default https://api.saiisai.com/api/v1
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";

    // ✅ Development: always talk to local backend, never api.saiisai.com
    if (isLocalhost) {
      return "http://localhost:4000/api/v1";
    }

    // Non-localhost (production / staging in browser)
    // Check for API_BASE_URL environment variable (highest priority)
    // Supports both VITE_API_BASE_URL and VITE_API_URL for backward compatibility
    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

    if (apiBaseUrl) {
      // Remove trailing slashes and ensure /api/v1 is appended if not present
      let url = apiBaseUrl.trim().replace(/\/+$/, "");

      // If URL doesn't already include /api/v1, append it
      if (!url.includes("/api/v1")) {
        url = `${url}/api/v1`;
      }

      return url;
    }

    // Browser, non-localhost, no env override: default to production API
    return "https://api.saiisai.com/api/v1";
  }

  // Server-side / non-browser fallback: default to local backend
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

// SECURITY: Cookie-only authentication - tokens are in HTTP-only cookies
// withCredentials: true ensures cookies are sent with all requests
const api = axios.create({
  baseURL: normalizedBaseURL,
  withCredentials: true, // CRITICAL: Required for cookie-based authentication
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json', // Explicitly set JSON content type
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";
  
  // SECURITY: Ensure Content-Type is set correctly
  // For FormData, let browser set Content-Type with boundary
  // For all other requests, explicitly set application/json
  if (!(config.data instanceof FormData)) {
    config.headers = config.headers || {};
    // Always set Content-Type to application/json for non-FormData requests
    config.headers['Content-Type'] = 'application/json';
    
    // SECURITY: Ensure data is a proper object/array, not a string
    // If data is a string, it might be double-encoded - try to parse it
    if (typeof config.data === 'string' && config.data.trim().length > 0) {
      // Check if it's a simple string value (not JSON) - this is an error
      if (!config.data.trim().startsWith('{') && !config.data.trim().startsWith('[')) {
        console.error('[API] ❌ Request data is a plain string, not JSON:', config.data.substring(0, 100));
        console.error('[API] Expected an object like: {"email":"...","password":"..."}');
        throw new Error('Invalid request format: data must be a JSON object, not a plain string. Please check your request payload.');
      }
      
      // Try to parse if it looks like JSON
      try {
        const parsed = JSON.parse(config.data);
        config.data = parsed;
        if (import.meta.env.DEV) {
          console.warn('[API] ⚠️ Data was stringified - parsed back to object');
        }
      } catch (e) {
        console.error('[API] ❌ Failed to parse JSON string:', config.data.substring(0, 100));
        throw new Error('Invalid JSON format in request data. Please ensure your request body is valid JSON.');
      }
    }
    
    // Log data type for debugging
    if (import.meta.env.DEV && config.data !== undefined && config.data !== null) {
      console.debug('[API] Request data type:', typeof config.data, Array.isArray(config.data) ? '(array)' : '');
      if (typeof config.data === 'object' && !Array.isArray(config.data) && !(config.data instanceof FormData)) {
        console.debug('[API] Request data keys:', Object.keys(config.data));
      }
    }
  }
  
  // SECURITY: Warn if seller is trying to access admin-only routes
  const adminOnlyRoutes = [
    // IMPORTANT: Be precise here to avoid flagging valid seller routes
    '/order',       // Admin order dashboard root (not /order/get-seller-orders)
    '/users/',      // Admin user management (not /users/me or /users/profile)
    '/admin',
    '/logs',
    '/eazshop',
  ];
  
  const isAdminRoute = adminOnlyRoutes.some(route => {
    if (route === '/order') {
      // Only treat the bare /order or /order/ as admin-only.
      // Do NOT flag seller-specific endpoints like /order/get-seller-orders or /order/seller-order/:id
      return (
        normalizedPath === '/order' ||
        normalizedPath === '/order/'
      );
    }
    
    if (route.endsWith('/')) {
      return (
        normalizedPath.startsWith(route) &&
        !normalizedPath.includes('/me') &&
        !normalizedPath.includes('/profile')
      );
    }
    
    return normalizedPath === route || normalizedPath.startsWith(route);
  });
  
  if (isAdminRoute && method === 'get') {
    console.error(`[API] ⚠️ SECURITY WARNING: Possible admin-only route: ${method.toUpperCase()} ${normalizedPath}`);
    console.error(`[API] ⚠️ If you see 403 errors here, confirm this route is intended for sellers.`);
  }

  // Log full URL for debugging
  if (import.meta.env.DEV) {
    const fullURL = `${config.baseURL}${config.url}`;
    console.debug(`[API] ${method.toUpperCase()} ${normalizedPath} (Full URL: ${fullURL})`);
    console.debug(`[API] Content-Type: ${config.headers['Content-Type'] || 'not set'}`);
    console.debug(`[API] Request data:`, config.data);
    
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
  }

  // Skip authentication for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // SECURITY: Cookie-only authentication - JWT is automatically sent via withCredentials: true
  // Backend will read from req.cookies.seller_jwt (or req.cookies.main_jwt for buyer routes)
  // NO localStorage fallback - cookies are the only authentication method
  
  if (import.meta.env.DEV) {
    console.debug(`[API] Cookie will be sent automatically for ${method.toUpperCase()} ${normalizedPath}`);
  }
  
  // Enhanced logging for verify-otp requests
  if (import.meta.env.DEV && normalizedPath.includes('verify-otp')) {
    console.log(`[API] 🔍 Verify OTP request details:`, {
      withCredentials: config.withCredentials,
      baseURL: config.baseURL,
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
    
    if (isVerifyOtpError && import.meta.env.DEV) {
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
        withCredentials: error.config?.withCredentials
      });
      console.error('[API Interceptor] Full Error Object:', error);
      console.error('═══════════════════════════════════════════════════════════');
    }
    
    // Handle session expiration
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/seller/me') || url.includes('/auth/me');
      
      if (isAuthEndpoint) {
        // 401 on auth endpoint = user not authenticated (normal state, not an error)
        if (import.meta.env.DEV) {
          console.debug("[API] Seller unauthenticated (401) on auth endpoint - cookie may be expired or missing");
        }
      } else {
        // Other endpoint 401 = might be temporary or session issue
        if (import.meta.env.DEV) {
          console.debug("[API] 401 on non-auth endpoint - seller may need to re-authenticate");
        }
      }
      
      // SECURITY: No token storage - cookies are managed by backend
      // Just clear React Query cache - backend cookie is cleared by logout endpoint
      if (import.meta.env.DEV) {
        console.debug("[API] 401 response - cookie-based auth, no local storage to clear");
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message || error.message || "Request failed";

    if (isVerifyOtpError && import.meta.env.DEV) {
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
