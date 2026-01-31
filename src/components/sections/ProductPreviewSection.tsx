import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const ProductPreviewSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.9, 1, 1.02, 0.98]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [12, 4, 0, 2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.8]);

  return (
    <section 
      ref={containerRef}
      className="relative py-12 md:py-20 lg:py-32 overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      {/* Decorative blurs - smaller on mobile */}
      <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-3 md:mb-4 px-2">
            Votre <span className="text-primary">Dashboard</span> Personnel
          </h2>
          <p className="text-foreground/60 text-sm md:text-base lg:text-lg max-w-2xl mx-auto font-light px-4">
            Une interface intuitive et élégante pour suivre votre santé au quotidien
          </p>
        </motion.div>

        {/* Desktop Monitor Mockup with Real Screenshot */}
        <motion.div
          style={{ scale, rotateX, opacity }}
          className="relative max-w-5xl mx-auto perspective-[2000px]"
        >
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Screen Frame (Glassmorphism) */}
            <motion.div
              className="relative rounded-2xl lg:rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.15), 0 30px 60px -30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Top bezel with camera */}
              <div className="h-6 lg:h-8 bg-gradient-to-b from-white/10 to-transparent flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-foreground/20" />
              </div>

              {/* Screen Content - Real Dashboard Screenshot */}
              <div className="aspect-[16/10] lg:aspect-[16/9] p-1 lg:p-2">
                <div className="w-full h-full rounded-xl lg:rounded-2xl overflow-hidden shadow-inner">
                  <img 
                    src="/lovable-uploads/dashboard-screenshot.png" 
                    alt="Dashboard VitaSync - Interface de suivi santé personnalisé"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Bottom bezel */}
              <div className="h-4 lg:h-6 bg-gradient-to-t from-white/5 to-transparent" />
            </motion.div>

            {/* Reflection effect */}
            <div 
              className="absolute inset-0 rounded-2xl lg:rounded-3xl pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, transparent 100%)",
              }}
            />

            {/* CTA Overlay on Hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl lg:rounded-3xl"
            >
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ 
                  scale: isHovered ? 1 : 0.9, 
                  opacity: isHovered ? 1 : 0 
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
                onClick={() => window.location.href = '/auth'}
              >
                Explorer le dashboard
              </motion.button>
            </motion.div>
          </div>

          {/* Stand/Shadow */}
          <div className="hidden lg:block absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-gradient-to-t from-foreground/5 to-transparent rounded-full blur-sm" />
        </motion.div>
      </div>
    </section>
  );
};
