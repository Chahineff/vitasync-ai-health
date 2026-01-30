import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Repeat, 
  Check, 
  SpinnerGap,
  PencilSimple,
  Percent,
  ArrowRight
} from '@phosphor-icons/react';
import { ParsedSubscriptionBlock, formatPrice, SUBSCRIPTION_DISCOUNT_RATE } from '@/lib/subscription-calculator';
import { createSubscriptionCart } from '@/lib/shopify';
import { toast } from 'sonner';

interface SubscriptionCardProps {
  subscription: ParsedSubscriptionBlock;
  onModify?: () => void;
}

export function SubscriptionCard({ subscription, onModify }: SubscriptionCardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const handleCreateSubscription = async () => {
    // Check if we have valid variant IDs
    const validItems = subscription.items.filter(item => 
      item.variantId && item.variantId.startsWith('gid://shopify/ProductVariant/')
    );

    if (validItems.length === 0) {
      toast.error("Impossible de créer le panier", {
        description: "Les produits n'ont pas pu être identifiés. Demande à l'IA de régénérer l'abonnement.",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create cart items with real variant IDs from AI response
      const cartItems = validItems.map(item => ({
        variantId: item.variantId,
        quantity: item.packsPerMonth,
      }));

      console.log('Creating subscription cart with items:', cartItems);

      const result = await createSubscriptionCart(cartItems);
      
      if (result?.checkoutUrl) {
        toast.success("Panier créé !", {
          description: "Tu vas être redirigé vers le checkout Shopify.",
        });
        setIsCreated(true);
        // Open checkout in new tab
        window.open(result.checkoutUrl, '_blank');
        setTimeout(() => setIsCreated(false), 3000);
      } else {
        toast.error("Erreur lors de la création du panier", {
          description: "Vérifie ta connexion et réessaie.",
        });
      }
    } catch (error) {
      console.error('Error creating subscription cart:', error);
      toast.error("Erreur lors de la création de l'abonnement");
    } finally {
      setIsCreating(false);
    }
  };

  const discountPercent = Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 overflow-hidden my-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Repeat weight="bold" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Abonnement Mensuel</h3>
            <p className="text-xs text-muted-foreground">Livraison automatique chaque mois</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
          <Percent weight="bold" className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">-{discountPercent}%</span>
        </div>
      </div>

      {/* Products List */}
      <div className="p-4 space-y-3">
        {subscription.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Package weight="duotone" className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.dosePerDay}/jour • {item.packsPerMonth} pack{item.packsPerMonth > 1 ? 's' : ''}/mois
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-foreground">
                {formatPrice(item.priceAfterDiscount)}
              </p>
              <p className="text-xs text-muted-foreground line-through">
                {formatPrice(item.originalPrice)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-4 pb-4">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="text-foreground">
              {formatPrice(subscription.total + subscription.savings)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Économie abonnement</span>
            <span>-{formatPrice(subscription.savings)}</span>
          </div>
          <div className="h-px bg-border/50 my-2" />
          <div className="flex justify-between font-semibold">
            <span className="text-foreground">Total mensuel</span>
            <span className="text-primary text-lg">{formatPrice(subscription.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 flex gap-2">
        {onModify && (
          <button
            onClick={onModify}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors"
          >
            <PencilSimple weight="bold" className="w-4 h-4" />
            Modifier
          </button>
        )}
        <button
          onClick={handleCreateSubscription}
          disabled={isCreating || isCreated}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isCreating ? (
            <SpinnerGap weight="bold" className="w-4 h-4 animate-spin" />
          ) : isCreated ? (
            <Check weight="bold" className="w-4 h-4" />
          ) : (
            <ArrowRight weight="bold" className="w-4 h-4" />
          )}
          {isCreated ? 'Créé !' : 'Créer mon abonnement'}
        </button>
      </div>

      {/* Info footer */}
      <div className="px-4 pb-4">
        <p className="text-xs text-center text-muted-foreground">
          🇺🇸 Livraison USA uniquement • Annulable à tout moment
        </p>
      </div>
    </motion.div>
  );
}
