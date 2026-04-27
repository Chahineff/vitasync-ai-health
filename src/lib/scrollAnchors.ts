type ScrollAnchorOptions = {
  behavior?: "auto" | "smooth";
  offset?: number;
  onComplete?: () => void;
  onCancel?: () => void;
};

const DEFAULT_NAV_OFFSET = 72;
let activeFrame: number | null = null;
let activeCleanup: (() => void) | null = null;
let releaseTimer: number | null = null;

const setStickyBypass = (enabled: boolean) => {
  if (releaseTimer) {
    window.clearTimeout(releaseTimer);
    releaseTimer = null;
  }

  document.documentElement.classList.toggle("anchor-scrolling", enabled);
};

const releaseStickyBypassSoon = () => {
  if (releaseTimer) window.clearTimeout(releaseTimer);
  releaseTimer = window.setTimeout(() => setStickyBypass(false), 180);
};

const cancelActiveScroll = () => {
  if (activeFrame) {
    window.cancelAnimationFrame(activeFrame);
    activeFrame = null;
  }

  activeCleanup?.();
  activeCleanup = null;
};

export const cancelAnchorScroll = () => {
  cancelActiveScroll();
  releaseStickyBypassSoon();
};

const pageTopOf = (element: HTMLElement) => window.scrollY + element.getBoundingClientRect().top;

const crossesFeaturePin = (startY: number, targetY: number) => {
  const features = document.getElementById("features");
  if (!features) return false;

  const featureStart = pageTopOf(features);
  const featureEnd = featureStart + features.offsetHeight;
  const minY = Math.min(startY, targetY);
  const maxY = Math.max(startY, targetY);

  return maxY > featureStart && minY < featureEnd;
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

export const scrollToY = (targetY: number, options: ScrollAnchorOptions = {}) => {
  cancelActiveScroll();

  const { behavior = "smooth", onComplete, onCancel } = options;
  const startY = window.scrollY;
  const finalY = Math.max(0, targetY);
  const distance = finalY - startY;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const shouldAnimate = behavior === "smooth" && !prefersReducedMotion && Math.abs(distance) > 8;

  if (!shouldAnimate) {
    window.scrollTo(0, finalY);
    onComplete?.();
    return;
  }

  const duration = Math.min(420, Math.max(180, Math.abs(distance) * 0.055));
  const startTime = performance.now();
  let settled = false;

  const cleanupListeners = () => {
    window.removeEventListener("wheel", abort);
    window.removeEventListener("touchstart", abort);
    window.removeEventListener("keydown", abort);
  };

  const finish = () => {
    settled = true;
    activeFrame = null;
    activeCleanup = null;
    cleanupListeners();
    window.scrollTo(0, finalY);
    onComplete?.();
  };

  const abort = () => {
    if (settled) return;
    settled = true;
    if (activeFrame) window.cancelAnimationFrame(activeFrame);
    activeFrame = null;
    activeCleanup = null;
    cleanupListeners();
    onCancel?.();
  };

  activeCleanup = abort;
  window.addEventListener("wheel", abort, { passive: true });
  window.addEventListener("touchstart", abort, { passive: true });
  window.addEventListener("keydown", abort);

  const animate = (now: number) => {
    if (settled) return;

    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo(0, startY + distance * easeOutCubic(progress));

    if (progress < 1) {
      activeFrame = window.requestAnimationFrame(animate);
    } else {
      finish();
    }
  };

  activeFrame = window.requestAnimationFrame(animate);
};

export const scrollToHomeAnchor = (anchor: string, options: ScrollAnchorOptions = {}) => {
  const id = anchor.replace(/^#/, "");
  const target = document.getElementById(id);
  if (!target) return false;

  const offset = options.offset ?? DEFAULT_NAV_OFFSET;
  const targetY = pageTopOf(target) - offset;
  const shouldBypassSticky = crossesFeaturePin(window.scrollY, targetY);

  setStickyBypass(shouldBypassSticky);

  scrollToY(targetY, {
    ...options,
    onComplete: () => {
      releaseStickyBypassSoon();
      options.onComplete?.();
    },
    onCancel: () => {
      releaseStickyBypassSoon();
      options.onCancel?.();
    },
  });

  return true;
};

export const scrollToPageTop = (options: ScrollAnchorOptions = {}) => {
  setStickyBypass(true);
  scrollToY(0, {
    ...options,
    onComplete: () => {
      releaseStickyBypassSoon();
      options.onComplete?.();
    },
    onCancel: () => {
      releaseStickyBypassSoon();
      options.onCancel?.();
    },
  });
};