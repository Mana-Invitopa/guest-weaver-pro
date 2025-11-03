import { Link } from "react-router-dom";
import { Mail, FileText, BookOpen, Calendar, Zap } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-8 sm:py-10 md:py-12 border-t border-primary-foreground/10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-3 sm:mb-4 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-secondary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-secondary-foreground font-bold text-sm sm:text-base">I</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold">Invitopia Mini</span>
            </Link>
            <p className="text-sm sm:text-base text-primary-foreground/80 leading-relaxed max-w-md mb-3 sm:mb-4">
              La solution complète pour créer et gérer vos invitations d'événements 
              avec élégance et simplicité. QR codes, analytics, workflows automatisés et bien plus.
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-primary-foreground/60">
              <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Propriétaire: Manassé Kikaya</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Calendar className="w-4 h-4" />
              Navigation
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2">
                  Événements Publics
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2">
                  Administration
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <BookOpen className="w-4 h-4" />
              Ressources
            </h4>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link to="/docs" className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/admin/workflows" className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Workflows
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@invitopia.com" 
                  className="text-primary-foreground/80 hover:text-accent transition-smooth flex items-center gap-2"
                >
                  <Mail className="w-3 h-3" />
                  Support technique
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-primary-foreground/60 text-center sm:text-left">
              © {currentYear} Invitopia Mini. Tous droits réservés.
            </p>
            <p className="text-xs sm:text-sm text-primary-foreground/60 flex items-center gap-2 text-center sm:text-left">
              Développé avec
              <a 
                href="https://lovable.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent hover:underline font-semibold"
              >
                Lovable
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;