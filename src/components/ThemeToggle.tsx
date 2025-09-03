import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      value: "light",
      label: "Clair",
      description: "Thème clair pour une utilisation de jour",
      icon: Sun,
    },
    {
      value: "dark", 
      label: "Sombre",
      description: "Thème sombre pour une utilisation de nuit",
      icon: Moon,
    },
    {
      value: "system",
      label: "Système",
      description: "Utilise les préférences de votre système",
      icon: Monitor,
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sun className="w-5 h-5" />
          <span>Apparence</span>
        </CardTitle>
        <CardDescription>
          Choisissez le thème de l'application qui vous convient le mieux
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={setTheme} className="space-y-3">
          {themes.map((themeOption) => (
            <div key={themeOption.value} className="flex items-center space-x-3">
              <RadioGroupItem
                value={themeOption.value}
                id={themeOption.value}
                className="mt-1"
              />
              <Label
                htmlFor={themeOption.value}
                className="flex items-start space-x-3 cursor-pointer flex-1"
              >
                <div className="p-2 rounded-lg bg-muted">
                  <themeOption.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{themeOption.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {themeOption.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  )
}

export function MiniThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("light")}
        className="h-8 w-8 p-0"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("dark")}
        className="h-8 w-8 p-0"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme("system")}
        className="h-8 w-8 p-0"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  )
}