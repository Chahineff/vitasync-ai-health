import { Info, WarningCircle, Lightbulb } from "@phosphor-icons/react";

interface Props {
  variant: "retenir" | "nuance" | "precaution";
  title: string;
  body: string;
}

const STYLES = {
  retenir: { border: "border-primary", text: "text-primary", Icon: Lightbulb },
  nuance: { border: "border-amber-500", text: "text-amber-400", Icon: Info },
  precaution: { border: "border-rose-500", text: "text-rose-400", Icon: WarningCircle },
};

export function Callout({ variant, title, body }: Props) {
  const s = STYLES[variant];
  const Icon = s.Icon;
  return (
    <aside
      className={`not-prose my-8 rounded-2xl border-l-4 ${s.border} bg-card/40 dark:bg-white/[0.02] backdrop-blur px-5 py-4`}
      role="note"
    >
      <div className={`flex items-center gap-2 text-xs uppercase tracking-widest font-medium ${s.text} mb-2`}>
        <Icon size={16} weight="light" />
        {title}
      </div>
      <p className="text-sm md:text-base text-foreground/80 leading-relaxed">{body}</p>
    </aside>
  );
}