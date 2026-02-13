// Dashboard VitaSync - Premium SaaS Interface
import { useState, useEffect } from "react";
import { SupplementAIInsights } from "@/components/dashboard/SupplementAIInsights";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { Robot, Storefront, Gear, Question, SignOut, X, Bell, EnvelopeSimple, MagnifyingGlass, DeviceMobile, House, FirstAidKit, Crown, User, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import QuickCoachWidget from "@/components/dashboard/QuickCoachWidget";
import { SupplementTrackerEnhanced } from "@/components/dashboard/SupplementTrackerEnhanced";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ShopSection } from "@/components/dashboard/ShopSection";
import { ProductDetailSection } from "@/components/dashboard/ProductDetailSection";
import { DailyCheckin } from "@/components/dashboard/DailyCheckin";
import { DailyCheckinWidget } from "@/components/dashboard/DailyCheckinWidget";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { Card } from "@/components/ui/card";
const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";
type Section = "home" | "coach" | "supplements" | "shop" | "product" | "settings" | "help";
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
    loading: healthProfileLoading
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
  const [hasInteractedWithCoach, setHasInteractedWithCoach] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedProductHandle, setSelectedProductHandle] = useState<string | null>(null);
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

  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

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
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
          <nav className="space-y-1">
            {menuItems.map((item) => <button key={item.id} onClick={() => handleSectionChange(item.id)} title={sidebarCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative ${activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/70 hover:bg-white/50 hover:text-foreground'}`}>
                {/* Active indicator bar */}
                {activeSection === item.id}
                <item.icon weight="light" className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                  {item.label}
                </span>
              </button>)}
          </nav>

          <p className={`px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 mt-8 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : ''}`}>
            {t("dashboard.general")}
          </p>
          <nav className="space-y-1">
            {generalItems.map((item) => <button key={item.id} onClick={() => handleSectionChange(item.id)} title={sidebarCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative ${activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/70 hover:bg-white/50'}`}>
                {activeSection === item.id}
                <item.icon weight="light" className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                  {item.label}
                </span>
              </button>)}
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
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-80'}`}>
        
        {/* Add padding bottom on mobile for bottom nav */}
        <div id="dashboard-scroll-container" className={`flex-1 overflow-auto overflow-x-hidden ${activeSection === 'coach' ? 'p-0 pb-0 lg:p-8 lg:pb-8' : 'p-4 lg:p-8 pb-24 lg:pb-8'}`}>
          {isTransitioning ? <DashboardSkeleton /> : <AnimatePresence mode="wait">
              {activeSection === "home" && <DashboardHome key="home" userName={userName} formatDate={formatDate} onGoToCoach={() => handleSectionChange("coach")} onGoToShop={() => handleSectionChange("shop")} hasInteractedWithCoach={hasInteractedWithCoach} />}
              {activeSection === "coach" && <motion.div key="coach" initial={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(6px)"
          }} animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }} exit={{
            opacity: 0
          }}>
                  <ChatInterface onFirstMessage={() => setHasInteractedWithCoach(true)} />
                </motion.div>}
              {activeSection === "supplements" && <motion.div key="supplements" initial={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(6px)"
          }} animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }} exit={{
            opacity: 0
          }}>
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
              {activeSection === "shop" && <motion.div key="shop" initial={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(6px)"
          }} animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }} exit={{
            opacity: 0
          }} className="h-full">
                  <ShopSection onProductSelect={handleProductSelect} />
                </motion.div>}
              {activeSection === "product" && selectedProductHandle && <motion.div key="product" initial={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(6px)"
          }} animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }} exit={{
            opacity: 0
          }} className="h-full">
                  <ProductDetailSection handle={selectedProductHandle} onBack={handleBackToShop} onProductSelect={handleProductSelect} />
                </motion.div>}
              {activeSection === "settings" && <motion.div key="settings" initial={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(6px)"
          }} animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }} exit={{
            opacity: 0
          }}>
                  <ProfileSection onNavigateToHelp={() => handleSectionChange("help")} onSignOut={handleSignOut} />
                </motion.div>}
              {activeSection === "help" && <motion.div key="help" initial={{
            opacity: 0,
            scale: 0.97,
            filter: "blur(6px)"
          }} animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)"
          }} exit={{
            opacity: 0
          }}>
                  <HelpSection />
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
  hasInteractedWithCoach: boolean;
}
const DashboardHome = ({
  userName,
  formatDate,
  onGoToCoach,
  onGoToShop,
  hasInteractedWithCoach
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
    <div className="mb-8">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-1">
        {t("dashboard.hello")} <span className="text-primary font-medium">{userName}</span>, {t("dashboard.readyForRoutine")}
      </h1>
      <p className="text-sm text-foreground/50 font-light capitalize">{formatDate()}</p>
    </div>
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.1 }}>
      <DailyCheckinWidget />
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.22 }}>
      <QuickCoachWidget onStartChat={onGoToCoach} userName={userName} />
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.34 }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SupplementTrackerEnhanced />
        <ProgressChart showAwaitingState={!hasInteractedWithCoach} onStartDiagnostic={onGoToShop} />
      </div>
    </motion.div>
  </motion.div>;
};
const HelpSection = () => {
  const {
    t
  } = useTranslation();
  return <div className="max-w-2xl">
    <h2 className="text-2xl font-light tracking-tight text-foreground mb-6">{t("help.title")}</h2>
    <div className="space-y-4">
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-medium text-foreground mb-2">{t("help.faq")}</h3>
        <p className="text-sm text-foreground/60 font-light mb-4">{t("help.faqDesc")}</p>
        <Link to="/#faq" className="text-sm text-primary hover:underline">{t("help.viewFaq")}</Link>
      </div>
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-medium text-foreground mb-2">{t("help.contact")}</h3>
        <p className="text-sm text-foreground/60 font-light mb-4">{t("help.contactDesc")}</p>
        <Link to="/contact" className="text-sm text-primary hover:underline">{t("help.contactUs")}</Link>
      </div>
    </div>
  </div>;
};
export default Dashboard;