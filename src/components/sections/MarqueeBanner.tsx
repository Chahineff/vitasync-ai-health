import { motion } from "framer-motion";

export function MarqueeBanner() {
  const text = "Your health needs VitaSync";
  // Repeat text enough times to fill the screen
  const repeats = 12;

  return (
    <section className="relative overflow-hidden py-5 md:py-6 select-none">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-secondary" />
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary via-primary to-transparent" />

      {/* Scrolling content */}
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-8 md:gap-12"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {Array.from({ length: repeats }).map((_, i) => (
            <span
              key={i}
              className="text-lg md:text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent whitespace-nowrap"
            >
              {text}
              <span className="mx-4 md:mx-6 text-primary/30">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
