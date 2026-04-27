import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck, Leaf, FlaskConical } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { AnimatedText } from "@/components/ui/animated-shiny-text";
import { MagicText } from "@/components/ui/magic-text";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";

function ProductSkeleton() {
  return (
    <div className="min-w-[260px] sm:min-w-[280px] md:min-w-[300px] h-[400px] rounded-2xl bg-card/40 border border-border/30 animate-pulse" />
  );
}

export function OurProductsSection() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProducts(8)
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, 8));
      })
      .catch((err) => console.error("Failed to load homepage products:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-play loop: continuously scrolls to the right; loops back to start when reaching the end.
  useEffect(() => {
    if (loading || products.length === 0) return;
    const el = scrollerRef.current;
    if (!el) return;

    let rafId: number;
    let lastTs = performance.now();
    const speedPxPerSec = 40; // gentle continuous drift

    const tick = (ts: number) => {
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (!isPaused) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 0) {
          let next = el.scrollLeft + speedPxPerSec * dt;
          if (next >= maxScroll - 1) next = 0; // loop back smoothly
          el.scrollLeft = next;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [loading, products.length, isPaused]);

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const trustBadges = [
    { icon: ShieldCheck, label: t("ourProducts.badgeMadeInUSA") },
    { icon: FlaskConical, label: t("ourProducts.badgeThirdParty") },
    { icon: Leaf, label: t("ourProducts.badgeClean") },
  ];

  return (
    <section id="products" className="section-padding bg-transparent relative overflow-hidden">
      <div className="absolute top-1/3 -left-20 w-72 h-72 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Heading */}
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-4 md:mb-5">
            {t("ourProducts.title")}{" "}
            <AnimatedText
              text={t("ourProducts.titleHighlight")}
              textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
              className="inline-block"
            />
          </h2>
          <MagicText
            text={t("ourProducts.subtitle")}
            className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light px-4 md:px-0 justify-center"
          />
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-10">
          {trustBadges.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm text-xs md:text-sm text-foreground/80"
            >
              <b.icon className="w-4 h-4 text-primary" />
              <span>{b.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Carousel + arrows */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <button
            type="button"
            onClick={() => scrollBy(-320)}
            aria-label={t("ourProducts.previous")}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-11 h-11 rounded-full bg-background/80 backdrop-blur border border-border/60 items-center justify-center text-foreground hover:bg-background transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(320)}
            aria-label={t("ourProducts.next")}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-11 h-11 rounded-full bg-background/80 backdrop-blur border border-border/60 items-center justify-center text-foreground hover:bg-background transition-colors shadow-lg"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ scrollPaddingLeft: 16 }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((p) => {
                  const image = p.node.images.edges[0]?.node;
                  const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
                  const currency = p.node.priceRange.minVariantPrice.currencyCode;
                  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;
                  return (
                    <Link
                      key={p.node.id}
                      to={`/product/${p.node.handle}`}
                      className="group min-w-[260px] sm:min-w-[280px] md:min-w-[300px] max-w-[300px] snap-start rounded-2xl overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-muted/40 to-muted/10 overflow-hidden">
                        {image && (
                          <img
                            src={image.url}
                            alt={image.altText || p.node.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-[10px] font-semibold text-foreground border border-border/50">
                          {t("ourProducts.madeInUSA")}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                          {p.node.productType || "Supplement"}
                        </p>
                        <h3 className="text-base font-medium text-foreground line-clamp-2 leading-snug mb-3 min-h-[2.5rem]">
                          {p.node.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-foreground">
                            {symbol}
                            {price.toFixed(2)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {t("ourProducts.viewProduct")}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 md:mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 btn-neumorphic text-primary-foreground"
          >
            <ShoppingBag className="w-4 h-4" />
            {t("ourProducts.ctaShop")}
          </Link>
          <Link
            to="/auth?mode=signup"
            className="text-sm text-foreground/70 hover:text-foreground underline-offset-4 hover:underline transition-colors px-4 py-2"
          >
            {t("ourProducts.ctaJoin")}
          </Link>
        </div>
      </div>
    </section>
  );
}
