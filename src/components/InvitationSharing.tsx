import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Mail, 
  Smartphone,
  Copy,
  ExternalLink,
  Users,
  Loader2
} from "lucide-react";

interface InvitationSharingProps {
  eventId: string;
  eventTitle: string;
  invitationUrl: string;
  invitees: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
  }>;
}

const InvitationSharing = ({ 
  eventId, 
  eventTitle, 
  invitationUrl, 
  invitees 
}: InvitationSharingProps) => {
  const { toast } = useToast();
  const [selectedInvitees, setSelectedInvitees] = useState<Set<string>>(new Set());
  const [customMessage, setCustomMessage] = useState(
    `🎉 Vous êtes invité(e) à ${eventTitle}!\n\nCliquez sur le lien pour confirmer votre présence:`
  );
  const [isSharing, setIsSharing] = useState<{[key: string]: boolean}>({});

  const handleSelectInvitee = (inviteeId: string) => {
    setSelectedInvitees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inviteeId)) {
        newSet.delete(inviteeId);
      } else {
        newSet.add(inviteeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedInvitees.size === invitees.length) {
      setSelectedInvitees(new Set());
    } else {
      setSelectedInvitees(new Set(invitees.map(i => i.id)));
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le lien a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = async () => {
    if (selectedInvitees.size === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(prev => ({ ...prev, whatsapp: true }));

    try {
      const selectedInviteesList = invitees.filter(i => selectedInvitees.has(i.id));
      
      // Open WhatsApp for each selected invitee with phone number
      for (const invitee of selectedInviteesList) {
        if (invitee.phone) {
          const message = `${customMessage}\n\n${invitationUrl}`;
          const whatsappUrl = `https://wa.me/${invitee.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          
          // Add small delay between opens to avoid browser blocking
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "WhatsApp ouvert",
        description: `${selectedInviteesList.filter(i => i.phone).length} conversation(s) WhatsApp ouverte(s)`,
      });
    } catch (error) {
      toast({
        title: "Erreur WhatsApp",
        description: "Impossible d'ouvrir WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsSharing(prev => ({ ...prev, whatsapp: false }));
    }
  };

  const shareViaTelegram = async () => {
    if (selectedInvitees.size === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(prev => ({ ...prev, telegram: true }));

    try {
      // For Telegram, we'll use the share URL or bot integration
      const message = `${customMessage}\n\n${invitationUrl}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationUrl)}&text=${encodeURIComponent(customMessage)}`;
      window.open(telegramUrl, '_blank');

      toast({
        title: "Telegram ouvert",
        description: "Interface de partage Telegram ouverte",
      });
    } catch (error) {
      toast({
        title: "Erreur Telegram",
        description: "Impossible d'ouvrir Telegram",
        variant: "destructive",
      });
    } finally {
      setIsSharing(prev => ({ ...prev, telegram: false }));
    }
  };

  const shareViaSMS = async () => {
    if (selectedInvitees.size === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(prev => ({ ...prev, sms: true }));

    try {
      const selectedInviteesList = invitees.filter(i => selectedInvitees.has(i.id));
      const message = `${customMessage}\n\n${invitationUrl}`;
      
      // Open SMS app for each phone number
      for (const invitee of selectedInviteesList) {
        if (invitee.phone) {
          const smsUrl = `sms:${invitee.phone}?body=${encodeURIComponent(message)}`;
          window.location.href = smsUrl;
          
          // Add delay between SMS opens
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: "SMS ouvert",
        description: `Application SMS ouverte pour ${selectedInviteesList.filter(i => i.phone).length} contact(s)`,
      });
    } catch (error) {
      toast({
        title: "Erreur SMS",
        description: "Impossible d'ouvrir l'application SMS",
        variant: "destructive",
      });
    } finally {
      setIsSharing(prev => ({ ...prev, sms: false }));
    }
  };

  const shareViaEmail = async () => {
    if (selectedInvitees.size === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(prev => ({ ...prev, email: true }));

    try {
      const selectedInviteesList = invitees.filter(i => selectedInvitees.has(i.id));
      const emails = selectedInviteesList.filter(i => i.email).map(i => i.email).join(';');
      
      if (emails) {
        const subject = `Invitation - ${eventTitle}`;
        const body = `${customMessage}\n\n${invitationUrl}`;
        const mailtoUrl = `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailtoUrl;

        toast({
          title: "Email ouvert",
          description: `Client email ouvert avec ${selectedInviteesList.filter(i => i.email).length} destinataire(s)`,
        });
      } else {
        toast({
          title: "Aucun email",
          description: "Aucun invité sélectionné n'a d'adresse email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur Email",
        description: "Impossible d'ouvrir le client email",
        variant: "destructive",
      });
    } finally {
      setIsSharing(prev => ({ ...prev, email: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Link Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="w-5 h-5" />
            <span>Lien d'invitation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
              {invitationUrl}
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(invitationUrl)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invitee Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Sélectionner les invités</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedInvitees.size === invitees.length ? "Désélectionner tout" : "Sélectionner tout"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {invitees.map(invitee => (
              <div
                key={invitee.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedInvitees.has(invitee.id)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
                onClick={() => handleSelectInvitee(invitee.id)}
              >
                <div className="font-medium text-sm">{invitee.name}</div>
                <div className="text-xs text-muted-foreground">
                  {invitee.email && <div>{invitee.email}</div>}
                  {invitee.phone && <div>{invitee.phone}</div>}
                </div>
              </div>
            ))}
          </div>
          {selectedInvitees.size > 0 && (
            <div className="mt-4">
              <Badge variant="secondary">
                {selectedInvitees.size} invité(s) sélectionné(s)
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Message personnalisé</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Personnalisez votre message d'invitation..."
            className="min-h-20"
          />
        </CardContent>
      </Card>

      {/* Sharing Options */}
      <Card>
        <CardHeader>
          <CardTitle>Partager les invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={shareViaWhatsApp}
              disabled={isSharing.whatsapp}
            >
              {isSharing.whatsapp ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <MessageCircle className="w-5 h-5 text-green-600" />
              )}
              <span className="text-xs">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={shareViaTelegram}
              disabled={isSharing.telegram}
            >
              {isSharing.telegram ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-blue-600" />
              )}
              <span className="text-xs">Telegram</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={shareViaSMS}
              disabled={isSharing.sms}
            >
              {isSharing.sms ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Smartphone className="w-5 h-5 text-orange-600" />
              )}
              <span className="text-xs">SMS</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex-col space-y-2"
              onClick={shareViaEmail}
              disabled={isSharing.email}
            >
              {isSharing.email ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5 text-red-600" />
              )}
              <span className="text-xs">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationSharing;