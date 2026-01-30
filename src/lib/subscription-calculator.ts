// VitaSync Subscription Calculator
// Calculates monthly subscription quantities and pricing with 10% discount

// Constants
export const SUBSCRIPTION_DISCOUNT_RATE = 0.10; // 10%
export const DEFAULT_CYCLE_DAYS = 30;
export const DEFAULT_PACK_UNITS = 30; // Conservative default

// Types
export interface ProductWithMeta {
  id: string;
  variantId: string;
  title: string;
  price: string;
  currencyCode: string;
  packUnits?: number;
  unitType?: string;
  defaultDose?: number;
  sellingPlanId?: string | null;
  availableForSale?: boolean;
}

export interface SubscriptionLineItem {
  productId: string;
  variantId: string;
  productName: string;
  dosePerDay: number;
  unitType: string;
  packUnits: number;
  cycleDays: number;
  packsNeeded: number;
  unitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
  sellingPlanId: string | null;
  hasSellingPlan: boolean;
}

export interface SubscriptionSummary {
  lines: SubscriptionLineItem[];
  subtotalBeforeDiscount: number;
  totalDiscount: number;
  totalAfterDiscount: number;
  currencyCode: string;
  hasSellingPlans: boolean;
  cycleDays: number;
}

export interface CadenceGroup {
  cadenceDays: number;
  items: SubscriptionLineItem[];
  subtotal: number;
}

// Calculation functions
export function calculatePacksNeeded(
  dosePerDay: number,
  cycleDays: number,
  packUnits: number
): number {
  const totalUnitsNeeded = dosePerDay * cycleDays;
  return Math.ceil(totalUnitsNeeded / packUnits);
}

export function calculateSubscriptionLine(
  product: ProductWithMeta,
  dosePerDay: number,
  cycleDays: number = DEFAULT_CYCLE_DAYS
): SubscriptionLineItem {
  const packUnits = product.packUnits || DEFAULT_PACK_UNITS;
  const packsNeeded = calculatePacksNeeded(dosePerDay, cycleDays, packUnits);
  const unitPrice = parseFloat(product.price);
  const lineSubtotal = packsNeeded * unitPrice;
  const lineDiscount = lineSubtotal * SUBSCRIPTION_DISCOUNT_RATE;
  const lineTotal = lineSubtotal - lineDiscount;
  
  return {
    productId: product.id,
    variantId: product.variantId,
    productName: product.title,
    dosePerDay,
    unitType: product.unitType || 'capsules',
    packUnits,
    cycleDays,
    packsNeeded,
    unitPrice,
    lineSubtotal,
    lineDiscount,
    lineTotal,
    sellingPlanId: product.sellingPlanId || null,
    hasSellingPlan: !!product.sellingPlanId
  };
}

export function calculateSubscriptionSummary(
  lines: SubscriptionLineItem[],
  currencyCode: string = 'USD'
): SubscriptionSummary {
  const subtotalBeforeDiscount = lines.reduce((sum, line) => sum + line.lineSubtotal, 0);
  const totalDiscount = lines.reduce((sum, line) => sum + line.lineDiscount, 0);
  const totalAfterDiscount = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const hasSellingPlans = lines.some(line => line.hasSellingPlan);
  
  // Use the most common cycle days, default to 30
  const cycleDays = lines.length > 0 ? lines[0].cycleDays : DEFAULT_CYCLE_DAYS;
  
  return {
    lines,
    subtotalBeforeDiscount,
    totalDiscount,
    totalAfterDiscount,
    currencyCode,
    hasSellingPlans,
    cycleDays
  };
}

// Group items by cadence for multi-cadence support
export function groupByCadence(items: SubscriptionLineItem[]): CadenceGroup[] {
  const groups = new Map<number, SubscriptionLineItem[]>();
  
  for (const item of items) {
    const existing = groups.get(item.cycleDays) || [];
    existing.push(item);
    groups.set(item.cycleDays, existing);
  }
  
  return Array.from(groups.entries()).map(([cadenceDays, groupItems]) => ({
    cadenceDays,
    items: groupItems,
    subtotal: groupItems.reduce((sum, item) => sum + item.lineTotal, 0)
  }));
}

