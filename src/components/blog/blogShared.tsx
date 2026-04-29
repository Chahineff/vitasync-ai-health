import { ReactNode } from "react";

// Render a tiny subset of inline markdown safely:
// **bold**, *italic*, `code`. No HTML, no links — content is trusted (authored
// in the typed data file).
export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) out.push(<strong key={`b${key++}`} className="font-semibold text-foreground">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={`c${key++}`} className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{tok.slice(1, -1)}</code>);
    else out.push(<em key={`i${key++}`} className="italic">{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function readingTimeLabel(min: number): string {
  return `${min} min`;
}