import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function LegalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const colors = [
      "0, 212, 200",   // teal
      "59, 130, 246",  // blue
      "99, 102, 241",  // indigo
      "16, 185, 129",  // emerald
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const baseCount = 120;
    for (let i = 0; i < baseCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 1,
        opacity: Math.random() * 0.4 + 0.15,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollFactor = scrollRef.current;
      const intensity = 0.6 + scrollFactor * 1.5;

      particles.forEach((p) => {
        p.x += p.vx * intensity;
        p.y += p.vy * intensity;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const dynamicOpacity = p.opacity * (0.7 + scrollFactor * 0.8);
        const dynamicSize = p.size * (0.9 + scrollFactor * 0.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(dynamicOpacity, 0.6)})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(dynamicOpacity * 0.12 + scrollFactor * 0.06, 0.12)})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      const connectionOpacity = 0.03 + scrollFactor * 0.06;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(0, 212, 200, ${connectionOpacity * (1 - dist / 150)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
