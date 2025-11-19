import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Mail, MessageSquare, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEvent } from "@/hooks/useEvents";
import type { Invitee } from "@/hooks/useInvitees";

interface PDFInvitationSenderProps {
  eventId: string;
  invitees: Invitee[];
}

const PDFInvitationSender = ({ eventId, invitees }: PDFInvitationSenderProps) => {
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sendingChannel, setSendingChannel] = useState<string | null>(null);

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

  const generateAndSendPDF = async (channel: 'email' | 'whatsapp' | 'telegram') => {
    if (selectedInvitees.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un invité",
        variant: "destructive",
      });
      return;
    }

    setSendingChannel(channel);
    setGeneratingPDF(true);

    try {
      const selectedGuestData = invitees.filter(i => selectedInvitees.includes(i.id));
      let successCount = 0;

      for (const guest of selectedGuestData) {
        // Generate PDF via edge function
        const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
          'generate-invitation-pdf',
          {
            body: {
              eventId,
              inviteeId: guest.id,
              inviteeName: guest.name,
              inviteeTable: guest.table_name,
              invitationImageUrl: event?.background_image_url,
            },
          }
        );

        if (pdfError) {
          console.error('PDF generation error:', pdfError);
          continue;
        }

        // Send based on channel
        const invitationUrl = `${window.location.origin}/invitation/${guest.token}`;

        if (channel === 'email') {
          // Send email with PDF
          const { error: emailError } = await supabase.functions.invoke('send-invitation', {
            body: {
              to: guest.email,
              subject: `Invitation - ${event?.title}`,
              message: `Bonjour ${guest.name},\n\nVous êtes invité(e) à ${event?.title}.\n\nVeuillez trouver ci-joint votre invitation personnalisée en PDF.\n\nConfirmez votre présence: ${invitationUrl}`,
              invitationUrl,
              eventTitle: event?.title,
              guestName: guest.name,
              pdfHtml: pdfData.html,
            },
          });

          if (emailError) {
            console.error('Email error:', emailError);
            continue;
          }
        } else if (channel === 'whatsapp' && guest.phone) {
          // Open WhatsApp with message
          const message = `Bonjour ${guest.name}! 🎉\n\nVous êtes invité(e) à ${event?.title}.\n\n📅 ${new Date(event?.date_time || '').toLocaleDateString('fr-FR')}\n📍 ${event?.location}\n\nVotre invitation PDF personnalisée a été générée.\n\nConfirmez votre présence: ${invitationUrl}`;
          const whatsappUrl = `https://wa.me/${guest.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
        } else if (channel === 'telegram') {
          // Open Telegram with message
          const message = `Bonjour ${guest.name}! 🎉\n\nVous êtes invité(e) à ${event?.title}.\n\n📅 ${new Date(event?.date_time || '').toLocaleDateString('fr-FR')}\n📍 ${event?.location}\n\nVotre invitation PDF personnalisée a été générée.\n\nConfirmez votre présence: ${invitationUrl}`;
          const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(invitationUrl)}&text=${encodeURIComponent(message)}`;
          window.open(telegramUrl, '_blank');
        }

        successCount++;
      }

      toast({
        title: "Succès",
        description: `${successCount} invitation(s) PDF générée(s) et envoyée(s) via ${channel}`,
      });

      setSelectedInvitees([]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération/envoi des invitations",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
      setSendingChannel(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invitations PDF Personnalisées
        </CardTitle>
        <CardDescription>
          Générez et envoyez des invitations PDF avec photo, détails et programme
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invitee Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sélectionner les invités</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedInvitees.length === invitees.length ? "Tout désélectionner" : "Tout sélectionner"}
            </Button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-4">
            {invitees.map((invitee) => (
              <div key={invitee.id} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-md">
                <Checkbox
                  checked={selectedInvitees.includes(invitee.id)}
                  onCheckedChange={() => handleSelectInvitee(invitee.id)}
                />
                <div className="flex-1">
                  <p className="font-medium">{invitee.name}</p>
                  <p className="text-sm text-muted-foreground">{invitee.email}</p>
                </div>
                {invitee.table_name && (
                  <Badge variant="secondary">{invitee.table_name}</Badge>
                )}
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground">
            {selectedInvitees.length} invité(s) sélectionné(s)
          </div>
        </div>

        {/* Send Buttons */}
        <div className="space-y-3">
          <h3 className="font-semibold">Générer et envoyer via</h3>
          
          <div className="grid gap-3">
            <Button
              onClick={() => generateAndSendPDF('email')}
              disabled={generatingPDF}
              className="w-full justify-start"
            >
              {sendingChannel === 'email' && generatingPDF ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Mail className="w-4 h-4 mr-2" />
              )}
              Email avec PDF joint
            </Button>

            <Button
              onClick={() => generateAndSendPDF('whatsapp')}
              disabled={generatingPDF}
              variant="outline"
              className="w-full justify-start"
            >
              {sendingChannel === 'whatsapp' && generatingPDF ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              WhatsApp
            </Button>

            <Button
              onClick={() => generateAndSendPDF('telegram')}
              disabled={generatingPDF}
              variant="outline"
              className="w-full justify-start"
            >
              {sendingChannel === 'telegram' && generatingPDF ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Telegram
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
          <p className="font-semibold">📄 Contenu du PDF:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Page 1: Photo d'invitation + Nom et table de l'invité</li>
            <li>Page 2: Détails de l'événement avec fond d'écran</li>
            <li>Page 3: Programme détaillé du déroulement</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFInvitationSender;
