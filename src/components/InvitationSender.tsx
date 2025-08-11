import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEvent } from "@/hooks/useEvents";
import type { Invitee } from "@/hooks/useInvitees";

interface InvitationSenderProps {
  eventId: string;
  invitees: Invitee[];
}

const InvitationSender = ({ eventId, invitees }: InvitationSenderProps) => {
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [emailMessage, setEmailMessage] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const { toast } = useToast();
  const { data: event } = useEvent(eventId);

  const handleSelectAll = () => {
    if (selectedInvitees.length === invitees.length) {
      setSelectedInvitees([]);
    } else {
      setSelectedInvitees(invitees.map(i => i.id));
    }
  };

  const handleSelectInvitee = (inviteeId: string) => {
    if (selectedInvitees.includes(inviteeId)) {
      setSelectedInvitees(selectedInvitees.filter(id => id !== inviteeId));
    } else {
      setSelectedInvitees([...selectedInvitees, inviteeId]);
    }
  };

  const getInvitationUrl = (token: string) => {
    return `${window.location.origin}/invitation/${token}`;
  };

  const sendEmailInvitations = async () => {
    if (selectedInvitees.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);

    try {
      const selectedGuestData = invitees.filter(i => selectedInvitees.includes(i.id));
      
      for (const guest of selectedGuestData) {
        const invitationUrl = getInvitationUrl(guest.token);
        
        const emailData = {
          to: guest.email,
          subject: `Invitation - ${event?.title}`,
          message: emailMessage || `Vous êtes invité(e) à ${event?.title}. Cliquez sur le lien pour confirmer votre présence: ${invitationUrl}`,
          invitationUrl,
          eventTitle: event?.title,
          guestName: guest.name,
        };

        // Call edge function to send email
        const { error } = await supabase.functions.invoke('send-invitation', {
          body: emailData,
        });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: `${selectedInvitees.length} invitation(s) envoyée(s) par email !`,
      });

      setSelectedInvitees([]);
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi des emails",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const sendWhatsAppInvitations = () => {
    if (selectedInvitees.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    const selectedGuestData = invitees.filter(i => selectedInvitees.includes(i.id));
    
    selectedGuestData.forEach(guest => {
      if (guest.phone) {
        const invitationUrl = getInvitationUrl(guest.token);
        const message = whatsappMessage || `Bonjour ${guest.name}, vous êtes invité(e) à ${event?.title}. Confirmez votre présence: ${invitationUrl}`;
        
        // Clean phone number and format for WhatsApp
        const cleanPhone = guest.phone.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
      }
    });

    toast({
      title: "Succès",
      description: "WhatsApp ouvert pour les invités sélectionnés",
    });
  };

  return (
    <div className="space-y-6">
      {/* Guest Selection */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Sélection des Invités
          </CardTitle>
          <CardDescription>
            Choisissez les invités qui recevront l'invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all"
                  checked={selectedInvitees.length === invitees.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Sélectionner tout ({invitees.length} invités)
                </Label>
              </div>
              {selectedInvitees.length > 0 && (
                <Badge variant="secondary">
                  {selectedInvitees.length} sélectionné(s)
                </Badge>
              )}
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {invitees.map(invitee => (
                <div key={invitee.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={`guest-${invitee.id}`}
                      checked={selectedInvitees.includes(invitee.id)}
                      onCheckedChange={() => handleSelectInvitee(invitee.id)}
                    />
                    <div>
                      <Label htmlFor={`guest-${invitee.id}`} className="font-medium">
                        {invitee.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{invitee.email}</p>
                    </div>
                  </div>
                  {!invitee.phone && (
                    <Badge variant="outline" className="text-xs">
                      Pas de téléphone
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Email Invitations */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-accent" />
              Invitation par Email
            </CardTitle>
            <CardDescription>
              Envoyez des invitations personnalisées par email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-message">Message personnalisé (optionnel)</Label>
              <Textarea
                id="email-message"
                placeholder="Personnalisez votre message d'invitation..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            
            <Button 
              className="w-full bg-gradient-primary hover:shadow-gold transition-smooth"
              onClick={sendEmailInvitations}
              disabled={sendingEmail || selectedInvitees.length === 0}
            >
              {sendingEmail ? (
                "Envoi en cours..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer par Email ({selectedInvitees.length})
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp Invitations */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent" />
              Invitation par WhatsApp
            </CardTitle>
            <CardDescription>
              Envoyez des invitations via WhatsApp (nécessite un numéro de téléphone)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Message personnalisé (optionnel)</Label>
              <Textarea
                id="whatsapp-message"
                placeholder="Personnalisez votre message WhatsApp..."
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={sendWhatsAppInvitations}
              disabled={sendingWhatsApp || selectedInvitees.length === 0}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Ouvrir WhatsApp ({selectedInvitees.filter(id => invitees.find(i => i.id === id)?.phone).length})
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Note: WhatsApp s'ouvrira dans un nouvel onglet pour chaque invité avec un numéro de téléphone
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitationSender;