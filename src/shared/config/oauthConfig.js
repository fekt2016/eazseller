const isDev = import.meta.env.DEV;
const warnedKeys = new Set();

const warnMissingEnv = (provider, envKey) => {
  if (!isDev) return;
  const id = `${provider}:${envKey}`;
  if (warnedKeys.has(id)) return;
  warnedKeys.add(id);
  console.warn(
    `[oauthConfig] ${provider} OAuth disabled: required env ${envKey} is not set. Set it in your .env to enable.`
  );
};

const getSafeOrigin = (explicitOrigin) => {
  if (explicitOrigin) return explicitOrigin;
  const envOrigin = import.meta.env.VITE_FRONTEND_URL;
  if (envOrigin && typeof envOrigin === "string" && envOrigin.trim()) {
    return envOrigin.trim().replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
};

export const getGoogleOAuthConfig = (origin) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    warnMissingEnv("Google", "VITE_GOOGLE_CLIENT_ID");
    return { enabled: false, url: null };
  }
  const safeOrigin = getSafeOrigin(origin);
  if (!safeOrigin) return { enabled: false, url: null };
  const redirectUri = `${safeOrigin}/google-callback`;
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile`;
  return { enabled: true, url };
};
