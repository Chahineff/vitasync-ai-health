import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [hasMessages, setHasMessages] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMobileMenuOpen(false);

      // If we're not on the home page, navigate there first
      if (location.pathname !== "/") {
        navigate("/" + href);
      } else {
        // We're on home page, just scroll
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    }
  };
  return <>
      <nav className={`nav-sticky ${isScrolled ? "scrolled" : ""}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img alt="VitaSync" className="w-8 h-8 md:w-10 md:h-10" src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" />
              <span className="text-lg md:text-xl font-medium tracking-tight text-foreground">VitaSync</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map(link => (
                <a 
                  key={link.href} 
                  href={link.href} 
                  onClick={e => handleAnchorClick(e, link.href)} 
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
                >
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="w-px h-5 bg-border" />
              {pageLinks.map(link => (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>

            {/* Right Side - Language, CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSelector />
              <Link to="/auth?mode=signin" className="px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all">
                {t("nav.signin")}
              </Link>
              <Link to="/auth?mode=signup" className="btn-neumorphic text-primary-foreground">
                {t("nav.start")}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-foreground/70 hover:text-foreground transition-colors" aria-label="Open menu">
              <List size={24} weight="light" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{
          x: "100%"
        }} animate={{
          x: 0
        }} exit={{
          x: "100%"
        }} transition={{
          type: "spring",
          damping: 30,
          stiffness: 300
        }} className="fixed top-0 right-0 h-full w-80 bg-background shadow-2xl z-50 lg:hidden">
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