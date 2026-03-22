import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useRef, useCallback } from "react";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  subtitle?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon = <Sparkles className="size-5" />,
  title = "Featured",
  description = "Discover amazing content",
  subtitle,
  date = "Just now",
  iconClassName = "text-primary",
  titleClassName = "text-primary",
}: DisplayCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    card.style.setProperty("--holo-x", `${x}px`);
    card.style.setProperty("--holo-y", `${y}px`);
    card.style.setProperty("--holo-bg-x", `${(x / rect.width) * 100}%`);
    card.style.setProperty("--holo-bg-y", `${(y / rect.height) * 100}%`);
    card.style.setProperty("--rotate-x", `${rotateX}deg`);
    card.style.setProperty("--rotate-y", `${rotateY}deg`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.setProperty("--holo-x", "50%");
    card.style.setProperty("--holo-y", "50%");
    card.style.setProperty("--holo-bg-x", "50%");
    card.style.setProperty("--holo-bg-y", "50%");
    card.style.setProperty("--rotate-x", "0deg");
    card.style.setProperty("--rotate-y", "0deg");
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "display-card-holo relative flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-lg transition-all duration-500 ease-out w-[420px] md:w-[540px] lg:w-[620px]",
        className
      )}
      style={{
        "--holo-x": "50%",
        "--holo-y": "50%",
        "--holo-bg-x": "50%",
        "--holo-bg-y": "50%",
        "--rotate-x": "0deg",
        "--rotate-y": "0deg",
        transform: "perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y))",
      } as React.CSSProperties}
    >
      {/* Holographic rainbow overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle at var(--holo-bg-x) var(--holo-bg-y), rgba(0,240,255,0.12), rgba(59,130,246,0.08) 30%, rgba(0,215,135,0.08) 50%, rgba(168,85,247,0.06) 70%, transparent 90%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Shine spot */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(circle 120px at var(--holo-x) var(--holo-y), rgba(255,255,255,0.1), transparent 60%)",
        }}
      />

      {/* Subtle gradient border glow */}
      <div
        className="absolute -inset-[1px] z-0 pointer-events-none rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(0,240,255,0.2), rgba(59,130,246,0.15), rgba(0,215,135,0.2))",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] flex items-center gap-3">
        <span className={cn("relative inline-flex p-2.5 rounded-xl bg-muted", iconClassName)}>
          {icon}
        </span>
        <div>
          <p className={cn("text-xl md:text-2xl font-bold leading-tight", titleClassName)}>{title}</p>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground/70 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <p className="relative z-[2] text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
      <p className="relative z-[2] text-xs text-muted-foreground/50 font-medium uppercase tracking-wider">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-full before:outline-1 before:rounded-2xl before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-full before:outline-1 before:rounded-2xl before:outline-border before:h-full before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}

export { DisplayCard };
export type { DisplayCardProps };
