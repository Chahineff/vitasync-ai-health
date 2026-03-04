import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, SpinnerGap, Check, Globe, Question, SignOut, ArrowClockwise, DownloadSimple, Trash, Warning } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/useTranslation";
import { useI18n } from "@/hooks/useTranslation";
import { languages, type Locale } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";
import { HealthProfileSection } from "./HealthProfileSection";
import { cn } from "@/lib/utils";

interface ProfileSectionProps {
  onNavigateToHelp?: () => void;
  onSignOut?: () => void;
  onRestartTutorial?: () => void;
}

export function ProfileSection({ onNavigateToHelp, onSignOut, onRestartTutorial }: ProfileSectionProps = {}) {
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

      {/* Restart Tutorial */}
      {onRestartTutorial && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ArrowClockwise weight="light" className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{t("settings.restartTutorial") || "Tutoriel"}</h3>
              <p className="text-sm text-foreground/50">{t("settings.restartTutorialDesc") || "Relancer la visite guidée du dashboard"}</p>
            </div>
          </div>
          <button
            onClick={onRestartTutorial}
            className="w-full px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            {t("settings.restartTutorialBtn") || "Relancer le tutoriel"}
          </button>
        </div>
      )}

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
