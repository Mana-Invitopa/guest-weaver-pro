import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Activity
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
      icon: Activity,
      label: "Pulse",
      href: "/admin/pulse",
      active: location.pathname === "/admin/pulse"
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics",
      active: location.pathname === "/admin/analytics"
    },
    {
      icon: Settings,
      label: "Réglages",
      href: "/admin/settings",
      active: location.pathname.includes("/admin/settings")
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t shadow-elegant lg:hidden">
      <div className="grid grid-cols-6 gap-1 px-2 py-2 safe-area-pb">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-200",
              item.active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              item.isAction && "col-span-1"
            )}
          >
            <div className={cn(
              "p-2 rounded-full transition-all duration-200",
              item.isAction && "bg-gradient-primary text-primary-foreground shadow-gold scale-110",
              item.active && !item.isAction && "bg-primary/10"
            )}>
              <item.icon className={cn(
                "w-5 h-5",
                item.isAction && "w-6 h-6"
              )} />
            </div>
            <span className={cn(
              "text-[10px] sm:text-xs font-medium mt-1 truncate max-w-full px-1",
              item.isAction && "hidden sm:inline"
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