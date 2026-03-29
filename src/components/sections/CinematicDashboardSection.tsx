
"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { useIsMobile } from "@/hooks/use-mobile";
import { Activity, Bot, Pill, Heart, TrendingUp } from "lucide-react";

import dashboardLight from "@/assets/dashboard-preview-light.png";
import dashboardDark from "@/assets/dashboard-preview-dark.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .cinematic-section .gsap-reveal { visibility: hidden; }

  .cinematic-section .bg-grid-theme {
    background-size: 60px 60px;
    background-image: 
      linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .cinematic-section .text-silver-matte {
    background: linear-gradient(180deg, var(--color-foreground) 0%, color-mix(in srgb, var(--color-foreground) 40%, transparent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter: 
      drop-shadow(0px 10px 20px color-mix(in srgb, var(--color-foreground) 15%, transparent)) 
      drop-shadow(0px 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent));
  }

  .cinematic-section .text-card-silver-matte {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter: 
      drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) 
      drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  .cinematic-section .premium-depth-card {
    background: linear-gradient(145deg, hsl(var(--primary) / 0.3) 0%, #0A101D 100%);
    box-shadow: 
      0 40px 100px -20px rgba(0, 0, 0, 0.9),
      0 20px 40px -20px rgba(0, 0, 0, 0.8),
      inset 0 1px 2px rgba(255, 255, 255, 0.2),
      inset 0 -2px 4px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.04);
    position: relative;
  }

  .cinematic-section .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .cinematic-section .iphone-bezel {
    background-color: #111;
    box-shadow: 
      inset 0 0 0 2px #52525B, 
      inset 0 0 0 7px #000, 
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }

  .cinematic-section .hardware-btn {
    background: linear-gradient(90deg, #404040 0%, #171717 100%);
    box-shadow: 
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(255,255,255,0.15),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.05);
  }

  .cinematic-section .screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .cinematic-section .floating-ui-badge {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(24px); 
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 25px 50px -12px rgba(0, 0, 0, 0.8),
      inset 0 1px 1px rgba(255,255,255,0.2),
      inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .cinematic-section .progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 251;
    stroke-dashoffset: 251;
    stroke-linecap: round;
  }

  .cinematic-section .macbook-body {
    background: linear-gradient(180deg, #2D2D2D 0%, #1A1A1A 100%);
    border-radius: 12px 12px 0 0;
    padding: 10px 10px 0 10px;
    box-shadow:
      inset 0 0 0 1.5px #404040,
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
  }

  .cinematic-section .macbook-screen {
    background: #000;
    border-radius: 6px 6px 0 0;
    overflow: hidden;
    position: relative;
  }

  .cinematic-section .macbook-notch {
    background: #1A1A1A;
    border-radius: 0 0 8px 8px;
    width: 25%;
    height: 18px;
    margin: 0 auto;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 30;
    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }

  .cinematic-section .macbook-notch::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, #1C3A1C 0%, #0A0A0A 100%);
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: inset 0 0 2px rgba(0,255,0,0.1);
  }

  .cinematic-section .macbook-base {
    background: linear-gradient(180deg, #3A3A3A 0%, #2A2A2A 50%, #1A1A1A 100%);
    height: 14px;
    border-radius: 0 0 6px 6px;
    position: relative;
    box-shadow:
      inset 0 1px 1px rgba(255,255,255,0.1),
      0 4px 10px rgba(0,0,0,0.5);
  }

  .cinematic-section .macbook-base::before {
    content: '';
    position: absolute;
    width: 18%;
    height: 4px;
    background: linear-gradient(180deg, #555 0%, #333 100%);
    border-radius: 0 0 4px 4px;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    box-shadow: inset 0 -1px 1px rgba(0,0,0,0.3);
  }

  .cinematic-section .macbook-foot {
    background: linear-gradient(180deg, #1A1A1A 0%, #111 100%);
    height: 4px;
    border-radius: 0 0 12px 12px;
    width: 104%;
    margin-left: -2%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  .cinematic-section .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.03; mix-blend-mode: overlay;
  }
`;

export const CinematicDashboardSection = () => {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const isMobile = useIsMobile();
  const dashboardSrc = resolvedTheme === "dark" ? dashboardDark : dashboardLight;

  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  // Mouse parallax (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 3) return;
      cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 10,
            rotationX: -yVal * 10,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isMobile]);

  // GSAP scroll timeline
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    const scrollEnd = mobile ? 3500 : 6000;

    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(".cine-title", { autoAlpha: 0, y: 50, filter: "blur(16px)" });
      gsap.set(".cine-subtitle", { autoAlpha: 0, y: 30 });
      gsap.set(".cine-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".cine-mockup-wrapper", ".cine-badge", ".cine-card-text-left", ".cine-card-text-right"], { autoAlpha: 0 });
      gsap.set(".cine-cta", { autoAlpha: 0, scale: 0.8, filter: "blur(20px)" });

      // Intro animation
      const intro = gsap.timeline({ delay: 0.2 });
      intro
        .to(".cine-title", { duration: 1.4, autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "expo.out" })
        .to(".cine-subtitle", { duration: 1, autoAlpha: 1, y: 0, ease: "power3.out" }, "-=0.8");

      // Scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${scrollEnd}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      tl
        // Phase 1: Fade title, bring card up
        .to(".cine-hero-text", { scale: 1.1, filter: "blur(16px)", opacity: 0, ease: "power2.inOut", duration: 2 }, 0)
        .to(".cine-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        // Phase 2: Expand card
        .to(".cine-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        // Phase 3: Reveal mockup
        .fromTo(".cine-mockup-wrapper",
          { y: 200, z: -400, rotationX: mobile ? 0 : 40, rotationY: mobile ? 0 : -25, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        // Phase 4: Progress ring + counter
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.5")
        .to(".cine-counter", { innerHTML: 92, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        // Phase 4b: Floating badges
        .fromTo(".cine-badge",
          { y: 80, autoAlpha: 0, scale: 0.7, rotationZ: -8 },
          { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.15 }, "-=1.8"
        )
        // Phase 4c: Side text
        .fromTo(".cine-card-text-left", { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.2 }, "-=1.2")
        .fromTo(".cine-card-text-right", { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.2 }, "<")
        // Hold
        .to({}, { duration: 2 })
        // Phase 5: Exit — shrink mockup, show CTA
        .to([".cine-mockup-wrapper", ".cine-badge", ".cine-card-text-left", ".cine-card-text-right"], {
          scale: 0.9, y: -30, autoAlpha: 0, ease: "power3.in", duration: 1, stagger: 0.05,
        })
        .set(".cine-cta", { autoAlpha: 1 })
        .to(".cine-card", {
          width: mobile ? "92vw" : "85vw",
          height: mobile ? "85vh" : "80vh",
          borderRadius: mobile ? "28px" : "36px",
          ease: "expo.inOut",
          duration: 1.5,
        }, "pullback")
        .to(".cine-cta", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.5 }, "pullback")
        // Final exit
        .to(".cine-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="cinematic-section relative w-full h-screen overflow-hidden bg-background">
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      {/* Grid overlay */}
      <div className="bg-grid-theme absolute inset-0 z-0" />
      <div className="film-grain" />

      {/* Hero text (fades on scroll) */}
      <div className="cine-hero-text absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <h2 className="cine-title text-silver-matte text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-light tracking-tight mb-4">
          {t("productPreview.title")}{" "}
          <span className="font-extrabold">{t("productPreview.titleHighlight")}</span>{" "}
          {t("productPreview.titleEnd")}
        </h2>
        <p className="cine-subtitle text-muted-foreground text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-3xl font-light tracking-tight leading-relaxed">
          {t("productPreview.subtitle")}
        </p>
      </div>

      {/* Main premium card */}
      <div
        ref={mainCardRef}
        className="cine-card premium-depth-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center overflow-hidden"
        style={{ width: isMobile ? "90vw" : "75vw", height: isMobile ? "80vh" : "70vh", borderRadius: isMobile ? "28px" : "36px" }}
      >
        <div className="card-sheen" />

        {/* Side text left */}
        <div className="cine-card-text-left absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:block max-w-[200px]">
          <p className="text-card-silver-matte text-sm font-light leading-relaxed">
            Suivi intelligent de vos suppléments et de votre santé au quotidien
          </p>
        </div>

        {/* Mockup */}
        <div className="cine-mockup-wrapper relative z-20" style={{ perspective: "1200px" }}>
          <div ref={mockupRef} className="relative" style={{ transformStyle: "preserve-3d" }}>
            {/* iPhone bezel */}
            <div className="iphone-bezel relative rounded-[3rem] md:rounded-[3.5rem] overflow-hidden"
              style={{ width: isMobile ? "220px" : "300px", aspectRatio: "9/19.5", padding: isMobile ? "8px" : "12px" }}>
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 md:w-28 h-5 md:h-6 bg-black rounded-b-2xl z-30" />
              {/* Hardware buttons */}
              <div className="hardware-btn absolute -right-[3px] top-[25%] w-[3px] h-[40px] rounded-r-sm" />
              <div className="hardware-btn absolute -right-[3px] top-[38%] w-[3px] h-[40px] rounded-r-sm" />
              <div className="hardware-btn absolute -left-[3px] top-[30%] w-[3px] h-[55px] rounded-l-sm" />
              {/* Screen */}
              <div className="relative w-full h-full rounded-[2.2rem] md:rounded-[2.8rem] overflow-hidden bg-black">
                <img
                  src={dashboardSrc}
                  alt="VitaSync Dashboard"
                  className="w-full h-full object-cover object-left-top"
                />
                <div className="screen-glare absolute inset-0 z-20 pointer-events-none" />
              </div>
            </div>

            {/* Health Score Ring — floating */}
            <div className="cine-badge absolute -top-4 -right-8 md:-top-6 md:-right-14 z-40">
              <div className="floating-ui-badge rounded-2xl p-3 md:p-4 flex items-center gap-2 md:gap-3">
                <svg width="48" height="48" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                  <circle className="progress-ring" cx="45" cy="45" r="40" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" />
                </svg>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="cine-counter text-white text-xl md:text-2xl font-bold">0</span>
                    <span className="text-white/60 text-xs">%</span>
                  </div>
                  <span className="text-white/50 text-[10px] md:text-xs">Score Santé</span>
                </div>
              </div>
            </div>

            {/* Badge: Coach IA */}
            <div className="cine-badge absolute -bottom-2 -left-10 md:-bottom-4 md:-left-16 z-40">
              <div className="floating-ui-badge rounded-xl px-3 py-2 md:px-4 md:py-3 flex items-center gap-2">
                <Bot className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                <span className="text-white text-xs md:text-sm font-medium">Coach IA actif</span>
              </div>
            </div>

            {/* Badge: Stack */}
            <div className="cine-badge absolute top-1/3 -left-12 md:-left-20 z-40">
              <div className="floating-ui-badge rounded-xl px-3 py-2 md:px-4 md:py-3 flex items-center gap-2">
                <Pill className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                <span className="text-white text-xs md:text-sm font-medium">Stack optimisé</span>
              </div>
            </div>

            {/* Badge: Trend */}
            <div className="cine-badge absolute bottom-1/4 -right-10 md:-right-16 z-40">
              <div className="floating-ui-badge rounded-xl px-3 py-2 md:px-4 md:py-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                <span className="text-white text-xs md:text-sm font-medium">+12% énergie</span>
              </div>
            </div>
          </div>
        </div>

        {/* Side text right */}
        <div className="cine-card-text-right absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 hidden lg:block max-w-[200px] text-right">
          <p className="text-card-silver-matte text-sm font-light leading-relaxed">
            Analyses sanguines, recommandations IA, et coaching personnalisé
          </p>
        </div>

        {/* CTA overlay */}
        <div className="cine-cta absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-6">
          <h3 className="text-card-silver-matte text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            Prêt à optimiser votre santé ?
          </h3>
          <p className="text-white/50 text-sm md:text-base max-w-md mb-8">
            Rejoignez VitaSync et accédez à votre dashboard de santé personnalisé
          </p>
          <button
            onClick={() => (window.location.href = "/auth")}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium text-sm md:text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            {t("productPreview.cta")}
          </button>
        </div>
      </div>
    </section>
  );
};
