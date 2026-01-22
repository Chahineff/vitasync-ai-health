import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If there's a hash in the URL (like #how-it-works), scroll to that element
    if (hash) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      // No hash - scroll to top of page
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  // On initial page load, clear any stale hash from URL and scroll to top
  useEffect(() => {
    // Check if user intentionally navigated to this hash
    const currentHash = window.location.hash;
    const lastIntentionalHash = sessionStorage.getItem("last_hash_nav");
    
    // If there's a hash but it wasn't from intentional navigation, clear it
    if (currentHash && currentHash !== lastIntentionalHash) {
      window.history.replaceState(null, "", window.location.pathname);
      window.scrollTo(0, 0);
    }
    
    // Clear the intentional flag after checking
    sessionStorage.removeItem("last_hash_nav");
  }, []);

  return null;
}

// Helper to mark hash navigation as intentional (call this when user clicks anchor links)
export function markIntentionalHashNav(hash: string) {
  sessionStorage.setItem("last_hash_nav", hash);
}
