import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Type, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

interface EventDeleteDialogProps {
  eventTitle: string;
  eventDate: string;
  inviteesCount: number;
  onConfirmDelete: () => void;
  children?: React.ReactNode;
}

const EventDeleteDialog = ({ 
  eventTitle, 
  eventDate, 
  inviteesCount, 
  onConfirmDelete,
  children 
}: EventDeleteDialogProps) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const expectedText = eventTitle.toLowerCase();
  const isValid = confirmationText.toLowerCase() === expectedText;

  const handleConfirm = () => {
    if (!isValid) {
      toast.error("Le nom de l'événement ne correspond pas");
      return;
    }
    
    onConfirmDelete();
    setIsOpen(false);
    setConfirmationText("");
    toast.success("Événement supprimé avec succès");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmationText("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        )}
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          
          <AlertDialogTitle className="text-xl font-bold">
            Supprimer définitivement
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-base text-left">
            Vous êtes sur le point de supprimer définitivement cet événement. Cette action est{" "}
            <strong className="text-destructive">irréversible</strong> et entraînera la perte de toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Event Details */}
        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Détails de l'événement
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{eventTitle}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{eventDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{inviteesCount} invité{inviteesCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Warning Info */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h5 className="font-medium text-destructive mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Ce qui sera supprimé
            </h5>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• L'événement et toutes ses informations</li>
              <li>• Tous les invités et leurs réponses</li>
              <li>• Les QR codes générés</li>
              <li>• L'historique des check-ins</li>
              <li>• Les messages du livre d'or</li>
              <li>• Les paramètres et thèmes personnalisés</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="confirmation" className="text-sm font-medium">
                Tapez le nom de l'événement pour confirmer :
              </Label>
              <div className="mt-1">
                <Badge variant="secondary" className="font-mono text-xs">
                  {eventTitle}
                </Badge>
              </div>
            </div>
            
            <Input
              id="confirmation"
              placeholder="Nom de l'événement..."
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={`font-mono ${isValid ? 'border-success' : confirmationText ? 'border-destructive' : ''}`}
            />
            
            {confirmationText && !isValid && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Le nom ne correspond pas
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="flex-1">
            Annuler
          </AlertDialogCancel>
          
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid}
            className={`flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
              !isValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer définitivement
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EventDeleteDialog;