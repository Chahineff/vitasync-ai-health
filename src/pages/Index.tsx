import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/PageTransition";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProductPreviewSection } from "@/components/sections/ProductPreviewSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingThemeToggle />
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
