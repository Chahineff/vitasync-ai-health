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
  House,
  List,
  X,
  CaretRight,
  Bell,
  EnvelopeSimple,
  MagnifyingGlass,
  DeviceMobile,
  Globe
} from "@phosphor-icons/react";

// Menu sections
const menuItems = [
  { id: "coach", label: "Coach IA", icon: Robot },
  { id: "shop", label: "Boutique", icon: Storefront },
  { id: "payments", label: "Historique Paiements", icon: CreditCard },
];

const generalItems = [
  { id: "settings", label: "Paramètres", icon: Gear },
  { id: "help", label: "Help", icon: Question },
];

const Dashboard = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("coach");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const displayName = profile?.first_name || user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="min-h-screen bg-background flex">
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
        className={`fixed lg:static lg:translate-x-0 top-0 left-0 h-full w-72 bg-background border-r border-border/50 z-50 lg:z-auto flex flex-col transition-transform lg:transition-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-lg">V</span>
              </div>
              <span className="text-xl font-medium text-foreground">VitaSync</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-foreground/70 hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Menu Section */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-medium text-foreground/40 uppercase tracking-wider">Menu</p>
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <item.icon size={20} weight={activeSection === item.id ? "fill" : "light"} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {activeSection === item.id && (
                      <CaretRight size={14} className="ml-auto" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* General Section */}
          <div className="mb-6">
            <p className="px-4 mb-2 text-xs font-medium text-foreground/40 uppercase tracking-wider">Général</p>
            <ul className="space-y-1">
              {generalItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                    }`}
                  >
                    <item.icon size={20} weight={activeSection === item.id ? "fill" : "light"} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {activeSection === item.id && (
                      <CaretRight size={14} className="ml-auto" />
                    )}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all"
                >
                  <SignOut size={20} weight="light" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-3">
          {/* App Mobile Coming Soon */}
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-foreground/60">
              <DeviceMobile size={18} weight="light" />
              <span className="text-xs font-medium">App Mobile Coming Soon</span>
            </div>
          </div>

          {/* Website Link */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-all"
          >
            <Globe size={18} weight="light" />
            <span className="font-medium text-sm">Website</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground/70 hover:text-foreground"
            >
              <List size={24} />
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-foreground/5 border-0 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all">
                <Bell size={20} weight="light" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              </button>

              {/* Inbox */}
              <button className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all">
                <EnvelopeSimple size={20} weight="light" />
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-3 border-l border-border/50">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-foreground">{displayName}</p>
                  <p className="text-xs text-foreground/50">{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
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
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
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

// Coach IA Section
const CoachSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Coach IA
      </h1>
      <p className="text-foreground/60 mb-8">
        Votre assistant santé personnalisé, disponible 24h/24
      </p>
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
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Boutique
      </h1>
      <p className="text-foreground/60 mb-8">
        Découvrez nos compléments et produits santé
      </p>

      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
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
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Historique Paiements
      </h1>
      <p className="text-foreground/60 mb-8">
        Historique de vos transactions
      </p>

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
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Paramètres
      </h1>
      <p className="text-foreground/60 mb-8">
        Gérez votre profil et vos préférences
      </p>
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
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Help
      </h1>
      <p className="text-foreground/60 mb-8">
        Besoin d'aide ? Nous sommes là pour vous.
      </p>

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
