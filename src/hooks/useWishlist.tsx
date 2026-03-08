import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useWishlist(productHandle: string | null) {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !productHandle) return;
    (supabase as any)
      .from('user_wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_handle', productHandle)
      .maybeSingle()
      .then(({ data }: any) => setIsWishlisted(!!data));
  }, [user, productHandle]);

  const toggle = useCallback(async () => {
    if (!user || !productHandle || loading) return;
    setLoading(true);
    try {
      if (isWishlisted) {
        await (supabase as any)
          .from('user_wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_handle', productHandle);
        setIsWishlisted(false);
      } else {
        await (supabase as any)
          .from('user_wishlists')
          .insert({ user_id: user.id, product_handle: productHandle });
        setIsWishlisted(true);
      }
    } catch (e) {
      console.error('Wishlist toggle failed:', e);
    } finally {
      setLoading(false);
    }
  }, [user, productHandle, isWishlisted, loading]);

  return { isWishlisted, toggleWishlist: toggle, loading };
}
