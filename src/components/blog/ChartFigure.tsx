import { useId } from "react";
import type { ChartBlock } from "@/data/blog/posts";

export function ChartFigure({ block }: { block: ChartBlock }) {
  const id = useId();
  const tableId = `${id}-table`;
  const captionId = `${id}-caption`;
  return (
    <figure className="not-prose my-10">
      <div className="rounded-2xl overflow-hidden border border-border/40 bg-card/30 dark:bg-white/[0.015]">
        <img
          src={block.src}
          alt={block.alt}
          loading="lazy"
          decoding="async"
          width="1329"
          height="700"
          className="w-full h-auto"
          aria-describedby={`${captionId} ${tableId}`}
        />
      </div>
      <figcaption id={captionId} className="mt-3 text-xs italic text-foreground/50 text-center px-4">
        {block.caption}
      </figcaption>
      {/* Hidden a11y data table */}
      <table id={tableId} className="sr-only">
        <caption>{block.alt}</caption>
        <thead>
          <tr>
            {block.a11yHeaders.map((h, i) => (
              <th key={i} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.a11yRows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}