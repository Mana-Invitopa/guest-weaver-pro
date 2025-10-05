import { Button } from "@/components/ui/button";
import { Send, Mail } from "lucide-react";
import { useSendEventProgram } from "@/hooks/useSendEventProgram";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SendProgramButtonProps {
  eventId: string;
}

export default function SendProgramButton({ eventId }: SendProgramButtonProps) {
  const { toast } = useToast();
  const sendProgram = useSendEventProgram();

  const handleSendProgram = async () => {
    try {
      const result = await sendProgram.mutateAsync({ eventId });
      
      toast({
        title: "Programme préparé",
        description: `Le programme est prêt à être envoyé à ${result.count} invité(s) confirmé(s)`,
      });

      // In a real implementation, you would call an edge function here
      // to actually send the emails
      console.log('Program data ready to send:', result);
      
    } catch (error: any) {
      console.error('Error preparing program:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de préparer le programme",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="w-4 h-4" />
          Envoyer le programme
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Envoyer le programme aux invités</AlertDialogTitle>
          <AlertDialogDescription>
            Le programme sera envoyé par email à tous les invités ayant confirmé leur présence (RSVP).
            Les invités ayant reçu une invitation par SMS ne recevront pas ce programme (ils utilisent la vérification par code).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSendProgram}
            disabled={sendProgram.isPending}
            className="bg-gradient-primary"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendProgram.isPending ? "Envoi..." : "Envoyer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
