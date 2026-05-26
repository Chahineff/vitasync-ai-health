import { useEffect, useState } from "react";

export function GeoRestrictionOverlay() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("us_confirmed") === "true") return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (!tz.startsWith("America/")) {
        setBlocked(true);
      }
    } catch {
      setBlocked(true);
    }
  }, []);

  if (!blocked) return null;

  const confirmUS = () => {
    localStorage.setItem("us_confirmed", "true");
    setBlocked(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-md p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          VitaSync is not available in your region
        </h1>
        <p className="text-muted-foreground mb-6">
          VitaSync currently ships supplements to the United States only. Our services are not yet available in your region.
        </p>
        <a
          href="/availability"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-6 py-2.5 font-medium hover:opacity-90 transition"
        >
          Learn more & join waitlist
        </a>
        <div className="mt-6">
          <button
            onClick={confirmUS}
            className="text-xs text-muted-foreground underline hover:text-foreground transition"
          >
            I am a US resident
          </button>
        </div>
      </div>
    </div>
  );
}