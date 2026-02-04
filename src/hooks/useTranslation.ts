import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, detectBrowserLocale, type Locale } from '@/lib/i18n';

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  initialized: boolean;
  initialize: () => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'en',
      initialized: false,
      setLocale: (locale) => set({ locale }),
      initialize: () => {
        if (!get().initialized) {
          // Only detect browser locale on first visit (when no persisted locale)
          const stored = localStorage.getItem('vitasync-locale');
          if (!stored) {
            const browserLocale = detectBrowserLocale();
            set({ locale: browserLocale, initialized: true });
          } else {
            set({ initialized: true });
          }
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
    return translations[locale][key] || key;
  };
  
  return { t, locale, setLocale };
}
