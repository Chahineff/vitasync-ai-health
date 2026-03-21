import { Check, X, Star, Lightning } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlowCard } from "@/components/ui/spotlight-card";
import { GradientBorderWrapper } from "@/components/ui/GradientBorderWrapper";
import NumberFlow from "@number-flow/react";
import confetti from "canvas-confetti";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} weight="bold" className="text-secondary mx-auto" />
    ) : (
      <X size={18} weight="bold" className="text-foreground/30 mx-auto" />
    );
  }
  return <span className="text-foreground/80 text-sm">{value}</span>;
}

export function PricingSection() {
  const { t } = useTranslation();
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: [
          "hsl(217, 100%, 50%)",
          "hsl(190, 100%, 45%)",
          "hsl(163, 100%, 42%)",
        ],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  const plans = [
    {
      name: t("pricing.plan1.name"),
      monthlyPrice: 0,
      yearlyPrice: 0,
      period: t("pricing.perMonth"),
      description: t("pricing.plan1.description"),
      features: [
        t("pricing.plan1.feature1"),
        t("pricing.plan1.feature2"),
        t("pricing.plan1.feature3"),
        t("pricing.plan1.feature4"),
      ],
      cta: t("pricing.plan1.cta"),
      popular: false,
      glowColor: "cyan" as const,
      accentRgba: "rgba(0, 240, 255, 0.8)",
    },
    {
      name: t("pricing.plan2.name"),
      monthlyPrice: 7.99,
      yearlyPrice: 6.39,
      period: t("pricing.perMonth"),
      description: t("pricing.plan2.description"),
      features: [
        t("pricing.plan2.feature1"),
        t("pricing.plan2.feature2"),
        t("pricing.plan2.feature3"),
        t("pricing.plan2.feature4"),
        t("pricing.plan2.feature5"),
        t("pricing.plan2.feature6"),
      ],
      cta: t("pricing.plan2.cta"),
      popular: false,
      glowColor: "green" as const,
      accentRgba: "rgba(0, 215, 135, 0.8)",
    },
    {
      name: t("pricing.plan3.name"),
      monthlyPrice: 24.99,
      yearlyPrice: 19.99,
      period: t("pricing.perMonth"),
      description: t("pricing.plan3.description"),
      features: [
        t("pricing.plan3.feature1"),
        t("pricing.plan3.feature2"),
        t("pricing.plan3.feature3"),
        t("pricing.plan3.feature4"),
        t("pricing.plan3.feature5"),
        t("pricing.plan3.feature6"),
        t("pricing.plan3.feature7"),
      ],
      cta: t("pricing.plan3.cta"),
      popular: true,
      glowColor: "blue" as const,
      accentRgba: "rgba(59, 130, 246, 0.8)",
    },
  ];

  const comparisonFeatures = [
    { name: t("pricing.comparison.row1"), free: t("pricing.comparison.row1Free"), go: t("pricing.comparison.row1Go"), premium: t("pricing.comparison.row1Premium") },
    { name: t("pricing.comparison.row2"), free: true, go: true, premium: true },
    { name: t("pricing.comparison.row3"), free: false, go: false, premium: true },
    { name: t("pricing.comparison.row4"), free: false, go: t("pricing.comparison.row4Go"), premium: true },
    { name: t("pricing.comparison.row5"), free: t("pricing.comparison.row5Free"), go: t("pricing.comparison.row5Go"), premium: t("pricing.comparison.row5Premium") },
    { name: t("pricing.comparison.row6"), free: false, go: false, premium: true },
    { name: t("pricing.comparison.row7"), free: t("pricing.comparison.row7Free"), go: t("pricing.comparison.row7Go"), premium: t("pricing.comparison.row7Premium") },
    { name: t("pricing.comparison.row8"), free: false, go: true, premium: true },
    { name: t("pricing.comparison.row9"), free: t("pricing.comparison.row9Free"), go: t("pricing.comparison.row9Go"), premium: t("pricing.comparison.row9Premium") },
  ];

  return (
    <section id="pricing" className="section-padding bg-transparent section-parallax">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          className="text-center mb-6 md:mb-10 px-2"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-3 md:mb-4">
            {t("pricing.subtitle")}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4 md:px-0">
            {t("pricing.description")}
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className={cn("text-sm font-medium transition-colors", isMonthly ? "text-foreground" : "text-muted-foreground")}>
            {t("pricing.perMonth")?.replace("/", "") || "Mensuel"}
          </span>
          <Switch ref={switchRef} checked={!isMonthly} onCheckedChange={handleToggle} />
          <Label className={cn("text-sm font-medium transition-colors cursor-pointer", !isMonthly ? "text-foreground" : "text-muted-foreground")}>
            Annuel
            <span className="ml-1.5 text-xs font-semibold text-secondary">(-20%)</span>
          </Label>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto px-2 md:px-0 mb-16 md:mb-24">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative"
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold shadow-lg shadow-primary/25">
                    <Star size={14} weight="fill" />
                    {t("pricing.recommended")}
                  </span>
                </div>
              )}

              <GradientBorderWrapper accentColor={plan.accentRgba} borderRadius="rounded-2xl" intensity={plan.popular ? "strong" : "medium"}>
              <GlowCard glowColor={plan.glowColor} className={cn("h-full", plan.popular && "ring-1 ring-primary/30")}>
                <div className={cn("p-6 md:p-8 relative", plan.popular && "pt-8")}>
                  {/* Plan name */}
                  <div className="flex items-center gap-2 mb-4">
                    {index === 1 && <Lightning size={18} weight="fill" className="text-primary" />}
                    {index === 2 && <Star size={18} weight="fill" className="text-primary" />}
                    <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-1">
                    <NumberFlow
                      value={isMonthly ? plan.monthlyPrice : plan.yearlyPrice}
                      format={{ style: "currency", currency: "EUR", minimumFractionDigits: plan.monthlyPrice === 0 ? 0 : 2 }}
                      transformTiming={{ duration: 500, easing: "ease-out" }}
                      willChange
                      className="text-4xl md:text-5xl font-light text-foreground tabular-nums"
                    />
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground/60 mb-6">
                    {isMonthly ? t("pricing.billedMonthly") || "facturé mensuellement" : t("pricing.billedAnnually") || "facturé annuellement"}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          plan.popular ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"
                        )}>
                          <Check size={11} weight="bold" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Separator */}
                  <div className="h-px bg-border/50 mb-6" />

                  {/* CTA */}
                  <Link
                    to="/auth?mode=signup"
                    className={cn(
                      "w-full block text-center text-sm font-medium py-3.5 rounded-xl transition-all duration-300",
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:brightness-110"
                        : "bg-muted hover:bg-muted/80 text-foreground border border-border/50"
                    )}
                  >
                    {plan.cta}
                  </Link>

                  <p className="text-[11px] text-muted-foreground/50 text-center mt-3">
                    {plan.description}
                  </p>
                </div>
              </GlowCard>
              </GradientBorderWrapper>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <motion.div
          className="max-w-5xl mx-auto px-2 md:px-0"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <GradientBorderWrapper accentColor="rgba(0, 240, 255, 0.8)" secondaryColor="rgba(59, 130, 246, 0.8)" borderRadius="rounded-2xl" intensity="subtle">
          <GlowCard glowColor="cyan">
            <div className="p-4 md:p-6 border-b border-border/30">
              <h3 className="text-lg md:text-xl font-light text-foreground text-center">
                {t("pricing.comparison.title")}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-muted-foreground font-light w-[35%]">{t("pricing.comparison.feature")}</TableHead>
                    <TableHead className="text-center text-muted-foreground font-light w-[20%]">{t("pricing.free")}</TableHead>
                    <TableHead className="text-center text-muted-foreground font-light w-[22%]">
                      <span className="inline-flex items-center gap-1">Go AI <Lightning size={12} weight="fill" className="text-primary" /></span>
                    </TableHead>
                    <TableHead className="text-center text-muted-foreground font-light w-[23%]">
                      <span className="inline-flex items-center gap-1">Premium AI <Star size={12} weight="fill" className="text-primary" /></span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((feature) => (
                    <TableRow key={feature.name} className="border-border/20">
                      <TableCell className="text-foreground/80 text-sm font-light">{feature.name}</TableCell>
                      <TableCell className="text-center"><FeatureValue value={feature.free} /></TableCell>
                      <TableCell className="text-center bg-primary/[0.02]"><FeatureValue value={feature.go} /></TableCell>
                      <TableCell className="text-center bg-primary/[0.04]"><FeatureValue value={feature.premium} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlowCard>
          </GradientBorderWrapper>
        </motion.div>

        {/* Note */}
        <motion.div
          className="mt-8 md:mt-12 text-center px-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="text-xs md:text-sm text-muted-foreground/50">{t("pricing.note")}</p>
        </motion.div>
      </div>
    </section>
  );
}
