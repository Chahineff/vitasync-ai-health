import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MagnifyingGlass, Sun, Moon, Plus, SpinnerGap, Pill } from '@phosphor-icons/react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { Input } from '@/components/ui/input';

interface AddSupplementModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (supplement: {
    product_name: string;
    shopify_product_id: string | null;
    dosage: string | null;
    time_of_day: string;
    recommended_by_ai: boolean;
    active: boolean;
  }) => Promise<{ error: Error | null }>;
}

export function AddSupplementModal({ open, onClose, onAdd }: AddSupplementModalProps) {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'evening'>('morning');
  const [dosage, setDosage] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchProducts(100).then(p => {
        setProducts(p);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      // Reset state when closed
      setSelectedProduct(null);
      setSearch('');
      setDosage('');
      setTimeOfDay('morning');
    }
  }, [open]);

  const filteredProducts = products.filter(p =>
    p.node.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!selectedProduct) return;
    setAdding(true);
    const productId = selectedProduct.node.id;
    await onAdd({
      product_name: selectedProduct.node.title,
      shopify_product_id: productId,
      dosage: dosage || null,
      time_of_day: timeOfDay,
      recommended_by_ai: false,
      active: true,
    });
    setAdding(false);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="glass-card-premium rounded-2xl border border-white/10 w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                <Plus weight="light" className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-lg font-light text-foreground">Ajouter un complément</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X weight="light" className="w-5 h-5 text-foreground/60" />
            </button>
          </div>

          {selectedProduct ? (
            /* Step 2: Configure */
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                {selectedProduct.node.images.edges[0]?.node.url ? (
                  <img
                    src={selectedProduct.node.images.edges[0].node.url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <Pill weight="light" className="w-6 h-6 text-foreground/30" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{selectedProduct.node.title}</p>
                  <button onClick={() => setSelectedProduct(null)} className="text-xs text-primary hover:underline">
                    Changer
                  </button>
                </div>
              </div>

              {/* Time of day */}
              <div>
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-2 block">
                  Moment de prise
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTimeOfDay('morning')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      timeOfDay === 'morning'
                        ? 'bg-secondary/10 border-secondary/30 text-secondary'
                        : 'bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10'
                    }`}
                  >
                    <Sun weight="light" className="w-5 h-5" />
                    <span className="text-sm font-light">Matin</span>
                  </button>
                  <button
                    onClick={() => setTimeOfDay('evening')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      timeOfDay === 'evening'
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10'
                    }`}
                  >
                    <Moon weight="light" className="w-5 h-5" />
                    <span className="text-sm font-light">Soir</span>
                  </button>
                </div>
              </div>

              {/* Dosage */}
              <div>
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide mb-2 block">
                  Dosage (optionnel)
                </label>
                <Input
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="Ex: 1 gélule, 5g..."
                  className="bg-white/5 border-white/10"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleAdd}
                disabled={adding}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {adding ? <SpinnerGap className="w-4 h-4 animate-spin" /> : <Plus weight="bold" className="w-4 h-4" />}
                Ajouter au suivi
              </button>
            </div>
          ) : (
            /* Step 1: Search & Select */
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5">
                <div className="relative">
                  <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="pl-9 bg-white/5 border-white/10"
                    autoFocus
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerGap className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center text-foreground/40 text-sm py-8">Aucun produit trouvé</p>
                ) : (
                  filteredProducts.map(product => (
                    <button
                      key={product.node.id}
                      onClick={() => setSelectedProduct(product)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
                    >
                      {product.node.images.edges[0]?.node.url ? (
                        <img
                          src={product.node.images.edges[0].node.url}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                          <Pill weight="light" className="w-5 h-5 text-foreground/30" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-light text-foreground truncate">{product.node.title}</p>
                        <p className="text-xs text-foreground/40">{product.node.productType || 'Complément'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
