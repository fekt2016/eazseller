/**
 * Socket.io + `/api/v1/chat/*` origin — same resolution order as buyer `getChatSocketOrigin`.
 * Set `VITE_SOCKET_URL` in `.env` for local dev (e.g. `http://localhost:4000`).
 * Production: omit it and use `API_ORIGIN` (typically https://api.saiisai.com).
 */

const isDev = import.meta.env.DEV;

const PRODUCTION_API_ORIGIN = 'https://api.saiisai.com';
const DEVELOPMENT_API_ORIGIN = 'http://localhost:4000';

const normalizeEnvToApiOrigin = (raw) => {
  if (raw == null || raw === '') return null;
  let url = String(raw).trim().replace(/\/+$/, '');
  if (!url) return null;
  url = url.replace(/\/api\/v1\/?$/i, '');
  const isLocal = /localhost|127\.0\.0\.1|:4000/i.test(url);
  if (isLocal) {
    url = url.replace(/^https:\/\//i, 'http://');
    if (!/^https?:\/\//i.test(url)) {
      url = `http://${url.replace(/^\/\//, '')}`;
    }
  }
  return url;
};

const VITE_UI_PORTS = new Set(['5173', '5174', '5175']);

const stripViteDevServerPortFromOrigin = (origin) => {
  if (!origin || typeof origin !== 'string') return origin;
  const trimmed = origin.trim().replace(/\/+$/, '');
  let u;
  try {
    u = new URL(trimmed.includes('://') ? trimmed : `http://${trimmed}`);
  } catch {
    return trimmed;
  }
  const port = u.port || '';
  const loopback = u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  if (loopback && VITE_UI_PORTS.has(port)) {
    if (isDev) {
       
      console.warn(
        `[eazseller/chat] ${trimmed} is a Vite UI port, not the API. Using ${u.protocol}//${u.hostname}:4000.`
      );
    }
    u.port = '4000';
    return u.origin;
  }
  return trimmed;
};

const envApiRaw =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const envApiNormalized = normalizeEnvToApiOrigin(envApiRaw);
const envApiOrigin = envApiNormalized
  ? stripViteDevServerPortFromOrigin(envApiNormalized)
  : null;

const API_ORIGIN =
  envApiOrigin || (isDev ? DEVELOPMENT_API_ORIGIN : PRODUCTION_API_ORIGIN);

/** Same rule as `src/shared/services/api.js` getBaseURL(): localhost UI → local API. */
const isBrowserLocalhost = () => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
};

const loopbackKey = (hostname) => {
  if (!hostname) return '';
  const h = String(hostname).toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return '__loopback__';
  return h;
};

const shouldUseViteDevProxyOrigin = (apiOriginStr, pageOriginStr) => {
  if (!isDev || typeof window === 'undefined') return false;
  try {
    const api = new URL(apiOriginStr);
    const page = new URL(pageOriginStr);
    if (api.protocol !== 'http:') return false;
    const apiPort = api.port || '80';
    if (apiPort !== '4000') return false;
    const a = loopbackKey(api.hostname);
    if (a === '__loopback__') return true;
    return api.hostname === page.hostname;
  } catch {
    return false;
  }
};

const resolveExplicitSocketUrl = (raw) => {
  const base =
    normalizeEnvToApiOrigin(raw) || String(raw).trim().replace(/\/+$/, '');
  return stripViteDevServerPortFromOrigin(base);
};

/** Log bad VITE_SOCKET_URL at most once per page load (chat + history call this often). */
let didWarnViteSocketUrl = false;

/** True when env points at buyer/admin/seller Vite ports — never the API. */
const isViteDevUiOriginString = (raw) => {
  if (!raw || typeof raw !== 'string') return false;
  try {
    const withProto = raw.includes('://') ? raw.trim() : `http://${String(raw).trim()}`;
    const u = new URL(withProto);
    const port = u.port || '';
    const loopback =
      u.hostname === 'localhost' ||
      u.hostname === '127.0.0.1' ||
      u.hostname === '[::1]';
    return loopback && VITE_UI_PORTS.has(port);
  } catch {
    return false;
  }
};

/**
 * Origin for **HTTP** calls to `/api/v1/chat/*` (history, conversation).
 * Always targets the real API host — never `window.location.origin` on Vite (5175), or fetches
 * hit the dev server and return 404/500 unless proxy is perfectly configured.
 * Matches `src/shared/services/api.js` getBaseURL() on localhost → :4000.
 */
export const getEazsellerChatRestOrigin = () => {
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') {
      return DEVELOPMENT_API_ORIGIN;
    }
  }
  const rawExplicit = String(import.meta.env.VITE_SOCKET_URL || '').trim();
  if (rawExplicit && !isViteDevUiOriginString(rawExplicit)) {
    return resolveExplicitSocketUrl(rawExplicit);
  }
  return API_ORIGIN;
};

export const getEazsellerChatOrigin = () => {
  const rawExplicit = String(import.meta.env.VITE_SOCKET_URL || '').trim();
  if (rawExplicit && isViteDevUiOriginString(rawExplicit)) {
    if (isDev && !didWarnViteSocketUrl) {
      didWarnViteSocketUrl = true;
       
      console.warn(
        `[eazseller/chat] VITE_SOCKET_URL="${rawExplicit}" is a Vite dev UI port, not the API. Remove it from .env or set VITE_SOCKET_URL=http://localhost:4000`
      );
    }
  }
  const explicitSocket =
    rawExplicit && !isViteDevUiOriginString(rawExplicit) ? rawExplicit : '';
  if (explicitSocket) {
    const base = resolveExplicitSocketUrl(explicitSocket);
    if (
      typeof window !== 'undefined' &&
      shouldUseViteDevProxyOrigin(base, window.location.origin)
    ) {
      return window.location.origin;
    }
    return base;
  }

  // Without VITE_SOCKET_URL: match axios — do not send chat to production API from localhost:5175
  // when .env still has VITE_API_BASE_URL=https://api.saiisai.com (cookies stay on localhost).
  const resolvedOrigin = isBrowserLocalhost()
    ? DEVELOPMENT_API_ORIGIN
    : API_ORIGIN;

  if (
    typeof window !== 'undefined' &&
    shouldUseViteDevProxyOrigin(resolvedOrigin, window.location.origin)
  ) {
    return window.location.origin;
  }

  return resolvedOrigin;
};
