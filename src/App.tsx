import { useEffect, lazy, Suspense } from "react";
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
import "@/lib/cookie-consent";
import { SkipToContent } from "@/components/a11y/SkipToContent";
// Eager: home + lightweight pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
// Lazy: heavy / non-critical routes (split into separate chunks)
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Product = lazy(() => import("./pages/Product"));
const Shop = lazy(() => import("./pages/Shop"));
const ShopifyCallback = lazy(() => import("./pages/ShopifyCallback"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const LegalNotice = lazy(() => import("./pages/legal/LegalNotice"));
const CookiesPage = lazy(() => import("./pages/legal/Cookies"));
const CGV = lazy(() => import("./pages/legal/CGV"));
const Disclaimer = lazy(() => import("./pages/legal/Disclaimer"));
const Shipping = lazy(() => import("./pages/legal/Shipping"));

const queryClient = new QueryClient();

function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

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
      <SkipToContent />
      <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:blogHandle/:articleHandle" element={<BlogPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/product/:handle" element={<Product />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shopify-callback" element={<ShopifyCallback />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/legal-notice" element={<LegalNotice />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms-of-service" element={<Terms />} />
        <Route path="/refund-policy" element={<Shipping />} />
        <Route path="/shipping-policy" element={<Shipping />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <CookieBanner />
    </BrowserRouter>
  );
}

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
