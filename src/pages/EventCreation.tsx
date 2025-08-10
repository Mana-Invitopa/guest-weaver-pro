import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ImageIcon, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";

const EventCreation = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    backgroundImage: null as File | null,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, backgroundImage: file }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Créer un Nouvel Événement</h1>
          <p className="text-muted-foreground">
            Configurez tous les détails de votre événement pour créer des invitations personnalisées.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Informations de Base</CardTitle>
                <CardDescription>
                  Les détails essentiels de votre événement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'événement *</Label>
                  <Input 
                    id="title"
                    placeholder="Mariage de Marie & Paul"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Nous avons l'honneur de vous convier à célébrer notre union..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                  Date et Heure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input 
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Heure *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="time"
                        type="time"
                        className="pl-10"
                        value={formData.time}
                        onChange={(e) => handleInputChange("time", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-accent" />
                  Lieu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="location">Adresse du lieu *</Label>
                  <Input 
                    id="location"
                    placeholder="Château de Versailles, Grande Galerie"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-accent" />
                  Image de Fond
                </CardTitle>
                <CardDescription>
                  Une image qui représente votre événement (optionnel)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input 
                    id="background-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.backgroundImage && (
                    <div className="text-sm text-muted-foreground">
                      Fichier sélectionné: {formData.backgroundImage.name}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Aperçu de l'Invitation</CardTitle>
                <CardDescription>
                  Voici comment votre invitation apparaîtra aux invités
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-64 overflow-hidden rounded-b-lg">
                  <div className="absolute inset-0 bg-gradient-hero"></div>
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
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Templates d'Invitation</CardTitle>
                <CardDescription>
                  Choisissez un style pour vos invitations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3 cursor-pointer hover:border-accent transition-smooth">
                    <div className="h-20 bg-gradient-primary rounded mb-2"></div>
                    <p className="text-xs text-center">Élégant</p>
                  </div>
                  <div className="border rounded-lg p-3 cursor-pointer hover:border-accent transition-smooth">
                    <div className="h-20 bg-gradient-secondary rounded mb-2"></div>
                    <p className="text-xs text-center">Moderne</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Plus de templates seront disponibles une fois Supabase connecté.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
          <Button variant="outline" size="lg">
            Enregistrer comme Brouillon
          </Button>
          <Button variant="premium" size="lg" disabled>
            Créer l'Événement
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mt-6">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Note:</strong> La création d'événements nécessite une connexion à Supabase 
            pour la sauvegarde et la gestion des données.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventCreation;