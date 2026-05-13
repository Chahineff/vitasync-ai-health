import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { ShopSection } from "@/components/dashboard/ShopSection";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";

export default function Shop() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleProductSelect = (handle: string) => {
    navigate(`/product/${handle}`);
  };

  return (
    <PageTransition className="min-h-screen bg-background relative">
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main id="main" className="pt-24 md:pt-28 pb-16">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
          {/* Public banner — invite to login for AI recommendations */}
          {!user && (
            <div className="mb-8 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_0_hsl(var(--foreground)/0.04)]">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium text-foreground tracking-tight">
                    {t("publicShop.bannerTitle")}
                  </p>
                  <p className="text-xs md:text-sm text-foreground/60 mt-1 leading-relaxed">
                    {t("publicShop.bannerSubtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-all whitespace-nowrap"
              >
                {t("publicShop.bannerCta")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          <ShopSection onProductSelect={handleProductSelect} />
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
