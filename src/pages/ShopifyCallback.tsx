import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

export default function ShopifyCallback() {
  const navigate = useNavigate();
  const { processCallback } = useShopifyCustomer();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    processCallback().then((success) => {
      navigate('/dashboard', { replace: true });
    });
  }, [processCallback, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Connexion de votre compte Shopify...</p>
      </div>
    </div>
  );
}
