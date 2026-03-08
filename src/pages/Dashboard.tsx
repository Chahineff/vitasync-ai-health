// Dashboard VitaSync - Premium SaaS Interface
import { useState, useEffect, useCallback } from "react";
import { SupplementAIInsights } from "@/components/dashboard/SupplementAIInsights";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { Robot, Storefront, Gear, Question, SignOut, X, Bell, EnvelopeSimple, MagnifyingGlass, DeviceMobile, House, FirstAidKit, Crown, User, CaretLeft, CaretRight, Package, TestTube, BookOpen, ChatCircleDots, Lifebuoy, MagnifyingGlass as SearchIcon } from "@phosphor-icons/react";
import { MyStackSection } from "@/components/dashboard/mystack";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import QuickCoachWidget from "@/components/dashboard/QuickCoachWidget";
import { SupplementTrackerEnhanced } from "@/components/dashboard/SupplementTrackerEnhanced";
import { MyStackPreviewWidget } from "@/components/dashboard/MyStackPreviewWidget";
import { AnalysesPreviewWidget } from "@/components/dashboard/AnalysesPreviewWidget";
import { AwaitingAnalysis } from "@/components/dashboard/AwaitingAnalysis";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ShopSection } from "@/components/dashboard/ShopSection";
import { ProductDetailSection } from "@/components/dashboard/ProductDetailSection";
import { DailyCheckin } from "@/components/dashboard/DailyCheckin";
import { DailyCheckinWidget } from "@/components/dashboard/DailyCheckinWidget";
import { BloodTestSection } from "@/components/dashboard/BloodTestSection";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { DashboardTutorial } from "@/components/dashboard/DashboardTutorial";
import { LogoutConfirmModal, LogoutFarewellOverlay } from "@/components/dashboard/LogoutConfirmModal";
import { HealthScoreWidget } from "@/components/dashboard/HealthScoreWidget";
import { WeeklyGoalsWidget } from "@/components/dashboard/WeeklyGoalsWidget";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";
type Section = "home" | "coach" | "supplements" | "shop" | "product" | "mystack" | "analyses" | "settings" | "help";

