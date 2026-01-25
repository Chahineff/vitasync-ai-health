import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Dumbbell, 
  Moon, 
  Utensils, 
  AlertTriangle, 
  Pill, 
  Wallet,
  MapPin,
  Edit3
} from "lucide-react";

export function HealthProfileSection() {
  const navigate = useNavigate();
  const { healthProfile, loading } = useHealthProfile();

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-8 animate-pulse">
        <div className="h-6 bg-foreground/10 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-foreground/10 rounded w-full" />
          <div className="h-4 bg-foreground/10 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!healthProfile || !healthProfile.onboarding_completed) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Profil santé incomplet
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Complétez votre profil pour des recommandations personnalisées
        </p>
        <Button onClick={() => navigate("/onboarding")}>
          Compléter mon profil
        </Button>
      </div>
    );
  }

  const goalLabels: Record<string, string> = {
    sleep: "Sommeil",
    energy: "Énergie",
    focus: "Focus",
    stress: "Gestion du stress",
    sport: "Performance sport",
    muscle: "Prise de muscle",
    weight_loss: "Perte de poids",
    digestion: "Digestion",
    immunity: "Immunité",
    skin_hair: "Peau/cheveux",
  };

  const dietLabels: Record<string, string> = {
    omnivore: "Omnivore",
    vegetarian: "Végétarien",
    vegan: "Vegan",
    halal: "Halal",
    keto: "Keto/low-carb",
    gluten_free: "Sans gluten",
    lactose_free: "Sans lactose",
    unknown: "Non défini",
  };

  const activityLabels: Record<string, string> = {
    "0-1": "0-1x/semaine",
    "2-3": "2-3x/semaine",
    "4-5": "4-5x/semaine",
    "6+": "6x+/semaine",
  };

  const budgetLabels: Record<string, string> = {
    eco: "Économique",
    standard: "Standard",
    premium: "Premium",
  };

  const sections = [
    {
      icon: Target,
      label: "Objectifs",
      content: healthProfile.health_goals?.length ? (
        <div className="flex flex-wrap gap-2">
          {healthProfile.health_goals.map((goal) => (
            <Badge key={goal} variant="secondary">
              {goalLabels[goal] || goal}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">Non défini</span>
      ),
    },
    {
      icon: MapPin,
      label: "Pays de livraison",
      content: healthProfile.shipping_country || "Non défini",
    },
    {
      icon: Dumbbell,
      label: "Activité physique",
      content: healthProfile.activity_level
        ? activityLabels[healthProfile.activity_level] || healthProfile.activity_level
        : "Non défini",
    },
    {
      icon: Moon,
      label: "Sommeil",
      content: healthProfile.sleep_hours
        ? `${healthProfile.sleep_hours} • Qualité: ${healthProfile.sleep_quality_score || "-"}/5`
        : "Non défini",
    },
    {
      icon: Utensils,
      label: "Régime alimentaire",
      content: healthProfile.diet_type
        ? dietLabels[healthProfile.diet_type] || healthProfile.diet_type
        : "Non défini",
    },
    {
      icon: AlertTriangle,
      label: "Allergies",
      content: healthProfile.allergies?.length ? (
        <div className="flex flex-wrap gap-2">
          {healthProfile.allergies.map((allergy) => (
            <Badge key={allergy} variant="outline" className="text-destructive border-destructive/30">
              {allergy}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">Aucune</span>
      ),
    },
    {
      icon: Pill,
      label: "Préférences de prise",
      content: healthProfile.preferred_forms?.length ? (
        <div className="flex flex-wrap gap-2">
          {healthProfile.preferred_forms.map((form) => (
            <Badge key={form} variant="secondary">
              {form}
            </Badge>
          ))}
          {healthProfile.max_daily_intakes && (
            <Badge variant="outline">
              {healthProfile.max_daily_intakes} prise(s)/jour max
            </Badge>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">Non défini</span>
      ),
    },
    {
      icon: Wallet,
      label: "Budget mensuel",
      content: healthProfile.monthly_budget
        ? budgetLabels[healthProfile.monthly_budget] || healthProfile.monthly_budget
        : healthProfile.budget_range_min && healthProfile.budget_range_max
        ? `${healthProfile.budget_range_min}-${healthProfile.budget_range_max}€/mois`
        : "Non défini",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-foreground">
          Mon Profil Santé
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/onboarding?edit=true")}
          className="gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Modifier
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-foreground/5 space-y-2"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <section.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </div>
            <div className="text-sm text-foreground">
              {section.content}
            </div>
          </div>
        ))}
      </div>

      {healthProfile.medications_notes && (
        <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            <strong>Note médicale :</strong> {healthProfile.medications_notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
