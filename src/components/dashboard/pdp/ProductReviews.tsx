import { useState } from 'react';
import { Star, ChatCircleDots, CaretDown, UserCircle, ThumbsUp, ThumbsDown } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FAQItem } from './types';

interface ProductReviewsProps {
  productTitle: string;
  productHandle?: string;
  enrichedFaq?: FAQItem[];
  reviewRating?: number | null;
  reviewCount?: number | null;
}

export function ProductReviews({ productTitle, productHandle, enrichedFaq, reviewRating, reviewCount }: ProductReviewsProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const faqItems = enrichedFaq?.slice(0, 4) || [];
  const hasReviews = reviewRating != null && reviewCount != null && reviewCount > 0;
  const rating = reviewRating ?? 0;
  const count = reviewCount ?? 0;

  // Star distribution placeholder — percentage bars
  const starDistribution = hasReviews
    ? [
        { stars: 5, pct: 72 },
        { stars: 4, pct: 18 },
        { stars: 3, pct: 6 },
        { stars: 2, pct: 3 },
        { stars: 1, pct: 1 },
      ]
    : [5, 4, 3, 2, 1].map(s => ({ stars: s, pct: 0 }));

  return (
    <section className="py-8 space-y-8">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        {t('pdp.customerReviews')}
      </h2>

      {/* Rating Summary + Distribution */}
      <div className="flex flex-col md:flex-row items-start gap-6 p-6 rounded-2xl bg-white dark:bg-muted/20 border border-[#E2E8F0] dark:border-border/30">
        <div className="text-center md:min-w-[120px]">
          <div className="text-5xl font-bold text-foreground">{hasReviews ? rating.toFixed(1) : '—'}</div>
          <div className="flex items-center justify-center gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = hasReviews && star <= Math.round(rating);
              return (
                <Star key={star} weight={filled ? 'fill' : 'light'} className={cn("w-5 h-5", filled ? 'text-amber-400' : 'text-foreground/15')} />
              );
            })}
          </div>
          <p className="text-sm text-foreground/50 mt-2">
            {hasReviews ? `${count} ${t('pdp.reviews')}` : t('pdp.noReviewsYet')}
          </p>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {starDistribution.map((row) => (
            <div key={row.stars} className="flex items-center gap-3">
              <span className="text-xs text-foreground/50 w-3 text-right">{row.stars}</span>
              <Star weight="fill" className="w-3.5 h-3.5 text-amber-400/60" />
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
              <span className="text-xs text-foreground/40 w-8">{row.pct > 0 ? `${row.pct}%` : '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards — empty placeholders per reviews policy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((id) => (
          <div key={id} className="p-5 rounded-2xl bg-white dark:bg-muted/10 border border-[#E2E8F0] dark:border-border/30 border-dashed space-y-4">
            {/* Stars placeholder */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} weight="light" className="w-4 h-4 text-foreground/15" />
              ))}
            </div>
            {/* Title + body placeholder */}
            <div className="space-y-2">
              <div className="h-4 bg-foreground/5 rounded-md w-3/4" />
              <div className="h-3 bg-foreground/5 rounded-md w-full" />
              <div className="h-3 bg-foreground/5 rounded-md w-5/6" />
            </div>
            {/* Helpful buttons placeholder */}
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-foreground/5" />
                <div className="h-3 bg-foreground/5 rounded w-20" />
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp weight="light" className="w-3.5 h-3.5 text-foreground/15" />
                <ThumbsDown weight="light" className="w-3.5 h-3.5 text-foreground/15" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="flex items-center gap-3 justify-center flex-wrap">
        {productHandle && (
          <a href={`https://vitasync2.myshopify.com/products/${productHandle}#judgeme_product_reviews`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <Star weight="light" className="w-4 h-4" />
              {t('pdp.readReviewsJudgme')}
            </Button>
          </a>
        )}
        <Button
          variant="ghost"
          className="gap-2 text-primary"
          onClick={() => {
            const question = t('pdp.askVitaSyncQuestion').replace('{product}', productTitle);
            navigate('/dashboard', { state: { activeTab: 'coach', prefillMessage: question } });
          }}
        >
          <ChatCircleDots weight="light" className="w-4 h-4" />
          {t('pdp.askVitaSync')}
        </Button>
      </div>

      {/* Q&A Section */}
      {faqItems.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border/20">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ChatCircleDots weight="duotone" className="w-5 h-5 text-primary/60" />
            {t('pdp.faq')}
          </h3>
          <div className="space-y-2">
            {faqItems.map((faq, index) => (
              <div key={index} className="rounded-xl border border-[#E2E8F0] dark:border-border/30 overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground pr-4">{faq.question}</span>
                  <CaretDown weight="light" className={cn("w-4 h-4 text-foreground/50 transition-transform flex-shrink-0", openFaqIndex === index && "rotate-180")} />
                </button>
                <div className={cn("grid transition-all duration-300", openFaqIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4">
                      <p className="text-sm text-foreground/60 font-light leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
