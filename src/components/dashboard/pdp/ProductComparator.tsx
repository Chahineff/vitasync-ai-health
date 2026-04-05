import { ShopifyProduct } from '@/lib/shopify';
import { CheckCircle, XCircle } from '@phosphor-icons/react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface ProductComparatorProps {
  currentProduct: {
    title: string;
    price: string;
    productType: string;
    vendor: string;
    tags: string[];
  };
  alternatives: ShopifyProduct[];
  onProductClick?: (handle: string) => void;
}

export function ProductComparator({ currentProduct, alternatives, onProductClick }: ProductComparatorProps) {
  const { t } = useTranslation();

  const comparables = alternatives
    .filter(p => {
      const tp = p.node.productType?.toLowerCase() || '';
      const ct = currentProduct.productType?.toLowerCase() || '';
      return tp === ct && p.node.title !== currentProduct.title;
    })
    .slice(0, 2);

  if (comparables.length === 0) return null;

  const allProducts = [
    {
      title: currentProduct.title,
      price: currentProduct.price,
      vendor: currentProduct.vendor,
      tags: currentProduct.tags,
      handle: null as string | null,
      isCurrent: true,
    },
    ...comparables.map(p => ({
      title: p.node.title,
      price: parseFloat(p.node.priceRange.minVariantPrice.amount).toFixed(2),
      vendor: p.node.vendor || '—',
      tags: [] as string[],
      handle: p.node.handle,
      isCurrent: false,
    })),
  ];

  const features = [
    { key: 'vegan', label: t('pdp.featureVegan') },
    { key: 'gluten', label: t('pdp.featureGlutenFree') },
    { key: 'bio', label: t('pdp.featureOrganic') },
    { key: 'france', label: t('pdp.featureMadeInFrance') },
  ];

  const hasFeature = (product: typeof allProducts[0], featureKey: string) => {
    if (product.isCurrent) {
      return currentProduct.tags.some(tg => tg.toLowerCase().includes(featureKey.toLowerCase()));
    }
    return null;
  };

  return (
    <section className="py-6 space-y-4">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground tracking-tight">
        {t('pdp.compare')}
      </h2>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[400px] text-sm">
          <thead>
            <tr>
              <th className="text-left font-normal text-foreground/40 py-2 pr-4 w-28"></th>
              {allProducts.map((p, i) => (
                <th key={i} className="text-left py-2 px-3">
                  <div className="space-y-1">
                    {p.isCurrent ? (
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{t('pdp.thisProduct')}</span>
                    ) : (
                      <button
                        onClick={() => p.handle && onProductClick?.(p.handle)}
                        className="text-xs text-foreground/50 hover:text-primary transition-colors"
                      >
                        {t('pdp.alternative')}
                      </button>
                    )}
                    <p className={cn(
                      "text-sm font-semibold leading-tight line-clamp-2",
                      p.isCurrent ? "text-foreground" : "text-foreground/70"
                    )}>
                      {p.title}
                    </p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            <tr>
              <td className="py-3 pr-4 text-foreground/50 font-light">{t('pdp.price')}</td>
              {allProducts.map((p, i) => (
                <td key={i} className={cn("py-3 px-3 font-semibold", p.isCurrent ? "text-primary" : "text-foreground/70")}>
                  {p.price} €
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 pr-4 text-foreground/50 font-light">{t('pdp.brand')}</td>
              {allProducts.map((p, i) => (
                <td key={i} className="py-3 px-3 text-foreground/70 font-light">
                  {p.vendor?.replace(/vitasync\s*2/i, 'VitaSync') || '—'}
                </td>
              ))}
            </tr>
            {features.map(feature => (
              <tr key={feature.key}>
                <td className="py-3 pr-4 text-foreground/50 font-light">{feature.label}</td>
                {allProducts.map((p, i) => {
                  const has = hasFeature(p, feature.key);
                  return (
                    <td key={i} className="py-3 px-3">
                      {has === true ? (
                        <CheckCircle weight="fill" className="w-4.5 h-4.5 text-green-500" />
                      ) : has === false ? (
                        <XCircle weight="fill" className="w-4.5 h-4.5 text-foreground/20" />
                      ) : (
                        <span className="text-foreground/20">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}