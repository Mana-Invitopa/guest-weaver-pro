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
import { Calendar, MapPin, Clock, Users, Camera, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInviteeByToken } from "@/hooks/useInvitees";
import QRCodeGenerator from "@/components/QRCodeGenerator";

const InvitationPage = () => {
  const { token } = useParams();
  const { toast } = useToast();
  const { data: invitationData, isLoading, error } = useInviteeByToken(token || '');
  
  const [guestCount, setGuestCount] = useState(1);
  const [drinks, setDrinks] = useState<string[]>([]);
  const [customDrink, setCustomDrink] = useState("");
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | 'pending'>('pending');
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

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

  const drinkOptions = [
    "Champagne", "Vin Rouge", "Vin Blanc", "Cocktail", 
    "Bière", "Jus de Fruits", "Eau", "Sans Alcool"
  ];

  const handleDrinkChange = (drink: string, checked: boolean) => {
    if (checked) {
      setDrinks([...drinks, drink]);
    } else {
      setDrinks(drinks.filter(d => d !== drink));
    }
  };

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
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {event.description || "Nous avons l'honneur de vous convier à cet événement exceptionnel. Votre présence nous ferait grand plaisir !"}
              </p>
            </CardContent>
          </Card>

          {/* RSVP Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Confirmation de Présence</CardTitle>
              <CardDescription>
                Merci de confirmer votre présence avant le 10 Mars 2024
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
                <div className="space-y-3">
                  <Label htmlFor="guests">Nombre d'accompagnants</Label>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setGuestCount(Math.max(0, guestCount - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">{guestCount}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setGuestCount(guestCount + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: {guestCount + 1} personne{guestCount > 0 ? 's' : ''}
                  </p>
                </div>
              )}

              <Button className="w-full bg-gradient-primary hover:shadow-gold transition-smooth">
                <Users className="w-4 h-4 mr-2" />
                {rsvpStatus === 'yes' ? 'Confirmer ma Présence' : 'Confirmer mon Absence'}
              </Button>
            </CardContent>
          </Card>

          {/* Drinks Preferences */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Préférences de Boissons</CardTitle>
              <CardDescription>
                Aidez-nous à préparer la réception (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {drinkOptions.map((drink) => (
                  <div key={drink} className="flex items-center space-x-2">
                    <Checkbox 
                      id={drink}
                      checked={drinks.includes(drink)}
                      onCheckedChange={(checked) => handleDrinkChange(drink, checked as boolean)}
                    />
                    <Label htmlFor={drink} className="text-sm">{drink}</Label>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-drink">Autre préférence</Label>
                <Input 
                  id="custom-drink" 
                  placeholder="Précisez votre préférence..."
                  value={customDrink}
                  onChange={(e) => setCustomDrink(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {drinks.map((drink) => (
                  <Badge key={drink} variant="secondary" className="text-xs">
                    {drink}
                  </Badge>
                ))}
                {customDrink && (
                  <Badge variant="secondary" className="text-xs">
                    {customDrink}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Guestbook */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-accent" />
                Livre d'Or
              </CardTitle>
              <CardDescription>
                Laissez un message aux futurs mariés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Votre message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Toutes nos félicitations pour votre mariage..."
                  className="min-h-[100px] resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo">Ajouter une photo (optionnel)</Label>
                <Input id="photo" type="file" accept="image/*" />
              </div>

              <Button variant="outline" className="w-full">
                Ajouter au Livre d'Or
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <div className="mt-8">
          <QRCodeGenerator 
            data={`${window.location.origin}/invitation/${token}`}
            title="Votre QR Code Personnel"
            description="Présentez ce code à l'entrée de l'événement"
            size={200}
          />
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;