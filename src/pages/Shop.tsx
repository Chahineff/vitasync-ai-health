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
      <main className="pt-24 md:pt-28 pb-16">
        <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8">
          {/* Public banner — invite to login for AI recommendations */}
          {!user && (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-semibold text-foreground">
                    {t("publicShop.bannerTitle")}
                  </p>
                  <p className="text-xs md:text-sm text-foreground/70 mt-0.5">
                    {t("publicShop.bannerSubtitle")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap shadow-md shadow-primary/20"
              >
                {t("publicShop.bannerCta")}
                <ArrowRight className="w-4 h-4" />
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
