import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Spinner, Package, MapPin, CreditCard, CalendarCheck } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ShopifyConnectBannerProps {
  onConnect: () => Promise<void>;
  isAuthenticating: boolean;
  error: string | null;
}

const benefits = [
  { icon: Package, label: 'Gérer vos abonnements et produits' },
  { icon: CalendarCheck, label: 'Suivre vos commandes et livraisons' },
  { icon: MapPin, label: 'Modifier vos adresses de livraison' },
  { icon: CreditCard, label: 'Consulter vos moyens de paiement' },
];

export function ShopifyConnectBanner({ onConnect, isAuthenticating, error }: ShopifyConnectBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-card rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-primary/20 p-8 md:p-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <ShoppingBag weight="duotone" className="w-10 h-10 text-primary" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Connectez votre compte Shopify
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Liez votre compte pour accéder à toutes les fonctionnalités de gestion directement depuis VitaSync.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full max-w-lg">
          {benefits.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground/80">{label}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={onConnect}
          disabled={isAuthenticating}
          size="lg"
          className="rounded-xl px-8 transition-all duration-200 ease-in-out"
        >
          {isAuthenticating ? (
            <>
              <Spinner weight="bold" className="w-5 h-5 mr-2 animate-spin" />
              Connexion en cours…
            </>
          ) : (
            <>
              Connecter mon compte
              <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {error && (
          <p className="text-sm text-destructive mt-4">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
