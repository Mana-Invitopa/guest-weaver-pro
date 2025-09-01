import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Camera, Heart, Utensils, Table, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInviteeByToken } from "@/hooks/useInvitees";
import { useCreateOrUpdateRSVP } from "@/hooks/useRSVP";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import GuestbookForm from "@/components/GuestbookForm";

const InvitationPage = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const { data: invitationData, isLoading, error } = useInviteeByToken(token || '');
  const createOrUpdateRSVPMutation = useCreateOrUpdateRSVP();
  
  const [guestCount, setGuestCount] = useState(1);
  const [drinks, setDrinks] = useState<string[]>([]);
  const [customDrink, setCustomDrink] = useState("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | 'pending'>('pending');
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitationData || !token) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Invitation non trouvée</h1>
            <p className="text-muted-foreground mb-4">
              Cette invitation n'existe pas ou a expiré.
            </p>
            <Button asChild>
              <a href="/">Retour à l'accueil</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const event = invitationData.events;
  const invitee = invitationData;

  // Check if invitation has expired
  const isExpired = (invitee as any).invitation_expires_at && new Date((invitee as any).invitation_expires_at) < new Date();

  const drinkOptions = [
    "Champagne", "Vin Rouge", "Vin Blanc", "Cocktail", 
    "Bière", "Jus de Fruits", "Eau", "Sans Alcool", "Café", "Thé"
  ];

  const handleDrinkChange = (drink: string, checked: boolean) => {
    if (checked) {
      setDrinks([...drinks, drink]);
    } else {
      setDrinks(drinks.filter(d => d !== drink));
    }
  };

  const handleSubmitRSVP = async () => {
    if (rsvpStatus === 'pending') {
      toast({
        title: "Erreur",
        description: "Veuillez confirmer votre présence",
        variant: "destructive",
      });
      return;
    }

    if (!guestName.trim() || !guestEmail.trim()) {
      toast({
        title: "Erreur",
        description: "Nom et email sont requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const drinkPreferences = [...drinks];
      if (customDrink.trim()) {
        drinkPreferences.push(customDrink.trim());
      }

      await createOrUpdateRSVPMutation.mutateAsync({
        invitee_id: invitee.id,
        event_id: event.id,
        status: rsvpStatus === 'yes' ? 'confirmed' : 'declined',
        guest_count: rsvpStatus === 'yes' ? guestCount + 1 : 0, // Fixed: correct guest count calculation
        drink_preferences: drinkPreferences,
        dietary_restrictions: dietaryRestrictions || undefined
      });

      toast({
        title: "Succès ✨",
        description: `Votre ${rsvpStatus === 'yes' ? 'confirmation' : 'refus'} a été enregistré avec succès !`,
      });

    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre réponse. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-warning mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Invitation Expirée</h1>
            <p className="text-muted-foreground mb-4">
              Cette invitation a expiré le {new Date((invitee as any).invitation_expires_at!).toLocaleDateString('fr-FR')}.
            </p>
            <Button asChild>
              <a href="/">Retour à l'accueil</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section with Event Details */}
      <div className="relative h-96 overflow-hidden">
        {event.background_image_url ? (
          <img 
            src={event.background_image_url} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-hero"></div>
        )}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(event.date_time).toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{new Date(event.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Description */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                Détails de l'Événement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {event.description || "Nous avons l'honneur de vous convier à cet événement exceptionnel. Votre présence nous ferait grand plaisir !"}
              </p>
              
              {/* Table Assignment */}
              {(invitee as any).table_number && (
                <div className="bg-accent/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Table className="w-5 h-5 text-accent" />
                    <h4 className="font-semibold">Votre table assignée</h4>
                  </div>
                  <p className="text-foreground">
                    <span className="font-bold">Table {(invitee as any).table_number}</span>
                    {(invitee as any).table_name && (
                      <span className="text-muted-foreground"> - {(invitee as any).table_name}</span>
                    )}
                  </p>
                </div>
              )}
              
              {/* Expiration Notice */}
              {(invitee as any).invitation_expires_at && (
                <div className="bg-warning/10 p-3 rounded-lg">
                  <p className="text-sm text-warning-foreground">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Cette invitation expire le {new Date((invitee as any).invitation_expires_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* RSVP Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Confirmation de Présence</CardTitle>
              <CardDescription>
                Merci de confirmer votre présence pour {event.title}
                {event.rsvp_deadline && (
                  <span className="block mt-1 text-warning">
                    Date limite: {new Date(event.rsvp_deadline).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Bonjour {invitee.name},</strong><br/>
                  Vous êtes invité(e) à cet événement.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="name">Votre nom complet *</Label>
                <Input 
                  id="name" 
                  value={guestName || invitee.name}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Votre nom complet" 
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={guestEmail || invitee.email}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="votre@email.com" 
                />
              </div>

              <div className="space-y-3">
                <Label>Confirmez-vous votre présence ? *</Label>
                <RadioGroup value={rsvpStatus} onValueChange={(value) => setRsvpStatus(value as 'yes' | 'no')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes">Oui, je serai présent(e)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no">Non, je ne pourrai pas venir</Label>
                  </div>
                </RadioGroup>
              </div>

              {rsvpStatus === 'yes' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="guests">Nombre d'accompagnants</Label>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setGuestCount(Math.max(0, guestCount - 1))}
                        type="button"
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">{guestCount}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setGuestCount(guestCount + 1)}
                        type="button"
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total: {guestCount + 1} personne{guestCount > 0 ? 's' : ''} (vous inclus)
                    </p>
                  </div>
                  
                  {/* Drink Preferences */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Préférences de boissons (optionnel)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {drinkOptions.slice(0, 8).map((drink) => (
                        <div key={drink} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`drink-${drink}`}
                            checked={drinks.includes(drink)}
                            onCheckedChange={(checked) => handleDrinkChange(drink, checked as boolean)}
                          />
                          <Label htmlFor={`drink-${drink}`} className="text-sm">{drink}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="space-y-2">
                    <Label htmlFor="dietary">Restrictions alimentaires (optionnel)</Label>
                    <Textarea 
                      id="dietary"
                      placeholder="Allergies, régimes spéciaux..."
                      value={dietaryRestrictions}
                      onChange={(e) => setDietaryRestrictions(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>
                </div>
              )}

              <Button 
                className="w-full bg-gradient-primary hover:shadow-gold transition-smooth"
                onClick={handleSubmitRSVP}
                disabled={isSubmitting}
              >
                <Users className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Enregistrement...' : 
                 rsvpStatus === 'yes' ? 'Confirmer ma Présence' : 
                 rsvpStatus === 'no' ? 'Confirmer mon Absence' : 'Confirmer'}
              </Button>
            </CardContent>
          </Card>

          {/* Event Cover and QR Code */}
          <Card className="shadow-card">
            <CardContent className="p-0">
              {event.background_image_url ? (
                <div className="relative">
                  <img 
                    src={event.background_image_url} 
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm opacity-90">{event.location}</p>
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gradient-hero rounded-t-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm opacity-90">{event.location}</p>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="text-center">
                  <h4 className="font-semibold mb-2 flex items-center justify-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Votre QR Code Personnel
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Présentez ce code à l'entrée pour un accès rapide
                  </p>
                  <div className="flex justify-center">
                    <QRCodeGenerator 
                      data={`${window.location.origin}/invitation/${token}`}
                      size={150}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Code: <span className="font-mono">{token?.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guestbook for Wedding Events */}
        {event.event_type === 'wedding' && (
          <div className="mt-8">
            <GuestbookForm 
              eventId={event.id} 
              inviteeId={invitee.id}
              onSuccess={() => {
                toast({
                  title: "Message ajouté au livre d'or ✨",
                  description: "Votre message a été ajouté avec succès !",
                });
              }}
            />
          </div>
        )}

        {/* Additional Event Information */}
        {event.description && (
          <Card className="shadow-card mt-8">
            <CardHeader>
              <CardTitle>À propos de l'événement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvitationPage;