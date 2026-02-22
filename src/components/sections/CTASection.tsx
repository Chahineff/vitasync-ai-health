import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

export function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-custom relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary mb-8">
            <Sparkle size={14} weight="fill" />
            Essai gratuit — Aucune carte requise
          </span>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.05]">
            Commence{" "}
            <span className="font-editorial italic text-primary">maintenant</span>
          </h2>

          <p className="text-lg md:text-xl text-foreground/50 mb-10 max-w-xl mx-auto">
            Rejoins des milliers d'utilisateurs qui optimisent leur santé grâce à l'IA.
          </p>

          <Link
            to="/auth?mode=signup"
            className="btn-outline-hero group inline-flex"
          >
            Créer mon profil santé
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
