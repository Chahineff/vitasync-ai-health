import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, MagnifyingGlass, Funnel, SpinnerGap } from '@phosphor-icons/react';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { ProductCard } from './ProductCard';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '@/stores/cartStore';

export function ShopSection() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const cartItems = useCartStore(state => state.items);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(50);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique product types for filtering
  const categories = Array.from(
    new Set(products.map(p => p.node.productType).filter(Boolean))
  );

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.node.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.node.productType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-light text-foreground">Boutique</h2>
          <p className="text-foreground/60 font-light text-sm">
            Compléments recommandés pour votre profil
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm text-foreground placeholder:text-foreground/40 font-light"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="appearance-none pl-10 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm text-foreground font-light cursor-pointer"
              >
                <option value="">Toutes catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
            </div>
          )}

          {/* Cart Button */}
          <CartDrawer>
            <button className="relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <ShoppingCart weight="light" className="w-5 h-5 text-foreground" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalCartItems}
                </span>
              )}
            </button>
          </CartDrawer>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <SpinnerGap className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <ShoppingCart weight="light" className="w-16 h-16 text-foreground/20 mb-4" />
            <p className="text-foreground/60 font-light">
              {searchQuery || selectedCategory ? 'Aucun produit trouvé' : 'Aucun produit disponible'}
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.node.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
