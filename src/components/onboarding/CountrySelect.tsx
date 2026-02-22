import { useState, useMemo } from "react";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  region: "EU" | "US" | "OTHER";
  currency: string;
}

const countries: Country[] = [
  // Europe
  { code: "FR", name: "France", region: "EU", currency: "EUR" },
  { code: "BE", name: "Belgique", region: "EU", currency: "EUR" },
  { code: "CH", name: "Suisse", region: "EU", currency: "CHF" },
  { code: "DE", name: "Allemagne", region: "EU", currency: "EUR" },
  { code: "ES", name: "Espagne", region: "EU", currency: "EUR" },
  { code: "IT", name: "Italie", region: "EU", currency: "EUR" },
  { code: "NL", name: "Pays-Bas", region: "EU", currency: "EUR" },
  { code: "PT", name: "Portugal", region: "EU", currency: "EUR" },
  { code: "AT", name: "Autriche", region: "EU", currency: "EUR" },
  { code: "LU", name: "Luxembourg", region: "EU", currency: "EUR" },
  { code: "IE", name: "Irlande", region: "EU", currency: "EUR" },
  { code: "GB", name: "Royaume-Uni", region: "EU", currency: "GBP" },
  { code: "PL", name: "Pologne", region: "EU", currency: "PLN" },
  { code: "SE", name: "Suède", region: "EU", currency: "SEK" },
  { code: "DK", name: "Danemark", region: "EU", currency: "DKK" },
  { code: "NO", name: "Norvège", region: "EU", currency: "NOK" },
  { code: "FI", name: "Finlande", region: "EU", currency: "EUR" },
  // USA & Canada
  { code: "US", name: "États-Unis", region: "US", currency: "USD" },
  { code: "CA", name: "Canada", region: "US", currency: "CAD" },
  // Other
  { code: "AU", name: "Australie", region: "OTHER", currency: "AUD" },
  { code: "JP", name: "Japon", region: "OTHER", currency: "JPY" },
  { code: "BR", name: "Brésil", region: "OTHER", currency: "BRL" },
  { code: "MX", name: "Mexique", region: "OTHER", currency: "MXN" },
];

interface CountrySelectProps {
  value: string | null;
  onChange: (code: string, country: Country) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    return countries.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const groupedCountries = useMemo(() => {
    const groups: Record<string, Country[]> = {
      EU: [],
      US: [],
      OTHER: [],
    };
    filteredCountries.forEach((c) => {
      groups[c.region].push(c);
    });
    return groups;
  }, [filteredCountries]);

  const regionLabels: Record<string, string> = {
    EU: "🇪🇺 Europe",
    US: "🇺🇸 Amérique du Nord",
    OTHER: "🌍 Autres",
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher un pays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Countries list */}
      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-1">
        {Object.entries(groupedCountries).map(([region, regionCountries]) => {
          if (regionCountries.length === 0) return null;
          return (
            <div key={region}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {regionLabels[region]}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {regionCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => onChange(country.code, country)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border text-left transition-all",
                      value === country.code
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                    )}
                  >
                    <span className="text-sm font-medium truncate">
                      {country.name}
                    </span>
                    {value === country.code && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {filteredCountries.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aucun pays trouvé
          </p>
        )}
      </div>
    </div>
  );
}

export { countries, type Country };
