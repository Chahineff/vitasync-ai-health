import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { scrollToHomeAnchor } from "@/lib/scrollAnchors";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On first render (page load/refresh), always scroll to top and clear hash
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Clear any stale hash from URL
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      
      // Force scroll to top
      window.scrollTo(0, 0);
      return;
    }

    // For subsequent navigations (user clicking links)
    if (hash) {
      // User clicked an anchor link - jump past sticky scroll sections to the exact target
      setTimeout(() => {
        scrollToHomeAnchor(hash);
      }, 100);
    } else {
      // Regular page navigation - scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

// Helper to mark hash navigation as intentional (kept for compatibility)
export function markIntentionalHashNav(hash: string) {
  // No longer needed with the isFirstRender approach, but kept for API compatibility
}
