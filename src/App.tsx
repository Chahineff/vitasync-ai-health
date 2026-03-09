import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { DailyCheckinProvider } from "@/hooks/useDailyCheckin";
import { ThemeProvider } from "next-themes";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useCartSync } from "@/hooks/useCartSync";
import { CookieBanner } from "@/components/ui/CookieBanner";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";
import ShopifyCallback from "./pages/ShopifyCallback";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import LegalNotice from "./pages/legal/LegalNotice";
import CookiesPage from "./pages/legal/Cookies";
import CGV from "./pages/legal/CGV";
import Disclaimer from "./pages/legal/Disclaimer";
import Shipping from "./pages/legal/Shipping";

const queryClient = new QueryClient();

function OAuthRedirectHandler() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && user && location.pathname === '/' && sessionStorage.getItem('oauth_redirect_pending') === 'true') {
      sessionStorage.removeItem('oauth_redirect_pending');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return null;
}

function AppContent() {
  useCartSync();
  
  return (
    <BrowserRouter>
      <ScrollToTop />
      <OAuthRedirectHandler />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blog />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/product/:handle" element={<Product />} />
        <Route path="/shopify-callback" element={<ShopifyCallback />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/shipping" element={<Shipping />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <DailyCheckinProvider>
            <AppContent />
          </DailyCheckinProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
