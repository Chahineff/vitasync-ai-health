import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const translate = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const headerTranslate = useTransform(scrollYProgress, [0, 1], [0, -10]);

  return (
    <div
      className="h-[40rem] md:h-[55rem] lg:h-[60rem] flex items-center justify-center relative p-2 md:p-8"
      ref={containerRef}
    >
      <div className="py-10 md:py-20 w-full relative">
        <Header translate={headerTranslate} titleComponent={titleComponent} />
        <Card translate={translate}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: React.ReactNode }) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  children,
}: {
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative max-w-5xl mt-12 md:mt-16 mx-auto">
      <div className="h-[30rem] md:h-[40rem] w-full p-2 md:p-6 bg-card rounded-[28px] shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-border/30">
        <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl md:p-4">
          {children}
        </div>
      </div>
    </div>
  );
};
