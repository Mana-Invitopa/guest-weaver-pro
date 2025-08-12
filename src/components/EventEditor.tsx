import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Image, Settings, Save, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/useEvents";
import { useEventTables, useCreateEventTable } from "@/hooks/useEventTables";
import EventCoverUpload from "./EventCoverUpload";

interface EventEditorProps {
  eventId: string;
  onSave?: () => void;
  onDelete?: () => void;
}

const EventEditor = ({ eventId, onSave, onDelete }: EventEditorProps) => {
  const { toast } = useToast();
  const { data: event, isLoading } = useEvent(eventId);
  const { data: eventTables = [] } = useEventTables(eventId);
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  const createTableMutation = useCreateEventTable();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date_time: "",
    max_guests: "",
    status: "draft" as string,
    background_image_url: ""
  });
  
  const [newTable, setNewTable] = useState({
    table_number: "",
    table_name: "",
    max_seats: "8"
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        date_time: event.date_time ? new Date(event.date_time).toISOString().slice(0, 16) : "",
        max_guests: event.max_guests?.toString() || "",
        status: event.status || "draft",
        background_image_url: event.background_image_url || ""
      });
    }
  }, [event]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        ...formData,
        date_time: new Date(formData.date_time).toISOString(),
        max_guests: formData.max_guests ? parseInt(formData.max_guests) : undefined
      });
      
      toast({
        title: "Succès",
        description: "Événement mis à jour avec succès !",
      });
      
      onSave?.();
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'événement",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.")) {
      return;
    }
    
    try {
      await deleteEventMutation.mutateAsync(eventId);
      toast({
        title: "Succès",
        description: "Événement supprimé avec succès !",
      });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      });
    }
  };

  const handleAddTable = async () => {
    if (!newTable.table_number || !newTable.table_name) {
      toast({
        title: "Erreur",
        description: "Numéro et nom de table requis",
        variant: "destructive",
      });
      return;
    }

    try {
      await createTableMutation.mutateAsync({
        event_id: eventId,
        table_number: parseInt(newTable.table_number),
        table_name: newTable.table_name,
        max_seats: parseInt(newTable.max_seats)
      });

      setNewTable({ table_number: "", table_name: "", max_seats: "8" });
      toast({
        title: "Succès",
        description: "Table ajoutée avec succès !",
      });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la table",
        variant: "destructive",
      });
    }
  };

  const handleImageUploaded = (url: string) => {
    handleInputChange('background_image_url', url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      published: { label: "Publié", variant: "default" as const },
      active: { label: "Actif", variant: "default" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Éditer l'Événement</h2>
          <div className="flex items-center gap-2 mt-2">
            {getStatusBadge(formData.status)}
            <span className="text-sm text-muted-foreground">
              Créé le {event ? new Date(event.created_at).toLocaleDateString('fr-FR') : ''}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/invitation/${eventId}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary">
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Nom de votre événement"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Décrivez votre événement..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Adresse du lieu"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date_time">Date et heure *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="date_time"
                      type="datetime-local"
                      value={formData.date_time}
                      onChange={(e) => handleInputChange('date_time', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_guests">Nombre maximum d'invités</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="max_guests"
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => handleInputChange('max_guests', e.target.value)}
                    placeholder="Limite d'invités (optionnel)"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Image de Couverture
              </CardTitle>
              <CardDescription>
                Ajoutez une image de couverture pour votre événement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EventCoverUpload 
                eventId={eventId} 
                currentImageUrl={formData.background_image_url}
                onImageUploaded={handleImageUploaded}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Configuration des Tables</CardTitle>
              <CardDescription>
                Gérez les tables et l'attribution des places pour votre événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="table_number">Numéro</Label>
                  <Input
                    id="table_number"
                    type="number"
                    value={newTable.table_number}
                    onChange={(e) => setNewTable(prev => ({ ...prev, table_number: e.target.value }))}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table_name">Nom de la table</Label>
                  <Input
                    id="table_name"
                    value={newTable.table_name}
                    onChange={(e) => setNewTable(prev => ({ ...prev, table_name: e.target.value }))}
                    placeholder="Table des Amis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_seats">Places max</Label>
                  <Input
                    id="max_seats"
                    type="number"
                    value={newTable.max_seats}
                    onChange={(e) => setNewTable(prev => ({ ...prev, max_seats: e.target.value }))}
                    placeholder="8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button onClick={handleAddTable} className="w-full">
                    Ajouter Table
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Tables Existantes ({eventTables.length})</h4>
                {eventTables.length > 0 ? (
                  <div className="grid gap-2">
                    {eventTables.map((table) => (
                      <div key={table.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">Table {table.table_number}</Badge>
                          <span className="font-medium">{table.table_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {table.current_seats}/{table.max_seats} places
                          </span>
                        </div>
                        <Button variant="destructive" size="sm">
                          Supprimer
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6">
                    Aucune table configurée pour cet événement
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Paramètres Avancés</CardTitle>
              <CardDescription>
                Configuration avancée de l'événement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL de l'image de couverture</Label>
                <Input
                  value={formData.background_image_url}
                  onChange={(e) => handleInputChange('background_image_url', e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Statistiques</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Invités actuels:</span>
                    <span className="ml-2 font-medium">{event?.current_guests || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tables configurées:</span>
                    <span className="ml-2 font-medium">{eventTables.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventEditor;