import { STAT_COLOR, type StatItem } from "@/data/blog/posts";

export function StatRow({ items }: { items: [StatItem, StatItem, StatItem] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 not-prose">
      {items.map((s, i) => (
        <div
          key={i}
          className={`rounded-2xl border-l-4 bg-card/40 dark:bg-white/[0.02] backdrop-blur px-5 py-4 ${STAT_COLOR[s.color || "primary"].split(" ")[0]}`}
        >
          <div className={`text-3xl md:text-4xl font-semibold tracking-tight ${STAT_COLOR[s.color || "primary"].split(" ")[1]}`}>
            {s.value}
          </div>
          <div className="text-sm text-foreground/60 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}