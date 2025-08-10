import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
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
          <Link to="/admin" className="text-muted-foreground hover:text-foreground transition-smooth">
            Administration
          </Link>
          <Button variant="outline" size="sm">
            Connexion
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;