import { useTranslation } from "@/hooks/useTranslation";
import { AnimatedText } from "@/components/ui/animated-shiny-text";
import { MagicText } from "@/components/ui/magic-text";
import { FeatureSteps } from "@/components/ui/feature-steps";
import { ChatPreviewWidget } from "./ChatPreviewWidget";
import { TrackerPreviewWidget } from "./TrackerPreviewWidget";
import { BiomarkerPreviewWidget } from "./BiomarkerPreviewWidget";
import { QualityPreviewWidget } from "./QualityPreviewWidget";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      step: t("features.feature1.subtitle"),
      title: t("features.feature1.title"),
      content: t("features.feature1.description"),
      preview: <ChatPreviewWidget />,
    },
    {
      step: t("features.feature2.subtitle"),
      title: t("features.feature2.title"),
      content: t("features.feature2.description"),
      preview: <TrackerPreviewWidget />,
    },
    {
      step: t("features.feature3.subtitle"),
      title: t("features.feature3.title"),
      content: t("features.feature3.description"),
      preview: <BiomarkerPreviewWidget />,
    },
    {
      step: t("features.feature4.subtitle"),
      title: t("features.feature4.title"),
      content: t("features.feature4.description"),
      preview: <QualityPreviewWidget />,
    },
  ];

  return (
    <section id="features" className="section-padding overflow-hidden bg-transparent section-parallax">
      <FeatureSteps
        features={features}
        autoPlayInterval={6000}
        title={
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-tight text-foreground mb-4 md:mb-5">
            {t("features.title")}{" "}
            <AnimatedText
              text={t("features.titleHighlight")}
              textClassName="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight"
              className="inline-block"
            />
            {" "}{t("features.titleEnd")}
          </h2>
        }
        subtitle={
          <MagicText
            text={t("features.subtitle")}
            className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto font-light px-4 md:px-0 justify-center"
          />
        }
      />
    </section>
  );
}
