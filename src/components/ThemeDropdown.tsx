import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Sparkles, 
  Heart, 
  Briefcase, 
  Leaf,
  Zap,
  Crown
} from "lucide-react";

const themes = [
  {
    id: 'elegant-gold',
    name: 'Or Élégant',
    icon: Crown,
    colors: ['#F59E0B', '#1F2937', '#F3F4F6']
  },
  {
    id: 'romantic-rose',
    name: 'Rose Romantique', 
    icon: Heart,
    colors: ['#EC4899', '#FCE7F3', '#FDF2F8']
  },
  {
    id: 'corporate-blue',
    name: 'Bleu Corporate',
    icon: Briefcase,
    colors: ['#3B82F6', '#DBEAFE', '#F8FAFC']
  },
  {
    id: 'nature-green',
    name: 'Vert Nature',
    icon: Leaf,
    colors: ['#10B981', '#D1FAE5', '#F0FDF4']
  },
  {
    id: 'vibrant-purple',
    name: 'Violet Vibrant',
    icon: Zap,
    colors: ['#8B5CF6', '#E9D5FF', '#FAF5FF']
  },
  {
    id: 'sunset-orange',
    name: 'Orange Coucher',
    icon: Sparkles,
    colors: ['#F97316', '#FED7AA', '#FFF7ED']
  }
];

export function ThemeDropdown() {
  const { theme, setTheme } = useTheme();
  const [selectedEventTheme, setSelectedEventTheme] = useState('elegant-gold');

  const systemThemes = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor }
  ];

  const applyEventTheme = (themeId: string) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme) {
      setSelectedEventTheme(themeId);
      // Apply theme colors to CSS variables
      const root = document.documentElement;
      const [accent, primary, background] = selectedTheme.colors;
      root.style.setProperty('--theme-accent', accent);
      root.style.setProperty('--theme-primary', primary);
      root.style.setProperty('--theme-background', background);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3">
          <Palette className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Thèmes</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Apparence Système</DropdownMenuLabel>
        {systemThemes.map((sysTheme) => {
          const IconComponent = sysTheme.icon;
          return (
            <DropdownMenuItem
              key={sysTheme.value}
              onClick={() => setTheme(sysTheme.value)}
              className={theme === sysTheme.value ? "bg-accent" : ""}
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {sysTheme.label}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Thèmes d'Événements</DropdownMenuLabel>
        {themes.map((eventTheme) => {
          const IconComponent = eventTheme.icon;
          return (
            <DropdownMenuItem
              key={eventTheme.id}
              onClick={() => applyEventTheme(eventTheme.id)}
              className={selectedEventTheme === eventTheme.id ? "bg-accent" : ""}
            >
              <div className="flex items-center w-full">
                <IconComponent className="h-4 w-4 mr-2" />
                <span className="flex-1">{eventTheme.name}</span>
                <div className="flex gap-1 ml-2">
                  {eventTheme.colors.slice(0, 3).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}