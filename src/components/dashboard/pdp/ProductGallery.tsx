import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, X, Star } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: Array<{
    url: string;
    altText: string | null;
  }>;
  productTitle: string;
  recommendedByAI?: boolean;
}

export function ProductGallery({ images, productTitle, recommendedByAI }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Create 8 slots - fill with existing images or placeholders
  const imageSlots = Array.from({ length: 8 }, (_, i) => {
    const image = images[i];
    return {
      url: image?.url || '',
      alt: image?.altText || `${productTitle} - Image ${i + 1}`,
      hasImage: !!image?.url,
      slotType: getSlotType(i),
    };
  });

  const selectedImage = imageSlots[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
          <AnimatePresence mode="wait">
            {selectedImage.hasImage ? (
              <motion.img
                key={selectedImage.url}
                src={selectedImage.url}
                alt={selectedImage.alt}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <motion.div
                key={`placeholder-${selectedIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex items-center justify-center"
              >
                <div className="text-center text-muted-foreground/50">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-lg bg-muted/50 flex items-center justify-center">
                    <span className="text-2xl font-light">{selectedIndex + 1}</span>
                  </div>
                  <p className="text-xs">{selectedImage.slotType}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Recommended Badge */}
          {recommendedByAI && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <Star weight="fill" className="w-3.5 h-3.5" />
              Recommandé par l'IA
            </div>
          )}

          {/* Zoom Button */}
          {selectedImage.hasImage && (
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
                    alt={selectedImage.alt}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {imageSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all",
              selectedIndex === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border/50 hover:border-border"
            )}
          >
            {slot.hasImage ? (
              <img
                src={slot.url}
                alt={slot.alt}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground/50">{index + 1}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function getSlotType(index: number): string {
  const types = [
    'Packshot',
    'Angle 3D',
    'Lifestyle',
    'Texture',
    'Bénéfices',
    'Utilisation',
    'Supplement Facts',
    'Qualité',
  ];
  return types[index] || 'Image';
}
