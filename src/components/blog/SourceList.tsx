import type { SourceItem } from "@/data/blog/posts";

export function SourceList({ sources }: { sources: SourceItem[] }) {
  return (
    <ol className="not-prose mt-4 space-y-3 text-sm text-foreground/70">
      {sources.map((s, i) => (
        <li key={i} className="pl-8 -indent-8 leading-relaxed">
          <span className="text-foreground/40 font-mono">{String(i + 1).padStart(2, "0")}. </span>
          <span className="text-foreground">{s.authors}</span>{" "}
          <em className="italic">{s.title}</em>. {s.publication}
          {s.url && (
            <>
              {" "}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {s.url.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}