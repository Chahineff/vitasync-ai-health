import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

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
  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md p-6 md:p-8 shadow-lg transition-all duration-500 ease-out w-[400px] md:w-[500px] lg:w-[560px]",
        className
      )}
    >
      <div className="flex items-center gap-3">
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
      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>
      <p className="text-xs text-muted-foreground/50 font-medium uppercase tracking-wider">{date}</p>
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
