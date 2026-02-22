import { Check, X, Star, Lightning } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

function AdaptiveCard({ children, className, popular = false }: { children: React.ReactNode; className?: string; popular?: boolean }) {
  return (
    <>
      {/* Light mode */}
      <div
        className={cn(
          "dark:hidden rounded-2xl overflow-hidden relative",
          "bg-white/70 backdrop-blur-xl border border-border/60",
          popular && "border-primary/30",
          className
        )}
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: popular ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))" : "linear-gradient(90deg, rgba(0,240,255,0.4), rgba(0,240,255,0.1))" }} />
        {children}
      </div>
      {/* Dark mode */}
      <div
        className={cn(
          "hidden dark:block rounded-2xl overflow-hidden relative border",
          popular ? "border-primary/40" : "border-white/[0.06]",
          className
        )}
        style={{
          background: "hsl(220 20% 8% / 0.92)",
          boxShadow: popular
            ? "0 0 30px rgba(0, 240, 255, 0.08), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 0 20px rgba(0, 240, 255, 0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: popular ? "linear-gradient(90deg, rgba(0,240,255,0.8), rgba(0,200,255,0.3))" : "linear-gradient(90deg, rgba(0,240,255,0.3), rgba(0,240,255,0.05))" }} />
        {children}
      </div>
    </>
  );
}

