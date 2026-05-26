import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTranslation, detectBrowserLocale, type Locale } from '@/lib/i18n';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  initialized: boolean;
  initialize: () => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'en' as Locale,
      initialized: false,
      setLocale: (locale: Locale) => set({ locale }),
      initialize: () => {
        if (!get().initialized) {
          const browserLocale = detectBrowserLocale();
          set({ locale: browserLocale, initialized: true });
        }
      },
    }),
    { 
      name: 'vitasync-locale',
      partialize: (state) => ({ locale: state.locale }),
    }
  )
);

export function useTranslation() {
  const { locale, setLocale, initialize } = useI18n();
  
  // Initialize on first use
  if (typeof window !== 'undefined') {
    initialize();
  }
  
  const t = (key: string): string => {
    return getTranslation(locale, key);
  };
  
  return { t, locale, setLocale };
}
