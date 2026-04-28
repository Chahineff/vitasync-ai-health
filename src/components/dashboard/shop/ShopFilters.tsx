import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowsDownUp, X } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import { Slider } from '@/components/ui/slider';
import { formatPriceUSD } from '@/lib/utils';

export type SortOption = 'az' | 'za' | 'price-low' | 'price-high';
export type CategoryKey = 'all' | 'sport' | 'wellness' | 'digestive' | 'vitamins' | 'brain' | 'weight' | 'mushrooms' | 'bones' | 'other';

// Mapping from mega-categories to Shopify productType values
export const CATEGORY_MAPPING: Record<CategoryKey, string[]> = {
  all: [],
  sport: [
    'Proteins',
    'Muscle Builders',
    'Pre-Workout Supplements',
    'Intra-Workout Supplements',
    'Post-Workout Recovery',
  ],
  wellness: [
    'Specialty Supplements',
    'Stress & Relaxation',
    'Sleep Support',
    'Sexual & Reproductive Wellness',
  ],
  digestive: ['Digestive Support', 'Gut Health'],
  vitamins: ['Vitamins & Minerals'],
  brain: ['Brain & Cognitive'],
  weight: ['Weight Management'],
  mushrooms: ['Mushroom Products', 'Bee Products'],
  bones: ['Bone, Joint & Cartilage'],
  other: [],
};

interface ShopFiltersProps {
  selectedCategory: CategoryKey;
  onCategoryChange: (category: CategoryKey) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function ShopFilters({
  selectedCategory,
  onCategoryChange,
  sortOption,
  onSortChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  onReset,
  hasActiveFilters,
}: ShopFiltersProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);

  const categories: { key: CategoryKey; labelKey: string }[] = [
    { key: 'all', labelKey: 'shop.allCategories' },
    { key: 'sport', labelKey: 'shop.sport' },
    { key: 'wellness', labelKey: 'shop.wellness' },
    { key: 'digestive', labelKey: 'shop.digestive' },
    { key: 'vitamins', labelKey: 'shop.vitamins' },
    { key: 'brain', labelKey: 'shop.brain' },
    { key: 'weight', labelKey: 'shop.weight' },
    { key: 'mushrooms', labelKey: 'shop.mushrooms' },
    { key: 'bones', labelKey: 'shop.bones' },
    { key: 'other', labelKey: 'shop.other' },
  ];

  const sortOptions: { value: SortOption; labelKey: string }[] = [
    { value: 'az', labelKey: 'shop.sortAZ' },
    { value: 'za', labelKey: 'shop.sortZA' },
    { value: 'price-low', labelKey: 'shop.sortPriceLow' },
    { value: 'price-high', labelKey: 'shop.sortPriceHigh' },
  ];

  return (
    <div className="space-y-4">
      {/* Category tabs - scrollable on mobile */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {t(cat.labelKey)}
              {selectedCategory === cat.key && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort & Price Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none pl-10 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm text-foreground font-light cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
          <ArrowsDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
        </div>

        {/* Price filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-light transition-colors ${
            showFilters || priceRange[0] > 0 || priceRange[1] < maxPrice
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-white/5 border border-white/10 text-foreground/70 hover:bg-white/10'
          }`}
        >
          {t('shop.priceRange')}: {priceRange[0]}€ - {priceRange[1]}€
        </button>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-light text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
            {t('shop.resetFilters')}
          </button>
        )}
      </div>

      {/* Price slider panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-foreground/70">{t('shop.priceRange')}</span>
            <span className="text-sm font-medium text-foreground">
              {priceRange[0]}€ - {priceRange[1]}€
            </span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={(value) => onPriceRangeChange(value as [number, number])}
            min={0}
            max={maxPrice}
            step={5}
            className="w-full"
          />
        </motion.div>
      )}
    </div>
  );
}
