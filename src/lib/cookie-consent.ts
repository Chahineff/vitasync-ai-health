// Cookie consent state management (CNIL/RGPD compliant).
// Stored in localStorage with a 13-month expiration.

export type CookieConsent = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  ts: number;
};

export const COOKIE_CONSENT_KEY = "cookie-consent";
const THIRTEEN_MONTHS_MS = 13 * 30 * 24 * 60 * 60 * 1000;

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  preferences: false,
  analytics: false,
  ts: 0,
};

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (!parsed || typeof parsed.ts !== "number") return null;
    // Expire after 13 months → treat as no consent.
    if (Date.now() - parsed.ts > THIRTEEN_MONTHS_MS) {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }
    return {
      necessary: true,
      preferences: !!parsed.preferences,
      analytics: !!parsed.analytics,
      ts: parsed.ts,
    };
  } catch {
    return null;
  }
}

export function writeConsent(partial: Omit<CookieConsent, "necessary" | "ts">): CookieConsent {
  const value: CookieConsent = {
    necessary: true,
    preferences: !!partial.preferences,
    analytics: !!partial.analytics,
    ts: Date.now(),
  };
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  // Expose globally so any tracker can read it synchronously.
  (window as any).__cookieConsent = value;
  window.dispatchEvent(new CustomEvent("cookie-consent-change", { detail: value }));
  return value;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("cookie-consent-open"));
}

// Hydrate the global gate on module import so any code that runs later
// (e.g. analytics init) can branch on it without a race.
if (typeof window !== "undefined") {
  (window as any).__cookieConsent = readConsent() ?? DEFAULT_CONSENT;
}
