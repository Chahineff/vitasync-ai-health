import { useMemo } from "react";
import { motion } from "framer-motion";

interface ProgressParticlesProps {
  progress: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function ProgressParticles({ progress }: ProgressParticlesProps) {
  const maxParticles = 30;
  const visibleCount = Math.floor((progress / 100) * maxParticles);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: maxParticles }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 4,
      duration: Math.random() * 6 + 6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.slice(0, visibleCount).map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0.3, 0.6, 0],
            scale: [0, 1, 0.8, 1, 0],
            y: [0, -30, -15, -40, -20],
            x: [0, 10, -8, 5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`,
          }}
        />
      ))}
    </div>
  );
}
