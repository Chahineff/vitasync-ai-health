import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, Dumbbell, Moon, Utensils, AlertTriangle, Pill, Wallet, MapPin, Edit3
} from "lucide-react";

export function HealthProfileSection() {
  const navigate = useNavigate();
  const { healthProfile, loading } = useHealthProfile();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-4 md:p-8 animate-pulse">
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
      <div className="glass-card rounded-2xl p-4 md:p-8 text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t('healthProfile.incomplete')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('healthProfile.incompleteDesc')}
        </p>
        <Button onClick={() => navigate("/onboarding")}>
          {t('healthProfile.complete')}
        </Button>
      </div>
    );
  }

  const goalMap: Record<string, string> = {
    sleep: "goal.sleep", energy: "goal.energy", focus: "goal.focus",
    stress: "goal.stress", sport: "goal.sport", muscle: "goal.muscle",
    weight_loss: "goal.weightLoss", digestion: "goal.digestion",
    immunity: "goal.immunity", skin_hair: "goal.skinHair",
  };

  const dietMap: Record<string, string> = {
    omnivore: "diet.omnivore", vegetarian: "diet.vegetarian", vegan: "diet.vegan",
    halal: "diet.halal", keto: "diet.keto", gluten_free: "diet.glutenFree",
    lactose_free: "diet.lactoseFree", unknown: "diet.unknown",
  };

  const activityLabels: Record<string, string> = {
    "0-1": "0-1x/week", "2-3": "2-3x/week", "4-5": "4-5x/week", "6+": "6x+/week",
  };

  const budgetMap: Record<string, string> = {
    standard: "budget.standard", premium: "budget.premium", elite: "budget.elite",
  };

  const sections = [
    {
      icon: Target,
      label: t('healthProfile.goals'),
      content: healthProfile.health_goals?.length ? (
        <div className="flex flex-wrap gap-2">
          {healthProfile.health_goals.map((goal) => (
            <Badge key={goal} variant="secondary">
              {goalMap[goal] ? t(goalMap[goal]) : goal}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">{t('healthProfile.notDefined')}</span>
      ),
    },
    {
      icon: MapPin,
      label: t('healthProfile.country'),
      content: healthProfile.shipping_country || t('healthProfile.notDefined'),
    },
    {
      icon: Dumbbell,
      label: t('healthProfile.activity'),
      content: healthProfile.activity_level
        ? activityLabels[healthProfile.activity_level] || healthProfile.activity_level
        : t('healthProfile.notDefined'),
    },
    {
      icon: Moon,
      label: t('healthProfile.sleep'),
      content: healthProfile.sleep_hours
        ? `${healthProfile.sleep_hours} • ${t('healthProfile.quality')}: ${healthProfile.sleep_quality_score || "-"}/5`
        : t('healthProfile.notDefined'),
    },
    {
      icon: Utensils,
      label: t('healthProfile.diet'),
      content: healthProfile.diet_type
        ? (dietMap[healthProfile.diet_type] ? t(dietMap[healthProfile.diet_type]) : healthProfile.diet_type)
        : t('healthProfile.notDefined'),
    },
    {
      icon: AlertTriangle,
      label: t('healthProfile.allergies'),
      content: healthProfile.allergies?.length ? (
        <div className="flex flex-wrap gap-2">
          {healthProfile.allergies.map((allergy) => (
            <Badge key={allergy} variant="outline" className="text-destructive border-destructive/30">
              {allergy}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground">{t('healthProfile.none')}</span>
      ),
    },
    {
      icon: Pill,
      label: t('healthProfile.preferences'),
      content: healthProfile.preferred_forms?.length ? (
        <div className="flex flex-wrap gap-2">
          {healthProfile.preferred_forms.map((form) => (
            <Badge key={form} variant="secondary">{form}</Badge>
          ))}
          {healthProfile.max_daily_intakes && (
            <Badge variant="outline">
              {healthProfile.max_daily_intakes} {t('healthProfile.intakesMax')}
            </Badge>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">{t('healthProfile.notDefined')}</span>
      ),
    },
    {
      icon: Wallet,
      label: t('healthProfile.budget'),
      content: healthProfile.monthly_budget
        ? (budgetMap[healthProfile.monthly_budget] ? t(budgetMap[healthProfile.monthly_budget]) : healthProfile.monthly_budget)
        : healthProfile.budget_range_min && healthProfile.budget_range_max
        ? `${healthProfile.budget_range_min}-${healthProfile.budget_range_max}€/${t('mystack.month')}`
        : t('healthProfile.notDefined'),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 md:p-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-medium text-foreground">
          {t('healthProfile.title')}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/onboarding?edit=true")}
          className="gap-2 w-full sm:w-auto"
        >
          <Edit3 className="w-4 h-4" />
          {t('healthProfile.edit')}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((section, index) => (
          <div key={index} className="p-4 rounded-xl bg-foreground/5 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <section.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{section.label}</span>
            </div>
            <div className="text-sm text-foreground">{section.content}</div>
          </div>
        ))}
      </div>

      {healthProfile.medications_notes && (
        <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            <strong>{t('healthProfile.medicalNote')}</strong> {healthProfile.medications_notes}
          </p>
        </div>
      )}
    </motion.div>
  );
}
