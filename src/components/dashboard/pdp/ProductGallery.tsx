import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { MagnifyingGlass, Star } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: Array<{
    url: string;
    altText: string | null;
  }>;
  productTitle: string;
  recommendedByAI?: boolean;
  tags?: string[];
}

export function ProductGallery({ images, productTitle, recommendedByAI, tags }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const realImages = images.filter((img) => !!img.url);
  const selectedImage = realImages[selectedIndex] || null;

  const badgeTags = (tags || []).filter((tag) => {
    const lower = tag.toLowerCase();
    return ['vegan', 'gluten-free', 'unflavored', 'micronized', 'organic', 'non-gmo', 'sugar-free', 'keto', 'halal', 'kosher'].some((k) => lower.includes(k));
  }).slice(0, 4);

  const swipeThreshold = 50;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -swipeThreshold && selectedIndex < realImages.length - 1) {
      setDirection(1);
      setSelectedIndex(selectedIndex + 1);
    } else if (info.offset.x > swipeThreshold && selectedIndex > 0) {
      setDirection(-1);
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goTo = (index: number) => {
    setDirection(index > selectedIndex ? 1 : -1);
    setSelectedIndex(index);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative">
        <div
          ref={containerRef}
          className="relative aspect-square rounded-[20px] overflow-hidden bg-[hsl(210_40%_98%)] dark:bg-muted/10 border border-[hsl(214_32%_91%)] dark:border-border/50 touch-pan-y"
        >
          <AnimatePresence mode="wait" custom={direction}>
            {selectedImage ? (
              <motion.img
                key={selectedImage.url}
                src={selectedImage.url}
                alt={selectedImage.altText || productTitle}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                drag={realImages.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                className="w-full h-full object-contain p-4 cursor-grab active:cursor-grabbing"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex items-center justify-center text-muted-foreground/50"
              >
                <span className="text-sm">No image</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay Badges — top left */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 pointer-events-none">
            {recommendedByAI && (
              <div className="px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-lg">
                <Star weight="fill" className="w-3.5 h-3.5" />
                AI Pick
              </div>
            )}
            {badgeTags.map((tag) => (
              <div
                key={tag}
                className="px-3 py-1.5 rounded-full bg-[hsl(210_40%_96%)] dark:bg-muted/60 text-foreground dark:text-foreground text-xs font-normal border border-[hsl(214_32%_91%)] dark:border-border/30"
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Dot indicators — mobile */}
          {realImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 lg:hidden">
              {realImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'rounded-full transition-all duration-200',
                    selectedIndex === i
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-foreground/20'
                  )}
                />
              ))}
            </div>
          )}

          {/* Zoom Button */}
          {selectedImage && (
            <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
              <DialogTrigger asChild>
                <button className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-background transition-colors shadow-lg">
                  <MagnifyingGlass weight="light" className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full p-0 bg-background border-border">
                <div className="relative aspect-square">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.altText || productTitle}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Thumbnails — desktop only, hover to preview */}
      {realImages.length > 1 && (
        <div className="hidden lg:flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {realImages.map((img, index) => (
            <button
              key={index}
              onMouseEnter={() => goTo(index)}
              onClick={() => goTo(index)}
              className={cn(
                'flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-[hsl(214_32%_91%)] dark:border-border/50 hover:border-foreground/30'
              )}
            >
              <img
                src={img.url}
                alt={img.altText || `${productTitle} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
