import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold">Invitopia Mini</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed max-w-md">
              La solution complète pour créer et gérer vos invitations d'événements 
              avec élégance et simplicité.
            </p>
            <p className="text-sm text-primary-foreground/60 mt-4">
              Propriétaire: Manassé Kikaya
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Administration
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-primary-foreground/80 hover:text-accent transition-smooth">
                  Démo
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/80">Documentation</li>
              <li className="text-primary-foreground/80">Guide d'utilisation</li>
              <li className="text-primary-foreground/80">Support technique</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Invitopia Mini. Tous droits réservés. Développé avec Lovable.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;