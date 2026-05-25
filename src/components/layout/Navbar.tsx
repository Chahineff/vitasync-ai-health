import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { List, X, CaretDown } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Sparkles, ShoppingBag, Tag, HelpCircle, LayoutDashboard } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { getAnchorId, scrollToHomeAnchor } from "@/lib/scrollAnchors";
import { fetchProducts } from "@/lib/shopify";

let shopPrefetchTriggered = false;
const prefetchShop = () => {
  if (shopPrefetchTriggered) return;
  shopPrefetchTriggered = true;
  // Warm up Shopify Storefront cache; ignore errors
  fetchProducts(250).catch(() => {
    shopPrefetchTriggered = false;
  });
};

const SECTION_IDS = ["dashboard", "how-it-works", "features", "products", "pricing", "faq"];

export function Navbar() {
  const { t } = useTranslation();
  
  const navLinks = [
    { href: "#dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard, descKey: "nav.dashboardDesc" },
    { href: "#how-it-works", labelKey: "nav.howItWorks", icon: Compass, descKey: "nav.howItWorksDesc" },
    { href: "#features", labelKey: "nav.features", icon: Sparkles, descKey: "nav.featuresDesc" },
    { href: "#products", labelKey: "nav.products", icon: ShoppingBag, descKey: "nav.productsDesc" },
    { href: "#pricing", labelKey: "nav.pricing", icon: Tag, descKey: "nav.pricingDesc" },
    { href: "#faq", labelKey: "nav.faq", icon: HelpCircle, descKey: "nav.faqDesc" },
  ];
  
  const pageLinks = [
    { href: "/shop", labelKey: "nav.shop" },
    { href: "/about", labelKey: "nav.about" },
    { href: "/blog", labelKey: "nav.blog" },
    { href: "/contact", labelKey: "nav.contact" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);
  const homeMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for active section tracking
  useEffect(() => {
    if (location.pathname !== "/") { setActiveSection(null); return; }

    const observers: IntersectionObserver[] = [];
    const visibleSections = new Map<string, number>();

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (isNavigatingRef.current) return;
          if (entry.isIntersecting) {
            visibleSections.set(id, entry.intersectionRatio);
          } else {
            visibleSections.delete(id);
          }
          let best: string | null = null;
          let bestRatio = 0;
          visibleSections.forEach((ratio, sectionId) => {
            if (ratio > bestRatio) { best = sectionId; bestRatio = ratio; }
          });
          setActiveSection(best);
        },
        { threshold: [0, 0.25, 0.5, 0.75], rootMargin: "-80px 0px -40% 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [location.pathname]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      setIsHomeMenuOpen(false);
      const sectionId = getAnchorId(href);
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        if (document.getElementById(sectionId)) {
          // Lock active section immediately and block observer during scroll
          setActiveSection(sectionId);
          isNavigatingRef.current = true;
          scrollToHomeAnchor(href);
          // Re-enable observer after scroll settles
          setTimeout(() => { isNavigatingRef.current = false; }, 300);
        }
      }
    }
  };

  const openHomeMenu = () => {
    if (homeMenuTimeoutRef.current) clearTimeout(homeMenuTimeoutRef.current);
    setIsHomeMenuOpen(true);
  };
  const closeHomeMenuDelayed = () => {
    if (homeMenuTimeoutRef.current) clearTimeout(homeMenuTimeoutRef.current);
    homeMenuTimeoutRef.current = setTimeout(() => setIsHomeMenuOpen(false), 150);
  };

  const isHomeActive = location.pathname === "/";

  return <>
      <nav className={`nav-sticky ${isScrolled ? "scrolled" : ""}`}>
        <div className="px-5 md:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img alt="VitaSync" className="w-8 h-8 md:w-10 md:h-10" src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" />
              <span className="text-lg md:text-xl font-medium tracking-tight text-foreground">VitaSync</span>
            </Link>

            {/* Desktop Navigation — Tubelight style */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 bg-white/5 dark:bg-black/10 rounded-full px-1.5 py-1 border border-white/10 dark:border-white/5">
                {/* Home dropdown trigger */}
                <div
                  className="relative"
                  onMouseEnter={openHomeMenu}
                  onMouseLeave={closeHomeMenuDelayed}
                >
                  <Link
                    to="/"
                    className={cn(
                      "relative cursor-pointer text-sm font-medium px-4 xl:px-5 py-1.5 rounded-full transition-colors duration-200 inline-flex items-center gap-1",
                      isHomeActive ? "text-primary" : "text-current opacity-70 hover:opacity-100"
                    )}
                  >
                    <span className="relative z-10">{t("nav.home")}</span>
                    <CaretDown
                      size={12}
                      weight="bold"
                      className={cn("relative z-10 transition-transform duration-200", isHomeMenuOpen && "rotate-180")}
                    />
                    {isHomeActive && (
                      <motion.div
                        layoutId="tubelight-nav"
                        className="absolute inset-0 rounded-full z-0"
                        style={{ backgroundColor: "hsl(var(--primary) / 0.12)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      >
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary opacity-70 blur-[3px]" />
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary opacity-30 blur-[6px]" />
                      </motion.div>
                    )}
                  </Link>

                  {/* Hover dropdown */}
                  <AnimatePresence>
                    {isHomeMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        onMouseEnter={openHomeMenu}
                        onMouseLeave={closeHomeMenuDelayed}
                        className="absolute left-0 top-full pt-3 min-w-[340px] z-50"
                      >
                        <div className="rounded-2xl border border-background/15 bg-foreground shadow-2xl p-2.5 space-y-1">
                          {navLinks.map((link) => {
                            const sectionId = link.href.replace("#", "");
                            const isActive = activeSection === sectionId;
                            const Icon = link.icon;
                            return (
                              <motion.a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleAnchorClick(e, link.href)}
                                whileHover={{ scale: 1.025 }}
                                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                className={cn(
                                  "group flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                  isActive
                                    ? "bg-primary/15 text-primary"
                                    : "text-background hover:bg-background/10"
                                )}
                              >
                                <span
                                  className={cn(
                                    "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                                    isActive
                                      ? "bg-primary/25 text-primary"
                                      : "bg-background/15 text-background group-hover:bg-primary/25 group-hover:text-primary"
                                  )}
                                >
                                  <Icon className="w-5 h-5" strokeWidth={2.25} />
                                </span>
                                <span className="flex flex-col">
                                  <span className={cn("text-sm leading-tight", isActive ? "font-semibold text-primary" : "font-medium text-background")}>
                                    {t(link.labelKey)}
                                  </span>
                                  <span className="text-[11px] text-background/75 leading-snug mt-0.5">
                                    {t(link.descKey)}
                                  </span>
                                </span>
                              </motion.a>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-px h-5 bg-white/10 dark:bg-white/5 mx-4" />

              {pageLinks.map(link => {
                const isActive = location.pathname === link.href || location.pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onMouseEnter={link.href === "/shop" ? prefetchShop : undefined}
                    onFocus={link.href === "/shop" ? prefetchShop : undefined}
                    className={cn(
                      "text-sm transition-opacity duration-200 px-3",
                      isActive ? "text-primary opacity-100 font-medium" : "text-current opacity-60 hover:opacity-100"
                    )}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </div>

            {/* Right Side - CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/auth?mode=signin" className="px-4 py-2 rounded-xl text-sm font-medium text-current opacity-70 hover:opacity-100 hover:bg-white/5 transition-all">
                {t("nav.signin")}
              </Link>
              <Link to="/auth?mode=signup" className="btn-neumorphic text-primary-foreground">
                {t("nav.start")}
              </Link>
            </div>

            {/* Mobile Right Cluster */}
            <div className="lg:hidden flex items-center gap-2">
              <Link
                to="/auth?mode=signup"
                className="relative inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary-foreground shadow-[0_4px_18px_-4px_hsl(var(--primary)/0.55)] active:scale-95 transition-transform"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
              >
                <span className="absolute inset-0 rounded-full opacity-60 blur-[10px] -z-10" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }} />
                {t("nav.start")}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-current opacity-90 hover:opacity-100 transition-colors"
                aria-label="Open menu"
              >
                <List size={22} weight="light" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[88%] max-w-sm z-50 lg:hidden bg-background/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl overflow-hidden"
            >
              {/* Brand glow accents */}
              <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-40" style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.5), transparent 70%)" }} />
              <div className="pointer-events-none absolute bottom-0 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: "radial-gradient(circle, hsl(var(--secondary)/0.5), transparent 70%)" }} />

              <div className="relative flex flex-col h-full px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <img src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" alt="VitaSync" className="w-9 h-9" />
                    <span className="text-lg font-semibold tracking-tight text-foreground">VitaSync</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl border border-white/10 bg-white/5 text-foreground/70 hover:text-foreground transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={22} weight="light" />
                  </button>
                </div>

                {/* Section: Explore home */}
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/40 font-medium mb-2.5 px-1">{t("nav.home")}</p>
                <div className="space-y-1.5 mb-6">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    return (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                        onClick={(e) => handleAnchorClick(e, link.href)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                      >
                        <span
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.18), hsl(var(--secondary)/0.18))" }}
                        >
                          <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={2.25} />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-foreground leading-tight">{t(link.labelKey)}</span>
                          <span className="block text-[11px] text-foreground/50 leading-snug mt-0.5 truncate">{t(link.descKey)}</span>
                        </span>
                      </motion.a>
                    );
                  })}
                </div>

                {/* Section: Pages */}
                <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/40 font-medium mb-2.5 px-1">Pages</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {pageLinks.map((link, index) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (navLinks.length + index) * 0.04 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-center py-3 rounded-2xl text-sm font-medium text-foreground/80 hover:text-foreground bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* CTAs */}
                <div className="mt-auto space-y-2.5">
                  <Link
                    to="/auth?mode=signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-2xl text-sm text-foreground/80 hover:text-foreground bg-white/[0.04] border border-white/10 transition-colors"
                  >
                    {t("nav.signin")}
                  </Link>
                  <Link
                    to="/auth?mode=signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="relative block w-full text-center px-4 py-3 rounded-2xl text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.7)] active:scale-[0.98] transition-transform"
                    style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
                  >
                    {t("nav.startFree")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </>;
}