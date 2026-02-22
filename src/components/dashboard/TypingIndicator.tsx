import { Sparkle } from '@phosphor-icons/react';

const vitasyncLogoUrl = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";

export const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-2 flex-shrink-0 border border-border">
        <img src={vitasyncLogoUrl} alt="VitaSync" className="w-full h-full object-contain" />
      </div>

      {/* Typing dots */}
      <div className="flex-1 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <Sparkle weight="fill" className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground/50">VitaSync AI</span>
        </div>

        <div className="flex items-center gap-1.5 h-8">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: `typing-bounce 800ms ease-in-out ${i * 150}ms infinite`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes typing-bounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};
