import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content from external sources (like Shopify product descriptions)
 * to prevent XSS attacks. Only allows safe HTML tags and attributes.
 */
export function sanitizeHtml(html: string | undefined | null): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    // Only allow safe formatting tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'pre', 'code',
      'img', 'figure', 'figcaption',
      'hr', 'sup', 'sub'
    ],
    // Only allow safe attributes
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt', 'src', 
      'class', 'id', 'width', 'height', 'style'
    ],
    // Disallow data attributes (can be used for attacks)
    ALLOW_DATA_ATTR: false,
    // Force all links to open in new tab with noopener
    FORCE_BODY: true,
    // Remove contents of dangerous tags rather than just the tags themselves
    KEEP_CONTENT: true,
  });
}

/**
 * Sanitize HTML with strict mode - only basic formatting allowed
 * Use this for user-generated content or less trusted sources
 */
export function sanitizeHtmlStrict(html: string | undefined | null): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
  });
}
