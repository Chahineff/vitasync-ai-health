import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Truck, ArrowRight, Lightning, Star, Crown, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { Progress } from "@/components/ui/progress";

const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

const STACK_ITEMS = [
  { name: "Créatine Monohydrate", dosage: "5g / jour", time: "Matin", status: "active" },
  { name: "Whey Isolate", dosage: "30g / jour", time: "Post-entraînement", status: "active" },
  { name: "Magnésium Bisglycinate", dosage: "300mg / jour", time: "Soir", status: "active" },
  { name: "Oméga-3 EPA/DHA", dosage: "2g / jour", time: "Midi", status: "active" },
  { name: "Vitamine D3 + K2", dosage: "2000 UI / jour", time: "Matin", status: "paused" },
];

const COACHING_TIERS = [
  { name: "Gratuit", price: "0 €", features: ["Coach IA basique", "Suivi des compléments", "Check-in quotidien"], current: true },
  { name: "Pro", price: "9,99 €/mois", features: ["Coach IA avancé", "Analyse sanguine IA", "Plan personnalisé", "Support prioritaire"], current: false },
  { name: "Elite", price: "19,99 €/mois", features: ["Tout Pro +", "Coaching vocal", "Formules sur-mesure", "Accès bêta"], current: false },
];

function matchStackImage(name: string, products: ShopifyProduct[]): string | null {
  const lower = name.toLowerCase();
  for (const p of products) {
    const title = p.node.title.toLowerCase();
    if (title.includes(lower) || lower.includes(title.split(" ")[0])) {
      return p.node.images.edges[0]?.node.url || null;
    }
  }
  const firstWord = lower.split(" ")[0];
  if (firstWord.length >= 4) {
    for (const p of products) {
      if (p.node.title.toLowerCase().includes(firstWord)) {
        return p.node.images.edges[0]?.node.url || null;
      }
    }
  }
  return null;
}

export function TutorialMyStackDemo() {
  const [shopifyProducts, setShopifyProducts] = useState<ShopifyProduct[]>([]);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  useEffect(() => {
    fetchProducts(250).then(setShopifyProducts).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-1">Mon Stack</h2>
        <p className="text-sm text-foreground/50 font-light">Gère tes compléments, abonnements et livraisons</p>
      </div>

      {/* Next Delivery Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.1 }}
        className="glass-card-premium rounded-3xl p-6 border border-white/10 bg-gradient-to-br from-primary/5 to-secondary/5"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Truck weight="duotone" className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-foreground">Prochaine livraison</h3>
            <p className="text-sm text-foreground/50 font-light">
              {deliveryDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium border border-secondary/30">
            En préparation
          </div>
        </div>
        <Progress value={35} className="h-2 bg-white/10" />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-foreground/40">Commandée</span>
          <span className="text-xs text-foreground/40">En route</span>
          <span className="text-xs text-foreground/40">Livrée</span>
        </div>
      </motion.div>

      {/* Current Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.2 }}
        className="glass-card-premium rounded-3xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <Package weight="duotone" className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Mon Stack Actuel</h3>
              <p className="text-xs text-foreground/50">{STACK_ITEMS.filter(s => s.status === "active").length} compléments actifs</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {STACK_ITEMS.map((item, i) => {
            const img = matchStackImage(item.name, shopifyProducts);
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.07 }}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl border transition-all",
                  item.status === "active" ? "bg-white/5 border-white/10" : "bg-white/3 border-white/5 opacity-60"
                )}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                  {img ? (
                    <img src={img} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">💊</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-foreground/40">{item.dosage} · {item.time}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-[10px] font-medium border",
                  item.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                )}>
                  {item.status === "active" ? "Actif" : "Pause"}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* AI Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.4 }}
        className="glass-card-premium rounded-3xl p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0 overflow-hidden"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={vitasyncLogo} alt="" className="w-7 h-7 object-contain" />
          </motion.div>
          <div className="flex-1">
            <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Recommandation IA</p>
            <p className="text-sm text-foreground font-light leading-relaxed mb-3">
              Basé sur ton profil et tes check-ins, l'ajout de <span className="text-primary font-medium">Zinc Picolinate</span> pourrait améliorer ta récupération et ton immunité.
            </p>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium border border-primary/20 flex items-center gap-1.5">
                <Lightning weight="bold" className="w-3 h-3" /> Ajouter au stack
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 text-foreground/50 text-xs font-medium border border-white/10">
                En savoir plus
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Coaching Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-light tracking-tight text-foreground mb-4">Niveau de coaching</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COACHING_TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={cn(
                "rounded-2xl p-5 border transition-all",
                tier.current
                  ? "bg-primary/5 border-primary/20"
                  : "bg-white/5 border-white/10 opacity-70"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {tier.current ? (
                  <Crown weight="fill" className="w-4 h-4 text-primary" />
                ) : (
                  <Star weight="light" className="w-4 h-4 text-foreground/40" />
                )}
                <h4 className="text-sm font-medium text-foreground">{tier.name}</h4>
              </div>
              <p className="text-lg font-light text-foreground mb-3">{tier.price}</p>
              <ul className="space-y-1.5">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-foreground/60">
                    <Check weight="bold" className="w-3 h-3 text-secondary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {tier.current ? (
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium text-center border border-primary/20">
                  Plan actuel
                </div>
              ) : (
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-foreground/5 text-foreground/30 text-xs font-medium text-center border border-white/10">
                  Bientôt
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
