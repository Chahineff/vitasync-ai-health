import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInBlur } from "@/lib/motion";

interface EditorialQuoteProps {
  children: React.ReactNode;
  cite?: string;
  role?: string;
  className?: string;
}

export function EditorialQuote({ children, cite, role, className }: EditorialQuoteProps) {
  return (
    <motion.figure
      variants={fadeInBlur}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "v2-glass relative px-8 py-10 md:px-12 md:py-14 max-w-3xl",
        className,
      )}
    >
      <Quote
        className="absolute -top-3 left-6 h-8 w-8 text-primary/70"
        aria-hidden="true"
      />
      <blockquote
        className="v2-h3 font-light italic leading-snug text-foreground"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {children}
      </blockquote>
      {(cite || role) && (
        <figcaption className="mt-6 flex items-center gap-3">
          <span className="h-px w-8 bg-foreground/30" aria-hidden="true" />
          <span className="v2-overline">
            {cite}
            {cite && role ? " · " : ""}
            {role}
          </span>
        </figcaption>
      )}
    </motion.figure>
  );
}

export default EditorialQuote;