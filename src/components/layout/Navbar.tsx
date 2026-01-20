import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#how-it-works", label: "Comment ça marche" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#testimonials", label: "Témoignages" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
];

const pageLinks = [
  { href: "/about", label: "À propos" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className={`nav-sticky ${isScrolled ? "scrolled" : ""}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg">V</span>
              </div>
              <span className="text-xl font-medium tracking-tight text-foreground">VitaSync</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
              <div className="w-px h-5 bg-border" />
              {pageLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:block">
              <a href="#pricing" className="btn-neumorphic text-primary-foreground">
                Démarrer
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <List size={28} weight="light" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 bg-background shadow-2xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                    aria-label="Close menu"
                  >
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
                      onClick={(e) => handleAnchorClick(e, link.href)}
                      className="text-lg text-foreground/70 hover:text-foreground transition-colors py-2 border-b border-border/50"
                    >
                      {link.label}
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
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-auto">
                  <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="btn-neumorphic text-primary-foreground w-full text-center block">
                    Démarrer gratuitement
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
