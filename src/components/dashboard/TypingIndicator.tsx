import { motion } from 'framer-motion';

export const TypingIndicator = () => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -6 }
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
};
