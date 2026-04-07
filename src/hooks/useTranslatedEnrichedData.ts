import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { EnrichedProductData } from '@/components/dashboard/pdp/types';

// In-memory + localStorage cache: key = `translate_${productTitle}_${locale}`
const memoryCache = new Map<string, Record<string, string>>();

function getCacheKey(productTitle: string, locale: string) {
  return `translate_${productTitle.toLowerCase().replace(/\s+/g, '_')}_${locale}`;
}

function getFromCache(key: string): Record<string, string> | null {
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Cache for 7 days
      if (parsed.ts && Date.now() - parsed.ts < 7 * 24 * 60 * 60 * 1000) {
        memoryCache.set(key, parsed.data);
        return parsed.data;
      }
    }
  } catch {}
  return null;
}

function setCache(key: string, data: Record<string, string>) {
  memoryCache.set(key, data);
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

/**
 * Extracts translatable text fields from enriched product data
 */
function extractTranslatableTexts(data: EnrichedProductData): Record<string, string> {
  const texts: Record<string, string> = {};
  
  if (data.summary) texts.summary = data.summary;
  if (data.coach_tip) texts.coach_tip = data.coach_tip;
  
  // Key benefits
  if (data.key_benefits && Array.isArray(data.key_benefits)) {
    data.key_benefits.forEach((b: any, i: number) => {
      if (b.title) texts[`benefit_title_${i}`] = b.title;
      if (b.description) texts[`benefit_desc_${i}`] = b.description;
    });
  }

  // Suggested use
  if (data.suggested_use) {
    const su = data.suggested_use as any;
    if (su.dosage) texts.dosage = su.dosage;
    if (su.timing) texts.timing = su.timing;
    if (su.notes) texts.notes = su.notes;
  }

  // Safety warnings
  if (data.safety_warnings) {
    const sw = data.safety_warnings as any;
    if (sw.contraindications && Array.isArray(sw.contraindications)) {
      sw.contraindications.forEach((c: string, i: number) => {
        texts[`contra_${i}`] = c;
      });
    }
    if (sw.interactions && Array.isArray(sw.interactions)) {
      sw.interactions.forEach((c: string, i: number) => {
        texts[`interaction_${i}`] = c;
      });
    }
  }

  // Quality info
  if (data.quality_info) {
    const qi = data.quality_info as any;
    if (qi.manufacturing) texts.manufacturing = qi.manufacturing;
    if (qi.testing) texts.testing = qi.testing;
  }

  // FAQ
  if (data.faq && Array.isArray(data.faq)) {
    data.faq.forEach((f: any, i: number) => {
      if (f.question) texts[`faq_q_${i}`] = f.question;
      if (f.answer) texts[`faq_a_${i}`] = f.answer;
    });
  }

  // Science data
  if (data.science_data) {
    const sd = data.science_data as any;
    if (sd.tldr) texts.tldr = sd.tldr;
    if (sd.study_bullets && Array.isArray(sd.study_bullets)) {
      sd.study_bullets.forEach((b: string, i: number) => {
        texts[`study_${i}`] = b;
      });
    }
  }

  return texts;
}

/**
 * Applies translations back to enriched data, returning a new object
 */
function applyTranslations(data: EnrichedProductData, translations: Record<string, string>): EnrichedProductData {
  const result = { ...data } as any;

  if (translations.summary) result.summary = translations.summary;
  if (translations.coach_tip) result.coach_tip = translations.coach_tip;

  // Key benefits
  if (result.key_benefits && Array.isArray(result.key_benefits)) {
    result.key_benefits = result.key_benefits.map((b: any, i: number) => ({
      ...b,
      title: translations[`benefit_title_${i}`] || b.title,
      description: translations[`benefit_desc_${i}`] || b.description,
    }));
  }

  // Suggested use
  if (result.suggested_use) {
    result.suggested_use = {
      ...result.suggested_use,
      dosage: translations.dosage || (result.suggested_use as any).dosage,
      timing: translations.timing || (result.suggested_use as any).timing,
      notes: translations.notes || (result.suggested_use as any).notes,
    };
  }

  // Safety warnings
  if (result.safety_warnings) {
    const sw = result.safety_warnings as any;
    if (sw.contraindications) {
      sw.contraindications = sw.contraindications.map((c: string, i: number) => 
        translations[`contra_${i}`] || c
      );
    }
    if (sw.interactions) {
      sw.interactions = sw.interactions.map((c: string, i: number) => 
        translations[`interaction_${i}`] || c
      );
    }
    result.safety_warnings = { ...sw };
  }

  // Quality info
  if (result.quality_info) {
    result.quality_info = {
      ...result.quality_info,
      manufacturing: translations.manufacturing || (result.quality_info as any).manufacturing,
      testing: translations.testing || (result.quality_info as any).testing,
    };
  }

  // FAQ
  if (result.faq && Array.isArray(result.faq)) {
    result.faq = result.faq.map((f: any, i: number) => ({
      ...f,
      question: translations[`faq_q_${i}`] || f.question,
      answer: translations[`faq_a_${i}`] || f.answer,
    }));
  }

  // Science data
  if (result.science_data) {
    const sd = result.science_data as any;
    result.science_data = {
      ...sd,
      tldr: translations.tldr || sd.tldr,
      study_bullets: sd.study_bullets?.map((b: string, i: number) => translations[`study_${i}`] || b),
    };
  }

  return result as EnrichedProductData;
}

export function useTranslatedEnrichedData(
  enrichedData: EnrichedProductData | null,
  productTitle: string | null
): { translatedData: EnrichedProductData | null; isTranslating: boolean } {
  const { locale } = useTranslation();
  const [translatedData, setTranslatedData] = useState<EnrichedProductData | null>(enrichedData);
  const [isTranslating, setIsTranslating] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enrichedData || !productTitle) {
      setTranslatedData(enrichedData);
      return;
    }

    // English is the source language - no translation needed
    if (locale === 'en') {
      setTranslatedData(enrichedData);
      return;
    }

    const cacheKey = getCacheKey(productTitle, locale);
    const cached = getFromCache(cacheKey);
    if (cached) {
      setTranslatedData(applyTranslations(enrichedData, cached));
      return;
    }

    // Translate via edge function
    const controller = new AbortController();
    abortRef.current = controller;
    setIsTranslating(true);

    const texts = extractTranslatableTexts(enrichedData);
    if (Object.keys(texts).length === 0) {
      setTranslatedData(enrichedData);
      setIsTranslating(false);
      return;
    }

    supabase.functions
      .invoke('translate-text', {
        body: { texts, targetLocale: locale, sourceLocale: 'en' },
      })
      .then(({ data, error }) => {
        if (controller.signal.aborted) return;
        if (error || !data?.translations) {
          console.warn('Translation failed, using original:', error);
          setTranslatedData(enrichedData);
        } else {
          setCache(cacheKey, data.translations);
          setTranslatedData(applyTranslations(enrichedData, data.translations));
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setTranslatedData(enrichedData);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsTranslating(false);
      });

    return () => {
      controller.abort();
    };
  }, [enrichedData, productTitle, locale]);

  return { translatedData, isTranslating };
}
