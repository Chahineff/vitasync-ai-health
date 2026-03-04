import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Cookie, X } from "@phosphor-icons/react";

const CONSENT_KEY = "vitasync_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[9999]"
        >
          <div className="glass-card rounded-2xl p-5 shadow-xl border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie weight="light" className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-foreground text-sm">Cookies & Vie privée</h3>
                  <button onClick={reject} className="text-foreground/40 hover:text-foreground/70 transition-colors -mr-1">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-foreground/60 leading-relaxed mb-3">
                  Nous utilisons des cookies essentiels au fonctionnement du site et des cookies analytiques pour améliorer votre expérience.{" "}
                  <Link to="/cookies" className="text-primary hover:underline">
                    En savoir plus
                  </Link>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={accept}
                    className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    Accepter tout
                  </button>
                  <button
                    onClick={reject}
                    className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors border border-border/50"
                  >
                    Essentiels uniquement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
