import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DrinkPreferencesManagerProps {
  eventId: string;
}

const DrinkPreferencesManager = ({ eventId }: DrinkPreferencesManagerProps) => {
  const [drinks, setDrinks] = useState<string[]>([
    "Champagne", "Vin Rouge", "Vin Blanc", "Cocktail", 
    "Bière", "Jus de Fruits", "Eau", "Sans Alcool", "Café", "Thé"
  ]);
  const [newDrink, setNewDrink] = useState("");
  const { toast } = useToast();

  // En production, vous récupéreriez les préférences depuis la base de données
  // useEffect(() => {
  //   fetchEventDrinkPreferences(eventId);
  // }, [eventId]);

  const addDrink = () => {
    if (!newDrink.trim()) return;
    
    if (drinks.includes(newDrink.trim())) {
      toast({
        title: "Erreur",
        description: "Cette boisson existe déjà",
        variant: "destructive",
      });
      return;
    }

    setDrinks(prev => [...prev, newDrink.trim()]);
    setNewDrink("");
    
    toast({
      title: "Succès",
      description: "Boisson ajoutée aux options",
    });
  };

  const removeDrink = (drinkToRemove: string) => {
    setDrinks(prev => prev.filter(drink => drink !== drinkToRemove));
    
    toast({
      title: "Succès",
      description: "Boisson supprimée des options",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addDrink();
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-accent" />
          Options de Boissons
        </CardTitle>
        <CardDescription>
          Gérez les options de boissons disponibles pour vos invités
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-drink" className="sr-only">Nouvelle boisson</Label>
            <Input
              id="new-drink"
              placeholder="Ajouter une nouvelle boisson..."
              value={newDrink}
              onChange={(e) => setNewDrink(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <Button onClick={addDrink} disabled={!newDrink.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Options disponibles ({drinks.length})</Label>
          <div className="flex flex-wrap gap-2">
            {drinks.map((drink) => (
              <Badge 
                key={drink} 
                variant="secondary" 
                className="text-sm px-3 py-2 flex items-center gap-2"
              >
                <span>{drink}</span>
                <button
                  onClick={() => removeDrink(drink)}
                  className="hover:text-destructive transition-colors"
                  aria-label={`Supprimer ${drink}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          {drinks.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              Aucune option de boisson configurée
            </p>
          )}
        </div>

        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Conseils :</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ajoutez des options variées pour satisfaire tous les goûts</li>
            <li>• Pensez aux options sans alcool et aux boissons chaudes</li>
            <li>• Ces options apparaîtront sur le formulaire d'invitation</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" variant="outline">
            Réinitialiser par défaut
          </Button>
          <Button className="flex-1 bg-gradient-primary">
            Sauvegarder les options
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrinkPreferencesManager;