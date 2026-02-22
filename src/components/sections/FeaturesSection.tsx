import { motion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const bentoCards = [
  {
    titleKey: "features.feature1.title",
    descriptionKey: "features.feature1.description",
    image: "/lovable-uploads/dashboard-screenshot.png",
    span: "md:col-span-2 md:row-span-2",
    aspect: "aspect-[4/3]",
  },
  {
    titleKey: "features.feature2.title",
    descriptionKey: "features.feature2.description",
    image: "/lovable-uploads/93cbbe29-32a4-45e6-8a4d-0893a176b344.png",
    span: "md:col-span-1",
    aspect: "aspect-square",
  },
  {
    titleKey: "features.feature3.title",
    descriptionKey: "features.feature3.description",
    image: "/lovable-uploads/b76c7338-9637-4218-a2fd-4ee911de2e71.png",
    span: "md:col-span-1",
    aspect: "aspect-square",
  },
  {
    titleKey: "features.feature4.title",
    descriptionKey: "features.feature4.description",
    image: "/lovable-uploads/37a50e32-8de6-4d95-b672-08c026f435c5.png",
    span: "md:col-span-2",
    aspect: "aspect-[2/1]",
  },
];

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="section-padding overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-20 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            {t("features.title")}{" "}
            <span className="font-editorial italic text-primary">{t("features.titleHighlight")}</span>
          </h2>
          <p className="text-base md:text-lg text-foreground/50 max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-6xl mx-auto">
          {bentoCards.map((card, index) => (
            <motion.div
              key={index}
              className={`${card.span} group`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="glass-card-premium rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1">
                {/* Image */}
                <div className={`${card.aspect} overflow-hidden relative`}>
                  <img
                    src={card.image}
                    alt={t(card.titleKey)}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                </div>
                {/* Text */}
                <div className="p-5 md:p-6 mt-auto">
                  <h3 className="text-lg md:text-xl font-medium text-foreground mb-2">
                    {t(card.titleKey)}
                  </h3>
                  <p className="text-sm text-foreground/50 leading-relaxed mb-3">
                    {t(card.descriptionKey)}
                  </p>
                  <Link
                    to="/auth?mode=signup"
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:gap-2.5 transition-all duration-200"
                  >
                    En savoir plus <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coach IA Section */}
        <motion.div
          className="mt-20 md:mt-32 text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            <span className="font-editorial italic text-primary">Demande</span> n'importe quoi
          </h2>
          <p className="text-base md:text-lg text-foreground/50 mb-12 max-w-xl mx-auto">
            Un coach IA disponible 24h/24, formé sur les dernières études scientifiques en nutrition et supplémentation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Insights instantanés", desc: "Posez une question, obtenez une réponse sourcée en secondes." },
              { title: "Récaps personnalisés", desc: "Votre bilan hebdomadaire avec recommandations ajustées." },
              { title: "Analyse de stack", desc: "Vérifiez les interactions et optimisez vos prises." },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card-premium rounded-2xl p-6 text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <h4 className="text-base font-medium text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-foreground/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
