import { useState, useEffect, useMemo, useRef, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Sparkle, X, SlidersHorizontal, Heart } from '@phosphor-icons/react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '@/stores/cartStore';
import { useProductGroups, ProductGroup } from '@/hooks/useProductGroups';
import { useTranslation } from '@/hooks/useTranslation';
import { Slider } from '@/components/ui/slider';
import { 
  SearchOverlay, 
  ShopFilters, 
  ProductGroupCard, 
  Pagination,
  CATEGORY_MAPPING,
  type SortOption,
  type CategoryKey
} from './shop';
import { ShopSkeletonGrid } from './shop/ShopSkeletonGrid';
import { QuickViewModal } from './shop/QuickViewModal';
import { BackToTopButton } from './shop/BackToTopButton';

interface ShopSectionProps {
  onProductSelect?: (handle: string) => void;
}

const ITEMS_PER_PAGE = 20;

// Wishlist stored in localStorage
function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem('vitasync-wishlist') || '[]');
  } catch { return []; }
}
function toggleWishlistItem(title: string): string[] {
  const list = getWishlist();
  const next = list.includes(title) ? list.filter(t => t !== title) : [...list, title];
  localStorage.setItem('vitasync-wishlist', JSON.stringify(next));
  return next;
}

export const ShopSection = forwardRef<HTMLDivElement, ShopSectionProps>(function ShopSection({ onProductSelect }, ref) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [sortOption, setSortOption] = useState<SortOption>('az');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewGroup, setQuickViewGroup] = useState<ProductGroup | null>(null);
  const [wishlist, setWishlist] = useState<string[]>(getWishlist);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const shopContainerRef = useRef<HTMLDivElement>(null);
  const cartItems = useCartStore(state => state.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const productGroups = useProductGroups(products);

  const maxPrice = useMemo(() => {
    const prices = products.map(p => parseFloat(p.node.priceRange.minVariantPrice.amount));
    return Math.ceil(Math.max(...prices, 200) / 10) * 10;
  }, [products]);

  useEffect(() => {
    if (products.length > 0 && priceRange[1] === 200) setPriceRange([0, maxPrice]);
  }, [maxPrice, products.length]);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, sortOption, priceRange, showFavoritesOnly]);
  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }, [currentPage]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(250);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count products per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: productGroups.length };
    const allDefinedTypes = Object.values(CATEGORY_MAPPING).flat().filter(Boolean);
    
    for (const [key, types] of Object.entries(CATEGORY_MAPPING)) {
      if (key === 'all') continue;
      if (key === 'other') {
        counts[key] = productGroups.filter(g => !allDefinedTypes.includes(g.productType)).length;
      } else {
        counts[key] = productGroups.filter(g => types.includes(g.productType)).length;
      }
    }
    return counts;
  }, [productGroups]);

  const filteredGroups = useMemo(() => {
    let filtered = productGroups;

    // Wishlist filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(g => wishlist.includes(g.baseTitle));
    }

    // Search
    if (searchQuery.trim()) {
      const words = searchQuery.toLowerCase().trim().split(/\s+/);
      filtered = filtered.filter(group =>
        group.products.some(product => {
          const title = product.node.title.toLowerCase();
          const description = (product.node.description || '').toLowerCase();
          const productType = (product.node.productType || '').toLowerCase();
          return words.every(w => title.includes(w) || description.includes(w) || productType.includes(w));
        })
      );
    }

    // Category
    if (selectedCategory !== 'all') {
      const categoryTypes = CATEGORY_MAPPING[selectedCategory];
      if (selectedCategory === 'other') {
        const allDefined = Object.values(CATEGORY_MAPPING).flat().filter(Boolean);
        filtered = filtered.filter(g => !allDefined.includes(g.productType));
      } else {
        filtered = filtered.filter(g => categoryTypes.includes(g.productType));
      }
    }

    // Price
    filtered = filtered.filter(g => g.minPrice >= priceRange[0] && g.minPrice <= priceRange[1]);

    // Sort
    switch (sortOption) {
      case 'az': filtered.sort((a, b) => a.baseTitle.localeCompare(b.baseTitle)); break;
      case 'za': filtered.sort((a, b) => b.baseTitle.localeCompare(a.baseTitle)); break;
      case 'price-low': filtered.sort((a, b) => a.minPrice - b.minPrice); break;
      case 'price-high': filtered.sort((a, b) => b.minPrice - a.minPrice); break;
    }

    return filtered;
  }, [productGroups, searchQuery, selectedCategory, sortOption, priceRange, showFavoritesOnly, wishlist]);

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasActiveFilters = selectedCategory !== 'all' || sortOption !== 'az' || priceRange[0] > 0 || priceRange[1] < maxPrice || searchQuery.trim().length > 0 || showFavoritesOnly;

  const handleReset = () => {
    setSelectedCategory('all');
    setSortOption('az');
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
    setShowFavoritesOnly(false);
  };

  const handleToggleWishlist = useCallback((title: string) => {
    setWishlist(toggleWishlistItem(title));
  }, []);

  const categories = [
    { key: 'all' as CategoryKey, label: t('shop.allCategories') },
    { key: 'sport' as CategoryKey, label: t('shop.sport') },
    { key: 'wellness' as CategoryKey, label: t('shop.wellness') },
    { key: 'brain' as CategoryKey, label: t('shop.brain') },
    { key: 'digestive' as CategoryKey, label: t('shop.digestive') },
    { key: 'vitamins' as CategoryKey, label: t('shop.vitamins') },
    { key: 'weight' as CategoryKey, label: t('shop.weight') },
    { key: 'mushrooms' as CategoryKey, label: t('shop.mushrooms') },
    { key: 'bones' as CategoryKey, label: t('shop.bones') },
    { key: 'other' as CategoryKey, label: t('shop.other') },
  ];

  return (
    <div ref={ref} className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-light text-foreground flex items-center gap-2">
            {t('shop.title')}
            <Sparkle weight="fill" className="w-5 h-5 text-primary/60" />
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <SearchOverlay products={products} onProductSelect={onProductSelect || (() => {})} onSearch={setSearchQuery} />
          <CartDrawer>
            <button className="relative p-3 rounded-xl bg-muted/50 dark:bg-white/5 border border-border/50 dark:border-white/10 hover:bg-muted dark:hover:bg-white/10 transition-colors">
              <ShoppingCart weight="light" className="w-5 h-5 text-foreground" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalCartItems}
                </span>
              )}
            </button>
          </CartDrawer>
        </div>
      </div>

      {/* Category Pills with counts */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setSelectedCategory(cat.key); setCurrentPage(1); }}
              className={`px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
              {categoryCounts[cat.key] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat.key ? 'bg-accent-foreground/20' : 'bg-foreground/10'
                }`}>
                  {categoryCounts[cat.key]}
                </span>
              )}
            </button>
          ))}
          {/* Favorites filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              showFavoritesOnly
                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Heart weight={showFavoritesOnly ? 'fill' : 'regular'} className="w-4 h-4" />
            {t('shop.favorites')}
            {wishlist.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                showFavoritesOnly ? 'bg-destructive/20' : 'bg-foreground/10'
              }`}>
                {wishlist.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as SortOption)}
          className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-muted border border-border focus:border-primary/50 focus:outline-none text-sm text-foreground cursor-pointer"
        >
          {[
            { value: 'az' as SortOption, label: t('shop.sortAZ') },
            { value: 'za' as SortOption, label: t('shop.sortZA') },
            { value: 'price-low' as SortOption, label: t('shop.sortPriceLow') },
            { value: 'price-high' as SortOption, label: t('shop.sortPriceHigh') },
          ].map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Price slider toggle */}
        <button
          onClick={() => setShowPriceSlider(!showPriceSlider)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            showPriceSlider || priceRange[0] > 0 || priceRange[1] < maxPrice
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-muted border border-border text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t('shop.priceRange')}: {priceRange[0]}€ – {priceRange[1]}€
        </button>

        {hasActiveFilters && (
          <button onClick={handleReset} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
            {t('shop.resetFilters')}
          </button>
        )}
      </div>

      {/* Price slider panel */}
      <AnimatePresence>
        {showPriceSlider && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{t('shop.priceRange')}</span>
                <span className="text-sm font-medium text-foreground">{priceRange[0]}€ – {priceRange[1]}€</span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                min={0}
                max={maxPrice}
                step={5}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div ref={shopContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden mt-6 scroll-smooth">
        {loading ? (
          <ShopSkeletonGrid />
        ) : (
          <>
            

            {paginatedGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                {/* Animated empty state */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ShoppingCart weight="light" className="w-20 h-20 text-muted-foreground/20 mb-4" />
                </motion.div>
                <p className="text-foreground/60 font-light text-lg mb-2">
                  {searchQuery || selectedCategory !== 'all' || showFavoritesOnly ? t('shop.noProducts') : t('shop.noProductsAvailable')}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleReset}
                    className="mt-3 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    {t('shop.exploreAll')}
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
                  >
                    {paginatedGroups.map((group, index) => (
                      <motion.div
                        key={group.baseTitle}
                        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ delay: index * 0.07, duration: 0.35 }}
                      >
                        <ProductGroupCard
                          group={group}
                          onProductClick={onProductSelect}
                          onQuickView={() => setQuickViewGroup(group)}
                          isFavorite={wishlist.includes(group.baseTitle)}
                          onToggleFavorite={() => handleToggleWishlist(group.baseTitle)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredGroups.length}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewGroup && (
        <QuickViewModal
          group={quickViewGroup}
          onClose={() => setQuickViewGroup(null)}
          onViewFull={(handle) => { setQuickViewGroup(null); onProductSelect?.(handle); }}
        />
      )}

      <BackToTopButton />
    </div>
  );
});
