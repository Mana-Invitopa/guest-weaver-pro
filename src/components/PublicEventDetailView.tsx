import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  ArrowLeft,
  Mail,
  Phone,
  User,
  Check,
  X,
  Star,
  Music,
  Camera,
  TrendingUp,
  MessageCircle
} from "lucide-react";
import { format, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { usePublicEvent } from "@/hooks/usePublicEvents";
import { toast } from "sonner";

const PublicEventDetailView = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: event, isLoading } = usePublicEvent(eventId!);
  
  const [rsvpForm, setRsvpForm] = useState({
    name: '',
    email: '',
    phone: '',
    guest_count: 1,
    dietary_restrictions: '',
    message: ''
  });
  
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'confirmed' | 'declined' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleRSVP = async (status: 'confirmed' | 'declined') => {
    if (status === 'confirmed' && (!rsvpForm.name || !rsvpForm.email)) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setRsvpStatus(status);
      toast.success(
        status === 'confirmed' 
          ? 'Votre participation a été confirmée !' 
          : 'Votre réponse a été enregistrée'
      );
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de votre réponse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && event) {
        await navigator.share({
          title: event.title,
          text: `Je vous invite à découvrir cet événement : ${event.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      toast.error('Erreur lors du partage');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="shadow-elegant max-w-md mx-auto">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Événement non trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Cet événement n'existe pas ou n'est plus disponible.
            </p>
            <Button asChild variant="outline">
              <Link to="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux événements
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const EventIcon = getEventTypeIcon(event.event_type || '');
  const isExpired = isPast(new Date(event.date_time));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost">
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux événements
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl mb-8">
          {event.background_image_url ? (
            <img 
              src={event.background_image_url} 
              alt={event.title}
              className="w-full h-80 object-cover"
            />
          ) : (
            <div className="w-full h-80 bg-gradient-hero flex items-center justify-center">
              <EventIcon className="w-24 h-24 text-white opacity-50" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/90 text-black">
                <EventIcon className="w-3 h-3 mr-1" />
                {getEventTypeLabel(event.event_type || '')}
              </Badge>
              {isExpired && (
                <Badge variant="destructive">
                  <Clock className="w-3 h-3 mr-1" />
                  Événement terminé
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(event.date_time), 'EEEE d MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(event.date_time), 'HH:mm')}</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleShare}
            variant="secondary"
            size="sm"
            className="absolute top-6 right-6 bg-white/90 text-black"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Détails de l'événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  
                  {(event.current_guests || event.max_guests) && (
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-medium">Participants</p>
                        <p className="text-sm text-muted-foreground">
                          {event.current_guests || 0}
                          {event.max_guests ? ` / ${event.max_guests}` : ''} participants
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments/Messages Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Messages des participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sample messages */}
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Marie Jeanne</p>
                      <p className="text-sm text-muted-foreground">
                        Très hâte de participer à cet événement ! 🎉
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Il y a 2 heures</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>PD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Pierre Dubois</p>
                      <p className="text-sm text-muted-foreground">
                        Super organisation, merci pour l'invitation !
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Il y a 1 jour</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RSVP Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-card sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Confirmer votre présence
                </CardTitle>
                <CardDescription>
                  Faites-nous savoir si vous participerez à cet événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isExpired ? (
                  <div className="text-center py-6">
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-destructive" />
                      </div>
                      <h3 className="font-semibold text-destructive">Événement terminé</h3>
                      <p className="text-sm text-muted-foreground">
                        Cet événement est terminé. Les inscriptions ne sont plus acceptées.
                      </p>
                    </div>
                  </div>
                ) : rsvpStatus ? (
                  <div className="text-center py-6">
                    {rsvpStatus === 'confirmed' ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8 text-success" />
                        </div>
                        <h3 className="font-semibold text-success">Participation confirmée !</h3>
                        <p className="text-sm text-muted-foreground">
                          Merci d'avoir confirmé votre présence. Nous avons hâte de vous voir !
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                          <X className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold">Absence notée</h3>
                        <p className="text-sm text-muted-foreground">
                          Merci d'avoir répondu. Nous espérons vous voir au prochain événement !
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nom complet *</Label>
                        <Input
                          id="name"
                          placeholder="Votre nom complet"
                          value={rsvpForm.name}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, name: e.target.value }))}
                          disabled={isExpired}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          value={rsvpForm.email}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={isExpired}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          value={rsvpForm.phone}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={isExpired}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guest_count">Nombre de participants</Label>
                        <Input
                          id="guest_count"
                          type="number"
                          min="1"
                          max="10"
                          value={rsvpForm.guest_count}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, guest_count: parseInt(e.target.value) || 1 }))}
                          disabled={isExpired}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dietary">Restrictions alimentaires</Label>
                        <Textarea
                          id="dietary"
                          placeholder="Allergies, régime spécial..."
                          rows={2}
                          value={rsvpForm.dietary_restrictions}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, dietary_restrictions: e.target.value }))}
                          disabled={isExpired}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message (optionnel)</Label>
                        <Textarea
                          id="message"
                          placeholder="Un petit message pour les organisateurs..."
                          rows={3}
                          value={rsvpForm.message}
                          onChange={(e) => setRsvpForm(prev => ({ ...prev, message: e.target.value }))}
                          disabled={isExpired}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => handleRSVP('confirmed')}
                        disabled={isSubmitting || isExpired}
                        className="w-full bg-gradient-primary"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Confirmation...
                          </div>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Je participe
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => handleRSVP('declined')}
                        disabled={isSubmitting || isExpired}
                        variant="outline"
                        className="w-full"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Je ne peux pas venir
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEventDetailView;