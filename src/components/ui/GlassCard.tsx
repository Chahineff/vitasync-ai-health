import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "glass-card p-6 md:p-8",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
