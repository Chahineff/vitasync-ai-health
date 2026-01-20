// Dashboard VitaSync - Premium SaaS Interface
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { 
  Robot, 
  Storefront, 
  Gear,
  Question,
  SignOut,
  List,
  X,
  Bell,
  EnvelopeSimple,
  MagnifyingGlass,
  DeviceMobile,
  House,
  FirstAidKit,
  Crown,
  User
} from "@phosphor-icons/react";
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import QuickCoachWidget from "@/components/dashboard/QuickCoachWidget";
import SupplementTracker from "@/components/dashboard/SupplementTracker";
import ProgressChart from "@/components/dashboard/ProgressChart";

type Section = "home" | "coach" | "supplements" | "shop" | "settings" | "help";

const menuItems = [
  { id: "home" as Section, label: "Dashboard", icon: House },
  { id: "coach" as Section, label: "Coach IA", icon: Robot },
  { id: "supplements" as Section, label: "Suivi Compléments", icon: FirstAidKit },
  { id: "shop" as Section, label: "Boutique", icon: Storefront, comingSoon: true },
];

const generalItems = [
  { id: "settings" as Section, label: "Paramètres", icon: Gear },
  { id: "help" as Section, label: "Aide", icon: Question },
];

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?mode=signin");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    };
    return new Date().toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const userName = profile?.first_name || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-sidebar flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between">
          <span className="text-xl font-light tracking-tight text-foreground">
            Vita<span className="text-primary font-medium">Sync</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-lg hover:bg-white/50">
            <X weight="light" className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 flex-1">
          <p className="px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3">Menu</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { if (!item.comingSoon) { setActiveSection(item.id); setSidebarOpen(false); } }}
                disabled={item.comingSoon}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all ${
                  activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20'
                    : item.comingSoon ? 'text-foreground/30 cursor-not-allowed'
                    : 'text-foreground/70 hover:bg-white/50 hover:text-foreground'
                }`}
              >
                <item.icon weight="light" className="w-5 h-5" />
                <span>{item.label}</span>
                {item.comingSoon && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-foreground/10">Bientôt</span>}
              </button>
            ))}
          </nav>

          <p className="px-3 text-xs font-medium text-foreground/40 uppercase tracking-wider mb-3 mt-8">Général</p>
          <nav className="space-y-1">
            {generalItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light transition-all ${
                  activeSection === item.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-foreground/70 hover:bg-white/50'
                }`}
              >
                <item.icon weight="light" className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all">
              <SignOut weight="light" className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </nav>
        </div>

        <div className="px-4 mb-4">
          <div className="glass-card-premium rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <DeviceMobile weight="light" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">App Mobile</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-4">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-light text-foreground/60 hover:text-foreground hover:bg-white/50 transition-all">
            <House weight="light" className="w-4 h-4" />
            <span>Retour au site</span>
          </Link>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <User weight="light" className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-1">
                <Crown weight="fill" className="w-3 h-3 text-foreground/40" />
                <span className="text-xs text-foreground/50">Free Plan</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 glass-card-premium border-b border-white/10 px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/50">
              <List weight="light" className="w-6 h-6" />
            </button>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 border border-white/20 text-sm font-light placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl bg-white/50 border border-white/20 hover:bg-white/70 relative">
                <Bell weight="light" className="w-5 h-5 text-foreground/60" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>
              <button className="p-2.5 rounded-xl bg-white/50 border border-white/20 hover:bg-white/70">
                <EnvelopeSimple weight="light" className="w-5 h-5 text-foreground/60" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            {activeSection === "home" && <DashboardHome key="home" userName={userName} formatDate={formatDate} onGoToCoach={() => setActiveSection("coach")} />}
            {activeSection === "coach" && <motion.div key="coach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><ChatInterface /></motion.div>}
            {activeSection === "supplements" && <motion.div key="supplements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl"><h2 className="text-2xl font-light tracking-tight text-foreground mb-6">Suivi des Compléments</h2><SupplementTracker /></motion.div>}
            {activeSection === "settings" && <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><ProfileSection /></motion.div>}
            {activeSection === "help" && <motion.div key="help" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><HelpSection /></motion.div>}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const DashboardHome = ({ userName, formatDate, onGoToCoach }: { userName: string; formatDate: () => string; onGoToCoach: () => void }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
    <div className="mb-8">
      <h1 className="text-2xl lg:text-3xl font-light tracking-tight text-foreground mb-1">
        Bonjour <span className="text-primary font-medium">{userName}</span>, prêt pour votre routine ?
      </h1>
      <p className="text-sm text-foreground/50 font-light capitalize">{formatDate()}</p>
    </div>
    <QuickCoachWidget onStartChat={onGoToCoach} userName={userName} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <SupplementTracker />
      <ProgressChart />
    </div>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="relative glass-card-premium rounded-2xl p-6 overflow-hidden">
      <div className="absolute inset-0 backdrop-blur-sm bg-white/60 z-10 flex items-center justify-center">
        <div className="text-center">
          <Storefront weight="light" className="w-12 h-12 text-foreground/30 mx-auto mb-3" />
          <p className="text-lg font-light text-foreground/60">Boutique</p>
          <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">Coming Soon</span>
        </div>
      </div>
      <h3 className="text-lg font-light tracking-tight text-foreground/30 mb-4">Recommandations pour vous</h3>
      <div className="grid grid-cols-3 gap-4 opacity-30">{[1, 2, 3].map((i) => <div key={i} className="aspect-square rounded-xl bg-white/30" />)}</div>
    </motion.div>
  </motion.div>
);

const HelpSection = () => (
  <div className="max-w-2xl">
    <h2 className="text-2xl font-light tracking-tight text-foreground mb-6">Centre d'aide</h2>
    <div className="space-y-4">
      <div className="glass-card-premium rounded-xl p-6">
        <h3 className="text-lg font-medium text-foreground mb-2">FAQ</h3>
        <p className="text-sm text-foreground/60 font-light mb-4">Retrouvez les réponses aux questions fréquentes.</p>
        <Link to="/" className="text-sm text-primary hover:underline">Voir la FAQ →</Link>
      </div>
      <div className="glass-card-premium rounded-xl p-6">
        <h3 className="text-lg font-medium text-foreground mb-2">Contact</h3>
        <p className="text-sm text-foreground/60 font-light mb-4">Besoin d'aide ? Notre équipe est là pour vous.</p>
        <Link to="/contact" className="text-sm text-primary hover:underline">Nous contacter →</Link>
      </div>
    </div>
  </div>
);

export default Dashboard;
