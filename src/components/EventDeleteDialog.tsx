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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Calendar, Users, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  date_time: string;
  current_guests?: number;
  max_guests?: number;
  location: string;
}

interface EventDeleteDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (eventId: string) => Promise<void>;
  isDeleting?: boolean;
}

export const EventDeleteDialog = ({
  event,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false
}: EventDeleteDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const confirmationText = `SUPPRIMER ${event.title.toUpperCase()}`;
  const isConfirmValid = confirmText === confirmationText;

  const eventDate = new Date(event.date_time);
  const isUpcoming = eventDate > new Date();
  const formattedDate = format(eventDate, "dd MMMM yyyy 'à' HH:mm", { locale: fr });

  const handleConfirm = async () => {
    if (isConfirmValid && !isDeleting) {
      await onConfirm(event.id);
      setConfirmText("");
    }
  };

  const handleCancel = () => {
    setConfirmText("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl font-semibold text-destructive">
                Supprimer l'événement
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                Cette action est irréversible et supprimera définitivement toutes les données.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-6 py-4">
          {/* Event Details Card */}
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formattedDate}</span>
                  {isUpcoming && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      À venir
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {event.current_guests || 0}
                    {event.max_guests && ` / ${event.max_guests}`} invités
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 text-center text-muted-foreground">📍</span>
                  <span className="text-muted-foreground">{event.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="flex space-x-3">
              <Trash2 className="w-5 h-5 text-destructive mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  Les éléments suivants seront supprimés définitivement :
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Toutes les informations de l'événement</li>
                  <li>• La liste complète des invités</li>
                  <li>• Tous les RSVPs et confirmations</li>
                  <li>• Les messages du livre d'or</li>
                  <li>• Les QR codes générés</li>
                  <li>• L'historique des check-ins</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Pour confirmer, tapez "{confirmationText}" ci-dessous :
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Tapez: ${confirmationText}`}
              className={`font-mono ${
                confirmText && !isConfirmValid 
                  ? "border-destructive focus-visible:ring-destructive" 
                  : ""
              }`}
              autoComplete="off"
              spellCheck="false"
            />
            {confirmText && !isConfirmValid && (
              <p className="text-sm text-destructive">
                Le texte de confirmation ne correspond pas.
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter className="space-x-3">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="flex-1"
          >
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isDeleting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Suppression...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Supprimer définitivement</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};