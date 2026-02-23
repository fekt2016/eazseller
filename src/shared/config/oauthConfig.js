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
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
};

export const getFacebookOAuthConfig = (origin) => {
  const clientId = import.meta.env.VITE_FACEBOOK_CLIENT_ID;
  if (!clientId || clientId.trim() === "") {
    // Facebook is optional for seller app; no console warning
    return { enabled: false, url: null };
  }
  const safeOrigin = getSafeOrigin(origin);
  if (!safeOrigin) return { enabled: false, url: null };
  const redirectUri = `${safeOrigin}/facebook-callback`;
  const url =
    `https://www.facebook.com/v17.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=email,public_profile`;
  return { enabled: true, url };
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
