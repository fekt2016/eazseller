import axios from "axios";
import logger from '../utils/logger';

// getBaseURL() priority:
// 1. localhost/127.0.0.1 → dev server (http://localhost:4000/api/v1)
// 2. VITE_API_BASE_URL env var (preferred for production)
// 3. VITE_API_URL env var (legacy support)
// 4. Hardcoded https://api.saiisai.com/api/v1 — set VITE_API_BASE_URL in production to avoid relying on this fallback
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
    logger.error("Error parsing URL");
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
  timeout: 30000, // 30 seconds default to reduce false timeouts on cold/slow networks
  headers: {
    'Content-Type': 'application/json', // Explicitly set JSON content type
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Strip trailing slashes from path so backend route matching works (e.g. GET /seller not GET /seller/)
  if (config.url && typeof config.url === 'string' && !config.url.startsWith('http')) {
    const [path, query] = config.url.split('?');
    const pathNorm = path.replace(/\/+$/, '') || '/';
    config.url = query ? `${pathNorm}?${query}` : pathNorm;
  }
  const relativePath = getRelativePath(config.url);
  const normalizedPath = normalizePath(relativePath);
  const method = config.method ? config.method.toLowerCase() : "get";

  // Platform identification for backend logging and rate-limiting
  config.headers = config.headers || {};
  config.headers['x-platform'] = 'eazseller';

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
        logger.error('[API] Invalid request payload format');
        throw new Error('Invalid request format: data must be a JSON object, not a plain string. Please check your request payload.');
      }

      // Try to parse if it looks like JSON
      try {
        const parsed = JSON.parse(config.data);
        config.data = parsed;
        if (import.meta.env.DEV) {
          logger.warn('[API] Data was stringified - parsed back to object');
        }
      } catch (e) {
        logger.error('[API] Failed to parse JSON string');
        throw new Error('Invalid JSON format in request data. Please ensure your request body is valid JSON.');
      }
    }

    // Log data type for debugging
    if (import.meta.env.DEV && config.data !== undefined && config.data !== null) {
      logger.debug('[API] Request data type:', typeof config.data, Array.isArray(config.data) ? '(array)' : '');
      if (typeof config.data === 'object' && !Array.isArray(config.data) && !(config.data instanceof FormData)) {
        logger.debug('[API] Request data keys:', Object.keys(config.data));
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
    logger.warn(`[API] Possible admin-only route: ${method.toUpperCase()} ${normalizedPath}`);
  }

  // Log full URL for debugging
  if (import.meta.env.DEV) {
    const fullURL = `${config.baseURL}${config.url}`;
    logger.debug(`[API] ${method.toUpperCase()} ${normalizedPath} (Full URL: ${fullURL})`);
    logger.debug(`[API] Content-Type: ${config.headers['Content-Type'] || 'not set'}`);
  }

  // Skip authentication for public routes
  if (isPublicRoute(normalizedPath, method)) {
    return config;
  }

  // SECURITY: Cookie-only authentication - JWT is automatically sent via withCredentials: true
  // Backend will read from req.cookies.seller_jwt (or req.cookies.main_jwt for buyer routes)
  // NO localStorage fallback - cookies are the only authentication method

  // SECURITY: CSRF Protection - Read token from cookie and send in header
  // CSRF token is required for all state-changing operations (POST, PATCH, PUT, DELETE)
  if (['post', 'patch', 'put', 'delete'].includes(method)) {
    // Get CSRF token from cookie
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const csrfToken = getCookie('csrf-token');

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
      if (import.meta.env.DEV) {
        logger.debug(`[API] CSRF token added to ${method.toUpperCase()} ${normalizedPath}`);
      }
    } else {
      if (import.meta.env.DEV) {
        logger.warn(`[API] CSRF token not found in cookie for ${method.toUpperCase()} ${normalizedPath}`);
      }
    }
  }

  if (import.meta.env.DEV) {
    logger.debug(`[API] Cookie will be sent automatically for ${method.toUpperCase()} ${normalizedPath}`);
  }

  // Longer timeout for auth endpoints (login, /seller/me, verify-otp, etc.)
  const AUTH_PATHS = [
    '/seller/me',
    '/seller/login',
    '/seller/logout',
    '/seller/verify-otp',
    '/seller/send-otp',
    '/seller/forgot-password',
    '/seller/reset-password',
    '/seller/register',
  ];
  const isAuthPath = AUTH_PATHS.some((path) => config.url?.includes(path));
  if (isAuthPath) {
    config.timeout = 45000; // Auth can be slower in production (cookie/csrf/session work)
  }

  // Category catalog can be large (limit 1000 + populate); cold DB / slow links exceed default 15s
  const isCategoryGet =
    method === 'get' &&
    (normalizedPath === '/categories' ||
      normalizedPath === '/categories/parents' ||
      /^\/categories\//.test(normalizedPath));
  if (isCategoryGet) {
    config.timeout = 60000;
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle timeout errors with user-friendly messages
    const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
    if (isTimeout) {
      const url = error.config?.url || '';
      const isAuthRequest = url.includes('/seller/login') || url.includes('/seller/signup') ||
        url.includes('/seller/verify') || url.includes('/auth/');

      const timeoutMessage = isAuthRequest
        ? 'The server is taking too long to respond. Please check your internet connection and try again.'
        : 'Request timed out. Please try again.';

      logger.error(`[API] Timeout error: ${timeoutMessage}`, {
        url: error.config?.url,
        timeout: error.config?.timeout,
        code: error.code,
      });

      // Create a user-friendly error while preserving original axios context
      const timeoutError = new Error(timeoutMessage);
      timeoutError.code = 'ECONNABORTED';
      timeoutError.isTimeout = true;
      timeoutError.url = error.config?.url;
      timeoutError.status = error.response?.status;
      timeoutError.data = error.response?.data;
      timeoutError.originalError = error;
      return Promise.reject(timeoutError);
    }

    const isVerifyOtpError = error.config?.url?.includes('verify-otp');
    if (isVerifyOtpError && import.meta.env.DEV) {
      logger.debug('[API Interceptor] verify-otp error', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    // Handle CSRF token errors (403) — fetch new token and retry
    if (error.response?.status === 403) {
      const errorCode = error.response?.data?.code || error.response?.data?.error || '';
      const isCsrfError =
        String(errorCode).includes('CSRF') ||
        errorCode === 'CSRF_TOKEN_MISSING' ||
        errorCode === 'CSRF_TOKEN_MISMATCH' ||
        errorCode === 'INVALID_CSRF_TOKEN' ||
        errorCode === 'SESSION_EXPIRED';

      if (isCsrfError && !error.config._csrfRetried) {
        try {
          const tokenResponse = await fetch(`${normalizedBaseURL}/csrf-token`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });

          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            if (tokenData?.csrfToken) {
              error.config._csrfRetried = true;
              error.config.headers = error.config.headers || {};
              error.config.headers['X-CSRF-Token'] = tokenData.csrfToken;
              if (import.meta.env.DEV) {
                logger.warn('[API] CSRF token refreshed, retrying request');
              }
              return api(error.config);
            }
          }
        } catch (csrfErr) {
          if (import.meta.env.DEV) {
            logger.warn('[API] CSRF refresh failed:', csrfErr?.message);
          }
        }
      }
    }

    // Handle session expiration (401) — redirect to login with message for non-login endpoints
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isLoginEndpoint =
        requestUrl.includes('/seller/login') || requestUrl.includes('/seller/register');

      // Don't redirect for auth-check endpoints (/seller/me) — useAuth handles 401 gracefully.
      // Redirecting on /seller/me causes an infinite reload loop on the login page.
      const isAuthCheckEndpoint = requestUrl.includes('/seller/me') || requestUrl.includes('/auth/me');
      const isAlreadyOnLogin = typeof window !== 'undefined' &&
        (window.location.pathname === '/login' || window.location.pathname === '/');

      if (!isLoginEndpoint && !isAuthCheckEndpoint && !isAlreadyOnLogin && !error.config?._authRetried) {
        error.config._authRetried = true;
        
        if (typeof window !== 'undefined') {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(
              'eazseller_login_message',
              'Your session has expired. Please log in again.'
            );
          }
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/seller/me') || url.includes('/auth/me');

      if (isAuthEndpoint) {
        if (import.meta.env.DEV) {
          logger.debug("[API] Seller unauthenticated (401) on auth endpoint - cookie may be expired or missing");
        }
      } else {
        if (import.meta.env.DEV) {
          logger.debug("[API] 401 on non-auth endpoint - seller may need to re-authenticate");
        }
      }

      if (import.meta.env.DEV) {
        logger.debug("[API] 401 response - cookie-based auth, no local storage to clear");
      }
    }

    // Handle 429 rate limit
    if (error.response?.status === 429) {
      const retryAfter =
        error.response.headers['retry-after'] ||
        error.response.data?.retryAfter ||
        null;

      const retryMessage = retryAfter
        ? `Too many requests. Please try again in ${Math.ceil(Number(retryAfter) / 60)} minute(s).`
        : 'Too many requests. Please wait a moment and try again.';

      return Promise.reject({
        ...error,
        userMessage: retryMessage,
        isRateLimit: true,
        retryAfter: retryAfter,
      });
    }

    // Handle other errors
    const isNetworkError =
      error.message === "Network Error" ||
      error.code === "ERR_NETWORK" ||
      !error.response;
    const fullUrl = error.config?.baseURL && error.config?.url
      ? `${(error.config.baseURL || "").replace(/\/+$/, "")}${error.config.url.startsWith("/") ? "" : "/"}${error.config.url}`
      : error.config?.url;
    const errorMessage =
      error.response?.data?.message || error.message || "Request failed";

    if (isVerifyOtpError && import.meta.env.DEV) {
      logger.debug(`[API Interceptor] verify-otp error message: ${errorMessage}`);
    } else if (isNetworkError) {
      logger.error('[API] Network error', {
        code: error.code,
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      logger.error(`[API] Error: ${errorMessage}`, {
        url: fullUrl || error.config?.url,
        status: error.response?.status,
        code: error.code,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
