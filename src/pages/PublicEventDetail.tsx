import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft,
  Heart,
  Music,
  Star,
  TrendingUp,
  Camera,
  Share2,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { usePublicEvent } from "@/hooks/usePublicEvents";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PublicEventDetail = () => {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { data: event, isLoading, error } = usePublicEvent(eventId || '');

  const getEventTypeIcon = (eventType: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'wedding': Heart,
      'party': Music,
      'conference': TrendingUp,
      'charity': Heart,
      'festival': Music,
      'theatre': Star,
      'cinema': Camera,
      'corporate': TrendingUp,
    };
    return icons[eventType] || Calendar;
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'wedding': 'Mariage',
      'party': 'Fête',
      'conference': 'Conférence',
      'charity': 'Charité',
      'festival': 'Festival',
      'theatre': 'Théâtre',
      'cinema': 'Cinéma',
      'corporate': 'Entreprise',
    };
    return labels[eventType] || eventType;
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Lien copié",
        description: "Le lien de l'événement a été copié dans le presse-papiers",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-card">
              <div className="h-96 bg-muted animate-pulse"></div>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-8 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="shadow-card">
              <CardContent className="p-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-4">Événement non trouvé</h1>
                <p className="text-muted-foreground mb-6">
                  Cet événement n'existe pas ou n'est plus disponible.
                </p>
                <Button asChild>
                  <Link to="/events">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour aux événements
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const EventIcon = getEventTypeIcon(event.event_type || '');
  const isUpcoming = new Date(event.date_time) > new Date();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        {event.background_image_url ? (
          <img 
            src={event.background_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-hero flex items-center justify-center">
            <EventIcon className="w-16 h-20 sm:w-24 sm:h-24 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-white">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                <Button variant="outline" size="sm" asChild className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <Link to="/events">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Link>
                </Button>
                
                <Badge variant="secondary" className="bg-white/90 text-black">
                  <EventIcon className="w-4 h-4 mr-2" />
                  {getEventTypeLabel(event.event_type || '')}
                </Badge>
                
                {isUpcoming && (
                  <Badge className="bg-primary text-primary-foreground">
                    À venir
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 text-sm sm:text-base md:text-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{format(new Date(event.date_time), 'EEEE d MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{format(new Date(event.date_time), 'HH:mm')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Description */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>À propos de l'événement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description || "Aucune description disponible pour le moment."}
                  </p>
                </CardContent>
              </Card>
              
              {/* Additional info */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Informations pratiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Horaires</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(event.date_time), 'HH:mm')}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Lieu</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    {(event.current_guests || event.max_guests) && (
                      <div>
                        <h4 className="font-semibold mb-2">Participants</h4>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>
                            {event.current_guests || 0}
                            {event.max_guests ? ` / ${event.max_guests}` : ''} participants
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-semibold mb-2">Type</h4>
                      <Badge variant="outline">
                        <EventIcon className="w-4 h-4 mr-2" />
                        {getEventTypeLabel(event.event_type || '')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      onClick={handleShare}
                      className="w-full bg-gradient-primary hover:shadow-gold transition-smooth"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Partager l'événement
                    </Button>
                    
                    {/* View on maps */}
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const query = encodeURIComponent(event.location);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir sur Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Event details card */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Détails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-1">
                      {format(new Date(event.date_time), 'd')}
                    </div>
                    <div className="text-muted-foreground">
                      {format(new Date(event.date_time), 'MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      Publié le {format(new Date(event.created_at), 'd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublicEventDetail;