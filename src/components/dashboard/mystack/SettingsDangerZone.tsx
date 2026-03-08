import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, PlugsConnected, ArrowSquareOut } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AddressModal } from './AddressModal';
import { useTranslation } from '@/hooks/useTranslation';
import type { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

interface SettingsDangerZoneProps {
  index: number;
  customer: ReturnType<typeof useShopifyCustomer>;
}

export function SettingsDangerZone({ index, customer }: SettingsDangerZoneProps) {
  const { t } = useTranslation();
  const { isConnected, customer: customerData, disconnect, executeQuery, refresh } = customer;
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const address = customerData?.defaultAddress;
  const hasAddress = !!address;
  const addressLines = hasAddress
    ? [address.address1, address.address2, [address.zip, address.city].filter(Boolean).join(' '), address.country].filter(Boolean)
    : [];

  const handlePaymentClick = () => {
    if (!isConnected) {
      toast.info(t('settingsDanger.connectForPayment'));
      return;
    }
    window.open('https://shopify.com/99633365360/account', '_blank');
    toast.info(t('settingsDanger.redirectToShopify'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <CreditCard weight="duotone" className="w-5 h-5 text-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('settingsDanger.paymentTitle')}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{t('settingsDanger.noPayment')}</p>
          <Button
            variant="outline"
            className="rounded-xl border-border"
            onClick={handlePaymentClick}
          >
            {t('settingsDanger.manageOnShopify')}
            <ArrowSquareOut weight="bold" className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="bg-card rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.03)] p-6 border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <MapPin weight="duotone" className="w-5 h-5 text-foreground/70" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{t('settingsDanger.addressTitle')}</h3>
          </div>
          {hasAddress ? (
            <>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {addressLines.map((line, i) => (
                  <span key={i}>{line}{i < addressLines.length - 1 && <br />}</span>
                ))}
              </p>
              <Button variant="outline" className="rounded-xl border-border" onClick={() => setAddressModalOpen(true)}>
                {t('settingsDanger.edit')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">{t('settingsDanger.noAddress')}</p>
              <Button
                variant="outline"
                className="rounded-xl border-border"
                onClick={() => {
                  if (!isConnected) { toast.info(t('settingsDanger.connectForAddress')); return; }
                  setAddressModalOpen(true);
                }}
              >
                {t('settingsDanger.add')}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-4">
        {isConnected && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5">
                <PlugsConnected weight="bold" className="w-4 h-4" />
                {t('shopify.disconnect')}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('mystack.disconnectTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('mystack.disconnectDesc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">{t('mystack.cancel')}</AlertDialogCancel>
                <AlertDialogAction className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={disconnect}>
                  {t('mystack.confirmDisconnect')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <button className="text-sm text-muted-foreground hover:text-destructive transition-colors duration-200 underline-offset-4 hover:underline" onClick={() => {}}>
          {t('settingsDanger.cancelSubscription')}
        </button>
      </div>

      <AddressModal
        open={addressModalOpen}
        onOpenChange={setAddressModalOpen}
        currentAddress={customerData?.defaultAddress || null}
        executeQuery={executeQuery}
        onSuccess={refresh}
      />
    </motion.div>
  );
}
