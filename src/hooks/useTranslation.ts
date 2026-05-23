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
      locale: 'en' as Locale,
      initialized: false,
      setLocale: () => set({ locale: 'en' as Locale }),
      initialize: () => {
        if (!get().initialized) {
          set({ locale: 'en' as Locale, initialized: true });
        }
      },
    }),
    { 
      name: 'vitasync-locale',
      partialize: (state) => ({ locale: 'en' as Locale }),
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
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };
  
  return { t, locale, setLocale };
}
