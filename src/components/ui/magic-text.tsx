"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface MagicTextProps {
  text: string;
  className?: string;
}

interface WordProps {
  children: string;
  progress: any;
  range: number[];
}

const Word: React.FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <span className="relative mx-[0.15em] lg:mx-[0.2em] inline-block">
      <span className="opacity-20">{children}</span>
      <motion.span
        style={{ opacity }}
        className="absolute left-0 top-0 text-foreground"
      >
        {children}
      </motion.span>
    </span>
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
      className={cn("flex flex-wrap text-foreground/20", className)}
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
