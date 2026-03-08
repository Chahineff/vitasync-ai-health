import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, X, ShoppingCart, TrendUp } from '@phosphor-icons/react';
import { ShopifyProduct } from '@/lib/shopify';
import { useTranslation } from '@/hooks/useTranslation';

interface SearchOverlayProps {
  products: ShopifyProduct[];
  onProductSelect: (handle: string) => void;
  onSearch: (query: string) => void;
}

const POPULAR_TAGS = ['Whey', 'Créatine', 'Oméga-3', 'Magnésium', 'Vitamine D', 'Ashwagandha'];

export function SearchOverlay({ products, onProductSelect, onSearch }: SearchOverlayProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchResults = query.trim().length >= 2
    ? products.filter(product => {
        const searchLower = query.toLowerCase().trim();
        const words = searchLower.split(/\s+/);
        const title = product.node.title.toLowerCase();
        const description = (product.node.description || '').toLowerCase();
        const productType = (product.node.productType || '').toLowerCase();
        return words.every(word => title.includes(word) || description.includes(word) || productType.includes(word));
      }).slice(0, 6)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleInputChange = (value: string) => { setQuery(value); onSearch(value); };
  const handleProductClick = (handle: string) => { setIsOpen(false); setQuery(''); onProductSelect(handle); };
  const handleClose = () => { setIsOpen(false); setQuery(''); onSearch(''); };
  const handleTagClick = (tag: string) => { setQuery(tag); onSearch(tag); };

  const showDropdown = isOpen && (query.trim().length >= 2 || query.trim().length === 0);

  return (
    <div ref={containerRef} className="relative">
      <motion.div animate={{ width: isOpen ? '100%' : 'auto' }} className="relative">
        <div className={`relative flex items-center transition-all duration-300 ${isOpen ? 'w-full md:w-80' : 'w-10 md:w-64'}`}>
          <MagnifyingGlass className={`absolute left-3 w-4 h-4 text-foreground/40 pointer-events-none z-10 ${!isOpen ? 'md:block hidden' : ''}`} />
          {!isOpen && (
            <button onClick={() => setIsOpen(true)} className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <MagnifyingGlass className="w-5 h-5 text-foreground/60" />
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={t("shop.search")}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:bg-white/10 focus:outline-none text-sm text-foreground placeholder:text-foreground/40 font-light transition-all ${isOpen ? 'block' : 'hidden md:block'}`}
          />
          {isOpen && query && (
            <button onClick={handleClose} className="absolute right-3 p-1 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-4 h-4 text-foreground/40" />
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[300px] md:min-w-[320px]"
          >
            {query.trim().length === 0 ? (
              /* Popular search tags */
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendUp weight="bold" className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('shop.popularSearches')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1.5 rounded-full bg-muted text-sm text-foreground hover:bg-accent/20 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingCart weight="light" className="w-10 h-10 text-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-foreground/60">{t("shop.noProducts")}</p>
              </div>
            ) : (
              <>
                <div className="max-h-[400px] overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product.node.id}
                      onClick={() => handleProductClick(product.node.handle)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div className="w-14 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                        {product.node.images.edges[0]?.node ? (
                          <img src={product.node.images.edges[0].node.url} alt={product.node.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart weight="light" className="w-6 h-6 text-foreground/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-foreground truncate">{product.node.title}</p>
                        <p className="text-xs text-foreground/50">{product.node.productType || 'Supplement'}</p>
                        <p className="text-sm font-semibold text-primary">
                          {parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)} {product.node.priceRange.minVariantPrice.currencyCode}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {searchResults.length >= 6 && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full p-3 text-center text-sm text-primary hover:bg-primary/5 transition-colors border-t border-white/10"
                  >
                    {t("shop.viewResults")} →
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
