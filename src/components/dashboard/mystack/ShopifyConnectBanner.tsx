import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Spinner } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ShopifyConnectBannerProps {
  onConnect: () => Promise<void>;
  isAuthenticating: boolean;
  error: string | null;
}

export function ShopifyConnectBanner({ onConnect, isAuthenticating, error }: ShopifyConnectBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-primary/30 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ShoppingBag weight="duotone" className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Connectez votre compte Shopify
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pour gérer vos abonnements, produits et livraisons directement depuis VitaSync.
              </p>
            </div>
          </div>
          <Button
            onClick={onConnect}
            disabled={isAuthenticating}
            className="rounded-xl transition-all duration-200 ease-in-out"
          >
            {isAuthenticating ? (
              <>
                <Spinner weight="bold" className="w-4 h-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                Connecter mon compte
                <ArrowRight weight="bold" className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-destructive mt-3">{error}</p>
        )}
      </div>
    </motion.div>
  );
}
