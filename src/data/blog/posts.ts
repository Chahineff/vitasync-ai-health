// Native blog content extracted from the four founding VitaSync magazine PDFs.
// PDFs available under /blog/<slug>.pdf — chart images under /blog/<slug>/chart-N.png.

export type AccentColor = "primary" | "accent" | "emerald" | "orange";
export type BlogCategory = "Vitamines" | "Minéraux" | "Lipides" | "Cognition & Sport";

export interface StatItem {
  value: string;
  label: string;
  color?: "primary" | "accent" | "emerald" | "orange" | "amber" | "rose";
}

export interface CalloutBlock {
  kind: "callout";
  variant: "retenir" | "nuance" | "precaution";
  title: string;
  body: string;
}
export interface ParagraphBlock {
  kind: "p";
  // Allows simple inline markdown: **bold**, *italic*, `code`
  text: string;
}
export interface HeadingBlock {
  kind: "h2" | "h3";
  text: string;
}
export interface TableBlock {
  kind: "table";
  headers: string[];
  rows: string[][];
  caption?: string;
}
export interface ChartBlock {
  kind: "chart";
  src: string;             // /blog/<slug>/chart-N.png
  alt: string;
  caption: string;
  // Hidden a11y table tied via aria-describedby
  a11yHeaders: string[];
  a11yRows: string[][];
}
export interface QuoteBlock {
  kind: "quote";
  text: string;
}
export interface ListBlock {
  kind: "ul";
  items: string[];
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | CalloutBlock
  | TableBlock
  | ChartBlock
  | QuoteBlock
  | ListBlock;

export interface SourceItem {
  authors: string;       // "Cui A. et al."
  title: string;         // italicised in render
  publication: string;   // "Frontiers in Nutrition, 2022."
  url?: string;
}

export interface BlogPost {
  slug: string;
  category: BlogCategory;
  accent: AccentColor;
  title: string;
  subtitle: string;
  metaDescription: string;
  keywords: string[];
  publishedAt: string;       // ISO date
  readingMinutes: number;
  pdfPath: string;           // /blog/<slug>.pdf
  ogImage: string;           // first chart, used for OG
  lead: string;              // italic intro paragraph
  stats: [StatItem, StatItem, StatItem];
  body: ContentBlock[];
  cta: { title: string; body: string };
  bullets: string[];         // points clés à retenir
  sources: SourceItem[];
  relatedSlugs: [string, string];
}

const FDA_DISCLAIMER_FR = "Disclaimer FDA (21 CFR 101.93) — Ces informations n'ont pas été évaluées par la Food and Drug Administration. Ce produit n'est pas destiné à diagnostiquer, traiter, guérir ou prévenir une maladie.";
const FDA_DISCLAIMER_EN = "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.";
const MEDICAL_DISCLAIMER = "Disclaimer médical — Ces informations sont fournies à titre éducatif et ne constituent pas un avis médical. Consultez un professionnel de santé avant toute supplémentation.";
const AI_DISCLAIMER = "Disclaimer IA (EU AI Act, Art. 50) — Le Coach IA VitaSync est propulsé par Google Gemini 3 et fournit des informations générales de bien-être, pas un diagnostic médical.";

export const DISCLAIMERS = {
  fdaFr: FDA_DISCLAIMER_FR,
  fdaEn: FDA_DISCLAIMER_EN,
  medical: MEDICAL_DISCLAIMER,
  ai: AI_DISCLAIMER,
};

// ---------------------------------------------------------------------------
// Article 01 — Vitamine D
// ---------------------------------------------------------------------------
const vitamineD: BlogPost = {
  slug: "vitamine-d-carence-silencieuse",
  category: "Vitamines",
  accent: "primary",
  title: "Vitamine D : la carence silencieuse",
  subtitle: "Pourquoi 4 Américains sur 10 manquent de la vitamine la plus essentielle — et ce que dit vraiment la science.",
  metaDescription: "40 % des adultes américains sont insuffisants en vitamine D. Méta-analyses 2022-2024 sur cancer, immunité et mortalité. Posologie, formes et cible 25(OH)D recommandée.",
  keywords: ["vitamine D", "carence vitamine D", "25-hydroxyvitamine D", "D3 K2", "NHANES", "supplémentation"],
  publishedAt: "2026-04-08",
  readingMinutes: 7,
  pdfPath: "/blog/vitamine-d-carence-silencieuse.pdf",
  ogImage: "/blog/vitamine-d-carence-silencieuse/chart-1.png",
  lead: "Imaginez une carence qui touche **40 % de la population américaine adulte**, qui s'aggrave en hiver, et dont les conséquences vont du rhume à répétition jusqu'à un risque accru de mortalité par cancer. Ce n'est pas une projection alarmiste : c'est exactement ce que documente la plus large enquête nutritionnelle au monde, le *National Health and Nutrition Examination Survey (NHANES)*, sur 71 685 participants entre 2001 et 2018.",
  stats: [
    { value: "40,9 %", label: "Insuffisance en vitamine D", color: "amber" },
    { value: "22 %", label: "Carence modérée", color: "orange" },
    { value: "2,6 %", label: "Carence sévère", color: "rose" },
  ],
  body: [
    { kind: "p", text: "Ces chiffres signifient que **2 Américains sur 3** n'ont pas un statut optimal en vitamine D. Et lorsqu'on applique le seuil plus exigeant de 100-150 nmol/L recommandé par certains groupes de recherche, la proportion grimpe à **près de 90 % de la population**." },
    { kind: "callout", variant: "retenir", title: "À retenir", body: "La vitamine D est techniquement une hormone, pas une simple vitamine. Elle régule plus de 200 gènes impliqués dans l'immunité, l'humeur, la santé osseuse et la réponse inflammatoire." },
    { kind: "chart", src: "/blog/vitamine-d-carence-silencieuse/chart-1.png", alt: "Distribution du statut vitamine D dans la population adulte américaine — 65 % n'atteint pas la suffisance.", caption: "Distribution du statut vitamine D — population adulte américaine. Source : Cui et al., Frontiers in Nutrition 2022 (n = 71 685).", a11yHeaders: ["Statut", "% population"], a11yRows: [["Carence sévère <30 nmol/L", "2,6 %"], ["Carence modérée 30-50", "22 %"], ["Insuffisance 50-75", "40,9 %"], ["Suffisance ≥ 75", "34,5 %"]] },
    { kind: "h2", text: "Qui est le plus à risque ?" },
    { kind: "p", text: "L'analyse NHANES la plus récente (2017-2018) identifie six profils particulièrement vulnérables : personnes à peau mate, jeunes adultes (20-39 ans), femmes en post-ménopause, IMC > 30, bas revenus, et latitudes nord en hiver. Au-delà du 37ᵉ parallèle nord, aucun UVB efficace n'atteint la peau d'octobre à mars." },
    { kind: "chart", src: "/blog/vitamine-d-carence-silencieuse/chart-2.png", alt: "Profils les plus à risque de carence en vitamine D, classés par % avec taux ≤ 50 nmol/L.", caption: "Profils les plus à risque de carence en vitamine D. Sources : NHANES 2017-2018 ; Endocrine Society.", a11yHeaders: ["Profil", "% avec taux ≤ 50 nmol/L"], a11yRows: [["Afro-Américains", "53 %"], ["Hommes 20-29 ans", "47 %"], ["IMC > 30 (obésité)", "41 %"], ["Sans supplément", "38 %"], ["Hiver (latitude N)", "35 %"]] },
    { kind: "h2", text: "Vitamine D et cancer : ce que disent vraiment les méta-analyses" },
    { kind: "p", text: "C'est la question qui revient le plus souvent : **la vitamine D protège-t-elle du cancer ?** La réponse, basée sur les essais cliniques randomisés (le plus haut niveau de preuve), est nuancée. Une méta-analyse publiée dans *Annals of Oncology* sur 10 essais et 79 055 participants conclut que la supplémentation **ne réduit pas l'incidence du cancer** (RR 0,98) mais **réduit la mortalité par cancer de 13 %** (RR 0,87). Une seconde méta-analyse en *Trial Sequential Analysis* confirme une **réduction de 10 % de la mortalité toutes causes confondues** par cancer." },
    { kind: "p", text: "Le détail crucial : la réduction n'apparaît que dans les essais utilisant un **dosage quotidien** (typiquement 1 000-4 000 UI/jour), **pas dans les essais à mégadoses bolus** mensuelles. Cela suggère qu'un taux sérique stable, plutôt qu'un pic, est ce qui compte." },
    { kind: "chart", src: "/blog/vitamine-d-carence-silencieuse/chart-3.png", alt: "Effets cliniques de la supplémentation en vitamine D sur l'incidence et la mortalité du cancer ainsi que sur les infections respiratoires.", caption: "Effets cliniques documentés de la supplémentation en vitamine D. Sources : Annals of Oncology 2019 ; Martineau, BMJ 2017.", a11yHeaders: ["Critère", "Réduction vs placebo"], a11yRows: [["Incidence du cancer", "−2 %"], ["Mortalité cancer (toutes)", "−13 %"], ["Mortalité cancer (dosage quotidien)", "−12 %"], ["Mortalité respiratoire (infections)", "−19 %"]] },
    { kind: "h2", text: "Vitamine D et immunité" },
    { kind: "p", text: "L'essai contrôlé randomisé de référence (Martineau et al., BMJ 2017) sur 25 essais et 11 321 participants a montré qu'une supplémentation quotidienne ou hebdomadaire **réduit le risque d'infection respiratoire aiguë de 19 %**, et de **70 % chez les personnes sévèrement carencées au départ**. C'est probablement l'application clinique la mieux documentée de la vitamine D." },
    { kind: "h2", text: "Quel taux viser ? Comment doser ?" },
    { kind: "table", headers: ["Statut", "NIH (US)", "Endocrine Society", "Recherche optimale"], rows: [["Carence sévère", "< 12 ng/mL", "< 20 ng/mL", "< 30 ng/mL"], ["Insuffisance", "12-19 ng/mL", "20-29 ng/mL", "30-49 ng/mL"], ["Suffisance", "≥ 20 ng/mL", "≥ 30 ng/mL", "50-80 ng/mL"], ["Toxicité", "> 100 ng/mL", "> 100 ng/mL", "> 100 ng/mL"]] },
    { kind: "p", text: "**Recommandation pratique** : viser **40-60 ng/mL** (100-150 nmol/L) chez l'adulte sain, vérifié par une prise de sang `25-hydroxyvitamine D`. La vitamine **D3 (cholécalciférol)** est mieux absorbée que la D2. Posologie typique : 1 000-2 000 UI/j en entretien, 4 000-5 000 UI/j si carence. La **vitamine K2 (MK-7)** associée dirige le calcium vers les os et hors des artères." },
    { kind: "quote", text: "Comprenez votre statut. Optimisez votre stack." },
  ],
  cta: {
    title: "Le « bilan vitamine D » avec VitaSync",
    body: "Le Coach IA VitaSync, propulsé par Google Gemini 3, peut analyser vos résultats sanguins (PDF), calculer la dose adaptée à votre profil (latitude, IMC, exposition), choisir une formulation D3 + K2 made in USA, et suivre semaine après semaine l'effet réel sur votre énergie et votre sommeil.",
  },
  bullets: [
    "40 % des adultes américains sont insuffisants en vitamine D, 22 % carencés.",
    "La supplémentation réduit la mortalité par cancer de 10-13 % (mais pas l'incidence).",
    "Réduction de 19 % du risque d'infection respiratoire aiguë avec une supplémentation quotidienne.",
    "Forme privilégiée : D3 (cholécalciférol). Cible : 40-60 ng/mL de 25(OH)D.",
    "D3 + K2 est la combinaison favorisant l'os sans calcifier les artères.",
    "L'exposition solaire ne suffit pas en hiver au-dessus du 37ᵉ parallèle nord.",
  ],
  sources: [
    { authors: "Cui A. et al.", title: "Prevalence, trend, and predictor analyses of vitamin D deficiency in the US population, 2001-2018", publication: "Frontiers in Nutrition, 2022.", url: "https://www.frontiersin.org/articles/10.3389/fnut.2022.965376/full" },
    { authors: "Keum N. et al.", title: "Vitamin D supplementation and total cancer incidence and mortality", publication: "Annals of Oncology, 2019." },
    { authors: "Guo Z. et al.", title: "Vitamin D supplementation and cancer — Trial Sequential Meta-Analysis", publication: "Critical Reviews in Food Science, 2022." },
    { authors: "Martineau A.R. et al.", title: "Vitamin D supplementation to prevent acute respiratory tract infections", publication: "BMJ, 2017;356:i6583.", url: "https://www.bmj.com/content/356/bmj.i6583" },
    { authors: "NIH Office of Dietary Supplements.", title: "Vitamin D — Health Professional Fact Sheet", publication: "ods.od.nih.gov", url: "https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/" },
    { authors: "Frontiers in Nutrition.", title: "Prevalence of vitamin D deficiency and associated risk of all-cause mortality", publication: "2023." },
    { authors: "Dawson-Hughes B. et al.", title: "Dietary fat increases vitamin D-3 absorption", publication: "J Acad Nutr Diet, 2015." },
  ],
  relatedSlugs: ["magnesium-pourquoi-1-americain-sur-2-en-manque", "omega-3-epa-dha-cerveau-et-coeur"],
};

// ---------------------------------------------------------------------------
// Article 02 — Magnésium
// ---------------------------------------------------------------------------
const magnesium: BlogPost = {
  slug: "magnesium-pourquoi-1-americain-sur-2-en-manque",
  category: "Minéraux",
  accent: "accent",
  title: "Magnésium : pourquoi 1 Américain sur 2 en manque",
  subtitle: "Le minéral le plus sous-estimé du 21ᵉ siècle. Quelle forme choisir et pour quel objectif.",
  metaDescription: "48 % des Américains n'atteignent pas le RDA en magnésium. Glycinate, L-thréonate, citrate : quelle forme pour le sommeil, la cognition ou l'énergie. Posologie pratique 200-400 mg/j.",
  keywords: ["magnésium", "glycinate", "L-thréonate", "Magtein", "carence magnésium", "sommeil", "anxiété"],
  publishedAt: "2026-04-08",
  readingMinutes: 7,
  pdfPath: "/blog/magnesium-pourquoi-1-americain-sur-2-en-manque.pdf",
  ogImage: "/blog/magnesium-pourquoi-1-americain-sur-2-en-manque/chart-1.png",
  lead: "Si vous deviez choisir un **seul** complément à intégrer dans votre routine quotidienne, beaucoup de chercheurs en nutrition désigneraient le magnésium. Pourquoi ? Parce que ce minéral participe à **plus de 600 réactions enzymatiques** — production d'énergie (ATP), synthèse protéique, régulation du sommeil, contraction musculaire, modulation du système nerveux. Et parce que la moitié des Américains n'en consomme pas assez.",
  stats: [
    { value: "48 %", label: "Adultes US sous le RDA quotidien", color: "primary" },
    { value: "600+", label: "Réactions enzymatiques impliquées", color: "accent" },
    { value: "50 %", label: "Carence subclinique estimée", color: "amber" },
  ],
  body: [
    { kind: "callout", variant: "retenir", title: "À retenir", body: "La carence en magnésium est rarement diagnostiquée. La magnésémie sérique (test sanguin standard) est trompeuse, car le corps maintient activement le taux sanguin en pillant les réserves osseuses et musculaires." },
    { kind: "chart", src: "/blog/magnesium-pourquoi-1-americain-sur-2-en-manque/chart-1.png", alt: "Comparaison du RDA recommandé en magnésium et de l'apport médian observé : un déficit chronique de 50 à 100 mg/jour.", caption: "RDA recommandé vs apport médian observé — un déficit chronique de 50 à 100 mg/jour. Source : NIH Office of Dietary Supplements ; NHANES 2005-2006.", a11yHeaders: ["Groupe", "RDA", "Apport médian"], a11yRows: [["Hommes 19-30", "400 mg", "320 mg"], ["Hommes 31+", "420 mg", "320 mg"], ["Femmes 19-30", "310 mg", "270 mg"], ["Femmes 31+", "320 mg", "270 mg"]] },
    { kind: "h2", text: "Pourquoi un tel déficit ?" },
    { kind: "p", text: "**Sols appauvris** — La teneur en magnésium des fruits et légumes a chuté de 20-30 % depuis les années 1950. **Aliments raffinés** — Le raffinage du blé élimine 80-95 % du magnésium. Les régimes ultra-transformés sont mécaniquement carencés. **Stress et caféine** — Le stress chronique augmente l'excrétion urinaire de magnésium, et la caféine au-delà de 3 tasses/jour idem." },
    { kind: "h2", text: "Magnésium et sommeil : ce que disent les essais cliniques" },
    { kind: "p", text: "C'est probablement la première raison pour laquelle nos utilisateurs commencent un complément de magnésium. Une revue systématique 2024 publiée dans *Cureus* a conclu que la majorité des essais montrait au moins des résultats modestes positifs sur la qualité du sommeil et l'anxiété, particulièrement chez les sujets ayant un magnésium bas au départ. Dans l'étude de Abbasi (insomnie primaire chez seniors, 500 mg/j × 8 semaines) : +17 minutes de sommeil total, +8 % d'efficacité, augmentation de la mélatonine et baisse du cortisol matinal." },
    { kind: "chart", src: "/blog/magnesium-pourquoi-1-americain-sur-2-en-manque/chart-2.png", alt: "Effets observés du magnésium sur le sommeil, le cortisol et l'anxiété en essais cliniques.", caption: "Effets observés du magnésium sur les marqueurs de sommeil et d'anxiété. Sources : Abbasi (J Res Med Sci 2012) ; Rawji (Cureus 2024).", a11yHeaders: ["Marqueur", "Variation vs placebo"], a11yRows: [["Temps de sommeil total", "+17 %"], ["Latence d'endormissement", "−16 %"], ["Efficacité du sommeil", "+8 %"], ["Mélatonine sérique", "+14 %"], ["Cortisol matinal", "−11 %"], ["Score anxiété", "−10 %"]] },
    { kind: "h2", text: "Quelle forme choisir ?" },
    { kind: "p", text: "Toutes les formes de magnésium ne sont pas égales. La biodisponibilité, la tolérance digestive, et le passage de la barrière hémato-encéphalique varient considérablement." },
    { kind: "chart", src: "/blog/magnesium-pourquoi-1-americain-sur-2-en-manque/chart-3.png", alt: "Comparatif radar des 4 principales formes de magnésium : glycinate, L-thréonate, citrate et oxyde, notées sur cognition, sommeil, tolérance, biodisponibilité, coût et disponibilité.", caption: "Comparatif des 4 principales formes de magnésium par dimension. Synthèse VitaSync à partir de la littérature 2020-2024.", a11yHeaders: ["Forme", "Cognition", "Sommeil", "Tolérance", "Biodisponibilité", "Coût"], a11yRows: [["Glycinate", "7", "9", "9", "8", "7"], ["L-thréonate", "10", "8", "8", "9", "5"], ["Citrate", "6", "6", "6", "7", "8"], ["Oxyde", "3", "3", "4", "3", "9"]] },
    { kind: "table", headers: ["Forme", "Indication phare", "À noter"], rows: [["Glycinate", "Sommeil, stress, anxiété", "Apaisante, peu de troubles digestifs"], ["L-thréonate", "Cognition, mémoire", "Seule forme passant la BHE (Magtein®)"], ["Citrate", "Constipation, recharge", "Effet laxatif à doses ≥ 400 mg"], ["Malate", "Énergie, fatigue", "Bien toléré, plutôt énergisant"], ["Oxyde", "Constipation aiguë", "Mal absorbé, à éviter"]] },
    { kind: "h2", text: "Posologie pratique" },
    { kind: "p", text: "Dose totale élémentaire : 200-400 mg/j, à fractionner en 2 prises (matin + soir) pour éviter le seuil laxatif. Avec un **repas** pour améliorer absorption et tolérance. **Soir** (forme glycinate ou L-thréonate) : 200-300 mg, 30-60 min avant le coucher. **Limite supérieure tolérable (UL)** : 350 mg/j sous forme supplémentaire." },
    { kind: "callout", variant: "precaution", title: "Précaution", body: "Insuffisance rénale, traitement par antibiotiques (quinolones, tétracyclines) ou bisphosphonates — espacer les prises de 2 à 4 heures." },
  ],
  cta: {
    title: "Construisez votre stack magnésium personnalisé",
    body: "Le Coach IA VitaSync analyse vos check-ins quotidiens (sommeil, énergie, stress) pour détecter les patterns évocateurs d'une carence subclinique. Il recommande la forme adaptée (glycinate, L-thréonate, citrate) et ajuste la posologie semaine après semaine selon votre réponse réelle.",
  },
  bullets: [
    "48 % des Américains n'atteignent pas le RDA en magnésium.",
    "Carence subclinique jusqu'à 50 % de la population.",
    "Effet modeste mais significatif sur sommeil et anxiété, surtout chez les sujets bas au départ.",
    "Le glycinate est la forme la mieux tolérée pour le sommeil et le stress.",
    "Le L-thréonate (Magtein®) est la seule forme qui passe la barrière hémato-encéphalique.",
    "Dose pratique : 200-400 mg élémentaires, fractionnés, avec un repas.",
  ],
  sources: [
    { authors: "Rosanoff A. et al.", title: "Suboptimal magnesium status in the United States", publication: "Nutrition Reviews, 2012." },
    { authors: "DiNicolantonio J. et al.", title: "Subclinical magnesium deficiency: a principal driver of CVD", publication: "Open Heart, 2018.", url: "https://openheart.bmj.com/content/5/1/e000668" },
    { authors: "NIH Office of Dietary Supplements.", title: "Magnesium — Health Professional Fact Sheet", publication: "ods.od.nih.gov", url: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/" },
    { authors: "Rawji A. et al.", title: "Effects of Supplemental Magnesium on Anxiety and Sleep Quality — Systematic Review", publication: "Cureus, 2024." },
    { authors: "Abbasi B. et al.", title: "Magnesium supplementation on primary insomnia in elderly", publication: "J Res Med Sci, 2012." },
    { authors: "Sleep Medicine: X.", title: "Magnesium-L-threonate improves sleep quality", publication: "2024." },
    { authors: "Harvard T.H. Chan School of Public Health.", title: "Magnesium — Nutrition Source", publication: "hsph.harvard.edu", url: "https://www.hsph.harvard.edu/nutritionsource/magnesium/" },
  ],
  relatedSlugs: ["vitamine-d-carence-silencieuse", "creatine-pas-que-pour-la-salle"],
};

// ---------------------------------------------------------------------------
// Article 03 — Oméga-3
// ---------------------------------------------------------------------------
const omega3: BlogPost = {
  slug: "omega-3-epa-dha-cerveau-et-coeur",
  category: "Lipides",
  accent: "emerald",
  title: "Oméga-3 EPA + DHA : votre cerveau en réclame 4 fois plus",
  subtitle: "Le déficit nutritionnel le plus invisible des pays développés. Méta-analyses 2024 sur cœur et cerveau.",
  metaDescription: "L'Américain moyen consomme 86 mg d'EPA + DHA par jour, 6 à 12 fois moins que recommandé. Méta-analyse 2024 sur 134 144 participants : effets cardiovasculaires et cognitifs.",
  keywords: ["oméga-3", "EPA", "DHA", "Omega-3 Index", "huile de poisson", "REDUCE-IT", "cardiovasculaire"],
  publishedAt: "2026-04-08",
  readingMinutes: 8,
  pdfPath: "/blog/omega-3-epa-dha-cerveau-et-coeur.pdf",
  ogImage: "/blog/omega-3-epa-dha-cerveau-et-coeur/chart-1.png",
  lead: "Quand on parle de carences nutritionnelles aux États-Unis, on pense vitamine D, magnésium, fer. Rarement aux **oméga-3** — et c'est précisément le problème. D'après les données NHANES, l'apport moyen d'un adulte américain est de 63 mg de DHA et 23 mg d'EPA par jour, soit 86 mg d'oméga-3 marins quotidiens. Comparé aux 500-1000 mg/jour recommandés par l'American Heart Association, c'est 6 à 12 fois moins que le besoin estimé.",
  stats: [
    { value: "86 mg", label: "Apport moyen US (EPA+DHA / jour)", color: "rose" },
    { value: "80 %", label: "Adultes US sub-optimaux (CDC)", color: "amber" },
    { value: "500+", label: "mg/j recommandés par l'AHA", color: "emerald" },
  ],
  body: [
    { kind: "callout", variant: "retenir", title: "À retenir", body: "Il existe trois oméga-3 — l'ALA (origine végétale, lin, chia, noix), l'EPA et le DHA (origine marine). Seuls EPA et DHA sont biologiquement actifs ; la conversion ALA → EPA est inférieure à 5 %, et ALA → DHA inférieure à 1 % chez l'humain." },
    { kind: "chart", src: "/blog/omega-3-epa-dha-cerveau-et-coeur/chart-1.png", alt: "L'apport moyen américain en oméga-3 marins est 6 à 35 fois inférieur aux cibles cardiovasculaires recommandées.", caption: "L'Américain moyen consomme 6 à 35× moins d'oméga-3 marins que recommandé. Sources : Nutrients 2021 ; American Heart Association ; ESC.", a11yHeaders: ["Cible", "Dose"], a11yRows: [["Apport moyen US (EPA + DHA)", "86 mg"], ["Apport minimal AHA", "250 mg"], ["Cible bien-être général", "1 000 mg"], ["Cible cardiovasculaire", "3 000 mg"]] },
    { kind: "h2", text: "DHA : le carburant du cerveau" },
    { kind: "p", text: "Les oméga-3 sont des acides gras polyinsaturés à longue chaîne qui s'incorporent directement dans les membranes cellulaires. Et nulle part ailleurs cette intégration n'est plus dense que dans le cerveau et la rétine. Selon une revue parue dans *International Journal of Molecular Sciences* : le **DHA constitue 40 % des acides gras polyinsaturés du cerveau humain et 60 % des PUFA de la rétine**. Il participe à la fluidité membranaire, à la signalisation neuronale, et à la modulation de la neuroinflammation." },
    { kind: "h2", text: "Cœur : ce que disent vraiment les méta-analyses 2024" },
    { kind: "p", text: "Une **méta-analyse 2024** dans l'*European Journal of Preventive Cardiology* a regroupé **18 essais cliniques randomisés et 134 144 participants**. Conclusions principales : réduction du risque de revascularisation coronarienne, d'infarctus du myocarde, et de mortalité cardiovasculaire. **Pas d'augmentation** du risque de saignement, contrairement à une crainte ancienne." },
    { kind: "chart", src: "/blog/omega-3-epa-dha-cerveau-et-coeur/chart-2.png", alt: "Réductions des événements cardiovasculaires sous oméga-3, méta-analyse 2024 sur 134 144 participants.", caption: "Méta-analyse 2024 sur 134 144 participants : effets cardiovasculaires des oméga-3. Source : Eur J Prev Cardiol 2024 ; Khan et al., eClinicalMedicine 2021.", a11yHeaders: ["Critère", "Réduction vs placebo"], a11yRows: [["Revascularisation coronaire", "−15 %"], ["Infarctus du myocarde", "−12 %"], ["Mortalité cardiovasculaire", "−8 %"], ["Saignements majeurs", "0 %"]] },
    { kind: "callout", variant: "nuance", title: "Nuance importante", body: "L'effet est plus marqué avec l'EPA pure qu'avec un mélange EPA + DHA. L'essai REDUCE-IT (icosapent ethyl, 4 g/j d'EPA) reste la référence cardiologique. L'essai STRENGTH (mélange) avait été interrompu pour futilité. Cela ne signifie pas que le DHA est inutile — il a son propre rôle, principalement neurologique." },
    { kind: "h2", text: "Le fameux Omega-3 Index" },
    { kind: "p", text: "L'**Omega-3 Index** est le pourcentage d'EPA + DHA dans la membrane des globules rouges. C'est devenu **le marqueur biologique de référence** pour évaluer le statut oméga-3." },
    { kind: "chart", src: "/blog/omega-3-epa-dha-cerveau-et-coeur/chart-3.png", alt: "L'Omega-3 Index moyen aux États-Unis (4,5 %) se situe dans la zone à haut risque ; le Japon (9,5 %) est dans la zone optimale.", caption: "Omega-3 Index : la population US dans la zone à haut risque. Source : FORCE consortium.", a11yHeaders: ["Population", "Omega-3 Index"], a11yRows: [["États-Unis", "4,5 %"], ["Japon", "9,5 %"], ["Cible clinique", "≥ 8 %"]] },
    { kind: "h2", text: "EPA, DHA ou combiné : comment choisir ?" },
    { kind: "table", headers: ["Objectif", "Forme privilégiée", "Dose typique"], rows: [["Cardiovasculaire (TG hauts)", "EPA dominant ou pur", "2-4 g/j"], ["Cognition, humeur", "DHA dominant", "1-2 g/j (DHA ≥ 60 %)"], ["Bien-être général", "EPA + DHA combiné (~60/40)", "1-2 g/j"], ["Yeux secs, vision", "DHA dominant", "1 g/j"], ["Inflammation, articulations", "EPA dominant", "2-3 g/j"]] },
    { kind: "h2", text: "Qualité : ce qu'il faut vérifier" },
    { kind: "p", text: "**Certification IFOS, GOED ou USP** — garantit l'absence de métaux lourds, PCB et dioxines. **Indice TOTOX < 26** — l'huile rance est inflammatoire au lieu d'être anti-inflammatoire. **Forme moléculaire** — préférer les triglycérides reformés (rTG) ou les phospholipides (krill) plutôt que les esters éthyliques (EE), moins biodisponibles à jeun. **Origine** — petits poissons à courte vie (sardine, anchois, maquereau) = moins de bioaccumulation." },
  ],
  cta: {
    title: "Le bon ratio EPA/DHA selon votre objectif",
    body: "Le Coach IA VitaSync analyse votre bilan biologique (PDF), recommande la formulation et le ratio adaptés à votre objectif (cœur, cerveau, articulations), suit vos marqueurs subjectifs et alerte sur les contre-indications médicamenteuses (anticoagulants, chirurgie programmée).",
  },
  bullets: [
    "L'Américain moyen consomme 86 mg/j d'oméga-3 marins, contre 500-1000 mg/j recommandés.",
    "Le DHA constitue 40 % des PUFA cérébraux et 60 % des PUFA rétiniens.",
    "Méta-analyse 2024 sur 134 144 patients : réduction de l'IM, des revascularisations et de la mortalité CV.",
    "EPA dominante est plus efficace pour le cœur ; DHA pour le cerveau et la rétine.",
    "L'Omega-3 Index optimal est ≥ 8 % — atteignable avec 2-3 g/j d'EPA+DHA en 3-6 mois.",
    "Privilégier rTG ou phospholipides, certifiés IFOS, TOTOX bas.",
  ],
  sources: [
    { authors: "Nutrients.", title: "Importance of EPA and DHA Blood Levels in Brain Structure and Function", publication: "2021." },
    { authors: "Nutrients.", title: "The Importance of Marine Omega-3s for Brain Development", publication: "2020." },
    { authors: "Cureus.", title: "Effects of Omega-3 PUFAs on Brain Functions: A Systematic Review", publication: "2022." },
    { authors: "NIH Office of Dietary Supplements.", title: "Omega-3 Fatty Acids — Consumer Fact Sheet", publication: "ods.od.nih.gov", url: "https://ods.od.nih.gov/factsheets/Omega3FattyAcids-Consumer/" },
    { authors: "European Journal of Preventive Cardiology.", title: "Effects of omega-3 fatty acids on coronary revascularization and cardiovascular events: meta-analysis", publication: "2024." },
    { authors: "Curr Atheroscler Rep.", title: "N-3 Fatty Acids and Cardiovascular Health — Updated Review", publication: "2025." },
    { authors: "Khan SU. et al.", title: "Effect of omega-3 on cardiovascular outcomes: meta-analysis", publication: "eClinicalMedicine (Lancet), 2021." },
  ],
  relatedSlugs: ["vitamine-d-carence-silencieuse", "creatine-pas-que-pour-la-salle"],
};

// ---------------------------------------------------------------------------
// Article 04 — Créatine
// ---------------------------------------------------------------------------
const creatine: BlogPost = {
  slug: "creatine-pas-que-pour-la-salle",
  category: "Cognition & Sport",
  accent: "orange",
  title: "Créatine : pas (que) pour la salle",
  subtitle: "25 ans de recherche clinique, méta-analyse cognitive 2024 : ce que la science nous apprend sur le complément le plus étudié de l'histoire.",
  metaDescription: "Plus de 1 000 essais publiés. Méta-analyse 2024 sur la cognition. Sécurité rénale 25 ans. Pourquoi 3-5 g/j de créatine monohydrate (Creapure®) en continu suffisent.",
  keywords: ["créatine", "monohydrate", "Creapure", "cognition", "ATP", "phosphocréatine", "sport"],
  publishedAt: "2026-04-08",
  readingMinutes: 7,
  pdfPath: "/blog/creatine-pas-que-pour-la-salle.pdf",
  ogImage: "/blog/creatine-pas-que-pour-la-salle/chart-1.png",
  lead: "Si vous demandez à dix personnes ce qu'est la créatine, neuf répondront « un produit de musculation ». Or, depuis 2020, la *recherche clinique* a élargi la conversation : la créatine devient le complément polyvalent de la décennie, avec des données nouvelles sur la *mémoire*, le *fonctionnement cognitif sous stress*, et la *santé cérébrale chez les seniors*.",
  stats: [
    { value: "25 ans", label: "Études cliniques cumulées", color: "primary" },
    { value: "+10-25 %", label: "Gain de masse maigre (4-12 sem.)", color: "orange" },
    { value: "5 g/j", label: "Dose efficace en entretien", color: "emerald" },
  ],
  body: [
    { kind: "callout", variant: "retenir", title: "À retenir", body: "La créatine n'est pas une hormone, ni un dopant, ni un précurseur stéroïdien. C'est un dérivé d'acides aminés (glycine + arginine + méthionine) synthétisé naturellement par le foie, les reins et le pancréas, et stocké à 95 % dans le muscle squelettique sous forme de phosphocréatine." },
    { kind: "chart", src: "/blog/creatine-pas-que-pour-la-salle/chart-1.png", alt: "Bénéfices documentés de la créatine sur la performance, la masse maigre et la cognition.", caption: "Bénéfices documentés de la créatine — fourchettes observées en essais cliniques. Source : ISSN Position Stand 2017 ; Frontiers in Nutrition meta-analysis 2024.", a11yHeaders: ["Critère", "Amélioration vs placebo"], a11yRows: [["Sprint / puissance (<30s)", "+5 à 15 %"], ["Force maximale (1RM)", "+8 à 14 %"], ["Masse maigre (4-12 sem.)", "+10 à 25 %"], ["Mémoire (adultes)", "+4 à 12 %"], ["Vitesse traitement cognitif", "+5 à 11 %"]] },
    { kind: "h2", text: "Comment elle agit dans le corps (et le cerveau)" },
    { kind: "p", text: "L'ATP est la monnaie énergétique de la cellule. Mais le stock cellulaire ne tient que 2-3 secondes d'effort intense. C'est la **phosphocréatine** qui re-phosphoryle l'ADP en ATP pour les 8-10 secondes suivantes — d'où l'effet sur le sprint, la force explosive et la puissance maximale. Le cerveau, organe le plus énergivore du corps (~20 % de la dépense au repos), utilise exactement le même système. Et c'est là que les choses deviennent intéressantes." },
    { kind: "p", text: "Une étude publiée dans *Scientific Reports* en 2024 a montré qu'une **dose unique de créatine améliore la performance cognitive lors d'une privation de sommeil**, avec modifications mesurables des phosphates de haute énergie cérébraux. Une étude pilote de l'Université du Kansas chez des patients Alzheimer a observé une **augmentation de 11 % du taux de créatine cérébral** et des améliorations en mémoire de travail." },
    { kind: "h2", text: "Phase de charge ou prise directe ?" },
    { kind: "p", text: "Il existe deux protocoles validés. La **phase de charge** (20 g/j × 5-7 jours puis 3-5 g/j) sature en quelques jours. La **prise directe** (3-5 g/j d'emblée) sature en 3-4 semaines. Les deux mènent au même état de saturation musculaire — la phase de charge est plus rapide mais peut entraîner un léger inconfort digestif chez certains." },
    { kind: "chart", src: "/blog/creatine-pas-que-pour-la-salle/chart-2.png", alt: "Cinétique de saturation musculaire en créatine selon le protocole choisi (charge ou prise directe).", caption: "Cinétique de saturation musculaire selon le protocole. Source : Hultman et al. (J Appl Physiol 1996) ; ISSN Position Stand.", a11yHeaders: ["Jour", "Charge (% saturation)", "Direct (% saturation)"], a11yRows: [["0", "30", "30"], ["5", "95", "60"], ["10", "98", "75"], ["15", "99", "85"], ["20", "99", "90"], ["25", "99", "95"], ["30", "99", "98"]] },
    { kind: "h2", text: "Sécurité : 25 ans d'études robustes" },
    { kind: "p", text: "C'est la rumeur la plus tenace : « La créatine, c'est mauvais pour les reins. » **La science dit le contraire.** Les revues les plus rigoureuses, dont la position officielle de l'*International Society of Sports Nutrition* et Harvard Health, concluent qu'à doses recommandées (3-5 g/j) il n'y a **aucun impact négatif documenté** sur la fonction rénale chez les sujets sains. Études long terme jusqu'à 30 g/j pendant 5 ans dans des populations cliniques, sans dysfonction rénale induite." },
    { kind: "chart", src: "/blog/creatine-pas-que-pour-la-salle/chart-3.png", alt: "Profil de sécurité de la créatine monohydrate à 3-5 g/j sur 25 ans d'études.", caption: "Profil de sécurité de la créatine monohydrate à 3-5 g/j. 25 ans d'études — pas d'effet rénal, hépatique ou cardiovasculaire délétère.", a11yHeaders: ["Paramètre", "Effet documenté"], a11yRows: [["Fonction rénale (sujets sains)", "Aucun effet délétère"], ["Fonction hépatique", "Aucun effet délétère"], ["Marqueurs cardiovasculaires", "Aucun effet délétère"], ["Études long terme (jusqu'à 30 g/j × 5 ans)", "Sans dysfonction rénale"]] },
    { kind: "callout", variant: "precaution", title: "Précaution", body: "Si vous avez une maladie rénale préexistante, consultez votre néphrologue. La très légère augmentation de la créatinine sérique observée chez les supplémentés ne reflète pas une atteinte rénale — c'est un artefact métabolique de la mesure." },
    { kind: "h2", text: "Forme à privilégier : monohydrate, point." },
    { kind: "p", text: "Le marketing propose plus de 20 formes : créatine HCl, éthyl ester, alcaline, citrate, malate. **Aucune n'a démontré d'avantage clinique significatif** sur la créatine monohydrate, qui reste la plus étudiée (> 1 000 essais publiés), la moins chère, la plus stable, et la plus efficace. Préférez la mention Creapure® sur l'étiquette, label allemand certifiant ≥ 99,95 % de pureté pharmaceutique." },
  ],
  cta: {
    title: "Construisez votre routine créatine adaptée",
    body: "Le Coach IA VitaSync calcule la dose adaptée à votre poids et niveau d'activité, recommande un protocole (charge ou direct) selon votre objectif, et propose une routine cognitive complémentaire si votre objectif est plutôt cérébral (vitamine D, oméga-3, magnésium L-thréonate, sommeil).",
  },
  bullets: [
    "La créatine n'est pas qu'un produit de musculation — c'est un substrat énergétique du muscle ET du cerveau.",
    "Méta-analyse 2024 : bénéfice significatif sur mémoire, vitesse cognitive et fonctions exécutives.",
    "Étude Scientific Reports 2024 : performance cognitive maintenue lors d'une privation de sommeil.",
    "Sécurité long terme robuste à 3-5 g/j sur 25 ans — pas d'effet rénal délétère chez le sujet sain.",
    "Forme à privilégier : monohydrate (Creapure®), plus efficace et moins chère que toute alternative.",
    "Posologie : 3-5 g/j en continu, avec ou sans phase de charge initiale.",
  ],
  sources: [
    { authors: "Kreider RB. et al.", title: "ISSN position stand: safety and efficacy of creatine supplementation", publication: "JISSN, 2017.", url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z" },
    { authors: "Frontiers in Nutrition.", title: "The effects of creatine supplementation on cognitive function in adults: meta-analysis", publication: "2024." },
    { authors: "Scientific Reports.", title: "Single dose creatine improves cognitive performance during sleep deprivation", publication: "2024." },
    { authors: "University of Kansas Medical Center.", title: "Creatine and cognition in Alzheimer's patients", publication: "2024." },
    { authors: "Harvard Health Publishing.", title: "What is creatine? Potential benefits and risks", publication: "health.harvard.edu", url: "https://www.health.harvard.edu/exercise-and-fitness/what-is-creatine-potential-benefits-and-risks-of-this-popular-supplement" },
    { authors: "EFSA.", title: "Creatine and improvement in cognitive function — health claim evaluation", publication: "EFSA Journal, 2024." },
    { authors: "Antonio J. et al.", title: "Common questions and misconceptions about creatine", publication: "JISSN, 2021." },
  ],
  relatedSlugs: ["magnesium-pourquoi-1-americain-sur-2-en-manque", "omega-3-epa-dha-cerveau-et-coeur"],
};

export const POSTS: BlogPost[] = [vitamineD, magnesium, omega3, creatine];

export const CATEGORIES: { id: "all" | BlogCategory; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "Vitamines", label: "Vitamines" },
  { id: "Minéraux", label: "Minéraux" },
  { id: "Lipides", label: "Lipides" },
  { id: "Cognition & Sport", label: "Cognition & Sport" },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return post.relatedSlugs.map((s) => POSTS.find((p) => p.slug === s)).filter((p): p is BlogPost => !!p);
}

// Tailwind class helpers per accent — kept centralised so PostCard, PostHero,
// Callout etc. stay consistent.
export const ACCENT_CLASSES: Record<AccentColor, {
  text: string;
  bg: string;
  border: string;
  gradient: string;       // for hero & card cover
  ring: string;
}> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary",
    gradient: "from-primary/30 via-primary/15 to-background",
    ring: "ring-primary/30",
  },
  accent: {
    text: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent",
    gradient: "from-accent/30 via-accent/15 to-background",
    ring: "ring-accent/30",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
    gradient: "from-emerald-500/30 via-emerald-500/15 to-background",
    ring: "ring-emerald-500/30",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500",
    gradient: "from-orange-500/30 via-orange-500/15 to-background",
    ring: "ring-orange-500/30",
  },
};

export const STAT_COLOR: Record<NonNullable<StatItem["color"]>, string> = {
  primary: "border-primary text-primary",
  accent: "border-accent text-accent",
  emerald: "border-emerald-500 text-emerald-400",
  orange: "border-orange-500 text-orange-400",
  amber: "border-amber-500 text-amber-400",
  rose: "border-rose-500 text-rose-400",
};