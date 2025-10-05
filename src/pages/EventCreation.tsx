import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Upload, MapPin, Clock, ArrowLeft, Loader2, Settings, Calendar, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import EventCoverUpload from "@/components/EventCoverUpload";
import InvitationDesignUpload from "@/components/InvitationDesignUpload";
import EventTypeSelector from "@/components/EventTypeSelector";
import EventPrivacySettings from "@/components/EventPrivacySettings";
import EventScheduler from "@/components/EventScheduler";
import { useCreateEvent } from "@/hooks/useEvents";

const EventCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createEventMutation = useCreateEvent();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    event_type: "",
    template: "default",
    background_image_url: "",
    invitation_design_url: "",
    privacy: "private" as "public" | "private" | "unlisted",
    requires_approval: false,
    allow_guest_plus_ones: true,
    show_guest_list: true,
    allow_rsvp_changes: true,
    rsvp_deadline_days: 7,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location || !formData.date || !formData.time) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`).toISOString();

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location,
        date_time: dateTime,
        event_type: formData.event_type || undefined,
        template: formData.template,
        background_image_url: formData.background_image_url || undefined,
        invitation_design_url: formData.invitation_design_url || undefined,
      };

      await createEventMutation.mutateAsync(eventData);

      toast({
        title: "Succès",
        description: "Événement créé avec succès !",
      });

      navigate('/admin');
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Créer un Nouvel Événement</h1>
          <p className="text-muted-foreground">
            Configurez tous les détails de votre événement pour créer des invitations personnalisées.
          </p>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Informations</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Confidentialité</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Planification</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            {/* Basic Information Tab */}
            <TabsContent value="basic">
              <div className="space-y-6">
                <EventTypeSelector 
                  selectedType={formData.event_type}
                  onTypeChange={(type) => handleInputChange('event_type', type)}
                />
                
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-6">
                    <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Informations de l'Événement</CardTitle>
                      <CardDescription>Détails essentiels de votre événement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre de l'événement*</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Soirée d'anniversaire, Conférence, etc."
                          required
                        />
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

                      <div className="space-y-2">
                        <Label htmlFor="location">Lieu*</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Adresse complète du lieu"
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Date et Heure</CardTitle>
                      <CardDescription>Quand aura lieu votre événement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date*</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange('date', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Heure*</Label>
                          <Input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) => handleInputChange('time', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>Aperçu de l'Invitation</CardTitle>
                      <CardDescription>Prévisualisation avec vos données</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative h-64 overflow-hidden rounded-b-lg">
                        {formData.invitation_design_url ? (
                          <img 
                            src={formData.invitation_design_url} 
                            alt="Aperçu invitation" 
                            className="w-full h-full object-contain bg-muted"
                          />
                        ) : formData.background_image_url ? (
                          <>
                            <img 
                              src={formData.background_image_url} 
                              alt="Aperçu couverture" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                              <div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                  {formData.title || "Titre de votre événement"}
                                </h3>
                                <div className="flex flex-col gap-2 text-white/90 text-sm">
                                  {formData.date && (
                                    <div className="flex items-center justify-center gap-2">
                                      <CalendarIcon className="w-4 h-4" />
                                      <span>{new Date(formData.date).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                  )}
                                  {formData.time && (
                                    <div className="flex items-center justify-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      <span>{formData.time}</span>
                                    </div>
                                  )}
                                  {formData.location && (
                                    <div className="flex items-center justify-center gap-2">
                                      <MapPin className="w-4 h-4" />
                                      <span className="text-xs">{formData.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-hero flex items-center justify-center text-center px-6">
                            <div>
                              <h3 className="text-2xl font-bold text-white mb-2">
                                {formData.title || "Titre de votre événement"}
                              </h3>
                              <p className="text-white/90 text-sm">
                                Ajoutez un design d'invitation ou une image de couverture
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                </div>
              </div>
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design">
              <div className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <EventCoverUpload
                      currentImageUrl={formData.background_image_url}
                      onImageUploaded={(url) => handleInputChange('background_image_url', url)}
                    />
                    
                    <Card className="shadow-card">
                      <CardHeader>
                        <CardTitle>Modèle d'Invitation</CardTitle>
                        <CardDescription>Style prédéfini pour vos invitations</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="template">Modèle d'invitation</Label>
                          <Select value={formData.template} onValueChange={(value) => handleInputChange('template', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisissez un modèle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Classique</SelectItem>
                              <SelectItem value="modern">Moderne</SelectItem>
                              <SelectItem value="festive">Festif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <InvitationDesignUpload
                      currentImageUrl={formData.invitation_design_url}
                      onImageUploaded={(url) => handleInputChange('invitation_design_url', url)}
                    />
                  </div>
                </div>

                <Card className="shadow-card border-accent/20 bg-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-accent">
                      <Settings className="w-5 h-5" />
                      Prochaines Étapes
                    </CardTitle>
                    <CardDescription>
                      Configurez la confidentialité et la planification dans les onglets suivants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-accent/30 bg-background">
                        <Shield className="w-8 h-8 text-accent mb-2" />
                        <h4 className="font-semibold mb-1">Confidentialité</h4>
                        <p className="text-sm text-muted-foreground">
                          Définissez qui peut voir et participer à votre événement
                        </p>
                      </div>
                      <div className="p-4 rounded-lg border border-accent/30 bg-background">
                        <Calendar className="w-8 h-8 text-accent mb-2" />
                        <h4 className="font-semibold mb-1">Planification</h4>
                        <p className="text-sm text-muted-foreground">
                          Créez des événements récurrents et automatisations
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-accent" />
                    Paramètres de Confidentialité (Optionnel)
                  </CardTitle>
                  <CardDescription>
                    Vous pouvez configurer ces paramètres maintenant ou plus tard depuis le tableau de bord
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EventPrivacySettings 
                    eventId=""
                    currentSettings={{
                      visibility: formData.privacy,
                      requires_approval: formData.requires_approval,
                      allow_guest_plus_ones: formData.allow_guest_plus_ones,
                      show_guest_list: formData.show_guest_list,
                      allow_rsvp_changes: formData.allow_rsvp_changes,
                      rsvp_deadline_days: formData.rsvp_deadline_days,
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Planification Avancée (Optionnel)
                  </CardTitle>
                  <CardDescription>
                    Créez des événements récurrents ou programmez des rappels automatiques. Ces fonctionnalités seront également disponibles après la création de l'événement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 border border-dashed border-accent/30 rounded-lg text-center bg-accent/5">
                    <Calendar className="w-12 h-12 text-accent mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Planification disponible après création</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Les fonctionnalités de planification avancée (événements récurrents, rappels automatiques) seront disponibles une fois votre événement créé. Vous pourrez y accéder depuis le tableau de bord de gestion.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Action buttons */}
            <div className="sticky bottom-4 sm:static bg-background/95 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-4 sm:p-0 rounded-lg sm:rounded-none border sm:border-0 shadow-elegant sm:shadow-none">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                <Button 
                  type="button"
                  variant="outline" 
                  size="lg"
                  asChild
                  disabled={isLoading}
                  className="w-full sm:w-auto touch-target"
                >
                  <Link to="/admin">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Annuler
                  </Link>
                </Button>
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isLoading}
                  className="bg-gradient-primary w-full sm:w-auto touch-target"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    "Créer l'Événement"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  );
};

export default EventCreation;