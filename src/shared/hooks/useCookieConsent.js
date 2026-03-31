import { useState, useEffect, useCallback } from 'react';

const COOKIE_CONSENT_KEY = 'cookie_consent_eazseller';
const BANNER_DISMISSED_KEY = 'cookie_banner_dismissed_eazseller';
const COOKIE_EXPIRY_DAYS = 365;

const setCookie = (name, value, days = COOKIE_EXPIRY_DAYS) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

const getDefaultConsent = () => ({
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  performance: false,
});

const manageScripts = () => {
  // Seller app: no GA/FB/TikTok pixels by default.
  // If analytics/marketing scripts are added later, gate them here using consent.
};

/**
 * Cookie consent hook for Saiisai Seller app.
 * Stores consent for necessary, analytics, marketing, preferences, performance.
 */
export const useCookieConsent = () => {
  const [consent, setConsentState] = useState(getDefaultConsent());
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  useEffect(() => {
    const savedConsent = getCookie(COOKIE_CONSENT_KEY);
    const bannerDismissed = getCookie(BANNER_DISMISSED_KEY);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsentState({ ...getDefaultConsent(), ...parsed });
      } catch {
        setConsentState(getDefaultConsent());
      }
    } else {
      setConsentState(getDefaultConsent());
    }

    setShouldShowBanner(!bannerDismissed);
  }, []);

  useEffect(() => {
    manageScripts();
  }, [consent]);

  const updateConsent = useCallback((newConsent) => {
    const updated = { ...getDefaultConsent(), ...newConsent };
    updated.necessary = true;
    setConsentState(updated);
    setCookie(COOKIE_CONSENT_KEY, JSON.stringify(updated));
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      performance: true,
    };
    updateConsent(allAccepted);
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, [updateConsent]);

  const acceptEssential = useCallback(() => {
    updateConsent(getDefaultConsent());
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, [updateConsent]);

  const savePreferences = useCallback((preferences) => {
    updateConsent({ ...consent, ...preferences });
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, [consent, updateConsent]);

  const dismissBanner = useCallback(() => {
    setCookie(BANNER_DISMISSED_KEY, 'true');
    setShouldShowBanner(false);
  }, []);

  return {
    consent,
    shouldShowBanner,
    acceptAll,
    acceptEssential,
    savePreferences,
    dismissBanner,
  };
};

export default useCookieConsent;
