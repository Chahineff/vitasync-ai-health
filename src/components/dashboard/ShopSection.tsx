import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, SpinnerGap, Sparkle, X } from '@phosphor-icons/react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '@/stores/cartStore';
import { useProductGroups, ProductGroup } from '@/hooks/useProductGroups';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  SearchOverlay, 
  ShopFilters, 
  ProductGroupCard, 
  Pagination,
  AIRecommendationsWidget,
  CATEGORY_MAPPING,
  type SortOption,
  type CategoryKey
} from './shop';

interface ShopSectionProps {
  onProductSelect?: (handle: string) => void;
}

const ITEMS_PER_PAGE = 20;

export function ShopSection({ onProductSelect }: ShopSectionProps) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all');
  const [sortOption, setSortOption] = useState<SortOption>('az');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [currentPage, setCurrentPage] = useState(1);
  const shopContainerRef = useRef<HTMLDivElement>(null);
  const cartItems = useCartStore(state => state.items);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Group products by base title (flavors)
  const productGroups = useProductGroups(products);

  // Calculate max price from all products
  const maxPrice = useMemo(() => {
    const prices = products.map(p => parseFloat(p.node.priceRange.minVariantPrice.amount));
    return Math.ceil(Math.max(...prices, 200) / 10) * 10;
  }, [products]);

  // Initialize price range when products load
  useEffect(() => {
    if (products.length > 0 && priceRange[1] === 200) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, products.length]);

  useEffect(() => {
    loadProducts();
  }, []);

  // Reset page and scroll to top when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortOption, priceRange]);

  // Scroll to top when page changes
  useEffect(() => {
    requestAnimationFrame(() => {
      // The actual scroll container is the document element on this layout
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
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

  // Filter and sort product groups
  const filteredGroups = useMemo(() => {
    let filtered = productGroups;

    // Filter by search
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      const words = searchLower.split(/\s+/);
      
      filtered = filtered.filter(group => {
        // Check if any product in the group matches
        return group.products.some(product => {
          const title = product.node.title.toLowerCase();
          const description = (product.node.description || '').toLowerCase();
          const productType = (product.node.productType || '').toLowerCase();
          
          return words.every(word => 
            title.includes(word) || 
            description.includes(word) || 
            productType.includes(word)
          );
        });
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const categoryTypes = CATEGORY_MAPPING[selectedCategory];
      
      if (selectedCategory === 'other') {
        // "Other" = products not in any defined category
        const allDefinedTypes = Object.values(CATEGORY_MAPPING)
          .flat()
          .filter(t => t);
        
        filtered = filtered.filter(group => 
          !allDefinedTypes.includes(group.productType)
        );
      } else {
        filtered = filtered.filter(group => 
          categoryTypes.includes(group.productType)
        );
      }
    }

    // Filter by price
    filtered = filtered.filter(group => 
      group.minPrice >= priceRange[0] && group.minPrice <= priceRange[1]
    );

    // Sort
    switch (sortOption) {
      case 'az':
        filtered.sort((a, b) => a.baseTitle.localeCompare(b.baseTitle));
        break;
      case 'za':
        filtered.sort((a, b) => b.baseTitle.localeCompare(a.baseTitle));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.minPrice - a.minPrice);
        break;
    }

    return filtered;
  }, [productGroups, searchQuery, selectedCategory, sortOption, priceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    sortOption !== 'az' || 
    priceRange[0] > 0 || 
    priceRange[1] < maxPrice ||
    searchQuery.trim().length > 0;

  const handleReset = () => {
    setSelectedCategory('all');
    setSortOption('az');
    setPriceRange([0, maxPrice]);
    setSearchQuery('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-light text-foreground flex items-center gap-2">
            {t('shop.title')}
            <Sparkle weight="fill" className="w-5 h-5 text-primary/60" />
          </h2>
          <p className="text-foreground/60 font-light text-sm">
            {t('shop.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <SearchOverlay 
            products={products}
            onProductSelect={onProductSelect || (() => {})}
            onSearch={setSearchQuery}
          />

          {/* Cart Button */}
          <CartDrawer>
            <button className="relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
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

      {/* Category Pills */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {[
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
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setSelectedCategory(cat.key); setCurrentPage(1); }}
              className={`px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <div className="relative">
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
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
            {t('shop.resetFilters')}
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div ref={shopContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden mt-6 scroll-smooth">
        {loading ? (
          <div className="flex items-center justify-center h-64 gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-primary"
                animate={{ y: [-6, 6, -6], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* AI Recommendations Widget */}
            <AIRecommendationsWidget onProductClick={onProductSelect} />
            
            {paginatedGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingCart weight="light" className="w-16 h-16 text-foreground/20 mb-4" />
                <p className="text-foreground/60 font-light">
                  {searchQuery || selectedCategory !== 'all' ? t('shop.noProducts') : t('shop.noProductsAvailable')}
                </p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentPage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {paginatedGroups.map((group, index) => (
                      <motion.div
                        key={group.baseTitle}
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ delay: index * 0.07, duration: 0.35 }}
                      >
                        <ProductGroupCard 
                          group={group} 
                          onProductClick={onProductSelect}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Pagination */}
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
    </div>
  );
}
