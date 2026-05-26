import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "test" || entry === "__tests__") continue;
      out.push(...walk(p));
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.test\.(t|j)sx?$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

function extractRoutes(appSrc: string): Set<string> {
  const routes = new Set<string>();
  const re = /<Route\s+path=["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(appSrc)) !== null) routes.add(m[1]);
  return routes;
}

function extractLinks(): { file: string; to: string }[] {
  const links: { file: string; to: string }[] = [];
  for (const file of walk(SRC)) {
    const content = readFileSync(file, "utf8");
    // <Link to="/path"> or <Link to={"/path"}> — only literal strings starting with "/"
    const re = /<Link\b[^>]*\bto=(?:\{?\s*["']([^"'`{}]+)["']\s*\}?)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const to = m[1];
      if (to.startsWith("/")) links.push({ file, to });
    }
  }
  return links;
}

function matchesRoute(to: string, routes: Set<string>): boolean {
  const path = to.split("?")[0].split("#")[0];
  for (const route of routes) {
    if (route === "*") continue;
    // Convert /foo/:bar to regex
    const pattern = "^" + route.replace(/:[^/]+/g, "[^/]+") + "$";
    if (new RegExp(pattern).test(path)) return true;
  }
  return false;
}

describe("router link integrity", () => {
  const appSrc = readFileSync(join(SRC, "App.tsx"), "utf8");
  const routes = extractRoutes(appSrc);

  it("registers all required legal routes", () => {
    for (const r of ["/privacy", "/privacy-policy", "/terms", "/terms-of-service", "/disclaimer", "/cookies"]) {
      expect(routes.has(r), `Missing route: ${r}`).toBe(true);
    }
  });

  it("has no <Link to=...> pointing to an unregistered path", () => {
    const links = extractLinks();
    const broken = links.filter((l) => !matchesRoute(l.to, routes));
    if (broken.length > 0) {
      const msg = broken.map((b) => `  ${b.to}  (in ${b.file.replace(process.cwd() + "/", "")})`).join("\n");
      throw new Error(`Found <Link> targets not registered in router:\n${msg}`);
    }
    expect(broken.length).toBe(0);
  });
});