export function PricingSection() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t("pricing.plan1.name"),
      price: t("pricing.freePrice"),
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
      accent: "secondary" as const,
    },
    {
      name: t("pricing.plan2.name"),
      price: t("pricing.goPrice"),
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
      accent: "primary" as const,
    },
    {
      name: t("pricing.plan3.name"),
      price: t("pricing.premiumPrice"),
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
      accent: "primary" as const,
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

  const renderPlanContent = (plan: typeof plans[0], index: number) => (
    <div className="p-5 md:p-8 relative">
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs md:text-sm font-medium">
            <Star size={14} weight="fill" />
            {t("pricing.recommended")}
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          {index === 1 && <Lightning size={18} weight="fill" className="text-primary" />}
          {index === 2 && <Star size={18} weight="fill" className="text-primary" />}
          <h3 className="text-lg md:text-xl font-light text-foreground">
            {plan.name}
          </h3>
        </div>
        <div className="flex items-baseline gap-1 mb-2 md:mb-3">
          <span className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground">
            {plan.price}
          </span>
          <span className="text-foreground/50 text-sm md:text-base">{plan.period}</span>
        </div>
        <p className="text-xs md:text-sm text-foreground/50">
          {plan.description}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 md:gap-3">
            <div className={cn(
              "w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              plan.popular ? "bg-primary/20" : "bg-secondary/20"
            )}>
              <Check 
                size={10} 
                weight="bold" 
                className={cn(plan.popular ? "text-primary" : "text-secondary", "md:hidden")} 
              />
              <Check 
                size={12} 
                weight="bold" 
                className={cn(plan.popular ? "text-primary" : "text-secondary", "hidden md:block")} 
              />
            </div>
            <span className="text-xs md:text-sm text-foreground/70">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link 
        to="/auth?mode=signup"
        className={cn(
          "w-full block text-center text-sm md:text-base py-3 md:py-4",
          plan.popular 
            ? "btn-neumorphic text-primary-foreground" 
            : "btn-neumorphic-glass text-foreground"
        )}
      >
        {plan.cta}
      </Link>
    </div>
  );

  return (
    <section id="pricing" className="section-padding bg-muted/20 dark:bg-[hsl(222_25%_4%)] section-parallax">
      <div className="container-custom">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16 px-2">
            <span className="text-xs md:text-sm text-primary uppercase tracking-[0.3em] mb-3 md:mb-4 block">
              {t("pricing.title")}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground mb-3 md:mb-4">
              {t("pricing.subtitle").split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text-reverse">{t("pricing.subtitle").split(" ").slice(-1)}</span>
            </h2>
            <p className="text-sm md:text-lg text-foreground/50 max-w-2xl mx-auto px-4 md:px-0">
              {t("pricing.description")}
            </p>
          </div>
        </ScrollReveal>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto px-2 md:px-0 mb-12 md:mb-20">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 0.1}>
              <AdaptiveCard popular={plan.popular} className={cn("h-full", plan.popular && "pt-4")}>
                {renderPlanContent(plan, index)}
              </AdaptiveCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Comparison Table */}
        <ScrollReveal delay={0.2}>
          <div className="max-w-5xl mx-auto px-2 md:px-0">
            {/* Light mode table */}
            <div
              className="dark:hidden rounded-2xl overflow-hidden bg-white/70 backdrop-blur-xl border border-border/60"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(0,240,255,0.4), rgba(0,240,255,0.1))" }} />
              <div className="p-4 md:p-6 border-b border-border/50">
                <h3 className="text-lg md:text-xl font-light text-foreground text-center">
                  {t("pricing.comparison.title")}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-foreground/70 font-light w-[35%]">{t("pricing.comparison.feature")}</TableHead>
                      <TableHead className="text-center text-foreground/70 font-light w-[20%]">{t("pricing.free")}</TableHead>
                      <TableHead className="text-center text-foreground/70 font-light w-[22%]">
                        <span className="inline-flex items-center gap-1">Go AI <Lightning size={12} weight="fill" className="text-primary" /></span>
                      </TableHead>
                      <TableHead className="text-center text-foreground/70 font-light w-[23%]">
                        <span className="inline-flex items-center gap-1">Premium AI <Star size={12} weight="fill" className="text-primary" /></span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFeatures.map((feature) => (
                      <TableRow key={feature.name} className="border-border/30">
                        <TableCell className="text-foreground/80 text-sm font-light">{feature.name}</TableCell>
                        <TableCell className="text-center"><FeatureValue value={feature.free} /></TableCell>
                        <TableCell className="text-center bg-primary/[0.03]"><FeatureValue value={feature.go} /></TableCell>
                        <TableCell className="text-center bg-primary/5"><FeatureValue value={feature.premium} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            {/* Dark mode table */}
            <div
              className="hidden dark:block rounded-2xl overflow-hidden border border-white/[0.06]"
              style={{
                background: "hsl(220 20% 8% / 0.92)",
                boxShadow: "0 0 20px rgba(0, 240, 255, 0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, rgba(0,240,255,0.3), rgba(0,240,255,0.05))" }} />
              <div className="p-4 md:p-6 border-b border-white/[0.06]">
                <h3 className="text-lg md:text-xl font-light text-foreground text-center">
                  {t("pricing.comparison.title")}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06]">
                      <TableHead className="text-foreground/70 font-light w-[35%]">{t("pricing.comparison.feature")}</TableHead>
                      <TableHead className="text-center text-foreground/70 font-light w-[20%]">{t("pricing.free")}</TableHead>
                      <TableHead className="text-center text-foreground/70 font-light w-[22%]">
                        <span className="inline-flex items-center gap-1">Go AI <Lightning size={12} weight="fill" className="text-primary" /></span>
                      </TableHead>
                      <TableHead className="text-center text-foreground/70 font-light w-[23%]">
                        <span className="inline-flex items-center gap-1">Premium AI <Star size={12} weight="fill" className="text-primary" /></span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonFeatures.map((feature) => (
                      <TableRow key={feature.name} className="border-white/[0.04]">
                        <TableCell className="text-foreground/80 text-sm font-light">{feature.name}</TableCell>
                        <TableCell className="text-center"><FeatureValue value={feature.free} /></TableCell>
                        <TableCell className="text-center" style={{ background: "rgba(0,240,255,0.02)" }}><FeatureValue value={feature.go} /></TableCell>
                        <TableCell className="text-center" style={{ background: "rgba(0,240,255,0.04)" }}><FeatureValue value={feature.premium} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Note */}
        <ScrollReveal delay={0.3}>
          <div className="mt-8 md:mt-12 text-center px-4">
            {/* Light */}
            <div className="dark:hidden inline-block px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-border/60" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <p className="text-xs md:text-sm text-foreground/60">{t("pricing.note")}</p>
            </div>
            {/* Dark */}
            <div className="hidden dark:inline-block px-4 md:px-6 py-3 md:py-4 rounded-2xl border border-white/[0.06]" style={{ background: "hsl(220 20% 8% / 0.92)", boxShadow: "0 0 20px rgba(0, 240, 255, 0.04), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <p className="text-xs md:text-sm text-foreground/60">{t("pricing.note")}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
