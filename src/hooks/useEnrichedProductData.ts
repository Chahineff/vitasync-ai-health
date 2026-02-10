import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnrichedProductData } from '@/components/dashboard/pdp/types';

export function useEnrichedProductData(productTitle: string | null) {
  const [data, setData] = useState<EnrichedProductData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productTitle) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Try exact match first
        let { data: result } = await supabase
          .from('product_enriched_data')
          .select('*')
          .eq('shopify_product_title', productTitle)
          .maybeSingle();

        // If no exact match, try partial match (product title might differ slightly)
        if (!result) {
          // Extract base name (remove flavor variants in parentheses)
          const baseName = productTitle.replace(/\s*\([^)]+\)\s*$/, '').trim();
          const { data: partialResult } = await supabase
            .from('product_enriched_data')
            .select('*')
            .ilike('shopify_product_title', `%${baseName}%`)
            .limit(1)
            .maybeSingle();
          result = partialResult;
        }

        if (result) {
          setData(result as unknown as EnrichedProductData);
        }
      } catch (err) {
        console.error('Failed to fetch enriched product data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productTitle]);

  return { enrichedData: data, enrichedLoading: loading };
}
