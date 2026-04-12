import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["how-it-works", "features", "pricing", "faq"];

export function Navbar() {
  const { t } = useTranslation();
  
  const navLinks = [
    { href: "#how-it-works", labelKey: "nav.howItWorks" },
    { href: "#features", labelKey: "nav.features" },
    { href: "#pricing", labelKey: "nav.pricing" },
    { href: "#faq", labelKey: "nav.faq" },
  ];
  
  const pageLinks = [
    { href: "/about", labelKey: "nav.about" },
    { href: "/blog", labelKey: "nav.blog" },
    { href: "/contact", labelKey: "nav.contact" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
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
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

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
                {navLinks.map(link => {
                  const sectionId = link.href.replace("#", "");
                  const isActive = activeSection === sectionId;
                  return (
                    <a 
                      key={link.href} 
                      href={link.href} 
                      onClick={e => handleAnchorClick(e, link.href)} 
                      className={cn(
                        "relative cursor-pointer text-sm font-medium px-4 xl:px-5 py-1.5 rounded-full transition-colors duration-200",
                        isActive ? "text-primary" : "text-current opacity-70 hover:opacity-100"
                      )}
                    >
                      <span className="relative z-10">{t(link.labelKey)}</span>
                      {isActive && (
                        <motion.div
                          layoutId="tubelight-nav"
                          className="absolute inset-0 rounded-full z-0"
                          style={{
                            backgroundColor: "hsl(var(--primary) / 0.12)",
                          }}
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        >
                          {/* Tubelight glow effect */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary opacity-70 blur-[3px]" />
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary opacity-30 blur-[6px]" />
                        </motion.div>
                      )}
                    </a>
                  );
                })}
              </div>
              
              <div className="w-px h-5 bg-white/10 dark:bg-white/5 mx-4" />
              
              {pageLinks.map(link => (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className="text-sm text-current opacity-60 hover:opacity-100 transition-opacity duration-200 px-3"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Right Side - Language, CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSelector />
              <Link to="/auth?mode=signin" className="px-4 py-2 rounded-xl text-sm font-medium text-current opacity-70 hover:opacity-100 hover:bg-white/5 transition-all">
                {t("nav.signin")}
              </Link>
              <Link to="/auth?mode=signup" className="btn-neumorphic text-primary-foreground">
                {t("nav.start")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-current opacity-70 hover:opacity-100 transition-colors" aria-label="Open menu">
              <List size={24} weight="light" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed top-0 right-0 h-full w-80 bg-background shadow-2xl z-50 lg:hidden">
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-end mb-8">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-foreground/70 hover:text-foreground transition-colors" aria-label="Close menu">
                    <X size={28} weight="light" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {navLinks.map((link, index) => (
                    <motion.a 
                      key={link.href} 
                      href={link.href} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: index * 0.05 }} 
                      onClick={e => handleAnchorClick(e, link.href)} 
                      className="text-lg text-foreground/70 hover:text-foreground transition-colors py-2 border-b border-border/50"
                    >
                      {t(link.labelKey)}
                    </motion.a>
                  ))}
                  
                  <div className="my-4" />
                  
                  {pageLinks.map((link, index) => (
                    <motion.div 
                      key={link.href} 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: (navLinks.length + index) * 0.05 }}
                    >
                      <Link 
                        to={link.href} 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="text-lg text-foreground/70 hover:text-foreground transition-colors py-2 block border-b border-border/50"
                      >
                        {t(link.labelKey)}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto space-y-3">
                  <div className="flex justify-center mb-4">
                    <LanguageSelector />
                  </div>
                  <Link to="/auth?mode=signin" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all border border-border/50">
                    {t("nav.signin")}
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setIsMobileMenuOpen(false)} className="btn-neumorphic text-primary-foreground w-full text-center block">
                    {t("nav.startFree")}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </>;
}