/* ── Welcome Overlay with typewriter + gradient glow ── */
function WelcomeOverlay() {
  const text = "Bienvenue dans votre dashboard";
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[55] bg-background flex flex-col items-center justify-center gap-6"
    >
      <motion.img
        src={vitasyncLogo}
        alt="VitaSync"
        className="w-16 h-16"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative"
      >
        {/* Glow behind text */}
        <div className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-[hsl(174,60%,50%)] to-[hsl(140,55%,45%)] rounded-full scale-150" />
        <h1
          className="relative text-3xl md:text-4xl font-light tracking-tight text-center bg-gradient-to-r from-[hsl(174,60%,50%)] via-[hsl(155,55%,48%)] to-[hsl(140,55%,45%)] bg-200% bg-clip-text text-transparent animate-gradient-shift"
        >
          {displayed}
          <span className="animate-cursor-blink text-primary">|</span>
        </h1>
      </motion.div>
    </motion.div>
  );
}
// Custom VitaSync icon component for Coach IA
const VitaSyncIcon = ({
  className,
  weight



}: {className?: string;weight?: string;}) => <img src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" alt="Coach IA" className={className || "w-5 h-5"} />;
const Dashboard = () => {
  const {
    t,
    locale
  } = useTranslation();
  const {
    user,
    profile,
    loading,
    signOut
  } = useAuth();
  const {
    signedUrl: avatarUrl
  } = useAvatarUrl(profile?.avatar_url);
  const {
    healthProfile,
    loading: healthProfileLoading,
    updateHealthProfile,
  } = useHealthProfile();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProductHandle, setSelectedProductHandle] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [welcomePhase, setWelcomePhase] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutPhase, setLogoutPhase] = useState(false);
  const menuItems = [{
    id: "home" as Section,
    label: t("dashboard.home"),
    icon: House
  }, {
    id: "coach" as Section,
    label: t("dashboard.coach"),
    icon: VitaSyncIcon
  }, {
    id: "supplements" as Section,
    label: t("dashboard.supplements"),
    icon: FirstAidKit
  }, {
    id: "shop" as Section,
    label: t("dashboard.shop"),
    icon: Storefront
  }, {
    id: "mystack" as Section,
    label: "Mon Stack",
    icon: Package
  }, {
    id: "analyses" as Section,
    label: "Mes Analyses",
    icon: TestTube
  }];
  const generalItems = [{
    id: "settings" as Section,
    label: t("dashboard.settings"),
    icon: Gear
  }, {
    id: "help" as Section,
    label: t("dashboard.help"),
    icon: Question
  }];

  // Redirect to auth if not logged in - but don't render until checked
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signin", { replace: true });
    }
  }, [user, loading, navigate]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && !healthProfileLoading && user && healthProfile && !healthProfile.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [user, loading, healthProfile, healthProfileLoading, navigate]);

  // Show tutorial after first load if not completed
  useEffect(() => {
    if (!loading && !healthProfileLoading && healthProfile && healthProfile.onboarding_completed && healthProfile.tutorial_completed === false) {
      // Delay slightly to let check-in modal appear first
      const timer = setTimeout(() => setShowTutorial(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading, healthProfileLoading, healthProfile]);

  // Listen for navigate-tab custom events from child components
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Section;
      if (detail) handleSectionChange(detail);
    };
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, []);

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleTutorialComplete = useCallback(async () => {
    setShowTutorial(false);
    setWelcomePhase(true);
    if (healthProfile) {
      await updateHealthProfile({ tutorial_completed: true } as any);
    }
    setTimeout(() => setWelcomePhase(false), 3000);
  }, [healthProfile, updateHealthProfile]);

  const handleRestartTutorial = useCallback(async () => {
    if (healthProfile) {
      await updateHealthProfile({ tutorial_completed: false } as any);
    }
    setShowTutorial(true);
  }, [healthProfile, updateHealthProfile]);

  // Early return: Show skeleton while loading or if no user (prevents flash of dashboard UI)
  // This comes AFTER all hooks to comply with React hooks rules
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    // Return skeleton during redirect to prevent flash of dashboard
    return <DashboardSkeleton />;
  }
  const handleSectionChange = (section: Section) => {
    if (section === activeSection && section !== "product") return;
    setIsTransitioning(true);
    setSidebarOpen(false);
    if (section !== "product") {
      setSelectedProductHandle(null);
    }
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 150);
  };
  const handleProductSelect = (handle: string) => {
    setSelectedProductHandle(handle);
    handleSectionChange("product");
  };
  const handleBackToShop = () => {
    setSelectedProductHandle(null);
    handleSectionChange("shop");
  };
  const handleSignOut = () => {
    setShowLogoutModal(true);
  };
  const confirmSignOut = async () => {
    setShowLogoutModal(false);
    setLogoutPhase(true);
    await signOut();
    setTimeout(() => navigate("/"), 1500);
  };
  const formatDate = () => {
    const localeMap = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES'
    };
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date().toLocaleDateString(localeMap[locale] || 'fr-FR', options);
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>;
  }
  if (!user) return null;
  const userName = profile?.first_name || user?.email?.split("@")[0] || "User";
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex w-full">
      {/* Daily Checkin Modal */}
      <DailyCheckin />
      {/* Dashboard Tutorial */}
      <AnimatePresence>
        {showTutorial && <DashboardTutorial onComplete={handleTutorialComplete} />}
      </AnimatePresence>
      {/* Welcome Phase Overlay */}
      <AnimatePresence>
        {welcomePhase && <WelcomeOverlay />}
      </AnimatePresence>
      {/* Logout Confirm Modal */}
      <LogoutConfirmModal open={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmSignOut} />
      {/* Logout Farewell Overlay */}
      <LogoutFarewellOverlay visible={logoutPhase} />
      {/* Sidebar - Hidden on mobile/tablet, visible on desktop */}
      <aside className={`fixed top-4 bottom-4 left-4 z-50 glass-sidebar-floating hidden lg:flex flex-col transition-all duration-300 ease-out ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Logo & Collapse Button */}
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className={`transition-opacity duration-300 flex items-center gap-2 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
            <img alt="VitaSync" className="w-8 h-8" src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" />
            <span className="text-xl font-light tracking-tight text-foreground whitespace-nowrap">
              Vita<span className="text-primary font-medium">Sync</span>
            </span>
          </Link>
          {sidebarCollapsed && <Link to="/" className="hidden lg:block">
              <img src="/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png" alt="VitaSync" className="w-8 h-8" />
            </Link>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-2 rounded-lg hover:bg-white/50 transition-all" title={sidebarCollapsed ? t("dashboard.expand") : t("dashboard.collapse")}>
            {sidebarCollapsed ? <CaretRight weight="light" className="w-5 h-5 text-foreground/60" /> : <CaretLeft weight="light" className="w-5 h-5 text-foreground/60" />}
          </button>
        </div>

        <div className="px-4 flex-1">
          <p className={`px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : ''}`}>
            {t("dashboard.menu")}
          </p>
          <nav className="space-y-1 relative">
            {menuItems.map((item) => {
              const displayActive = activeSection === "product" ? "shop" : activeSection;
              const isActive = displayActive === item.id;
              return (
                <button key={item.id} onClick={() => handleSectionChange(item.id)} title={sidebarCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative overflow-hidden ${isActive ? 'text-primary-foreground' : 'text-foreground/70 hover:bg-white/50 hover:text-foreground'}`}>
                  {/* Animated gradient background */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
                    />
                  )}
                  <item.icon weight="light" className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'brightness-0 invert' : ''}`} />
                  <span className={`transition-opacity duration-300 relative z-10 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <p className={`px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 mt-8 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : ''}`}>
            {t("dashboard.general")}
          </p>
          <nav className="space-y-1 relative">
            {generalItems.map((item) => {
              const displayActive = activeSection === "product" ? "shop" : activeSection;
              const isActive = displayActive === item.id;
              return (
                <button key={item.id} onClick={() => handleSectionChange(item.id)} title={sidebarCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative overflow-hidden ${isActive ? 'text-primary-foreground' : 'text-foreground/70 hover:bg-white/50'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicatorGeneral"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
                      }}
                      transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
                    />
                  )}
                  <item.icon weight="light" className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? 'brightness-0 invert' : ''}`} />
                  <span className={`transition-opacity duration-300 relative z-10 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
            <button onClick={handleSignOut} title={sidebarCollapsed ? t("dashboard.signout") : undefined} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all">
              <SignOut weight="light" className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                {t("dashboard.signout")}
              </span>
            </button>
          </nav>
        </div>

        {/* App Promo Card */}
        <div className={`px-4 mb-4 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:h-0 lg:overflow-hidden' : ''}`}>
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-white/10 rounded-xl p-4 backdrop-blur-[20px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <DeviceMobile weight="light" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("dashboard.mobileApp")}</p>
              </div>
            </div>
            <button disabled className="w-full mt-2 px-3 py-2 rounded-lg bg-foreground/5 text-foreground/40 text-xs font-medium cursor-not-allowed border border-white/10">
              {t("dashboard.comingSoon")}
            </button>
          </Card>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <User weight="light" className="w-5 h-5 text-white" />}
            </div>
            <div className={`flex-1 min-w-0 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-1">
                <Crown weight="fill" className="w-3 h-3 text-foreground/40" />
                <span className="text-xs text-foreground/50">{t("dashboard.freePlan")}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main - with margin-left to compensate for fixed sidebar */}
      <main className={`flex-1 flex flex-col h-screen max-h-screen transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'}`}>
        
        {/* Add padding bottom on mobile for bottom nav */}
        <div id="dashboard-scroll-container" className={`flex-1 overflow-x-hidden ${activeSection === 'coach' ? 'overflow-hidden p-0 pb-0 lg:p-4 lg:pb-4' : 'overflow-auto p-4 lg:p-8 pb-24 lg:pb-8'}`}>
          {isTransitioning ? <DashboardSkeleton /> : <AnimatePresence mode="wait">
              {activeSection === "home" && <DashboardHome key="home" userName={userName} formatDate={formatDate} onGoToCoach={() => handleSectionChange("coach")} onGoToShop={() => handleSectionChange("shop")} onGoToStack={() => handleSectionChange("mystack")} onGoToAnalyses={() => handleSectionChange("analyses")} />}
              {activeSection === "coach" && <motion.div key="coach" className="h-full" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <ChatInterface />
                </motion.div>}
              {activeSection === "supplements" && <motion.div key="supplements" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <h2 className="text-2xl font-light tracking-tight text-foreground mb-6">{t("dashboard.supplements")}</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                      <SupplementTrackerEnhanced />
                    </div>
                    <div className="lg:col-span-2">
                      <SupplementAIInsights />
                    </div>
                  </div>
                </motion.div>}
              {activeSection === "shop" && <motion.div key="shop" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="h-full">
                  <ShopSection onProductSelect={handleProductSelect} />
                </motion.div>}
              {activeSection === "product" && selectedProductHandle && <motion.div key="product" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="h-full">
                  <ProductDetailSection handle={selectedProductHandle} onBack={handleBackToShop} onProductSelect={handleProductSelect} />
                </motion.div>}
              {activeSection === "mystack" && <motion.div key="mystack" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <MyStackSection />
                </motion.div>}
              {activeSection === "analyses" && <motion.div key="analyses" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <BloodTestSection />
                </motion.div>}
              {activeSection === "settings" && <motion.div key="settings" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <ProfileSection onNavigateToHelp={() => handleSectionChange("help")} onSignOut={handleSignOut} onRestartTutorial={handleRestartTutorial} />
                </motion.div>}
              {activeSection === "help" && <motion.div key="help" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                  <HelpSection onGoToCoach={() => handleSectionChange("coach")} />
                </motion.div>}
            </AnimatePresence>}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeSection={activeSection} onSectionChange={handleSectionChange} onSignOut={handleSignOut} />
    </div>;
};
interface DashboardHomeProps {
  userName: string;
  formatDate: () => string;
  onGoToCoach: () => void;
  onGoToShop: () => void;
  onGoToStack: () => void;
  onGoToAnalyses: () => void;
}
const DashboardHome = ({
  userName,
  formatDate,
  onGoToCoach,
  onGoToShop,
  onGoToStack,
  onGoToAnalyses,
}: DashboardHomeProps) => {
  const {
    t
  } = useTranslation();
  return <motion.div initial={{
    opacity: 0,
    scale: 0.97,
    filter: "blur(6px)"
  }} animate={{
    opacity: 1,
    scale: 1,
    filter: "blur(0px)"
  }} exit={{
    opacity: 0
  }} className="space-y-6">
    <motion.div 
      className="mb-8 group cursor-default"
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.h1 
        className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-1 transition-all duration-500 group-hover:tracking-wide"
        whileHover={{ scale: 1.02, x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {t("dashboard.hello")}{" "}
        <motion.span 
          className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary font-semibold"
          initial={{ backgroundSize: "200% 100%", backgroundPosition: "100% 0" }}
          animate={{ backgroundPosition: "0% 0" }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        >
          {userName}
        </motion.span>
        <span className="inline-block ml-1">, {t("dashboard.readyForRoutine")}</span>
        <motion.span
          className="inline-block ml-2 origin-[70%_70%]"
          animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
        >
          👋
        </motion.span>
      </motion.h1>
      <motion.p 
        className="text-sm text-foreground/50 font-light capitalize"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {formatDate()}
      </motion.p>
    </motion.div>
    <HealthScoreWidget />
    <WeeklyGoalsWidget />
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.1 }}>
      <DailyCheckinWidget />
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.22 }}>
      <QuickCoachWidget onStartChat={onGoToCoach} userName={userName} />
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.34 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupplementTrackerEnhanced />
        <AwaitingAnalysis title="Boutique" onStartDiagnostic={onGoToShop} />
      </div>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.46 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyStackPreviewWidget onGoToStack={onGoToStack} />
        <AnalysesPreviewWidget onGoToAnalyses={onGoToAnalyses} />
      </div>
    </motion.div>
  </motion.div>;
};
const FAQ_DATA = [
  { category: "Compléments", q: "Comment ajouter un complément à mon suivi ?", a: "Rendez-vous dans la section 'Compléments', cliquez sur '+ Ajouter un complément', puis renseignez le nom, le dosage et le moment de prise." },
  { category: "Compléments", q: "Puis-je suivre des compléments non vendus sur VitaSync ?", a: "Oui ! Vous pouvez ajouter manuellement n'importe quel complément, même s'il ne fait pas partie de notre boutique." },
  { category: "Analyses", q: "Comment importer une analyse sanguine ?", a: "Allez dans 'Mes Analyses', cliquez sur 'Importer une analyse', puis uploadez votre PDF. Notre IA analysera les résultats en quelques secondes." },
  { category: "Analyses", q: "Mes données médicales sont-elles sécurisées ?", a: "Absolument. Vos données sont chiffrées, stockées sur des serveurs sécurisés, et accessibles uniquement par vous. Nous respectons le RGPD." },
  { category: "Coach IA", q: "Le Coach IA peut-il remplacer un médecin ?", a: "Non. Le Coach IA fournit des conseils de bien-être basés sur vos données, mais ne pose jamais de diagnostic. Consultez un professionnel pour tout problème de santé." },
  { category: "Coach IA", q: "Comment le Coach IA personnalise-t-il ses conseils ?", a: "Il utilise votre profil santé, vos check-ins quotidiens, vos analyses sanguines et votre stack actuel pour des recommandations sur mesure." },
  { category: "Compte", q: "Comment modifier mon profil santé ?", a: "Allez dans Paramètres, puis cliquez sur 'Modifier' dans la section Profil Santé pour relancer le questionnaire." },
  { category: "Compte", q: "Comment supprimer mon compte ?", a: "Dans Paramètres, descendez jusqu'à 'Vos données personnelles' puis cliquez sur 'Supprimer mon compte'. L'action est irréversible." },
  { category: "Mon Stack", q: "Qu'est-ce que le Stack Mensuel ?", a: "C'est votre sélection personnalisée de compléments, construite avec l'aide du Coach IA, livrée chaque mois avec -10% d'abonnement." },
  { category: "Mon Stack", q: "Comment modifier ma commande mensuelle ?", a: "Depuis 'Mon Stack', vous pouvez ajouter, retirer ou modifier les quantités de chaque produit à tout moment." },
];

const QUICK_GUIDES = [
  { num: "01", title: "Ajouter un complément", desc: "Depuis la section Compléments, ajoutez votre stack et suivez vos prises quotidiennes.", icon: FirstAidKit },
  { num: "02", title: "Importer une analyse", desc: "Uploadez votre PDF d'analyse sanguine pour une lecture automatique par l'IA.", icon: TestTube },
  { num: "03", title: "Utiliser le Coach IA", desc: "Posez vos questions santé, demandez des recommandations personnalisées.", icon: ChatCircleDots },
  { num: "04", title: "Construire mon stack", desc: "Créez votre abonnement mensuel avec les produits recommandés par le Coach.", icon: Package },
];

interface HelpSectionProps {
  onGoToCoach?: () => void;
}

const HelpSection = ({ onGoToCoach }: HelpSectionProps) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [...new Set(FAQ_DATA.map(f => f.category))];
  const filtered = FAQ_DATA.filter(f => {
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || f.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-light tracking-tight text-foreground mb-2">{t("help.title")}</h2>
        <p className="text-foreground/50 text-sm">Trouvez des réponses, des guides et de l'aide</p>
      </div>

      {/* Quick Guides */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen weight="fill" className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Guides rapides</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_GUIDES.map((guide, i) => (
            <motion.div
              key={guide.num}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-4 hover:border-primary/30 transition-colors group cursor-default"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <guide.icon weight="light" className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-primary/60 font-mono mb-0.5">{guide.num}</p>
                  <p className="text-sm font-medium text-foreground mb-1">{guide.title}</p>
                  <p className="text-xs text-foreground/50 leading-relaxed">{guide.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Question weight="fill" className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Questions fréquentes</h3>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <SearchIcon weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la FAQ..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border/30 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-foreground/50 hover:bg-muted/50'}`}
          >
            Tout
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-foreground/50 hover:bg-muted/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <Accordion type="multiple" className="space-y-2">
          {filtered.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-2xl border border-border/30 px-4 overflow-hidden">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                <div className="flex items-center gap-2 text-left">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 flex-shrink-0">{faq.category}</span>
                  <span>{faq.q}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-foreground/60 leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-foreground/40 text-center py-8">Aucun résultat pour "{search}"</p>
          )}
        </Accordion>
      </div>

      {/* Contact + Coach IA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/contact" className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-colors group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lifebuoy weight="light" className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground">Nous contacter</h3>
          </div>
          <p className="text-xs text-foreground/50">Une question ? Notre équipe est là pour vous aider.</p>
        </Link>

        {onGoToCoach && (
          <button onClick={onGoToCoach} className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-colors group text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <img src={vitasyncLogo} alt="" className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-foreground">Demander au Coach IA</h3>
            </div>
            <p className="text-xs text-foreground/50">Posez votre question directement au Coach pour une aide personnalisée.</p>
          </button>
        )}
      </div>
    </motion.div>
  );
};
export default Dashboard;