import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductPreviewSection } from "@/components/sections/ProductPreviewSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingThemeToggle />
      <Navbar />
      <main>
        <HeroSection />
        <div className="section-divider section-divider-bg-to-muted" />
        <ProductPreviewSection />
        <div className="section-divider section-divider-muted-to-bg" />
        <HowItWorksSection />
        <div className="section-divider section-divider-bg-to-muted" />
        <FeaturesSection />
        <div className="section-divider section-divider-muted-to-bg" />
        <PricingSection />
        <div className="section-divider section-divider-bg-to-bg" />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
