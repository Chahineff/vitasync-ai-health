"use client";

import * as React from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagicTextProps {
  text: string;
  className?: string;
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: number[];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0.15, 1]);

  return (
    <motion.span
      className="relative mx-[0.15em] lg:mx-[0.2em] inline-block"
      style={{ opacity }}
    >
      {children}
    </motion.span>
  );
};

export const MagicText: React.FC<MagicTextProps> = ({ text, className }) => {
  const container = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <p
      ref={container}
      className={cn(
        "flex flex-wrap bg-gradient-to-r from-[hsl(217,100%,50%)] via-[hsl(190,100%,45%)] to-[hsl(163,100%,42%)] bg-clip-text text-transparent",
        className
      )}
    >
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
};
