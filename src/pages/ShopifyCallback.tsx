import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShopifyCustomer } from '@/hooks/useShopifyCustomer';

export default function ShopifyCallback() {
  const navigate = useNavigate();
  const { isAuthenticating } = useShopifyCustomer();

  useEffect(() => {
    // The hook handles the callback automatically
    // Once done, it redirects to /dashboard
    // This is just a loading screen
    const timeout = setTimeout(() => {
      // Fallback redirect if callback takes too long
      if (!isAuthenticating) {
        navigate('/dashboard', { replace: true });
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [navigate, isAuthenticating]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Connexion de votre compte Shopify...</p>
      </div>
    </div>
  );
}
