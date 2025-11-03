import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Home, 
  Calendar, 
  User, 
  LogOut,
  Settings,
  BarChart3,
  Sun,
  Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const menuItems = [
    {
      icon: Home,
      label: "Accueil",
      href: "/",
      public: true
    },
    {
      icon: Calendar,
      label: "Événements Publics",
      href: "/events",
      public: true
    },
    ...(user ? [
      {
        icon: Settings,
        label: "Dashboard",
        href: "/admin",
        public: false
      },
      {
        icon: Calendar,
        label: "Mes Événements",
        href: "/admin/events",
        public: false
      },
      {
        icon: BarChart3,
        label: "Analytics",
        href: "/admin/analytics",
        public: false
      }
    ] : [])
  ];

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-subtle">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">I</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">Invitopia Mini</h2>
                  {user && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                    <span className="font-medium text-foreground">{item.label}</span>
                  </Link>
                ))}
                
                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors group w-full text-left"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      <span className="font-medium text-foreground">Mode clair</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      <span className="font-medium text-foreground">Mode sombre</span>
                    </>
                  )}
                </button>
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/20">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-2">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">Connecté</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut}
                    className="w-full justify-start space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full bg-gradient-primary hover:shadow-gold">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    Connexion
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;