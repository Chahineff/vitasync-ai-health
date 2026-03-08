import { motion } from 'framer-motion';

export function ShopSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl overflow-hidden bg-card border border-border"
        >
          {/* Image skeleton */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
            <div className="absolute inset-0 bg-muted animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
          </div>
          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="flex gap-1">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-3.5 h-3.5 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
            <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 w-20 rounded bg-muted animate-pulse" />
              <div className="h-9 w-20 rounded-lg bg-muted animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
