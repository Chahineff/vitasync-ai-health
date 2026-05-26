import { useMemo, useState } from "react";
import { Check, MagnifyingGlass, Warning } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * VitaSync ships to the United States only (Supliful — 48 contiguous states).
 * The onboarding "Where do you want to receive your supplements?" step is
 * therefore locked to the US: this component renders a US-state selector,
 * NOT a worldwide country picker.
 *
 * The exported `Country` shape and `countries` array are kept for backwards
 * compatibility with callers (e.g. OnboardingFlow's `selectedCountry`). All
 * entries now represent US states with `code = "US"` and `currency = "USD"`,
 * and the human-readable `name` carries the state name ("California", etc.).
 * `region` is always `"US"` so any existing grouping logic still works.
 */
interface Country {
  code: string;       // ISO subdivision code without the "US-" prefix, e.g. "CA"
  name: string;       // State name, e.g. "California"
  flag: string;       // Always 🇺🇸
  region: string;     // Always "US"
  currency: string;   // Always "USD"
}

const FLAG = "🇺🇸";

// 50 states + DC. We intentionally exclude US territories (PR, GU, VI, AS, MP)
// because Supliful's flat shipping is to the 48 contiguous states + Alaska/Hawaii.
const US_STATES: Array<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// Kept for backwards compatibility with importers that expected
// a `countries` array of `Country` objects. Each entry is a US state.
const countries: Country[] = US_STATES.map((s) => ({
  code: s.code,
  name: s.name,
  flag: FLAG,
  region: "US",
  currency: "USD",
}));

/**
 * Heuristic: is the visitor likely outside the US?
 * Used to surface a "ship outside the US?" escape hatch to the waitlist page.
 * This is non-blocking — the global GeoRestrictionOverlay handles hard gating.
 */
function isLikelyNonUS(): boolean {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (!tz) return false;
    return !tz.startsWith("America/") && !tz.startsWith("Pacific/Honolulu");
  } catch {
    return false;
  }
}

interface CountrySelectProps {
  /** Currently selected US state code (e.g. "CA"), or null. */
  value: string | null;
  /**
   * Called with the state code and a `Country`-shaped object whose
   * `code` is the state and `currency` is always "USD".
   */
  onChange: (code: string, country: Country) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [search, setSearch] = useState("");
  const nonUS = useMemo(isLikelyNonUS, []);

  const filtered = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="space-y-4">
      {/* Non-US escape hatch — links to the waitlist instead of blocking selection. */}
      {nonUS && (
        <Link
          to="/availability"
          className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 transition-colors"
        >
          <Warning className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" weight="duotone" />
          <div className="text-sm">
            <p className="font-medium text-foreground">
              VitaSync ships to the United States only.
            </p>
            <p className="text-muted-foreground mt-0.5">
              Outside the US? Join the waitlist — we'll email you when we expand to your region.
            </p>
          </div>
        </Link>
      )}

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search a US state…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Search a US state"
        />
      </div>

      {/* US states */}
      <div className="max-h-[400px] overflow-y-auto pr-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {FLAG} United States
        </p>
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((state) => (
            <button
              key={state.code}
              type="button"
              onClick={() => onChange(state.code, state)}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border text-left transition-all",
                value === state.code
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
              )}
            >
              <span className="text-xs font-semibold text-muted-foreground w-7 flex-shrink-0">
                {state.code}
              </span>
              <span className="text-sm font-medium truncate flex-1">{state.name}</span>
              {value === state.code && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No state found</p>
        )}
      </div>
    </div>
  );
}

export { countries, type Country };
