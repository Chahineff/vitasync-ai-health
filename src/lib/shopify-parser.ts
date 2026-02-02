// Utility functions to parse structured data from Shopify product descriptions

export interface ParsedProductData {
  ingredients: string[];
  suggestedUse: string;
  productAmount: string;
  manufacturerCountry: string;
  warnings: string[];
  certifications: string[];
  benefits: string[];
}

/**
 * Extract ingredients list from HTML description
 */
export function extractIngredients(html: string): string[] {
  if (!html) return [];
  
  // Look for "Ingredients:" or "Other Ingredients:" sections
  const ingredientPatterns = [
    /<strong>(?:Other\s+)?Ingredients:<\/strong>\s*([^<]+)/i,
    /(?:Other\s+)?Ingredients:\s*([^<\n]+)/i,
    /<p>(?:Other\s+)?Ingredients:\s*([^<]+)<\/p>/i,
  ];
  
  for (const pattern of ingredientPatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      // Split by comma and clean up
      return match[1]
        .split(/,(?![^()]*\))/) // Split by comma but not inside parentheses
        .map(i => i.trim())
        .filter(i => i.length > 0);
    }
  }
  
  return [];
}

/**
 * Extract suggested use/dosage from HTML description
 */
export function extractSuggestedUse(html: string): string {
  if (!html) return '';
  
  const patterns = [
    /<strong>Suggested Use:<\/strong>\s*([^<]+)/i,
    /Suggested Use:\s*([^<\n]+)/i,
    /<p>Suggested Use:\s*([^<]+)<\/p>/i,
    /<strong>Directions:<\/strong>\s*([^<]+)/i,
    /Directions:\s*([^<\n]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

/**
 * Extract product amount/quantity from HTML description
 */
export function extractProductAmount(html: string): string {
  if (!html) return '';
  
  const patterns = [
    /<strong>Product Amount:<\/strong>\s*([^<]+)/i,
    /Product Amount:\s*([^<\n]+)/i,
    /(\d+\s*(?:capsules?|tablets?|softgels?|gummies?|mg|g|ml|oz|servings?))/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

/**
 * Extract manufacturer country from HTML description
 */
export function extractManufacturerCountry(html: string): string {
  if (!html) return '';
  
  const patterns = [
    /<strong>Manufacturer Country:<\/strong>\s*([^<]+)/i,
    /Manufacturer Country:\s*([^<\n]+)/i,
    /Made in\s+([A-Za-z\s]+)/i,
    /Country of Origin:\s*([^<\n]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return '';
}

/**
 * Extract warnings/cautions from HTML description
 */
export function extractWarnings(html: string): string[] {
  if (!html) return [];
  
  const warnings: string[] = [];
  
  const patterns = [
    /<strong>(?:Caution|Warning):<\/strong>\s*([^<]+)/gi,
    /(?:Caution|Warning):\s*([^<\n]+)/gi,
    /<p>(?:Caution|Warning):\s*([^<]+)<\/p>/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      if (match[1]) {
        warnings.push(match[1].trim());
      }
    }
  }
  
  return warnings;
}

/**
 * Extract certifications/badges from HTML description or tags
 */
export function extractCertifications(html: string, tags: string[] = []): string[] {
  const certifications: string[] = [];
  const certKeywords = [
    'Gluten-Free', 'Gluten Free',
    'Lactose-Free', 'Lactose Free', 
    'Dairy-Free', 'Dairy Free',
    'Vegan', 'Vegetarian',
    'Non-GMO', 'Non GMO',
    'Organic',
    'All Natural', 'Natural',
    'Sugar-Free', 'Sugar Free',
    'Soy-Free', 'Soy Free',
    'Kosher', 'Halal',
    'GMP Certified', 'GMP',
    'Third-Party Tested',
    'Made in USA',
  ];
  
  // Check in HTML
  if (html) {
    for (const cert of certKeywords) {
      const regex = new RegExp(cert.replace(/-/g, '[- ]?'), 'i');
      if (regex.test(html) && !certifications.includes(cert.replace(/\s+/g, '-'))) {
        certifications.push(cert.replace(/\s+/g, '-'));
      }
    }
  }
  
  // Check in tags
  for (const tag of tags) {
    const normalizedTag = tag.toLowerCase().trim();
    for (const cert of certKeywords) {
      if (normalizedTag.includes(cert.toLowerCase().replace('-', ' ')) || 
          normalizedTag.includes(cert.toLowerCase())) {
        const normalized = cert.replace(/\s+/g, '-');
        if (!certifications.includes(normalized)) {
          certifications.push(normalized);
        }
      }
    }
  }
  
  return certifications;
}

/**
 * Extract benefits from description or metafield
 */
export function extractBenefits(html: string, metafieldValue?: string): string[] {
  const benefits: string[] = [];
  
  // First try metafield
  if (metafieldValue) {
    try {
      const parsed = JSON.parse(metafieldValue);
      if (Array.isArray(parsed)) {
        return parsed.map(b => b.trim()).filter(b => b.length > 0);
      }
    } catch {
      // If not JSON, split by newline or comma
      return metafieldValue.split(/[\n,]/).map(b => b.trim()).filter(b => b.length > 0);
    }
  }
  
  // Look for benefits in HTML
  const benefitsPatterns = [
    /<strong>Benefits:<\/strong>\s*<ul>([\s\S]*?)<\/ul>/i,
    /<li>([^<]+)<\/li>/gi,
  ];
  
  // Try to find a benefits section
  const benefitsSectionMatch = html.match(/<strong>Benefits:<\/strong>\s*([\s\S]*?)(?=<strong>|$)/i);
  if (benefitsSectionMatch) {
    const listItems = benefitsSectionMatch[1].match(/<li>([^<]+)<\/li>/gi);
    if (listItems) {
      for (const item of listItems) {
        const text = item.replace(/<\/?li>/gi, '').trim();
        if (text) benefits.push(text);
      }
    }
  }
  
  // Fallback: extract bullet points or key phrases
  if (benefits.length === 0) {
    const bulletPoints = html.match(/[•·]\s*([^•·<\n]+)/g);
    if (bulletPoints) {
      for (const point of bulletPoints.slice(0, 5)) {
        benefits.push(point.replace(/^[•·]\s*/, '').trim());
      }
    }
  }
  
  return benefits;
}

/**
 * Parse all structured data from a product
 */
export function parseProductDescription(html: string, tags: string[] = [], metafields?: { benefits?: string; ingredients?: string }): ParsedProductData {
  return {
    ingredients: metafields?.ingredients 
      ? metafields.ingredients.split(',').map(i => i.trim())
      : extractIngredients(html),
    suggestedUse: extractSuggestedUse(html),
    productAmount: extractProductAmount(html),
    manufacturerCountry: extractManufacturerCountry(html),
    warnings: extractWarnings(html),
    certifications: extractCertifications(html, tags),
    benefits: extractBenefits(html, metafields?.benefits),
  };
}

/**
 * Clean HTML and convert to readable text
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  return html
    // Replace <br> and </p> with newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Get a short description (first paragraph or first N characters)
 */
export function getShortDescription(description: string, maxLength: number = 150): string {
  if (!description) return '';
  
  const firstParagraph = description.split('\n')[0];
  if (firstParagraph.length <= maxLength) {
    return firstParagraph;
  }
  
  return firstParagraph.substring(0, maxLength).trim() + '...';
}
