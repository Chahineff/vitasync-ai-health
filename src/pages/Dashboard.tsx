// Dashboard VitaSync - Premium SaaS Interface
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { Robot, Storefront, Gear, Question, SignOut, List, X, Bell, EnvelopeSimple, MagnifyingGlass, DeviceMobile, House, FirstAidKit, Crown, User, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import QuickCoachWidget from "@/components/dashboard/QuickCoachWidget";
import { SupplementTrackerEnhanced } from "@/components/dashboard/SupplementTrackerEnhanced";
import ProgressChart from "@/components/dashboard/ProgressChart";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ShopSection } from "@/components/dashboard/ShopSection";
import { Card } from "@/components/ui/card";
const vitasyncLogo = "/lovable-uploads/0eea2f50-2700-4e68-8bee-0e6a5d1bf128.png";
type Section = "home" | "coach" | "supplements" | "shop" | "settings" | "help";
const menuItems = [{
  id: "home" as Section,
  label: "Dashboard",
  icon: House
}, {
  id: "coach" as Section,
  label: "Coach IA",
  icon: Robot
}, {
  id: "supplements" as Section,
  label: "Suivi Compléments",
  icon: FirstAidKit
}, {
  id: "shop" as Section,
  label: "Boutique",
  icon: Storefront
}];
const generalItems = [{
  id: "settings" as Section,
  label: "Paramètres",
  icon: Gear
}, {
  id: "help" as Section,
  label: "Aide",
  icon: Question
}];
const Dashboard = () => {
  const {
    user,
    profile,
    loading,
    signOut
  } = useAuth();
  const {
    signedUrl: avatarUrl
  } = useAvatarUrl(profile?.avatar_url);
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
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, loading, navigate]);
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);
  const handleSectionChange = (section: Section) => {
    if (section === activeSection) return;
    setIsTransitioning(true);
    setSidebarOpen(false);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 150);
  };
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date().toLocaleDateString('fr-FR', options);
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>;
  }
  if (!user) return null;
  const userName = profile?.first_name || user?.email?.split("@")[0] || "Utilisateur";
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex w-full">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      {/* Sidebar - Fixed on all screens */}
      <aside className={`fixed inset-y-0 left-0 z-50 glass-sidebar flex flex-col transition-all duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
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
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-white/50">
            <X weight="light" className="w-5 h-5" />
          </button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:flex p-2 rounded-lg hover:bg-white/50 transition-all" title={sidebarCollapsed ? "Étendre" : "Réduire"}>
            {sidebarCollapsed ? <CaretRight weight="light" className="w-5 h-5 text-foreground/60" /> : <CaretLeft weight="light" className="w-5 h-5 text-foreground/60" />}
          </button>
        </div>

        <div className="px-4 flex-1">
          <p className={`px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : ''}`}>
            Menu
          </p>
          <nav className="space-y-1">
            {menuItems.map(item => <button key={item.id} onClick={() => handleSectionChange(item.id)} title={sidebarCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative ${activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/70 hover:bg-white/50 hover:text-foreground'}`}>
                {/* Active indicator bar */}
                {activeSection === item.id && <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />}
                <item.icon weight="light" className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                  {item.label}
                </span>
              </button>)}
          </nav>

          <p className={`px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 mt-8 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : ''}`}>
            Général
          </p>
          <nav className="space-y-1">
            {generalItems.map(item => <button key={item.id} onClick={() => handleSectionChange(item.id)} title={sidebarCollapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all relative ${activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/70 hover:bg-white/50'}`}>
                {activeSection === item.id && <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />}
                <item.icon weight="light" className="w-5 h-5 flex-shrink-0" />
                <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                  {item.label}
                </span>
              </button>)}
            <button onClick={handleSignOut} title={sidebarCollapsed ? "Déconnexion" : undefined} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all">
              <SignOut weight="light" className="w-5 h-5 flex-shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                Déconnexion
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
                <p className="text-sm font-medium text-foreground">App Mobile</p>
              </div>
            </div>
            <button disabled className="w-full mt-2 px-3 py-2 rounded-lg bg-foreground/5 text-foreground/40 text-xs font-medium cursor-not-allowed border border-white/10">
              Coming Soon
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
                <span className="text-xs text-foreground/50">Free Plan</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main - with margin-left to compensate for fixed sidebar */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        

        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          {isTransitioning ? <DashboardSkeleton /> : <AnimatePresence mode="wait">
              {activeSection === "home" && <DashboardHome key="home" userName={userName} formatDate={formatDate} onGoToCoach={() => handleSectionChange("coach")} hasInteractedWithCoach={hasInteractedWithCoach} />}
              {activeSection === "coach" && <motion.div key="coach" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }}>
                  <ChatInterface onFirstMessage={() => setHasInteractedWithCoach(true)} />
                </motion.div>}
              {activeSection === "supplements" && <motion.div key="supplements" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }} className="max-w-2xl">
                  <h2 className="text-2xl font-light tracking-tight text-foreground mb-6">Suivi des Compléments</h2>
                  <SupplementTrackerEnhanced showAwaitingState={!hasInteractedWithCoach} onStartDiagnostic={() => handleSectionChange("coach")} />
                </motion.div>}
              {activeSection === "shop" && <motion.div key="shop" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }} className="h-full">
                  <ShopSection />
                </motion.div>}
              {activeSection === "settings" && <motion.div key="settings" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }}>
                  <ProfileSection />
                </motion.div>}
              {activeSection === "help" && <motion.div key="help" initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0
          }}>
                  <HelpSection />
                </motion.div>}
            </AnimatePresence>}
        </div>
      </main>
    </div>;
};
interface DashboardHomeProps {
  userName: string;
  formatDate: () => string;
  onGoToCoach: () => void;
  hasInteractedWithCoach: boolean;
}
const DashboardHome = ({
  userName,
  formatDate,
  onGoToCoach,
  hasInteractedWithCoach
}: DashboardHomeProps) => <motion.div initial={{
  opacity: 0,
  y: 10
}} animate={{
  opacity: 1,
  y: 0
}} exit={{
  opacity: 0
}} className="space-y-6">
    <div className="mb-8">
      <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-1">
        Bonjour <span className="text-primary font-medium">{userName}</span>, prêt pour votre routine ?
      </h1>
      <p className="text-sm text-foreground/50 font-light capitalize">{formatDate()}</p>
    </div>
    <QuickCoachWidget onStartChat={onGoToCoach} userName={userName} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SupplementTrackerEnhanced showAwaitingState={!hasInteractedWithCoach} onStartDiagnostic={onGoToCoach} />
      <ProgressChart showAwaitingState={!hasInteractedWithCoach} onStartDiagnostic={onGoToCoach} />
    </div>
  </motion.div>;
const HelpSection = () => <div className="max-w-2xl">
    <h2 className="text-2xl font-light tracking-tight text-foreground mb-6">Centre d'aide</h2>
    <div className="space-y-4">
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-medium text-foreground mb-2">FAQ</h3>
        <p className="text-sm text-foreground/60 font-light mb-4">Retrouvez les réponses aux questions fréquentes.</p>
        <Link to="/#faq" className="text-sm text-primary hover:underline">Voir la FAQ →</Link>
      </div>
      <div className="glass-card-premium rounded-3xl p-6 border border-white/10">
        <h3 className="text-lg font-medium text-foreground mb-2">Contact</h3>
        <p className="text-sm text-foreground/60 font-light mb-4">Besoin d'aide ? Notre équipe est là pour vous.</p>
        <Link to="/contact" className="text-sm text-primary hover:underline">Nous contacter →</Link>
      </div>
    </div>
  </div>;
export default Dashboard;