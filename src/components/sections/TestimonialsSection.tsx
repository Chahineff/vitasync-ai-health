import { useState, useEffect, useCallback } from "react";
import { CaretLeft, CaretRight, Star } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
const testimonials = [{
  name: "Marie L.",
  role: "Entrepreneure",
  content: "Mon sommeil profond a augmenté de 20% grâce aux recommandations de l'IA. Je me réveille enfin reposée !",
  metric: "+20% sommeil profond",
  avatar: "M"
}, {
  name: "Thomas D.",
  role: "Développeur",
  content: "L'analyse de mes biomarqueurs a révélé une carence en vitamine D que mon médecin avait manquée. Incroyable précision.",
  metric: "Carence détectée",
  avatar: "T"
}, {
  name: "Sophie B.",
  role: "Coach sportive",
  content: "En 3 mois, mon énergie quotidienne s'est transformée. VitaSync comprend vraiment les besoins des sportifs.",
  metric: "+45% énergie",
  avatar: "S"
}, {
  name: "Pierre M.",
  role: "Cadre dirigeant",
  content: "Le stress était mon ennemi. Grâce au stack personnalisé, je gère mes journées intenses avec sérénité.",
  metric: "-60% stress ressenti",
  avatar: "P"
}, {
  name: "Camille R.",
  role: "Médecin",
  content: "En tant que professionnelle de santé, je suis impressionnée par la rigueur scientifique de VitaSync.",
  metric: "Validé médicalement",
  avatar: "C"
}];
export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  }, []);
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);
  return;
}