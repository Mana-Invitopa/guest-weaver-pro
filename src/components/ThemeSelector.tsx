import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  preview: string;
}

const themes: ThemeOption[] = [
  {
    id: "default",
    name: "Défaut",
    description: "Thème moderne et élégant",
    primaryColor: "hsl(222, 84%, 53%)",
    secondaryColor: "hsl(210, 40%, 94%)",
    accentColor: "hsl(210, 40%, 87%)",
    preview: "bg-gradient-to-r from-blue-500 to-blue-600"
  },
  {
    id: "elegant",
    name: "Élégant",
    description: "Noir et or sophistiqué",
    primaryColor: "hsl(45, 100%, 50%)",
    secondaryColor: "hsl(0, 0%, 10%)",
    accentColor: "hsl(0, 0%, 20%)",
    preview: "bg-gradient-to-r from-yellow-400 to-yellow-600"
  },
  {
    id: "romantic",
    name: "Romantique",
    description: "Rose et blanc doux",
    primaryColor: "hsl(330, 81%, 60%)",
    secondaryColor: "hsl(350, 100%, 97%)",
    accentColor: "hsl(340, 82%, 52%)",
    preview: "bg-gradient-to-r from-pink-400 to-pink-500"
  },
  {
    id: "corporate",
    name: "Corporatif",
    description: "Bleu marine professionnel",
    primaryColor: "hsl(221, 83%, 43%)",
    secondaryColor: "hsl(210, 17%, 93%)",
    accentColor: "hsl(217, 91%, 60%)",
    preview: "bg-gradient-to-r from-blue-700 to-blue-800"
  },
  {
    id: "nature",
    name: "Nature",
    description: "Vert naturel et apaisant",
    primaryColor: "hsl(142, 76%, 36%)",
    secondaryColor: "hsl(138, 76%, 97%)",
    accentColor: "hsl(142, 70%, 45%)",
    preview: "bg-gradient-to-r from-green-500 to-green-600"
  },
  {
    id: "sunset",
    name: "Coucher de Soleil",
    description: "Orange et rouge chaleureux",
    primaryColor: "hsl(24, 95%, 53%)",
    secondaryColor: "hsl(25, 100%, 97%)",
    accentColor: "hsl(16, 100%, 66%)",
    preview: "bg-gradient-to-r from-orange-400 to-red-500"
  }
];

interface ThemeSelectorProps {
  eventId: string;
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
}

const ThemeSelector = ({ eventId, currentTheme = "default", onThemeChange }: ThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId);
    setIsApplying(true);

    try {
      // Ici vous pourriez sauvegarder le thème dans la base de données
      // await updateEventTheme(eventId, themeId);
      
      // Pour l'instant, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Appliquer le thème au document
      applyTheme(themes.find(t => t.id === themeId));
      
      onThemeChange?.(themeId);
      
      toast({
        title: "Thème appliqué",
        description: `Le thème "${themes.find(t => t.id === themeId)?.name}" a été appliqué avec succès`,
      });
    } catch (error) {
      console.error('Error applying theme:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer le thème",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const applyTheme = (theme?: ThemeOption) => {
    if (!theme) return;

    // Appliquer les variables CSS
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--secondary', theme.secondaryColor);
    root.style.setProperty('--accent', theme.accentColor);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Choix du Thème
          </CardTitle>
          <CardDescription>
            Personnalisez l'apparence de votre événement avec un thème adapté à votre style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
              <Card 
                key={theme.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedTheme === theme.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-card'
                }`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <CardContent className="p-4">
                  <div className={`w-full h-24 rounded-lg mb-3 ${theme.preview}`} />
                  
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{theme.name}</h3>
                    {selectedTheme === theme.id && (
                      <Badge className="bg-success text-success-foreground">
                        <Check className="w-3 h-3 mr-1" />
                        Actuel
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {theme.description}
                  </p>
                  
                  {/* Color Palette Preview */}
                  <div className="flex gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.primaryColor }}
                      title="Couleur primaire"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.secondaryColor }}
                      title="Couleur secondaire"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.accentColor }}
                      title="Couleur d'accent"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {isApplying && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Application du thème en cours...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Aperçu du Thème</CardTitle>
          <CardDescription>
            Voici comment votre événement apparaîtra avec le thème sélectionné
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample Event Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Aperçu de l'Événement</CardTitle>
                <CardDescription>
                  Ceci est un aperçu de la façon dont votre événement apparaîtra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Action Primaire
                  </Button>
                  <Button size="sm" variant="outline">
                    Action Secondaire
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeSelector;