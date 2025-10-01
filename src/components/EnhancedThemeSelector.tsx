import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Sparkles, Heart, Briefcase, Music, Gift } from "lucide-react";
import { toast } from "sonner";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  preview: string;
  suitable_for: string[];
}

const themes: ThemeOption[] = [
  {
    id: 'elegant-gold',
    name: 'Or Élégant',
    description: 'Sophistication dorée avec touches profondes',
    category: 'Luxe',
    colors: {
      primary: '221 39% 11%',
      secondary: '45 93% 47%',
      accent: '45 93% 47%',
      background: '0 0% 99%'
    },
    preview: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
    suitable_for: ['Mariage', 'Gala', 'Événement VIP']
  },
  {
    id: 'romantic-rose',
    name: 'Rose Romantique',
    description: 'Douceur rosée pour les moments tendres',
    category: 'Romance',
    colors: {
      primary: '340 82% 52%',
      secondary: '340 55% 85%',
      accent: '340 82% 52%',
      background: '340 100% 99%'
    },
    preview: 'bg-gradient-to-r from-rose-300 to-rose-500',
    suitable_for: ['Mariage', 'Anniversaire', 'Saint-Valentin']
  },
  {
    id: 'corporate-blue',
    name: 'Bleu Corporate',
    description: 'Professionnel et moderne',
    category: 'Business',
    colors: {
      primary: '217 91% 60%',
      secondary: '217 20% 95%',
      accent: '217 91% 60%',
      background: '0 0% 100%'
    },
    preview: 'bg-gradient-to-r from-blue-400 to-blue-600',
    suitable_for: ['Conférence', 'Séminaire', 'Événement d\'entreprise']
  },
  {
    id: 'nature-green',
    name: 'Vert Nature',
    description: 'Fraîcheur naturelle et apaisante',
    category: 'Nature',
    colors: {
      primary: '142 76% 36%',
      secondary: '142 30% 85%',
      accent: '142 76% 36%',
      background: '142 15% 99%'
    },
    preview: 'bg-gradient-to-r from-green-400 to-green-600',
    suitable_for: ['Événement écologique', 'Extérieur', 'Printemps']
  },
  {
    id: 'vibrant-purple',
    name: 'Violet Vibrant',
    description: 'Créativité et énergie positive',
    category: 'Créatif',
    colors: {
      primary: '271 81% 56%',
      secondary: '271 35% 85%',
      accent: '271 81% 56%',
      background: '271 100% 99%'
    },
    preview: 'bg-gradient-to-r from-purple-400 to-purple-600',
    suitable_for: ['Festival', 'Événement artistique', 'Créatif']
  },
  {
    id: 'sunset-orange',
    name: 'Orange Coucher de Soleil',
    description: 'Chaleur et convivialité',
    category: 'Chaleureux',
    colors: {
      primary: '24 95% 53%',
      secondary: '24 45% 85%',
      accent: '24 95% 53%',
      background: '24 100% 99%'
    },
    preview: 'bg-gradient-to-r from-orange-400 to-red-500',
    suitable_for: ['Automne', 'Fête', 'Convivial']
  }
];

interface EnhancedThemeSelectorProps {
  eventId: string;
  eventType?: string;
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

const EnhancedThemeSelector = ({ 
  eventId, 
  eventType,
  currentTheme,
  onThemeChange 
}: EnhancedThemeSelectorProps) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'elegant-gold');
  const [isApplying, setIsApplying] = useState(false);

  const getRecommendedThemes = () => {
    if (!eventType) return themes;
    
    const typeMapping: Record<string, string[]> = {
      'wedding': ['romantic-rose', 'elegant-gold'],
      'party': ['vibrant-purple', 'sunset-orange'],
      'conference': ['corporate-blue', 'elegant-gold'],
      'charity': ['nature-green', 'corporate-blue'],
      'festival': ['vibrant-purple', 'sunset-orange'],
      'theatre': ['elegant-gold', 'vibrant-purple'],
      'cinema': ['elegant-gold', 'corporate-blue']
    };

    const recommended = typeMapping[eventType] || [];
    return themes.map(theme => ({
      ...theme,
      isRecommended: recommended.includes(theme.id)
    }));
  };

  const handleThemeSelect = async (themeId: string) => {
    setSelectedTheme(themeId);
    setIsApplying(true);

    try {
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        // Apply theme to CSS variables
        applyTheme(theme);
        
        // Save to localStorage for persistence
        localStorage.setItem(`event-theme-${eventId}`, themeId);
        
        // Call the callback if provided
        onThemeChange?.(themeId);
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
        toast.success(`Thème "${theme.name}" appliqué avec succès !`, {
          description: 'Le thème sera visible sur toutes les pages de votre événement.'
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'application du thème:', error);
      toast.error("Erreur lors de l'application du thème");
    } finally {
      setIsApplying(false);
    }
  };

  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;
    
    // Apply colors as CSS custom properties
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--background', theme.colors.background);
    
    // Add theme class to body for additional styling
    document.body.classList.remove(...Array.from(document.body.classList).filter(c => c.startsWith('theme-')));
    document.body.classList.add(`theme-${theme.id}`);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      'Luxe': Sparkles,
      'Romance': Heart,
      'Business': Briefcase,
      'Nature': Gift,
      'Créatif': Palette,
      'Chaleureux': Music
    };
    return icons[category] || Palette;
  };

  const recommendedThemes = getRecommendedThemes();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Sélection du Thème
        </CardTitle>
        <CardDescription>
          Choisissez un thème qui correspond à votre événement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedThemes.map((theme: any) => {
            const IconComponent = getCategoryIcon(theme.category);
            
            return (
              <Card
                key={theme.id}
                className={`cursor-pointer transition-all hover:shadow-glow border-2 relative ${
                  selectedTheme === theme.id
                    ? 'border-accent bg-accent/5 shadow-glow ring-2 ring-accent/20'
                    : 'border-border hover:border-accent/50'
                } ${isApplying && selectedTheme === theme.id ? 'animate-pulse' : ''}`}
                onClick={() => !isApplying && handleThemeSelect(theme.id)}
              >
                {theme.isRecommended && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-gradient-primary text-white">
                      Recommandé
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className={`w-full h-16 rounded-lg mb-3 ${theme.preview}`}></div>
                  
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{theme.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <IconComponent className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{theme.category}</span>
                      </div>
                    </div>
                    {selectedTheme === theme.id && (
                      <Badge variant="secondary" className="text-xs">Actuel</Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3 leading-tight">
                    {theme.description}
                  </p>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Idéal pour :</p>
                    <div className="flex flex-wrap gap-1">
                      {theme.suitable_for.map((use: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedTheme && (
          <div className="mt-6 p-6 bg-accent/10 rounded-lg">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Aperçu du Thème Sélectionné
            </h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-4 bg-card rounded-lg border">
                  <h5 className="font-medium mb-2">Couleurs principales</h5>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themes.find(t => t.id === selectedTheme)?.colors.primary})` }}></div>
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themes.find(t => t.id === selectedTheme)?.colors.secondary})` }}></div>
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: `hsl(${themes.find(t => t.id === selectedTheme)?.colors.accent})` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-4 bg-card rounded-lg border">
                  <h5 className="font-medium mb-2">Exemple de mise en page</h5>
                  <div className="space-y-2">
                    <div className="h-2 bg-primary rounded-full w-3/4"></div>
                    <div className="h-2 bg-secondary rounded-full w-1/2"></div>
                    <div className="h-2 bg-accent rounded-full w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedThemeSelector;