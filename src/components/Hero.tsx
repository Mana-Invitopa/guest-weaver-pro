import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Invitations élégantes sur table de marbre" 
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
          Créez des <span className="text-accent">invitations</span> inoubliables
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 md:mb-8 leading-relaxed px-4">
          Gérez vos événements avec élégance. De l'invitation au check-in, 
          tout est à portée de main avec Invitopia Mini.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4">
          <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
            <Link to="/admin">
              Commencer maintenant
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 transition-smooth w-full sm:w-auto">
            <Link to="/auth">
              Découvrir la plateforme
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;