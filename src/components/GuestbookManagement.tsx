import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, Calendar, User, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGuestbook, useCreateGuestbookEntry, type GuestbookEntry } from "@/hooks/useGuestbook";

interface GuestbookManagementProps {
  eventId: string;
}

const GuestbookManagement = ({ eventId }: GuestbookManagementProps) => {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: "",
    message: "",
    photo_url: ""
  });

  const { toast } = useToast();
  const { data: entries = [], isLoading } = useGuestbook(eventId);
  const createEntryMutation = useCreateGuestbookEntry();

  const handleAddEntry = async () => {
    if (!newEntry.name || !newEntry.message) {
      toast({
        title: "Erreur",
        description: "Le nom et le message sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEntryMutation.mutateAsync({
        event_id: eventId,
        name: newEntry.name,
        message: newEntry.message,
        photo_url: newEntry.photo_url || undefined,
      });

      setNewEntry({ name: "", message: "", photo_url: "" });
      setIsAddingEntry(false);
      
      toast({
        title: "Succès",
        description: "Message ajouté au livre d'or !",
      });
    } catch (error) {
      console.error('Error adding guestbook entry:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le message",
        variant: "destructive",
      });
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Livre d'Or
              </CardTitle>
              <CardDescription>
                Messages et souvenirs laissés par vos invités
              </CardDescription>
            </div>
            <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Message</DialogTitle>
                  <DialogDescription>
                    Ajoutez un message au livre d'or
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={newEntry.name}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom de l'invité"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={newEntry.message}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Écrivez votre message ici..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">URL de la photo (optionnel)</Label>
                    <Input
                      id="photo"
                      value={newEntry.photo_url}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, photo_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddEntry} 
                      className="flex-1"
                      disabled={createEntryMutation.isPending}
                    >
                      {createEntryMutation.isPending ? "Ajout..." : "Ajouter"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <Badge variant="secondary">{entries.length} message{entries.length > 1 ? 's' : ''}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Guestbook Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <div className="animate-pulse">Chargement des messages...</div>
            </CardContent>
          </Card>
        ) : entries.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun message dans le livre d'or pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {entry.photo_url ? (
                    <img 
                      src={entry.photo_url} 
                      alt={`Photo de ${entry.name}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{entry.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(entry.created_at)}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{entry.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default GuestbookManagement;