import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/PageTransition";
import { HeroSection } from "@/components/sections/HeroSection";
import { CinematicDashboardSection } from "@/components/sections/CinematicDashboardSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { MarqueeBanner } from "@/components/sections/MarqueeBanner";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";

const Index = () => {
  return (
    <PageTransition className="min-h-screen bg-background relative">
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main>
        <HeroSection />
        <CinematicDashboardSection />
        <HowItWorksSection />
        <MarqueeBanner text="Smart supplements, real results" />
        <FeaturesSection />
        <MarqueeBanner text="Your health needs VitaSync" />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Index;
