import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Repeat, 
  Plus, 
  Minus,
  Trash,
  SpinnerGap,
  ShoppingCart,
  Percent,
  CalendarBlank,
  X
} from '@phosphor-icons/react';
import { 
  SubscriptionSummary, 
  SubscriptionLineItem,
  formatPrice,
  SUBSCRIPTION_DISCOUNT_RATE,
  DEFAULT_CYCLE_DAYS
} from '@/lib/subscription-calculator';
import { createSubscriptionCart } from '@/lib/shopify';
import { toast } from 'sonner';

interface SubscriptionBuilderProps {
  summary: SubscriptionSummary;
  onAdjustDose: (productId: string, newDose: number) => void;
  onRemove: (productId: string) => void;
  onClose?: () => void;
}

export function SubscriptionBuilder({ 
  summary, 
  onAdjustDose, 
  onRemove,
  onClose 
}: SubscriptionBuilderProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const items = summary.lines.map(line => ({
        variantId: line.variantId,
        quantity: line.packsNeeded,
        sellingPlanId: line.sellingPlanId || undefined
      }));

      const result = await createSubscriptionCart(items);
      
      if (result?.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank');
        toast.success("Redirection vers le checkout...");
      } else {
        toast.error("Impossible de créer le panier d'abonnement");
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      toast.error("Erreur lors de la création de l'abonnement");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const discountPercent = Math.round(SUBSCRIPTION_DISCOUNT_RATE * 100);

  if (summary.lines.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <Package weight="duotone" className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Aucun produit dans l'abonnement</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Repeat weight="bold" className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">
              Ton Abonnement Mensuel
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarBlank weight="bold" className="w-4 h-4" />
              <span>Livraison tous les {summary.cycleDays} jours</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-semibold">
            <Percent weight="bold" className="w-4 h-4" />
            -{discountPercent}%
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X weight="bold" className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {summary.lines.map((line) => (
            <SubscriptionLineItemRow
              key={line.productId}
              line={line}
              currencyCode={summary.currencyCode}
              onAdjustDose={onAdjustDose}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Totals */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total ({summary.lines.length} produit{summary.lines.length > 1 ? 's' : ''})</span>
            <span className="text-foreground">{formatPrice(summary.subtotalBeforeDiscount, summary.currencyCode)}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Économie abonnement ({discountPercent}%)</span>
            <span>-{formatPrice(summary.totalDiscount, summary.currencyCode)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Total mensuel</span>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(summary.totalAfterDiscount, summary.currencyCode)}
            </span>
          </div>
        </div>

        {/* Warning if no selling plans */}
        {!summary.hasSellingPlans && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Certains produits ne supportent pas encore l'abonnement récurrent. 
              Ils seront ajoutés en achat unique.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleCheckout}
          disabled={isCheckingOut || summary.lines.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isCheckingOut ? (
            <SpinnerGap weight="bold" className="w-5 h-5 animate-spin" />
          ) : (
            <ShoppingCart weight="bold" className="w-5 h-5" />
          )}
          {isCheckingOut ? 'Création en cours...' : 'Valider et payer'}
        </button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          🇺🇸 Livraison USA uniquement • Annulable à tout moment • Frais de port calculés au checkout
        </p>
      </div>
    </motion.div>
  );
}

// Sub-component for each line item
function SubscriptionLineItemRow({
  line,
  currencyCode,
  onAdjustDose,
  onRemove
}: {
  line: SubscriptionLineItem;
  currencyCode: string;
  onAdjustDose: (productId: string, newDose: number) => void;
  onRemove: (productId: string) => void;
}) {
  const handleIncrease = useCallback(() => {
    onAdjustDose(line.productId, line.dosePerDay + 1);
  }, [line.productId, line.dosePerDay, onAdjustDose]);

  const handleDecrease = useCallback(() => {
    if (line.dosePerDay > 1) {
      onAdjustDose(line.productId, line.dosePerDay - 1);
    }
  }, [line.productId, line.dosePerDay, onAdjustDose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-background border border-border/50 hover:border-border transition-colors"
    >
      {/* Product Icon */}
      <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
        <Package weight="duotone" className="w-6 h-6 text-secondary-foreground" />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{line.productName}</p>
        <p className="text-xs text-muted-foreground">
          {line.packUnits} {line.unitType}/pack • {line.packsNeeded} pack{line.packsNeeded > 1 ? 's' : ''}/mois
        </p>
        {!line.hasSellingPlan && (
          <span className="inline-flex items-center text-xs text-amber-600 dark:text-amber-400">
            Achat unique
          </span>
        )}
      </div>

      {/* Dose Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleDecrease}
          disabled={line.dosePerDay <= 1}
          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 transition-colors"
        >
          <Minus weight="bold" className="w-4 h-4" />
        </button>
        <span className="w-8 text-center text-sm font-semibold">{line.dosePerDay}</span>
        <button
          onClick={handleIncrease}
          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          <Plus weight="bold" className="w-4 h-4" />
        </button>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-foreground">
          {formatPrice(line.lineTotal, currencyCode)}
        </p>
        <p className="text-xs text-muted-foreground line-through">
          {formatPrice(line.lineSubtotal, currencyCode)}
        </p>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(line.productId)}
        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
      >
        <Trash weight="bold" className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
