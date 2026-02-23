import { motion } from 'framer-motion';
import { ArrowsClockwise, Trash } from '@phosphor-icons/react';

interface StackProduct {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: string;
}

const MOCK_PRODUCTS: StackProduct[] = [
  { id: '1', name: 'Magnésium Bisglycinate', image: '/placeholder.svg', quantity: 1, price: '19,99 €' },
  { id: '2', name: 'Oméga 3 EPA/DHA', image: '/placeholder.svg', quantity: 1, price: '24,99 €' },
  { id: '3', name: 'Ashwagandha KSM-66', image: '/placeholder.svg', quantity: 1, price: '14,99 €' },
];

interface CurrentStackListProps {
  index: number;
}

export function CurrentStackList({ index }: CurrentStackListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        Dans votre prochaine box
      </h2>

      <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-border/50 divide-y divide-border/50">
        {MOCK_PRODUCTS.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-4 p-4 md:p-6 transition-all duration-200 hover:bg-muted/30 first:rounded-t-[20px] last:rounded-b-[20px] group"
          >
            {/* Image */}
            <div className="w-16 h-16 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-medium text-foreground truncate">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">x{product.quantity}</p>
            </div>

            {/* Price */}
            <p className="text-base font-semibold text-foreground hidden sm:block">
              {product.price}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/5">
                <ArrowsClockwise weight="bold" className="w-4 h-4" />
                <span className="hidden md:inline">Échanger</span>
              </button>
              <button className="text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-destructive/5">
                <Trash weight="bold" className="w-4 h-4" />
                <span className="hidden md:inline">Retirer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
