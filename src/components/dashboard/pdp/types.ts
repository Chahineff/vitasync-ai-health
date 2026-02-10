// PDP Master Template Types

import { ShopifyProduct, ProductDetail } from '@/lib/shopify';

export interface ProductVariantGroup {
  baseTitle: string;
  handle: string;
  variants: {
    flavor: string;
    product: ProductDetail;
    handle: string;
  }[];
  primaryProduct: ProductDetail;
}

export interface PDPProps {
  handle: string;
  onBack: () => void;
  recommendedByAI?: boolean;
}

export interface ImageSlot {
  url: string;
  alt: string;
  type: 'packshot' | 'angle' | 'lifestyle' | 'texture' | 'benefits' | 'howto' | 'supplement-facts' | 'quality';
}

export interface ProductBenefit {
  icon: React.ComponentType<{ className?: string; weight?: string }>;
  title: string;
  description: string;
}

export interface QuickBenefitItem {
  label: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CrossSellProduct {
  product: ShopifyProduct;
  type: 'pairs-well' | 'popular-stack';
}

export interface ReviewPlaceholder {
  name: string;
  rating: number;
  date: string;
  title: string;
  content: string;
}

export interface SourcePlaceholder {
  title: string;
  url: string;
}

// Enriched data types from product_enriched_data table
export interface EnrichedKeyBenefit {
  title: string;
  description: string;
  icon_hint: string;
}

export interface EnrichedIngredient {
  name: string;
  dosage: string;
  role: string;
  source: string;
}

export interface EnrichedSuggestedUse {
  dosage: string;
  timing: string;
  with_food: boolean;
  notes: string;
}

export interface EnrichedScienceData {
  tldr: string;
  study_bullets: string[];
  sources: Array<{ title: string; url: string; year: string }>;
}

export interface EnrichedSafetyWarnings {
  contraindications: string[];
  interactions: string[];
  pregnancy_safe: boolean;
  allergens: string[];
}

export interface EnrichedQualityInfo {
  certifications: string[];
  manufacturing: string;
  testing: string;
}

export interface EnrichedProductData {
  id: string;
  shopify_product_title: string;
  pdf_filename: string | null;
  summary: string | null;
  key_benefits: EnrichedKeyBenefit[];
  ingredients_detailed: EnrichedIngredient[];
  suggested_use: EnrichedSuggestedUse;
  science_data: EnrichedScienceData;
  safety_warnings: EnrichedSafetyWarnings;
  best_for_tags: string[];
  quality_info: EnrichedQualityInfo;
  faq: FAQItem[];
  coach_tip: string | null;
}
