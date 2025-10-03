import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Music, Users, Gift, Briefcase, BookOpen, Camera, Utensils, Trophy, Star } from "lucide-react";

interface EventType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  examples: string[];
}

const eventTypes: EventType[] = [
  {
    id: 'wedding',
    name: 'Mariage',
    description: 'Célébration d\'union, cérémonie romantique',
    icon: Heart,
    color: 'text-rose-500',
    examples: ['Cérémonie civile', 'Réception', 'Vin d\'honneur']
  },
  {
    id: 'party',
    name: 'Fête',
    description: 'Anniversaires, célébrations privées',
    icon: Gift,
    color: 'text-purple-500',
    examples: ['Anniversaire', 'Pendaison de crémaillère', 'Fête surprise']
  },
  {
    id: 'conference',
    name: 'Conférence',
    description: 'Événements professionnels et séminaires',
    icon: Briefcase,
    color: 'text-blue-500',
    examples: ['Séminaire', 'Formation', 'Présentation']
  },
  {
    id: 'charity',
    name: 'Charité',
    description: 'Événements caritatifs et levées de fonds',
    icon: Users,
    color: 'text-green-500',
    examples: ['Gala de charité', 'Collecte de fonds', 'Événement solidaire']
  },
  {
    id: 'concert',
    name: 'Concert',
    description: 'Spectacles musicaux et performances live',
    icon: Music,
    color: 'text-pink-500',
    examples: ['Concert rock', 'Récital', 'Festival musical']
  },
  {
    id: 'gala',
    name: 'Gala',
    description: 'Soirées de prestige et événements formels',
    icon: Star,
    color: 'text-yellow-500',
    examples: ['Gala de bienfaisance', 'Soirée de gala', 'Remise de prix']
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Événements culturels et artistiques',
    icon: Music,
    color: 'text-orange-500',
    examples: ['Festival de musique', 'Fête de la musique', 'Événement culturel']
  },
  {
    id: 'theatre',
    name: 'Théâtre',
    description: 'Représentations théâtrales et spectacles',
    icon: BookOpen,
    color: 'text-indigo-500',
    examples: ['Pièce de théâtre', 'Spectacle', 'Représentation']
  },
  {
    id: 'cinema',
    name: 'Cinéma',
    description: 'Projections et événements cinématographiques',
    icon: Camera,
    color: 'text-red-500',
    examples: ['Première', 'Projection privée', 'Festival de cinéma']
  },
  {
    id: 'corporate',
    name: 'Entreprise',
    description: 'Événements d\'entreprise et networking',
    icon: Briefcase,
    color: 'text-cyan-500',
    examples: ['Team building', 'Lancement produit', 'Soirée entreprise']
  },
  {
    id: 'dining',
    name: 'Gastronomie',
    description: 'Repas d\'affaires et événements culinaires',
    icon: Utensils,
    color: 'text-amber-500',
    examples: ['Dîner de gala', 'Dégustation', 'Repas d\'affaires']
  },
  {
    id: 'sports',
    name: 'Sport',
    description: 'Événements sportifs et compétitions',
    icon: Trophy,
    color: 'text-emerald-500',
    examples: ['Tournoi', 'Remise de prix', 'Événement sportif']
  },
  {
    id: 'exhibition',
    name: 'Exposition',
    description: 'Salons et expositions artistiques',
    icon: Camera,
    color: 'text-violet-500',
    examples: ['Exposition d\'art', 'Salon professionnel', 'Vernissage']
  },
  {
    id: 'workshop',
    name: 'Atelier',
    description: 'Sessions de formation et workshops',
    icon: BookOpen,
    color: 'text-teal-500',
    examples: ['Workshop créatif', 'Atelier de formation', 'Masterclass']
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'Événements de réseautage professionnel',
    icon: Users,
    color: 'text-sky-500',
    examples: ['Soirée networking', 'Meet-up', 'After-work']
  }
];

interface EventTypeSelectorProps {
  selectedType?: string;
  onTypeChange: (type: string) => void;
}

const EventTypeSelector = ({ selectedType, onTypeChange }: EventTypeSelectorProps) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Type d'Événement</CardTitle>
        <CardDescription>
          Choisissez le type d'événement pour personnaliser l'expérience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {eventTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                selectedType === type.id
                  ? 'border-accent bg-accent/5 shadow-gold'
                  : 'border-border hover:border-accent/50'
              }`}
              onClick={() => onTypeChange(type.id)}
            >
              <CardContent className="p-3 md:p-4 text-center">
                <type.icon className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 ${type.color}`} />
                <h3 className="font-semibold text-xs md:text-sm mb-1">{type.name}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground leading-tight hidden sm:block">
                  {type.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedType && (
          <div className="mt-6 p-4 bg-accent/10 rounded-lg">
            <h4 className="font-medium mb-2">Exemples pour ce type :</h4>
            <div className="flex flex-wrap gap-2">
              {eventTypes
                .find(t => t.id === selectedType)
                ?.examples.map((example, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {example}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventTypeSelector;