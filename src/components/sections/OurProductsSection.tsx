import { useEffect, useRef, useState } from "react";
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
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const interactionRef = useRef({ direction: 1 as 1 | -1, multiplier: 1 });

  useEffect(() => {
    let cancelled = false;
    fetchProducts(20)
      .then((data) => {
        if (!cancelled) setProducts(data.slice(0, 16));
      })
      .catch((err) => console.error("Failed to load homepage products:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trustBadges = [
    { icon: ShieldCheck, label: t("ourProducts.badgeMadeInUSA") },
    { icon: FlaskConical, label: t("ourProducts.badgeThirdParty") },
    { icon: Leaf, label: t("ourProducts.badgeClean") },
  ];

  // Duplicate products list so the marquee track loops seamlessly
  const marqueeProducts = products.length > 0 ? [...products, ...products] : [];

  const applyOffset = (nextOffset: number) => {
    const track = trackRef.current;
    const loopWidth = loopWidthRef.current;
    if (!track || loopWidth <= 0) return;

    offsetRef.current = ((nextOffset % loopWidth) + loopWidth) % loopWidth;
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
  };

  useEffect(() => {
    if (loading || products.length === 0) return;

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let last = performance.now();
    const baseSpeed = 70; // px / second — visible continuous flow

    const updateLoopWidth = () => {
      const loopStart = track.querySelector<HTMLElement>("[data-loop-start='true']");
      const width = loopStart?.offsetLeft ?? track.scrollWidth / 2;
      loopWidthRef.current = Math.max(width, 1);
      applyOffset(offsetRef.current);
    };

    updateLoopWidth();
    const resizeObserver = new ResizeObserver(updateLoopWidth);
    resizeObserver.observe(track);

    const tick = (now: number) => {
      const delta = Math.min(now - last, 64) / 1000;
      last = now;

      const { direction, multiplier } = interactionRef.current;
      applyOffset(offsetRef.current + direction * baseSpeed * multiplier * delta);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [loading, products.length]);

  // Hold-to-accelerate handlers
  const startBoost = (dir: 1 | -1) => {
    interactionRef.current.direction = dir;
    interactionRef.current.multiplier = 8;
  };
  const stopBoost = () => {
    interactionRef.current.multiplier = 1;
    interactionRef.current.direction = 1;
  };

  // Quick jump on single click (one card width ~ 300px + gap)
  const jumpBy = (dir: 1 | -1) => {
    const track = trackRef.current;
    const firstCard = track?.querySelector<HTMLElement>("[data-product-card='true']");
    const gap = track ? parseFloat(window.getComputedStyle(track).columnGap || "0") : 24;
    const step = firstCard ? firstCard.getBoundingClientRect().width + gap : 340;
    applyOffset(offsetRef.current + dir * step);
  };

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

        {/* Infinite marquee carousel */}
        <div className="relative group/marquee">
          {/* Edge fade masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 z-10 bg-gradient-to-l from-background to-transparent" />

          {/* Speed control buttons */}
          <button
            type="button"
            aria-label={t("ourProducts.previous")}
            onMouseDown={() => startBoost(-1)}
            onMouseUp={stopBoost}
            onMouseLeave={stopBoost}
            onTouchStart={() => startBoost(-1)}
            onTouchEnd={stopBoost}
            onClick={() => jumpBy(-1)}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/90 backdrop-blur border border-border/60 items-center justify-center text-foreground hover:bg-background hover:border-primary/50 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label={t("ourProducts.next")}
            onMouseDown={() => startBoost(1)}
            onMouseUp={stopBoost}
            onMouseLeave={stopBoost}
            onTouchStart={() => startBoost(1)}
            onTouchEnd={stopBoost}
            onClick={() => jumpBy(1)}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-background/90 backdrop-blur border border-border/60 items-center justify-center text-foreground hover:bg-background hover:border-primary/50 hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          <div
            className="overflow-hidden [contain:layout_paint]"
          >
            {loading ? (
              <div className="flex gap-4 md:gap-6 pb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div
                ref={trackRef}
                className="flex gap-4 md:gap-6 pb-4 w-max will-change-transform [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
              >
                {marqueeProducts.map((p, idx) => {
                  const image = p.node.images.edges[0]?.node;
                  const price = parseFloat(p.node.priceRange.minVariantPrice.amount);
                  const currency = p.node.priceRange.minVariantPrice.currencyCode;
                  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;
                  return (
                    <Link
                      key={`${p.node.id}-${idx}`}
                      to={`/product/${p.node.handle}`}
                      data-product-card="true"
                      data-loop-start={idx === products.length ? "true" : undefined}
                      className="group flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] rounded-2xl overflow-hidden border border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-colors duration-300"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-muted/40 to-muted/10 overflow-hidden">
                        {image && (
                          <img
                            src={image.url}
                            alt={image.altText || p.node.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
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
            )}
          </div>

          {/* Hint text */}
          <p className="text-center text-xs text-muted-foreground/70 mt-4 hidden md:block">
            {t("ourProducts.speedHint")}
          </p>
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
