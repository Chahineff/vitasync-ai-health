import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTranslation, detectBrowserLocale, locales, type Locale } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void; // local only; also persisted to localStorage
  setLocaleAndSync: (locale: Locale) => Promise<void>; // also writes to profile
  initialized: boolean;
  initialize: () => void;
  hydrateFromProfile: (locale: Locale | null | undefined) => void;
}

const isSelectable = (l: unknown): l is Locale =>
  typeof l === 'string' && (locales as readonly string[]).includes(l);

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'en' as Locale,
      initialized: false,
      setLocale: (locale: Locale) => {
        if (!isSelectable(locale)) return;
        set({ locale, initialized: true });
      },
      setLocaleAndSync: async (locale: Locale) => {
        if (!isSelectable(locale)) return;
        set({ locale, initialized: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('profiles')
              .update({ locale })
              .eq('user_id', user.id);
          }
        } catch (e) {
          // Non-fatal: localStorage still holds the choice.
          console.warn('[i18n] Failed to sync locale to profile', e);
        }
      },
      initialize: () => {
        // Only run once per browser. After the first run, the user's
        // explicit choice (in localStorage / profile) is the source of truth
        // and must NEVER be overwritten by browser detection on reload.
        if (get().initialized) return;
        const browserLocale = detectBrowserLocale();
        const safe: Locale = isSelectable(browserLocale) ? browserLocale : 'en';
        set({ locale: safe, initialized: true });
      },
      hydrateFromProfile: (locale) => {
        // Called once after login. The profile is the cross-device source
        // of truth; if it has a valid locale, adopt it and mark initialized.
        if (isSelectable(locale)) {
          set({ locale, initialized: true });
        }
      },
    }),
    {
      name: 'vitasync-locale',
      // Persist `initialized` too — otherwise every reload would re-run
      // browser detection and wipe out the user's explicit choice.
      partialize: (state) => ({ locale: state.locale, initialized: state.initialized }),
    }
  )
);

export function useTranslation() {
  const locale = useI18n((s) => s.locale);
  const setLocale = useI18n((s) => s.setLocaleAndSync);
  const initialize = useI18n((s) => s.initialize);

  // Initialize once on first consumer mount (no-op after first run).
  if (typeof window !== 'undefined') {
    initialize();
  }

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  return { t, locale, setLocale };
}
