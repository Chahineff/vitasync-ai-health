import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Camera, SpinnerGap, Check, Globe, Question, SignOut, ArrowClockwise, DownloadSimple, Trash, Warning, Lock, Eye, EyeSlash, CheckCircle, Circle } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useI18n } from "@/hooks/useTranslation";
import { languages, type Locale } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { HealthProfileSection } from "./HealthProfileSection";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useSupplementTracking } from "@/hooks/useSupplementTracking";
import { cn } from "@/lib/utils";
import { Bell } from "@phosphor-icons/react";
import { Switch } from "@/components/ui/switch";

function NotificationPreferences() {
  const { toast } = useToast();
  const { healthProfile, updateHealthProfile } = useHealthProfile();
  const [suppReminders, setSuppReminders] = useState(true);
  const [analysisReady, setAnalysisReady] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (healthProfile && !loaded) {
      setSuppReminders((healthProfile as any).notify_supplement_reminders ?? true);
      setAnalysisReady((healthProfile as any).notify_analysis_ready ?? true);
      setWeeklySummary((healthProfile as any).notify_weekly_summary ?? false);
      setLoaded(true);
    }
  }, [healthProfile, loaded]);

  const toggle = async (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    await updateHealthProfile({ [key]: value } as any);
    toast({ title: "Préférence mise à jour" });
  };

  const prefs = [
    { key: "notify_supplement_reminders", label: "Rappels de compléments", desc: "Matin, midi et soir", value: suppReminders, setter: setSuppReminders },
    { key: "notify_analysis_ready", label: "Analyse prête", desc: "Quand vos résultats sont disponibles", value: analysisReady, setter: setAnalysisReady },
    { key: "notify_weekly_summary", label: "Résumé hebdomadaire", desc: "Récap de votre semaine par email", value: weeklySummary, setter: setWeeklySummary },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell weight="light" className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Notifications</h3>
          <p className="text-sm text-foreground/50">Gérez vos préférences de notification</p>
        </div>
      </div>
      <div className="space-y-4">
        {prefs.map(pref => (
          <div key={pref.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{pref.label}</p>
              <p className="text-xs text-foreground/40">{pref.desc}</p>
            </div>
            <Switch
              checked={pref.value}
              onCheckedChange={(v) => toggle(pref.key, v, pref.setter)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProfileSectionProps {
  onNavigateToHelp?: () => void;
  onSignOut?: () => void;
}

export function ProfileSection({ onNavigateToHelp, onSignOut }: ProfileSectionProps = {}) {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const { signedUrl: avatarUrl, isLoading: isLoadingAvatar } = useAvatarUrl(profile?.avatar_url);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { locale, setLocale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { healthProfile } = useHealthProfile();
  const { supplements } = useSupplementTracking();

  // Profile completion
  const completionItems = useMemo(() => {
    const items = [
      { label: "Photo de profil", done: !!profile?.avatar_url },
      { label: "Nom & prénom", done: !!(profile?.first_name && profile?.last_name) },
      { label: "Date de naissance", done: !!profile?.date_of_birth },
      { label: "Profil santé", done: !!healthProfile?.onboarding_completed },
      { label: "Premier complément", done: supplements.length > 0 },
    ];
    return items;
  }, [profile, healthProfile, supplements]);

  const completionPct = useMemo(() => {
    const done = completionItems.filter(i => i.done).length;
    return Math.round((done / completionItems.length) * 100);
  }, [completionItems]);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Mot de passe trop court", description: "Minimum 6 caractères.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Mots de passe différents", description: "Les deux mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Mot de passe modifié", description: "Votre nouveau mot de passe est actif." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
  };

  // Sync state when profile changes
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setDateOfBirth(profile.date_of_birth || "");
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("settings.invalidFileType"),
        description: t("settings.selectImage"),
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t("settings.fileTooLarge"),
        description: t("settings.maxFileSize"),
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    const { error } = await uploadAvatar(file);

    if (error) {
      toast({
        title: t("common.error"),
        description: t("settings.uploadError"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("settings.photoUpdated"),
        description: t("settings.photoUpdatedDesc"),
      });
    }

    setIsUploadingAvatar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const { error } = await updateProfile({
      first_name: firstName || null,
      last_name: lastName || null,
      date_of_birth: dateOfBirth || null,
    });

    if (error) {
      toast({
        title: t("common.error"),
        description: t("settings.updateError"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("settings.profileUpdated"),
        description: t("settings.profileUpdatedDesc"),
      });
    }

    setIsUpdating(false);
  };

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "U";

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          {t("settings.title")}
        </h1>
        <p className="text-foreground/60 mb-8">
          {t("settings.subtitle")}
        </p>
      </div>

      {/* Profile Completion Bar */}
      {completionPct < 100 && (
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Profil {completionPct}% complet</h3>
            <span className="text-xs text-primary font-medium">{completionItems.filter(i => i.done).length}/{completionItems.length}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${completionPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {completionItems.filter(i => !i.done).map(item => (
              <span key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Circle weight="bold" className="w-3 h-3" />
                {item.label}
              </span>
            ))}
            {completionItems.filter(i => i.done).map(item => (
              <span key={item.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 text-foreground/40 text-xs">
                <CheckCircle weight="fill" className="w-3 h-3 text-primary" />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Language Selector */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe weight="light" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{t("settings.language")}</h3>
            <p className="text-sm text-foreground/50">{t("settings.languageSubtitle")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code as Locale)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all border",
                locale === lang.code
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 text-foreground/70 border-border/50 hover:border-primary/50"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>




      <div className="glass-card rounded-2xl p-4 md:p-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-semibold text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              {(isUploadingAvatar || isLoadingAvatar) && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                  <SpinnerGap size={24} className="animate-spin text-primary" />
                </div>
              )}
            </div>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Camera size={16} weight="light" />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          <p className="text-sm text-foreground/50 mt-3">
            {t("settings.avatarChange")}
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm text-foreground/70 mb-2">
                {t("settings.firstName")}
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t("settings.firstName")}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm text-foreground/70 mb-2">
                {t("settings.lastName")}
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder={t("settings.lastName")}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-foreground/70 mb-2">
              {t("settings.email")}
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground/50 cursor-not-allowed"
            />
            <p className="text-xs text-foreground/40 mt-1">
              {t("settings.emailCantChange")}
            </p>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm text-foreground/70 mb-2">
              {t("settings.dateOfBirth")}
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {age !== null && (
              <p className="text-sm text-foreground/50 mt-1">
                {age} {t("settings.years")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="btn-neumorphic text-primary-foreground w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUpdating ? (
              <>
                <SpinnerGap size={20} className="animate-spin" />
                {t("settings.saving")}
              </>
            ) : (
              <>
                <Check size={20} weight="light" />
                {t("settings.save")}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Health Profile Section */}
      <HealthProfileSection />

      {/* Security - Password Change */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock weight="light" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Sécurité</h3>
            <p className="text-sm text-foreground/50">Changer votre mot de passe</p>
          </div>
        </div>
        <div className="space-y-3 max-w-md">
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
              className="w-full px-4 py-3 pr-10 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/60"
            >
              {showNewPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {newPassword && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    newPassword.length < 6 ? "w-1/4 bg-destructive" :
                    newPassword.length < 10 ? "w-1/2 bg-yellow-500" :
                    "w-full bg-primary"
                  )}
                />
              </div>
              <span className="text-xs text-foreground/40">
                {newPassword.length < 6 ? "Faible" : newPassword.length < 10 ? "Moyen" : "Fort"}
              </span>
            </div>
          )}
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirmer le mot de passe"
            className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !newPassword || !confirmPassword}
            className="w-full px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isChangingPassword ? <SpinnerGap size={16} className="animate-spin" /> : <Lock size={16} />}
            {isChangingPassword ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <NotificationPreferences />

      {/* GDPR: Data Export & Account Deletion */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <DownloadSimple weight="light" className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Vos données personnelles</h3>
            <p className="text-sm text-foreground/50">RGPD — Art. 15 & 17</p>
          </div>
        </div>

        <button
          onClick={async () => {
            setIsExporting(true);
            try {
              const { data, error } = await supabase.functions.invoke("user-data-export");
              if (error) throw error;
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `vitasync-export-${new Date().toISOString().split("T")[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: "Export terminé", description: "Vos données ont été téléchargées." });
            } catch {
              toast({ title: "Erreur", description: "Impossible d'exporter vos données.", variant: "destructive" });
            } finally {
              setIsExporting(false);
            }
          }}
          disabled={isExporting}
          className="w-full px-4 py-3 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isExporting ? <SpinnerGap size={18} className="animate-spin" /> : <DownloadSimple size={18} />}
          {isExporting ? t("settings.exportInProgress") : t("settings.exportData")}
        </button>

        <div className="border-t border-border/50 pt-4">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash size={18} />
              Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <Warning size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  Cette action est <strong>irréversible</strong>. Toutes vos données, conversations, analyses et fichiers seront définitivement supprimés.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium border border-border/50 hover:bg-muted/80 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    setIsDeleting(true);
                    try {
                      const { error } = await supabase.functions.invoke("delete-account", {
                        body: { confirm: true },
                      });
                      if (error) throw error;
                      toast({ title: "Compte supprimé", description: "Votre compte a été supprimé." });
                      window.location.href = "/";
                    } catch {
                      toast({ title: "Erreur", description: "Impossible de supprimer le compte.", variant: "destructive" });
                    } finally {
                      setIsDeleting(false);
                    }
                  }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? <SpinnerGap size={16} className="animate-spin" /> : <Trash size={16} />}
                  {isDeleting ? "Suppression..." : "Confirmer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet only: Help Center & Sign Out */}
      {(onNavigateToHelp || onSignOut) && (
        <div className="lg:hidden space-y-3 pt-4">
          {onNavigateToHelp && (
            <button
              onClick={onNavigateToHelp}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl glass-card text-foreground/70 hover:text-foreground transition-all min-h-[48px]"
            >
              <Question weight="light" className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-light">{t("dashboard.help")}</span>
            </button>
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl glass-card text-destructive hover:bg-destructive/10 transition-all min-h-[48px]"
            >
              <SignOut weight="light" className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-light">{t("dashboard.signout")}</span>
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
