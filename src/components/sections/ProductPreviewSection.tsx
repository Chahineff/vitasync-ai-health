import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Robot, 
  Path, 
  Storefront, 
  DeviceMobile, 
  CheckCircle, 
  Circle,
  Brain,
  Lightning,
  Moon,
  ChatCircleDots,
  Leaf
} from "@phosphor-icons/react";

// Ring Chart Component
const RingChart = () => {
  const metrics = [
    { label: "Énergie", value: 78, color: "hsl(var(--primary))" },
    { label: "Focus", value: 92, color: "hsl(var(--secondary))" },
    { label: "Sommeil", value: 85, color: "hsl(var(--secondary))" },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {metrics.map((metric, index) => {
            const radius = 16 - index * 4;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = `${(metric.value / 100) * circumference} ${circumference}`;
            
            return (
              <motion.circle
                key={metric.label}
                cx="18"
                cy="18"
                r={radius}
                fill="none"
                stroke={metric.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray }}
                transition={{ duration: 1.5, delay: 0.3 + index * 0.2, ease: "easeOut" }}
              />
            );
          })}
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        {metrics.map((metric, index) => (
          <div key={metric.label} className="flex items-center gap-2 text-[10px]">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: metric.color }}
            />
            <span className="text-foreground/70">{metric.label}</span>
            <span className="font-medium text-foreground">{metric.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Routine Checklist Component
const RoutineChecklist = () => {
  const items = [
    { name: "Vitamine D3", time: "Matin", checked: true },
    { name: "Oméga-3", time: "Midi", checked: true },
    { name: "Magnésium", time: "Soir", checked: false },
  ];

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <motion.div
          key={item.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          className="flex items-center gap-2 text-[10px]"
        >
          {item.checked ? (
            <CheckCircle weight="fill" className="w-3.5 h-3.5 text-secondary" />
          ) : (
            <Circle weight="regular" className="w-3.5 h-3.5 text-foreground/30" />
          )}
          <span className={item.checked ? "text-foreground/50 line-through" : "text-foreground"}>
            {item.name}
          </span>
          <span className="text-foreground/40 ml-auto">{item.time}</span>
        </motion.div>
      ))}
    </div>
  );
};

// Mini Dashboard Component
const MiniDashboard = () => {
  return (
    <div className="w-full h-full flex bg-background/95 rounded-2xl overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-48 flex-col bg-muted/30 border-r border-border/50 p-3">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Leaf weight="fill" className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-light text-sm tracking-tight">VitaSync</span>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1">
          <motion.div 
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px]"
            animate={{ x: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Robot weight="light" className="w-4 h-4" />
            <span>Coach IA</span>
          </motion.div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-foreground/60 text-[11px] hover:bg-muted/50 rounded-lg transition-colors">
            <Path weight="light" className="w-4 h-4" />
            <span>Suivi routines</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 text-foreground/60 text-[11px] hover:bg-muted/50 rounded-lg transition-colors">
            <Storefront weight="light" className="w-4 h-4" />
            <span>Boutique</span>
            <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded-full bg-secondary/20 text-secondary">Soon</span>
          </div>
        </nav>

        {/* App Download Card */}
        <motion.div 
          className="mt-auto p-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-2">
            <DeviceMobile weight="light" className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[9px] font-medium">App Mobile</p>
              <p className="text-[8px] text-foreground/50">Coming Soon</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-light">
            Bonjour <span className="font-medium">Alex</span>,
          </h3>
          <p className="text-[11px] text-foreground/60">
            votre score de santé est de <span className="text-primary font-medium">85%</span> aujourd'hui
          </p>
        </motion.div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Coach IA Widget */}
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <ChatCircleDots weight="fill" className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[10px] font-medium">Coach IA</span>
            </div>
            <motion.div 
              className="p-2 rounded-lg bg-white/50 dark:bg-white/5 text-[9px] leading-relaxed text-foreground/80"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              "J'ai analysé votre sommeil, je vous conseille d'ajuster votre prise de <span className="text-primary font-medium">Magnésium</span> ce soir."
            </motion.div>
          </motion.div>

          {/* Stats Widget */}
          <motion.div 
            className="p-3 rounded-xl bg-gradient-to-br from-secondary/5 to-transparent border border-secondary/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <Brain weight="light" className="w-3 h-3 text-primary" />
                <Lightning weight="light" className="w-3 h-3 text-secondary" />
                <Moon weight="light" className="w-3 h-3 text-accent" />
              </div>
              <span className="text-[10px] font-medium">Statistiques</span>
            </div>
            <RingChart />
          </motion.div>

          {/* Routine Widget */}
          <motion.div 
            className="p-3 rounded-xl bg-muted/30 border border-border/50 md:col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle weight="light" className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] font-medium">Routine du jour</span>
              <span className="ml-auto text-[9px] text-muted-foreground">2/3 complété</span>
            </div>
            <RoutineChecklist />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

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
      className="relative py-20 lg:py-32 overflow-hidden"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />
      
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight mb-4">
            Votre <span className="text-primary">Dashboard</span> Personnel
          </h2>
          <p className="text-foreground/60 text-base md:text-lg max-w-2xl mx-auto font-light">
            Une interface intuitive et élégante pour suivre votre santé au quotidien
          </p>
        </motion.div>

        {/* Monitor Mockup */}
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

              {/* Screen Content */}
              <div className="aspect-[16/10] lg:aspect-[16/9] p-1 lg:p-2">
                <div className="w-full h-full rounded-xl lg:rounded-2xl overflow-hidden shadow-inner">
                  <MiniDashboard />
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

        {/* Mobile View Indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-foreground/40 text-sm font-light"
        >
          <DeviceMobile weight="light" className="inline w-4 h-4 mr-1" />
          Disponible sur tous vos appareils
        </motion.p>
      </div>
    </section>
  );
};
