import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeInUp, stagger } from "@/lib/motion";

interface SectionHeaderProps {
  overline?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeader({
  overline,
  title,
  description,
  align = "left",
  className,
  as: Tag = "h2",
}: SectionHeaderProps) {
  return (
    <motion.div
      variants={stagger(0.05, 0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {overline && (
        <motion.p variants={fadeInUp} className="v2-overline">
          {overline}
        </motion.p>
      )}
      <motion.div variants={fadeInUp}>
        <Tag className={cn(Tag === "h1" ? "v2-display" : Tag === "h2" ? "v2-h2" : "v2-h3", "text-foreground")}>
          {title}
        </Tag>
      </motion.div>
      {description && (
        <motion.p variants={fadeInUp} className="v2-lead">
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

export default SectionHeader;