const NAV_ANCHOR_OFFSET_PX = 72;
const SCROLL_RESTORE_DELAY_MS = 180;

export function getAnchorId(anchor: string) {
  return anchor.replace(/^#/, "");
}

export function scrollToHomeAnchor(anchor: string) {
  if (typeof window === "undefined") return false;

  const id = getAnchorId(anchor);
  const element = document.getElementById(id);
  if (!element) return false;

  const html = document.documentElement;
  const body = document.body;
  const previousHtmlScrollBehavior = html.style.scrollBehavior;
  const previousBodyScrollBehavior = body.style.scrollBehavior;

  html.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";

  const jumpToTarget = () => {
    const rect = element.getBoundingClientRect();
    const targetY = Math.max(0, window.scrollY + rect.top - NAV_ANCHOR_OFFSET_PX);
    window.scrollTo(0, targetY);
  };

  jumpToTarget();
  requestAnimationFrame(jumpToTarget);
  window.setTimeout(jumpToTarget, 80);
  window.setTimeout(() => {
    html.style.scrollBehavior = previousHtmlScrollBehavior;
    body.style.scrollBehavior = previousBodyScrollBehavior;
  }, SCROLL_RESTORE_DELAY_MS);

  return true;
}