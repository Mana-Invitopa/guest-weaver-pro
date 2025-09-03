import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Zap 
} from "lucide-react";
import { cn } from "@/lib/utils";

const MobileNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  const navItems = [
    {
      icon: Home,
      label: "Accueil",
      href: "/admin",
      active: location.pathname === "/admin"
    },
    {
      icon: Calendar,
      label: "Événements",
      href: "/admin/events",
      active: location.pathname.includes("/admin/events")
    },
    {
      icon: Plus,
      label: "Créer",
      href: "/admin/events/new",
      active: location.pathname === "/admin/events/new",
      isAction: true
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics",
      active: location.pathname === "/admin/analytics"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-elegant lg:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 rounded-lg transition-all duration-200",
              item.active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              item.isAction && "mx-1"
            )}
          >
            <div className={cn(
              "p-2 rounded-full transition-all duration-200",
              item.isAction && "bg-gradient-primary text-primary-foreground shadow-gold",
              item.active && !item.isAction && "bg-primary/10"
            )}>
              <item.icon className={cn(
                "w-5 h-5",
                item.isAction && "w-6 h-6"
              )} />
            </div>
            <span className={cn(
              "text-xs font-medium mt-1 truncate",
              item.isAction && "hidden"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;