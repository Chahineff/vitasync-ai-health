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
