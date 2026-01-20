import { ScrollReveal } from "@/components/ui/ScrollReveal";

const logos = [
  { name: "TechCrunch", width: 120 },
  { name: "Healthline", width: 100 },
  { name: "Wired", width: 80 },
  { name: "Forbes", width: 90 },
  { name: "VentureBeat", width: 120 },
];

export function SocialProofSection() {
  return (
    <section className="py-12 border-y border-border/30 bg-muted/20">
      <div className="container-custom">
        <ScrollReveal>
          <p className="text-center text-sm text-foreground/40 mb-8 uppercase tracking-widest">
            Ils parlent de nous
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {logos.map((logo) => (
              <div
                key={logo.name}
                className="text-foreground/20 hover:text-foreground/40 transition-colors duration-300"
                style={{ width: logo.width }}
              >
                <span className="text-xl md:text-2xl font-light tracking-tight">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
