import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeSlash, SpinnerGap } from "@phosphor-icons/react";
import { useToast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable/index";
import { SplineBackground } from "@/components/sections/SplineBackground";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInYears, parse } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

const signInSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

const signUpSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(passwordRegex.uppercase, "Doit contenir au moins une majuscule")
    .regex(passwordRegex.lowercase, "Doit contenir au moins une minuscule")
    .regex(passwordRegex.digit, "Doit contenir au moins un chiffre")
    .regex(passwordRegex.special, "Doit contenir au moins un caractère spécial (!@#$...)"),
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  dateOfBirth: z.string().min(1, "La date de naissance est requise").refine((val) => {
    const dob = parse(val, "yyyy-MM-dd", new Date());
    return differenceInYears(new Date(), dob) >= 18;
  }, "Vous devez avoir au moins 18 ans pour créer un compte"),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Vous devez accepter les conditions d'utilisation" }) }),
});

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  
  const [isSignUp, setIsSignUp] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update isSignUp when URL changes
  useEffect(() => {
    setIsSignUp(mode === "signup");
  }, [mode]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isSignUp) {
        const result = signUpSchema.safeParse({ email, password, firstName, lastName, dateOfBirth, acceptTerms });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, firstName, lastName, dateOfBirth || undefined);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: t("auth.existingAccount"),
              description: t("auth.emailAlreadyUsed"),
              variant: "destructive",
            });
          } else {
            toast({
              title: t("auth.signupError"),
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: t("auth.accountCreated"),
            description: t("auth.accountCreatedDesc"),
          });
          navigate("/dashboard");
        }
      } else {
        const result = signInSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: t("auth.invalidCredentials"),
              description: t("auth.invalidCredentialsDesc"),
              variant: "destructive",
            });
          } else {
            toast({
              title: t("auth.loginError"),
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: t("auth.loginSuccess"),
            description: t("auth.loginSuccessDesc"),
          });
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast({
        title: t("common.error"),
        description: t("auth.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <SplineBackground />
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img 
              src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" 
              alt="VitaSync" 
              className="w-12 h-12"
            />
            <span className="text-2xl font-medium tracking-tight text-foreground">VitaSync</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl">
          <h1 className="text-2xl font-light tracking-tight text-foreground text-center mb-2">
            {isSignUp ? t("auth.createAccount") : t("auth.signIn")}
          </h1>
          <p className="text-foreground/60 text-center mb-8">
            {isSignUp ? t("auth.signupSubtitle") : t("auth.signinSubtitle")}
          </p>


          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm text-foreground/70 mb-2">
                    {t("auth.firstName")}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={t("auth.firstNamePlaceholder")}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm text-foreground/70 mb-2">
                    {t("auth.lastName")}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder={t("auth.lastNamePlaceholder")}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm text-foreground/70 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="votre@email.com"
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-foreground/70 mb-2">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
              {/* Password strength indicator (signup only) */}
              {isSignUp && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {(() => {
                    const checks = [
                      { label: t("auth.8chars"), ok: password.length >= 8 },
                      { label: t("auth.uppercase"), ok: passwordRegex.uppercase.test(password) },
                      { label: t("auth.lowercase"), ok: passwordRegex.lowercase.test(password) },
                      { label: t("auth.digit"), ok: passwordRegex.digit.test(password) },
                      { label: t("auth.specialChar"), ok: passwordRegex.special.test(password) },
                    ];
                    const score = checks.filter(c => c.ok).length;
                    const barColor = score <= 2 ? "bg-red-500" : score <= 3 ? "bg-yellow-500" : score <= 4 ? "bg-blue-500" : "bg-green-500";
                    return (
                      <>
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= score ? barColor : "bg-foreground/10"}`} />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {checks.map(c => (
                            <span key={c.label} className={`text-xs ${c.ok ? "text-green-500" : "text-foreground/40"}`}>
                              {c.ok ? "✓" : "○"} {c.label}
                            </span>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm text-foreground/70 mb-2">
                  {t("auth.dob")} <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-card bg-background border-0 text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {errors.dateOfBirth && <p className="text-sm text-destructive mt-1">{errors.dateOfBirth}</p>}
              </div>
            )}

            {isSignUp && (
              <div className="flex items-start gap-3 mt-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="acceptTerms" className="text-sm text-foreground/70 leading-snug cursor-pointer">
                  {t("auth.acceptTermsLabel")}{" "}
                  <Link to="/legal/terms" target="_blank" className="text-primary hover:underline">
                    {t("auth.termsOfUse")}
                  </Link>
                  {" "}{t("auth.and")}{" "}
                  <Link to="/legal/privacy" target="_blank" className="text-primary hover:underline">
                    {t("auth.privacyPolicy")}
                  </Link>
                  {" "}<span className="text-destructive">*</span>
                </label>
              </div>
            )}
            {errors.acceptTerms && <p className="text-sm text-destructive mt-1">{errors.acceptTerms}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-neumorphic text-primary-foreground w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <SpinnerGap size={20} className="animate-spin" />
                  {isSignUp ? t("auth.creating") : t("auth.connecting")}
                </span>
              ) : isSignUp ? (
                t("auth.createMyAccount")
              ) : (
                t("auth.signIn")
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-foreground/60 hover:text-primary transition-colors"
            >
              {isSignUp ? t("auth.alreadyAccount") : t("auth.noAccount")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
