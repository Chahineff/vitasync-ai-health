import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductResearchRecord {
  product_id: string;
  name: string;
  product_handle: string | null;
  data: any;
}

export function useProductResearch(handle: string | null | undefined) {
  const [research, setResearch] = useState<ProductResearchRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!handle) { setResearch(null); return; }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('product_research')
        .select('product_id, name, product_handle, data')
        .eq('product_handle', handle)
        .maybeSingle();
      if (!cancelled) {
        setResearch((data as ProductResearchRecord | null) || null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [handle]);

  return { research, researchLoading: loading };
}