// Format price for display
export function formatPrice(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

// Validate if dose is reasonable (warning if >6 packs/month)
export function validateDose(packsNeeded: number): { valid: boolean; warning?: string } {
  if (packsNeeded > 6) {
    return {
      valid: false,
      warning: `Cette dose nécessite ${packsNeeded} packs/mois. Confirme que c'est correct.`
    };
  }
  return { valid: true };
}

// Parse subscription block from AI response
export interface ParsedSubscriptionItem {
  productName: string;
  variantId: string;
  dosePerDay: number;
  packsPerMonth: number;
  priceAfterDiscount: number;
  originalPrice: number;
}

export interface ParsedSubscriptionBlock {
  items: ParsedSubscriptionItem[];
  total: number;
  savings: number;
}

export function parseSubscriptionBlock(content: string): {
  text: string;
  subscription: ParsedSubscriptionBlock | null;
} {
  const regex = /\[\[SUBSCRIPTION_START\]\]([\s\S]*?)\[\[SUBSCRIPTION_END\]\]/;
  const match = content.match(regex);
  
  if (!match) return { text: content, subscription: null };
  
  const blockContent = match[1];
  const items: ParsedSubscriptionItem[] = [];
  
  // Parse lines with VariantID format:
  // - Produit: [Nom] | VariantID: [gid://shopify/ProductVariant/XXX] | Dose: [X]/jour | Packs: [N]/mois | Prix: [XX.XX]$ (-10%) | Original: [YY.YY]$
  const lineRegex = /Produit:\s*([^|]+)\s*\|\s*VariantID:\s*([^|]+)\s*\|\s*Dose:\s*(\d+)\/jour\s*\|\s*Packs:\s*(\d+)\/mois\s*\|\s*Prix:\s*([\d.]+)\$[^|]*\|\s*Original:\s*([\d.]+)\$/gi;
  let lineMatch;
  
  while ((lineMatch = lineRegex.exec(blockContent)) !== null) {
    items.push({
      productName: lineMatch[1].trim(),
      variantId: lineMatch[2].trim(),
      dosePerDay: parseInt(lineMatch[3], 10),
      packsPerMonth: parseInt(lineMatch[4], 10),
      priceAfterDiscount: parseFloat(lineMatch[5]),
      originalPrice: parseFloat(lineMatch[6])
    });
  }
  
  // Fallback: try old format without VariantID (for backwards compatibility)
  if (items.length === 0) {
    const oldLineRegex = /Produit:\s*([^|]+)\s*\|\s*Dose:\s*(\d+)\/jour\s*\|\s*Packs:\s*(\d+)\/mois\s*\|\s*Prix:\s*([\d.]+)\$?\s*\(-10%\)/gi;
    while ((lineMatch = oldLineRegex.exec(blockContent)) !== null) {
      const priceAfterDiscount = parseFloat(lineMatch[4]);
      items.push({
        productName: lineMatch[1].trim(),
        variantId: '', // No variant ID in old format
        dosePerDay: parseInt(lineMatch[2], 10),
        packsPerMonth: parseInt(lineMatch[3], 10),
        priceAfterDiscount,
        originalPrice: priceAfterDiscount / (1 - SUBSCRIPTION_DISCOUNT_RATE)
      });
    }
  }
  
  const total = items.reduce((sum, item) => sum + item.priceAfterDiscount, 0);
  const savings = items.reduce((sum, item) => sum + (item.originalPrice - item.priceAfterDiscount), 0);
  
  // Remove the subscription block from text, replace with placeholder
  const text = content.replace(regex, '__SUBSCRIPTION_BLOCK__');
  
  return {
    text,
    subscription: items.length > 0 ? { items, total, savings } : null
  };
}

// Check if content contains subscription intent
export function hasSubscriptionIntent(content: string): boolean {
  const keywords = [
    'abonnement',
    'pack mensuel',
    'livraison automatique',
    'subscription',
    'récurrent',
    'mensuel',
    'chaque mois'
  ];
  const lowerContent = content.toLowerCase();
  return keywords.some(keyword => lowerContent.includes(keyword));
}
