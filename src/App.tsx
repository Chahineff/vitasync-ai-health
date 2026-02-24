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
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Product from "./pages/Product";
import NotFound from "./pages/NotFound";
import ShopifyCallback from "./pages/ShopifyCallback";

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
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
