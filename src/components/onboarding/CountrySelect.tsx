import { useState, useMemo } from "react";
import { Check, MagnifyingGlass } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  currency: string;
}

const countries: Country[] = [
  // ── North America ──
  { code: "US", name: "États-Unis", flag: "🇺🇸", region: "NA", currency: "USD" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "NA", currency: "CAD" },
  { code: "MX", name: "Mexique", flag: "🇲🇽", region: "NA", currency: "MXN" },

  // ── Europe ──
  { code: "FR", name: "France", flag: "🇫🇷", region: "EU", currency: "EUR" },
  { code: "DE", name: "Allemagne", flag: "🇩🇪", region: "EU", currency: "EUR" },
  { code: "GB", name: "Royaume-Uni", flag: "🇬🇧", region: "EU", currency: "GBP" },
  { code: "ES", name: "Espagne", flag: "🇪🇸", region: "EU", currency: "EUR" },
  { code: "IT", name: "Italie", flag: "🇮🇹", region: "EU", currency: "EUR" },
  { code: "BE", name: "Belgique", flag: "🇧🇪", region: "EU", currency: "EUR" },
  { code: "NL", name: "Pays-Bas", flag: "🇳🇱", region: "EU", currency: "EUR" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "EU", currency: "EUR" },
  { code: "CH", name: "Suisse", flag: "🇨🇭", region: "EU", currency: "CHF" },
  { code: "AT", name: "Autriche", flag: "🇦🇹", region: "EU", currency: "EUR" },
  { code: "SE", name: "Suède", flag: "🇸🇪", region: "EU", currency: "SEK" },
  { code: "NO", name: "Norvège", flag: "🇳🇴", region: "EU", currency: "NOK" },
  { code: "DK", name: "Danemark", flag: "🇩🇰", region: "EU", currency: "DKK" },
  { code: "FI", name: "Finlande", flag: "🇫🇮", region: "EU", currency: "EUR" },
  { code: "IE", name: "Irlande", flag: "🇮🇪", region: "EU", currency: "EUR" },
  { code: "PL", name: "Pologne", flag: "🇵🇱", region: "EU", currency: "PLN" },
  { code: "CZ", name: "Tchéquie", flag: "🇨🇿", region: "EU", currency: "CZK" },
  { code: "RO", name: "Roumanie", flag: "🇷🇴", region: "EU", currency: "RON" },
  { code: "HU", name: "Hongrie", flag: "🇭🇺", region: "EU", currency: "HUF" },
  { code: "GR", name: "Grèce", flag: "🇬🇷", region: "EU", currency: "EUR" },
  { code: "HR", name: "Croatie", flag: "🇭🇷", region: "EU", currency: "EUR" },
  { code: "BG", name: "Bulgarie", flag: "🇧🇬", region: "EU", currency: "BGN" },
  { code: "SK", name: "Slovaquie", flag: "🇸🇰", region: "EU", currency: "EUR" },
  { code: "SI", name: "Slovénie", flag: "🇸🇮", region: "EU", currency: "EUR" },
  { code: "LT", name: "Lituanie", flag: "🇱🇹", region: "EU", currency: "EUR" },
  { code: "LV", name: "Lettonie", flag: "🇱🇻", region: "EU", currency: "EUR" },
  { code: "EE", name: "Estonie", flag: "🇪🇪", region: "EU", currency: "EUR" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺", region: "EU", currency: "EUR" },
  { code: "MT", name: "Malte", flag: "🇲🇹", region: "EU", currency: "EUR" },
  { code: "CY", name: "Chypre", flag: "🇨🇾", region: "EU", currency: "EUR" },
  { code: "IS", name: "Islande", flag: "🇮🇸", region: "EU", currency: "ISK" },
  { code: "AL", name: "Albanie", flag: "🇦🇱", region: "EU", currency: "ALL" },
  { code: "RS", name: "Serbie", flag: "🇷🇸", region: "EU", currency: "RSD" },
  { code: "BA", name: "Bosnie-Herzégovine", flag: "🇧🇦", region: "EU", currency: "BAM" },
  { code: "ME", name: "Monténégro", flag: "🇲🇪", region: "EU", currency: "EUR" },
  { code: "MK", name: "Macédoine du Nord", flag: "🇲🇰", region: "EU", currency: "MKD" },
  { code: "MD", name: "Moldavie", flag: "🇲🇩", region: "EU", currency: "MDL" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", region: "EU", currency: "UAH" },
  { code: "BY", name: "Biélorussie", flag: "🇧🇾", region: "EU", currency: "BYN" },
  { code: "GE", name: "Géorgie", flag: "🇬🇪", region: "EU", currency: "GEL" },
  { code: "AM", name: "Arménie", flag: "🇦🇲", region: "EU", currency: "AMD" },
  { code: "AZ", name: "Azerbaïdjan", flag: "🇦🇿", region: "EU", currency: "AZN" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", region: "EU", currency: "KZT" },
  { code: "RU", name: "Russie", flag: "🇷🇺", region: "EU", currency: "RUB" },
  { code: "TR", name: "Turquie", flag: "🇹🇷", region: "EU", currency: "TRY" },

  // ── Asia ──
  { code: "JP", name: "Japon", flag: "🇯🇵", region: "AS", currency: "JPY" },
  { code: "KR", name: "Corée du Sud", flag: "🇰🇷", region: "AS", currency: "KRW" },
  { code: "CN", name: "Chine", flag: "🇨🇳", region: "AS", currency: "CNY" },
  { code: "IN", name: "Inde", flag: "🇮🇳", region: "AS", currency: "INR" },
  { code: "TH", name: "Thaïlande", flag: "🇹🇭", region: "AS", currency: "THB" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", region: "AS", currency: "VND" },
  { code: "MY", name: "Malaisie", flag: "🇲🇾", region: "AS", currency: "MYR" },
  { code: "SG", name: "Singapour", flag: "🇸🇬", region: "AS", currency: "SGD" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", region: "AS", currency: "PHP" },
  { code: "ID", name: "Indonésie", flag: "🇮🇩", region: "AS", currency: "IDR" },
  { code: "TW", name: "Taïwan", flag: "🇹🇼", region: "AS", currency: "TWD" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", region: "AS", currency: "HKD" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", region: "AS", currency: "BDT" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", region: "AS", currency: "PKR" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", region: "AS", currency: "LKR" },
  { code: "NP", name: "Népal", flag: "🇳🇵", region: "AS", currency: "NPR" },
  { code: "MM", name: "Myanmar", flag: "🇲🇲", region: "AS", currency: "MMK" },
  { code: "KH", name: "Cambodge", flag: "🇰🇭", region: "AS", currency: "KHR" },
  { code: "LA", name: "Laos", flag: "🇱🇦", region: "AS", currency: "LAK" },
  { code: "MN", name: "Mongolie", flag: "🇲🇳", region: "AS", currency: "MNT" },
  { code: "UZ", name: "Ouzbékistan", flag: "🇺🇿", region: "AS", currency: "UZS" },
  { code: "KG", name: "Kirghizistan", flag: "🇰🇬", region: "AS", currency: "KGS" },
  { code: "TJ", name: "Tadjikistan", flag: "🇹🇯", region: "AS", currency: "TJS" },
  { code: "TM", name: "Turkménistan", flag: "🇹🇲", region: "AS", currency: "TMT" },
  { code: "AF", name: "Afghanistan", flag: "🇦🇫", region: "AS", currency: "AFN" },
  { code: "BN", name: "Brunei", flag: "🇧🇳", region: "AS", currency: "BND" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", region: "AS", currency: "MVR" },
  { code: "BT", name: "Bhoutan", flag: "🇧🇹", region: "AS", currency: "BTN" },
  { code: "KP", name: "Corée du Nord", flag: "🇰🇵", region: "AS", currency: "KPW" },

  // ── Middle East ──
  { code: "AE", name: "Émirats arabes unis", flag: "🇦🇪", region: "ME", currency: "AED" },
  { code: "SA", name: "Arabie saoudite", flag: "🇸🇦", region: "ME", currency: "SAR" },
  { code: "IL", name: "Israël", flag: "🇮🇱", region: "ME", currency: "ILS" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", region: "ME", currency: "QAR" },
  { code: "KW", name: "Koweït", flag: "🇰🇼", region: "ME", currency: "KWD" },
  { code: "BH", name: "Bahreïn", flag: "🇧🇭", region: "ME", currency: "BHD" },
  { code: "OM", name: "Oman", flag: "🇴🇲", region: "ME", currency: "OMR" },
  { code: "JO", name: "Jordanie", flag: "🇯🇴", region: "ME", currency: "JOD" },
  { code: "LB", name: "Liban", flag: "🇱🇧", region: "ME", currency: "LBP" },
  { code: "IQ", name: "Irak", flag: "🇮🇶", region: "ME", currency: "IQD" },
  { code: "IR", name: "Iran", flag: "🇮🇷", region: "ME", currency: "IRR" },
  { code: "SY", name: "Syrie", flag: "🇸🇾", region: "ME", currency: "SYP" },
  { code: "YE", name: "Yémen", flag: "🇾🇪", region: "ME", currency: "YER" },
  { code: "PS", name: "Palestine", flag: "🇵🇸", region: "ME", currency: "ILS" },

  // ── South America ──
  { code: "BR", name: "Brésil", flag: "🇧🇷", region: "SA", currency: "BRL" },
  { code: "AR", name: "Argentine", flag: "🇦🇷", region: "SA", currency: "ARS" },
  { code: "CO", name: "Colombie", flag: "🇨🇴", region: "SA", currency: "COP" },
  { code: "CL", name: "Chili", flag: "🇨🇱", region: "SA", currency: "CLP" },
  { code: "PE", name: "Pérou", flag: "🇵🇪", region: "SA", currency: "PEN" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", region: "SA", currency: "VES" },
  { code: "EC", name: "Équateur", flag: "🇪🇨", region: "SA", currency: "USD" },
  { code: "BO", name: "Bolivie", flag: "🇧🇴", region: "SA", currency: "BOB" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", region: "SA", currency: "PYG" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", region: "SA", currency: "UYU" },
  { code: "GY", name: "Guyana", flag: "🇬🇾", region: "SA", currency: "GYD" },
  { code: "SR", name: "Suriname", flag: "🇸🇷", region: "SA", currency: "SRD" },
  { code: "GF", name: "Guyane française", flag: "🇬🇫", region: "SA", currency: "EUR" },

  // ── Central America & Caribbean ──
  { code: "GT", name: "Guatemala", flag: "🇬🇹", region: "CA", currency: "GTQ" },
  { code: "CU", name: "Cuba", flag: "🇨🇺", region: "CA", currency: "CUP" },
  { code: "HT", name: "Haïti", flag: "🇭🇹", region: "CA", currency: "HTG" },
  { code: "DO", name: "République dominicaine", flag: "🇩🇴", region: "CA", currency: "DOP" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", region: "CA", currency: "HNL" },
  { code: "SV", name: "Salvador", flag: "🇸🇻", region: "CA", currency: "USD" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮", region: "CA", currency: "NIO" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", region: "CA", currency: "CRC" },
  { code: "PA", name: "Panama", flag: "🇵🇦", region: "CA", currency: "PAB" },
  { code: "JM", name: "Jamaïque", flag: "🇯🇲", region: "CA", currency: "JMD" },
  { code: "TT", name: "Trinité-et-Tobago", flag: "🇹🇹", region: "CA", currency: "TTD" },
  { code: "BB", name: "Barbade", flag: "🇧🇧", region: "CA", currency: "BBD" },
  { code: "BZ", name: "Belize", flag: "🇧🇿", region: "CA", currency: "BZD" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸", region: "CA", currency: "BSD" },

  // ── Africa ──
  { code: "ZA", name: "Afrique du Sud", flag: "🇿🇦", region: "AF", currency: "ZAR" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "AF", currency: "NGN" },
  { code: "EG", name: "Égypte", flag: "🇪🇬", region: "AF", currency: "EGP" },
  { code: "MA", name: "Maroc", flag: "🇲🇦", region: "AF", currency: "MAD" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿", region: "AF", currency: "DZD" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳", region: "AF", currency: "TND" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", region: "AF", currency: "KES" },
  { code: "ET", name: "Éthiopie", flag: "🇪🇹", region: "AF", currency: "ETB" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", region: "AF", currency: "GHS" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", region: "AF", currency: "XOF" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳", region: "AF", currency: "XOF" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲", region: "AF", currency: "XAF" },
  { code: "TZ", name: "Tanzanie", flag: "🇹🇿", region: "AF", currency: "TZS" },
  { code: "UG", name: "Ouganda", flag: "🇺🇬", region: "AF", currency: "UGX" },
  { code: "AO", name: "Angola", flag: "🇦🇴", region: "AF", currency: "AOA" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", region: "AF", currency: "MZN" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬", region: "AF", currency: "MGA" },
  { code: "CD", name: "RD Congo", flag: "🇨🇩", region: "AF", currency: "CDF" },
  { code: "CG", name: "Congo", flag: "🇨🇬", region: "AF", currency: "XAF" },
  { code: "GA", name: "Gabon", flag: "🇬🇦", region: "AF", currency: "XAF" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫", region: "AF", currency: "XOF" },
  { code: "ML", name: "Mali", flag: "🇲🇱", region: "AF", currency: "XOF" },
  { code: "NE", name: "Niger", flag: "🇳🇪", region: "AF", currency: "XOF" },
  { code: "TD", name: "Tchad", flag: "🇹🇩", region: "AF", currency: "XAF" },
  { code: "SD", name: "Soudan", flag: "🇸🇩", region: "AF", currency: "SDG" },
  { code: "LY", name: "Libye", flag: "🇱🇾", region: "AF", currency: "LYD" },
  { code: "MR", name: "Mauritanie", flag: "🇲🇷", region: "AF", currency: "MRU" },
  { code: "ZW", name: "Zimbabwe", flag: "🇿🇼", region: "AF", currency: "ZWL" },
  { code: "ZM", name: "Zambie", flag: "🇿🇲", region: "AF", currency: "ZMW" },
  { code: "BW", name: "Botswana", flag: "🇧🇼", region: "AF", currency: "BWP" },
  { code: "NA", name: "Namibie", flag: "🇳🇦", region: "AF", currency: "NAD" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", region: "AF", currency: "RWF" },
  { code: "BI", name: "Burundi", flag: "🇧🇮", region: "AF", currency: "BIF" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯", region: "AF", currency: "XOF" },
  { code: "TG", name: "Togo", flag: "🇹🇬", region: "AF", currency: "XOF" },
  { code: "SL", name: "Sierra Leone", flag: "🇸🇱", region: "AF", currency: "SLE" },
  { code: "LR", name: "Liberia", flag: "🇱🇷", region: "AF", currency: "LRD" },
  { code: "GN", name: "Guinée", flag: "🇬🇳", region: "AF", currency: "GNF" },
  { code: "GW", name: "Guinée-Bissau", flag: "🇬🇼", region: "AF", currency: "XOF" },
  { code: "GM", name: "Gambie", flag: "🇬🇲", region: "AF", currency: "GMD" },
  { code: "CV", name: "Cap-Vert", flag: "🇨🇻", region: "AF", currency: "CVE" },
  { code: "MU", name: "Maurice", flag: "🇲🇺", region: "AF", currency: "MUR" },
  { code: "SC", name: "Seychelles", flag: "🇸🇨", region: "AF", currency: "SCR" },
  { code: "DJ", name: "Djibouti", flag: "🇩🇯", region: "AF", currency: "DJF" },
  { code: "ER", name: "Érythrée", flag: "🇪🇷", region: "AF", currency: "ERN" },
  { code: "SO", name: "Somalie", flag: "🇸🇴", region: "AF", currency: "SOS" },
  { code: "KM", name: "Comores", flag: "🇰🇲", region: "AF", currency: "KMF" },
  { code: "ST", name: "São Tomé-et-Príncipe", flag: "🇸🇹", region: "AF", currency: "STN" },
  { code: "GQ", name: "Guinée équatoriale", flag: "🇬🇶", region: "AF", currency: "XAF" },
  { code: "CF", name: "Centrafrique", flag: "🇨🇫", region: "AF", currency: "XAF" },
  { code: "SS", name: "Soudan du Sud", flag: "🇸🇸", region: "AF", currency: "SSP" },
  { code: "MW", name: "Malawi", flag: "🇲🇼", region: "AF", currency: "MWK" },
  { code: "LS", name: "Lesotho", flag: "🇱🇸", region: "AF", currency: "LSL" },
  { code: "SZ", name: "Eswatini", flag: "🇸🇿", region: "AF", currency: "SZL" },

  // ── Oceania ──
  { code: "AU", name: "Australie", flag: "🇦🇺", region: "OC", currency: "AUD" },
  { code: "NZ", name: "Nouvelle-Zélande", flag: "🇳🇿", region: "OC", currency: "NZD" },
  { code: "PG", name: "Papouasie-Nouvelle-Guinée", flag: "🇵🇬", region: "OC", currency: "PGK" },
  { code: "FJ", name: "Fidji", flag: "🇫🇯", region: "OC", currency: "FJD" },
  { code: "WS", name: "Samoa", flag: "🇼🇸", region: "OC", currency: "WST" },
  { code: "TO", name: "Tonga", flag: "🇹🇴", region: "OC", currency: "TOP" },
  { code: "VU", name: "Vanuatu", flag: "🇻🇺", region: "OC", currency: "VUV" },
  { code: "SB", name: "Îles Salomon", flag: "🇸🇧", region: "OC", currency: "SBD" },
  { code: "KI", name: "Kiribati", flag: "🇰🇮", region: "OC", currency: "AUD" },
  { code: "MH", name: "Îles Marshall", flag: "🇲🇭", region: "OC", currency: "USD" },
  { code: "PW", name: "Palaos", flag: "🇵🇼", region: "OC", currency: "USD" },
  { code: "FM", name: "Micronésie", flag: "🇫🇲", region: "OC", currency: "USD" },
  { code: "NR", name: "Nauru", flag: "🇳🇷", region: "OC", currency: "AUD" },
  { code: "TV", name: "Tuvalu", flag: "🇹🇻", region: "OC", currency: "AUD" },
  { code: "NC", name: "Nouvelle-Calédonie", flag: "🇳🇨", region: "OC", currency: "XPF" },
  { code: "PF", name: "Polynésie française", flag: "🇵🇫", region: "OC", currency: "XPF" },
];

const regionOrder = ["NA", "EU", "AS", "ME", "SA", "CA", "AF", "OC"];

const regionLabels: Record<string, string> = {
  NA: "🌎 Amérique du Nord",
  EU: "🇪🇺 Europe",
  AS: "🌏 Asie",
  ME: "🕌 Moyen-Orient",
  SA: "🌎 Amérique du Sud",
  CA: "🌴 Amérique centrale & Caraïbes",
  AF: "🌍 Afrique",
  OC: "🌊 Océanie",
};

interface CountrySelectProps {
  value: string | null;
  onChange: (code: string, country: Country) => void;
}

export function CountrySelect({ value, onChange }: CountrySelectProps) {
  const [search, setSearch] = useState("");

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const groupedCountries = useMemo(() => {
    const groups: Record<string, Country[]> = {};
    regionOrder.forEach((r) => (groups[r] = []));
    filteredCountries.forEach((c) => {
      if (groups[c.region]) groups[c.region].push(c);
    });
    return groups;
  }, [filteredCountries]);

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
        {regionOrder.map((region) => {
          const regionCountries = groupedCountries[region];
          if (!regionCountries || regionCountries.length === 0) return null;
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
                      "flex items-center gap-2 p-3 rounded-xl border text-left transition-all",
                      value === country.code
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                        : "border-border bg-card/50 hover:border-primary/50 hover:bg-card"
                    )}
                  >
                    <span className="text-lg flex-shrink-0">{country.flag}</span>
                    <span className="text-sm font-medium truncate flex-1">
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
