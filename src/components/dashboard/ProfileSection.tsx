import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, SpinnerGap, Check } from "@phosphor-icons/react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function ProfileSection() {
  const { user, profile, updateProfile, uploadAvatar } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Type de fichier invalide",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5 Mo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    const { error } = await uploadAvatar(file);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été modifiée.",
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
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées.",
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
    >
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Mon Profil
      </h1>
      <p className="text-foreground/60 mb-8">
        Gérez vos informations personnelles
      </p>

      <div className="glass-card rounded-2xl p-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary-foreground font-semibold text-3xl">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              {isUploadingAvatar && (
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
            Cliquez pour changer votre photo
          </p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm text-foreground/70 mb-2">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Votre prénom"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm text-foreground/70 mb-2">
                Nom
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Votre nom"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-foreground/70 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border-0 text-foreground/50 cursor-not-allowed"
            />
            <p className="text-xs text-foreground/40 mt-1">
              L'email ne peut pas être modifié
            </p>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm text-foreground/70 mb-2">
              Date de naissance
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
                {age} ans
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
                Enregistrement...
              </>
            ) : (
              <>
                <Check size={20} weight="light" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
