import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, Settings, Sun, Moon } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-lg md:text-xl font-bold text-foreground">Invitopia Mini</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-foreground hover:text-accent transition-colors">
            Accueil
          </Link>
          <Link to="/events" className="text-foreground hover:text-accent transition-colors">
            Événements Publics
          </Link>
          <Link to="#features" className="text-foreground hover:text-accent transition-colors">
            Fonctionnalités
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {user && <NotificationBell />}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth transform hover:scale-105">
                  <Link to="/admin">Dashboard</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Mon compte</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/settings" className="cursor-pointer">
                        <Settings className="w-4 h-4 mr-2" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth transform hover:scale-105">
                <Link to="/auth">Connexion</Link>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;