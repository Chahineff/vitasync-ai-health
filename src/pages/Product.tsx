import { useNavigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FloatingThemeToggle } from "@/components/ui/FloatingThemeToggle";
import { ScrollToTopButton } from "@/components/ui/ScrollToTopButton";
import { ProductDetailMaster } from "@/components/dashboard/pdp/ProductDetailMaster";

export default function Product() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/shop");
  };

  const handleProductSelect = (newHandle: string) => {
    navigate(`/product/${newHandle}`);
  };

  if (!handle) {
    return null;
  }

  return (
    <PageTransition className="min-h-screen bg-background relative">
      <FloatingThemeToggle />
      <ScrollToTopButton />
      <Navbar />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="container-custom">
          <ProductDetailMaster
            handle={handle}
            onBack={handleBack}
            onProductSelect={handleProductSelect}
          />
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
