import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { 
  Robot, 
  Storefront, 
  CreditCard, 
  User, 
  SignOut,
  House,
  List,
  X,
  CaretRight
} from "@phosphor-icons/react";

const menuItems = [
  { id: "coach", label: "Coach IA", icon: Robot, active: true },
  { id: "shop", label: "Shop", icon: Storefront, active: true },
  { id: "payments", label: "Paiements", icon: CreditCard, active: true },
  { id: "profile", label: "Mon Profil", icon: User, active: true },
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
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-foreground/70 hover:text-foreground"
          >
            <List size={24} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold">V</span>
            </div>
            <span className="text-lg font-medium text-foreground">VitaSync</span>
          </Link>
          <div className="w-10" />
        </div>
      </div>

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

        {/* User Info */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground font-semibold text-lg">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">{displayName}</p>
              <p className="text-sm text-foreground/50">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
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
                  <item.icon size={22} weight={activeSection === item.id ? "fill" : "light"} />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <CaretRight size={16} className="ml-auto" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-all"
          >
            <House size={22} weight="light" />
            <span className="font-medium">Retour au site</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <SignOut size={22} weight="light" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {activeSection === "coach" && <CoachSection />}
          {activeSection === "shop" && <ShopSection />}
          {activeSection === "payments" && <PaymentsSection />}
          {activeSection === "profile" && <ProfileSection />}
        </div>
      </main>
    </div>
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
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Coach IA
      </h1>
      <p className="text-foreground/60 mb-8">
        Votre assistant santé personnalisé, disponible 24h/24
      </p>

      {/* Import and use the ChatInterface component */}
      <ChatInterface />
    </motion.div>
  );
};

// Chat Interface Component
import { ChatInterface } from "@/components/dashboard/ChatInterface";

// Shop Section
const ShopSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
        Shop
      </h1>
      <p className="text-foreground/60 mb-8">
        Découvrez nos compléments et produits santé
      </p>

      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Storefront size={40} weight="light" className="text-primary" />
        </div>
        <h2 className="text-2xl font-light text-foreground mb-4">
          En construction
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
        Paiements
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

// Profile Section
import { ProfileSection } from "@/components/dashboard/ProfileSection";

export default Dashboard;
