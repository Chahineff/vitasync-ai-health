import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONSENT_KEY = "vitasync_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const decline = () => {
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
          className="fixed bottom-0 left-0 right-0 z-[9999]"
          style={{ backgroundColor: "#0A1628", padding: 16 }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p style={{ color: "#FFFFFF", fontSize: 14, lineHeight: 1.5, margin: 0 }}>
              We use cookies to personalize your experience and analyze traffic. By continuing, you accept our{" "}
              <a href="/privacy-policy" style={{ color: "#00D4C8", textDecoration: "underline" }}>Privacy Policy</a>.
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={accept}
                style={{
                  backgroundColor: "#00D4C8",
                  color: "#FFFFFF",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Accept
              </button>
              <button
                onClick={decline}
                style={{
                  backgroundColor: "transparent",
                  color: "#FFFFFF",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "1px solid #FFFFFF",
                  cursor: "pointer",
                }}
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
