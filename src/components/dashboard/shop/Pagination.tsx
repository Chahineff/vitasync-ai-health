import { CaretLeft, CaretRight, CaretDoubleLeft, CaretDoubleRight } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
      {/* Page info */}
      <p className="text-sm text-foreground/60 order-2 sm:order-1">
        {totalItems} {t('shop.productsFound')}
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="First page"
        >
          <CaretDoubleLeft className="w-4 h-4 text-foreground/70" />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <CaretLeft className="w-4 h-4 text-foreground/70" />
        </button>

        {/* Page indicator */}
        <div className="px-4 py-2 text-sm text-foreground/70">
          {t('shop.page')} <span className="font-medium text-foreground">{currentPage}</span> {t('shop.of')} {totalPages}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <CaretRight className="w-4 h-4 text-foreground/70" />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Last page"
        >
          <CaretDoubleRight className="w-4 h-4 text-foreground/70" />
        </button>
      </div>
    </div>
  );
}
