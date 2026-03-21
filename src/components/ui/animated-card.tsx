import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AnimatedCard({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl transition-all duration-500 hover:border-border/60 hover:shadow-lg",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("relative z-10 p-6", className)}
      {...props}
    />
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground mt-2", className)}
      {...props}
    />
  );
}

export function CardVisual({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative h-48 w-full overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

// --- Visual Components ---

interface Visual1Props {
  mainColor?: string;
  secondaryColor?: string;
  gridColor?: string;
}

export function Visual1({
  mainColor = "#8b5cf6",
  secondaryColor = "#fbbf24",
  gridColor = "#80808015",
}: Visual1Props) {
  return (
    <div className="relative h-full w-full">
      <GridLayer color={gridColor} />
      <EllipseGradient color={mainColor} />
      <Layer1 color={mainColor} secondaryColor={secondaryColor} />
      <Layer2 color={mainColor} />
      <Layer3 color={mainColor} secondaryColor={secondaryColor} />
      <Layer4 />
    </div>
  );
}

interface GridLayerProps {
  color: string;
}

const GridLayer = ({ color }: GridLayerProps) => {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}
    />
  );
};

interface EllipseGradientProps {
  color: string;
}

const EllipseGradient = ({ color }: EllipseGradientProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="h-32 w-32 rounded-full blur-3xl opacity-30"
        style={{ background: color }}
      />
    </div>
  );
};

interface LayerProps {
  color: string;
  secondaryColor?: string;
}

const Layer1 = ({ color, secondaryColor }: LayerProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="h-full w-full opacity-20">
        <circle cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke={color} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="40" fill="none" stroke={secondaryColor || color} strokeWidth="0.5" />
        <circle cx="100" cy="100" r="20" fill="none" stroke={color} strokeWidth="0.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1="100"
            y1="100"
            x2={100 + 80 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 80 * Math.sin((angle * Math.PI) / 180)}
            stroke={color}
            strokeWidth="0.3"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
};

const Layer2 = ({ color }: LayerProps) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: color }} />
        <span className="text-[10px] text-muted-foreground">Active</span>
      </div>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-3 w-1 rounded-full"
            style={{
              background: color,
              opacity: 0.2 + i * 0.2,
              height: `${8 + i * 3}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Layer3 = ({ color, secondaryColor }: LayerProps) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[9px] text-muted-foreground">AI</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: secondaryColor || color }} />
        <span className="text-[9px] text-muted-foreground">Data</span>
      </div>
    </div>
  );
};

const Layer4 = () => {
  return (
    <div className="absolute top-4 left-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-lg bg-muted/50 flex items-center justify-center">
          <div className="h-3 w-3 rounded-sm bg-primary/30" />
        </div>
      </div>
    </div>
  );
};
