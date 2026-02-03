import { Star, PencilSimple } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductReviewsProps {
  productTitle: string;
}

export function ProductReviews({ productTitle }: ProductReviewsProps) {
  // Placeholder data
  const averageRating = 0;
  const totalReviews = 0;
  
  const placeholderReviews = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ];

  return (
    <section className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Customer Reviews
        </h2>
        <Badge variant="outline" className="text-xs">
          Placeholder
        </Badge>
      </div>

      {/* Summary Rating */}
      <div className="flex items-center gap-6 p-6 rounded-2xl bg-muted/30 border border-border/30">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">—</div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                weight="light" 
                className="w-4 h-4 text-foreground/20" 
              />
            ))}
          </div>
          <p className="text-xs text-foreground/50 mt-1">No reviews yet</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs text-foreground/50 w-3">{rating}</span>
              <Star weight="fill" className="w-3 h-3 text-foreground/20" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-foreground/20 rounded-full" 
                  style={{ width: '0%' }} 
                />
              </div>
              <span className="text-xs text-foreground/30 w-6">0</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {placeholderReviews.map((review) => (
          <div 
            key={review.id}
            className="p-5 rounded-2xl bg-muted/20 border border-border/20 border-dashed space-y-3"
          >
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  weight="light" 
                  className="w-4 h-4 text-foreground/20" 
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-foreground/5 rounded w-3/4" />
              <div className="h-3 bg-foreground/5 rounded w-full" />
              <div className="h-3 bg-foreground/5 rounded w-5/6" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-foreground/5" />
              <div className="h-3 bg-foreground/5 rounded w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Write Review CTA */}
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          disabled
          className="gap-2"
        >
          <PencilSimple weight="light" className="w-4 h-4" />
          Write a Review (Coming Soon)
        </Button>
      </div>
    </section>
  );
}
