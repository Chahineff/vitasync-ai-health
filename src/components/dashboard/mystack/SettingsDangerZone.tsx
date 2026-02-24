import { motion } from 'framer-motion';
import { CreditCard, MapPin, PlugsConnected } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

interface SettingsDangerZoneProps {
  index: number;
  customer: ReturnType<typeof useShopifyCustomer>;
}

export function SettingsDangerZone({ index, customer }: SettingsDangerZoneProps) {
  const { isConnected, customer: customerData, disconnect } = customer;

  const address = customerData?.defaultAddress;
  const hasAddress = !!address;
  const addressLines = hasAddress
    ? [
        address.address1,
        address.address2,
        [address.zip, address.city].filter(Boolean).join(' '),
        address.country,
      ].filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Card */}
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard weight="duotone" className="w-6 h-6 text-foreground/70" />
            <h3 className="text-lg font-semibold text-foreground">Moyen de paiement</h3>
          </div>
          <p className="text-base text-muted-foreground mb-4">
            Aucun moyen de paiement enregistré
          </p>
          <Button
            variant="outline"
            className="rounded-xl transition-all duration-200 ease-in-out border-border"
            onClick={() => {}}
          >
            Ajouter
          </Button>
        </div>

        {/* Address Card */}
        <div className="bg-card rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <MapPin weight="duotone" className="w-6 h-6 text-foreground/70" />
            <h3 className="text-lg font-semibold text-foreground">Adresse de livraison</h3>
          </div>
          {hasAddress ? (
            <>
              <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                {addressLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <Button
                variant="outline"
                className="rounded-xl transition-all duration-200 ease-in-out border-border"
                onClick={() => {}}
              >
                Modifier
              </Button>
            </>
          ) : (
            <>
              <p className="text-base text-muted-foreground mb-4">
                Aucune adresse enregistrée
              </p>
              <Button
                variant="outline"
                className="rounded-xl transition-all duration-200 ease-in-out border-border"
                onClick={() => {}}
              >
                Ajouter
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Connection status & Cancel */}
      <div className="flex flex-col items-center gap-3 pt-4">
        {isConnected && (
          <button
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1"
            onClick={disconnect}
          >
            <PlugsConnected weight="bold" className="w-4 h-4" />
            Déconnecter mon compte Shopify
          </button>
        )}
        <button
          className="text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 underline-offset-4 hover:underline"
          onClick={() => {}}
        >
          Annuler mon abonnement
        </button>
      </div>
    </motion.div>
  );
}
