import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-card/95 backdrop-blur-sm border-b shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-xl font-bold text-foreground">Invitopia Mini</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/demo">Voir la Démo</Link>
          </Button>
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
              <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth transform hover:scale-105">
                <Link to="/admin">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth transform hover:scale-105">
              <Link to="/auth">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;