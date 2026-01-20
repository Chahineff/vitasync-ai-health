import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { 
  Robot, 
  Storefront, 
  CreditCard, 
  Gear,
  Question,
  SignOut,
  List,
  X,
  Bell,
  EnvelopeSimple,
  MagnifyingGlass,
  DeviceMobile,
  Globe,
  House
} from "@phosphor-icons/react";

// Menu sections - Main navigation
const menuItems = [
  { id: "home", label: "Dashboard", icon: House },
  { id: "coach", label: "Coach IA", icon: Robot },
  { id: "shop", label: "Boutique", icon: Storefront },
  { id: "payments", label: "Historique Paiements", icon: CreditCard },
];

// General section
const generalItems = [
  { id: "settings", label: "Settings", icon: Gear },
  { id: "help", label: "Help", icon: Question },
];

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        className={`fixed lg:static lg:translate-x-0 top-0 left-0 h-full w-64 bg-background border-r border-border/50 z-50 lg:z-auto flex flex-col transition-transform lg:transition-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header - Logo */}
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold">V</span>
              </div>
              <span className="text-lg font-medium text-foreground">VitaSync</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          {/* MENU Section */}
          <div className="mb-6">
            <p className="px-3 mb-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Menu
            </p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      weight={activeSection === item.id ? "fill" : "regular"} 
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* GENERAL Section */}
          <div className="mb-6">
            <p className="px-3 mb-3 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              General
            </p>
            <ul className="space-y-1">
              {generalItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                      activeSection === item.id
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <item.icon 
                      size={20} 
                      weight={activeSection === item.id ? "fill" : "regular"} 
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
              {/* Logout button */}
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all text-sm"
                >
                  <SignOut size={20} weight="regular" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Footer - Mobile App Banner & Website Link */}
        <div className="p-3 space-y-2">
          {/* Mobile App Coming Soon */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 text-center border border-primary/20">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <DeviceMobile size={22} className="text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Application Mobile</p>
            <p className="text-xs text-foreground/60 mb-3">Bientôt disponible</p>
            <button 
              disabled
              className="w-full py-2 px-4 rounded-xl bg-primary/20 text-primary text-xs font-medium cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>

          {/* Website Link */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 hover:text-foreground transition-all text-sm font-medium"
          >
            <Globe size={18} />
            <span>Retour au site</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground/70 hover:text-foreground rounded-lg hover:bg-foreground/5"
            >
              <List size={22} />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Inbox */}
              <button className="relative p-2.5 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all">
                <EnvelopeSimple size={20} />
              </button>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 ml-2 pl-3 border-l border-border/50">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground leading-tight">{displayName}</p>
                  <p className="text-xs text-foreground/50">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden ring-2 ring-background">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary-foreground font-semibold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {activeSection === "home" && <DashboardHome />}
            {activeSection === "coach" && <CoachSection />}
            {activeSection === "shop" && <ShopSection />}
            {activeSection === "payments" && <PaymentsSection />}
            {activeSection === "settings" && <SettingsSection />}
            {activeSection === "help" && <HelpSection />}
          </div>
        </main>
      </div>
    </div>
  );
};

// Import components
import { ChatInterface } from "@/components/dashboard/ChatInterface";
import { ProfileSection } from "@/components/dashboard/ProfileSection";

// Dashboard Home Section
const DashboardHome = () => {
  const { profile } = useAuth();
  const displayName = profile?.first_name || "Utilisateur";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-foreground/60">
          Bienvenue, {displayName}. Voici un aperçu de votre santé.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-foreground/50 mb-1">Score Santé</p>
          <p className="text-3xl font-light text-foreground">87</p>
          <p className="text-xs text-secondary mt-1">+12% ce mois</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-foreground/50 mb-1">Conversations IA</p>
          <p className="text-3xl font-light text-foreground">12</p>
          <p className="text-xs text-foreground/40 mt-1">Ce mois</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-foreground/50 mb-1">Objectifs atteints</p>
          <p className="text-3xl font-light text-foreground">5/7</p>
          <p className="text-xs text-secondary mt-1">Cette semaine</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm text-foreground/50 mb-1">Jours consécutifs</p>
          <p className="text-3xl font-light text-foreground">14</p>
          <p className="text-xs text-primary mt-1">Record personnel !</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Accès rapide</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-left">
              <Robot size={20} />
              <span className="text-sm font-medium">Parler au Coach IA</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-foreground/5 text-foreground/70 hover:bg-foreground/10 transition-all text-left">
              <Gear size={20} />
              <span className="text-sm font-medium">Modifier mon profil</span>
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Conseil du jour</h3>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-sm">IA</span>
            </div>
            <p className="text-sm text-foreground/70">
              Pensez à boire au moins 2L d'eau aujourd'hui. L'hydratation est essentielle pour maintenir votre niveau d'énergie optimal. 💧
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Coach IA Section
const CoachSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Coach IA
        </h1>
        <p className="text-foreground/60">
          Votre assistant santé personnalisé, disponible 24h/24
        </p>
      </div>
      <ChatInterface />
    </motion.div>
  );
};

// Shop Section
const ShopSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Boutique
        </h1>
        <p className="text-foreground/60">
          Découvrez nos compléments et produits santé
        </p>
      </div>

      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Storefront size={40} weight="light" className="text-primary" />
        </div>
        <h2 className="text-2xl font-light text-foreground mb-4">
          Coming Soon
        </h2>
        <p className="text-foreground/60 max-w-md mx-auto">
          Notre boutique arrive bientôt ! Vous pourrez y découvrir des compléments alimentaires et produits santé sélectionnés par notre équipe d'experts.
        </p>
      </div>
    </motion.div>
  );
};

// Payments Section
const PaymentsSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Historique Paiements
        </h1>
        <p className="text-foreground/60">
          Historique de vos transactions
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8">
        <div className="text-center py-12">
          <CreditCard size={48} weight="light" className="text-foreground/30 mx-auto mb-4" />
          <p className="text-foreground/60">Aucun paiement pour le moment</p>
        </div>
      </div>
    </motion.div>
  );
};

// Settings Section (using ProfileSection)
const SettingsSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Settings
        </h1>
        <p className="text-foreground/60">
          Gérez votre profil et vos préférences
        </p>
      </div>
      <ProfileSection />
    </motion.div>
  );
};

// Help Section
const HelpSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Help
        </h1>
        <p className="text-foreground/60">
          Besoin d'aide ? Nous sommes là pour vous.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">FAQ</h3>
          <ul className="space-y-3">
            <li className="text-foreground/70 text-sm">• Comment fonctionne le Coach IA ?</li>
            <li className="text-foreground/70 text-sm">• Comment modifier mon profil ?</li>
            <li className="text-foreground/70 text-sm">• Comment annuler mon abonnement ?</li>
            <li className="text-foreground/70 text-sm">• Comment contacter le support ?</li>
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Contacter le support</h3>
          <p className="text-foreground/60 text-sm mb-4">
            Notre équipe est disponible du lundi au vendredi, de 9h à 18h.
          </p>
          <a 
            href="mailto:support@vitasync.com" 
            className="btn-neumorphic text-primary-foreground inline-block text-sm"
          >
            Envoyer un email
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
