import { motion } from "framer-motion";
import { ShoppingCart, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tous", "Protéines", "Vitamines", "Minéraux", "Oméga", "Énergie"];

const PRODUCTS = [
  { name: "Créatine Monohydrate", price: "29,99 €", tag: "Muscle", color: "bg-blue-500/15", tagColor: "text-blue-400" },
  { name: "Magnésium Bisglycinate", price: "24,99 €", tag: "Sommeil", color: "bg-indigo-500/15", tagColor: "text-indigo-400" },
  { name: "Oméga-3 Ultra", price: "34,99 €", tag: "Cerveau", color: "bg-cyan-500/15", tagColor: "text-cyan-400" },
  { name: "Vitamine D3 + K2", price: "19,99 €", tag: "Immunité", color: "bg-amber-500/15", tagColor: "text-amber-400" },
  { name: "Zinc Picolinate", price: "14,99 €", tag: "Immunité", color: "bg-emerald-500/15", tagColor: "text-emerald-400" },
  { name: "Ashwagandha KSM-66", price: "27,99 €", tag: "Stress", color: "bg-purple-500/15", tagColor: "text-purple-400" },
];

export function TutorialShopDemo() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light tracking-tight text-foreground">Boutique</h2>
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-card/60 border border-white/10 flex items-center justify-center">
            <ShoppingCart weight="light" className="w-5 h-5 text-foreground/60" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            2
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card/60 border border-white/10 backdrop-blur-sm">
        <MagnifyingGlass weight="light" className="w-5 h-5 text-foreground/30" />
        <span className="text-sm text-foreground/30 font-light">Rechercher un produit…</span>
        <div className="ml-auto">
          <Funnel weight="light" className="w-4 h-4 text-foreground/30" />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-light whitespace-nowrap border transition-all",
              i === 0
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white/5 text-foreground/50 border-white/10"
            )}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {PRODUCTS.map((product, i) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="glass-card-premium rounded-2xl p-4 border border-white/10 flex flex-col"
          >
            {/* Product image placeholder */}
            <div className={cn("w-full aspect-square rounded-xl mb-3 flex items-center justify-center", product.color)}>
              <span className="text-3xl">💊</span>
            </div>
            
            {/* Tag */}
            <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full w-fit mb-2 border", product.color, product.tagColor, "border-current/20")}>
              {product.tag}
            </span>
            
            {/* Name & Price */}
            <h4 className="text-sm font-light text-foreground truncate mb-1">{product.name}</h4>
            <p className="text-sm font-medium text-foreground mb-3">{product.price}</p>
            
            {/* Add button */}
            <div className="mt-auto px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium text-center border border-primary/20">
              Ajouter au panier
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
