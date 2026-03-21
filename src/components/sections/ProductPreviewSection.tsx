import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import dashboardLight from "@/assets/dashboard-preview-light.png";
import dashboardDark from "@/assets/dashboard-preview-dark.png";

export const ProductPreviewSection = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();

  return (
    <section className="relative overflow-hidden bg-transparent -mt-8">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl" />

      <ContainerScroll
        titleComponent={
          <div className="mb-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-3 md:mb-4 px-2 text-foreground">
              {t("productPreview.title")}{" "}
              <span className="gradient-text">{t("productPreview.titleHighlight")}</span>{" "}
              {t("productPreview.titleEnd")}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light px-4">
              {t("productPreview.subtitle")}
            </p>
          </div>
        }
      >
        <div
          className="relative w-full h-full group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={resolvedTheme === "dark" ? dashboardDark : dashboardLight}
            alt="Dashboard VitaSync - Interface de suivi santé personnalisé"
            className="w-full h-full object-cover object-left-top rounded-lg"
          />

          {/* CTA Overlay on Hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg"
          >
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: isHovered ? 1 : 0.9,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
              onClick={() => (window.location.href = "/auth")}
            >
              {t("productPreview.cta")}
            </motion.button>
          </motion.div>
        </div>
      </ContainerScroll>
    </section>
  );
};
