import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Spinner, Package, MapPin, CreditCard, CalendarCheck, ShieldCheck, ArrowSquareOut } from '@phosphor-icons/react';
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
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/hooks/useTranslation';

interface ShopifyConnectBannerProps {
  onConnect: () => Promise<void>;
  isAuthenticating: boolean;
  error: string | null;
}

export function ShopifyConnectBanner({ onConnect, isAuthenticating, error }: ShopifyConnectBannerProps) {
  const { t } = useTranslation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const benefits = [
    { icon: Package, label: t('shopify.benefit1') },
    { icon: CalendarCheck, label: t('shopify.benefit2') },
    { icon: MapPin, label: t('shopify.benefit3') },
    { icon: CreditCard, label: t('shopify.benefit4') },
  ];

  const handleConfirm = async () => {
    setConfirmOpen(false);
    await onConnect();
  };

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
          {t('shopify.connectTitle')}
        </h2>
        <p className="text-muted-foreground max-w-md mb-8">
          {t('shopify.connectSubtitle')}
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
          onClick={() => setConfirmOpen(true)}
          disabled={isAuthenticating}
          size="lg"
          className="rounded-xl px-8 transition-all duration-200 ease-in-out"
        >
          {isAuthenticating ? (
            <>
              <Spinner weight="bold" className="w-5 h-5 mr-2 animate-spin" />
              {t('shopify.connecting')}
            </>
          ) : (
            <>
              {t('shopify.connectBtn')}
              <ArrowRight weight="bold" className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {error && (
          <p className="text-sm text-destructive mt-4">{error}</p>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck weight="duotone" className="w-5 h-5 text-primary" />
              </div>
              <AlertDialogTitle>{t('shopify.confirmTitle')}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {t('shopify.confirmIntro')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-foreground">{t('shopify.confirmSyncedTitle')}</p>
            <ul className="space-y-2">
              {benefits.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3 text-sm text-foreground/80">
                  <Icon weight="duotone" className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-foreground/60 pt-2 border-t border-border/40">
              {t('shopify.confirmPrivacy')}
            </p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('shopify.confirmCancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {t('shopify.confirmContinue')}
              <ArrowSquareOut weight="bold" className="w-4 h-4 ml-2" />
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
