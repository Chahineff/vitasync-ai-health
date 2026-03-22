import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";
import { ShineBorder } from "@/components/ui/shine-border";

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
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [0.9, 1];
  };

  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const headerTranslate = useTransform(scrollYProgress, [0, 1], [0, -10]);

  return (
    <div
      className="h-[55rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-8"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-20 w-full relative"
      >
        <Header translate={headerTranslate} titleComponent={titleComponent} />
        <Card translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>; titleComponent: React.ReactNode }) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  scale,
  children,
}: {
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <div className="relative max-w-5xl mt-12 md:mt-16 mx-auto p-[2px] rounded-[30px] overflow-hidden">
      {/* Static gradient border */}
      <div
        className="absolute inset-0 rounded-[30px]"
        style={{
          background: "linear-gradient(135deg, rgba(0,240,255,0.5), rgba(59,130,246,0.5), rgba(0,240,255,0.5))",
        }}
      />
      <motion.div
        style={{ scale }}
        className="relative h-[30rem] md:h-[40rem] w-full p-2 md:p-6 bg-card rounded-[28px] shadow-xl dark:shadow-2xl dark:shadow-black/40"
      >
        <div className="h-full w-full overflow-hidden rounded-2xl bg-background md:rounded-2xl md:p-4">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
