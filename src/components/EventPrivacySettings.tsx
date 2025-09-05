import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Globe, 
  Lock, 
  EyeOff, 
  Users, 
  UserCheck,
  Clock,
  Settings,
  Save,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface EventPrivacySettingsProps {
  eventId: string;
  currentSettings?: {
    visibility: 'public' | 'private' | 'unlisted';
    requires_approval: boolean;
    allow_guest_plus_ones: boolean;
    show_guest_list: boolean;
    allow_rsvp_changes: boolean;
    rsvp_deadline_days: number;
  };
}

const EventPrivacySettings = ({ eventId, currentSettings }: EventPrivacySettingsProps) => {
  const [settings, setSettings] = useState({
    visibility: 'private' as 'public' | 'private' | 'unlisted',
    requires_approval: false,
    allow_guest_plus_ones: true,
    show_guest_list: true,
    allow_rsvp_changes: true,
    rsvp_deadline_days: 7,
    custom_message: '',
    max_guests_per_invite: 1,
    allow_anonymous_rsvp: false,
    require_phone_number: false,
    auto_approve_known_guests: true,
    ...currentSettings
  });

  const [isLoading, setIsLoading] = useState(false);

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Visible par tous, apparaît dans les recherches',
      icon: Globe,
      color: 'text-success'
    },
    {
      value: 'unlisted',
      label: 'Non répertorié',
      description: 'Accessible par lien uniquement',
      icon: EyeOff,
      color: 'text-warning'
    },
    {
      value: 'private',
      label: 'Privé',
      description: 'Invitations uniquement',
      icon: Lock,
      color: 'text-destructive'
    }
  ];

  const currentVisibilityOption = visibilityOptions.find(opt => opt.value === settings.visibility);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Paramètres de confidentialité sauvegardés !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const getVisibilityBadgeColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-success text-success-foreground';
      case 'unlisted': return 'bg-warning text-warning-foreground';
      case 'private': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            Confidentialité et Paramètres
          </h2>
          <p className="text-muted-foreground">
            Contrôlez qui peut voir et participer à votre événement
          </p>
        </div>
        <Badge className={getVisibilityBadgeColor(settings.visibility)}>
          {currentVisibilityOption?.label}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Visibility Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Visibilité de l'événement
            </CardTitle>
            <CardDescription>
              Définissez qui peut voir votre événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {visibilityOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      settings.visibility === option.value
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => setSettings(prev => ({ ...prev, visibility: option.value as any }))}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-0.5 ${option.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{option.label}</h4>
                          {settings.visibility === option.value && (
                            <Badge variant="secondary" className="text-xs">Sélectionné</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {settings.visibility === 'public' && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning">Événement public</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Votre événement sera visible par tous et apparaîtra dans les recherches publiques.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RSVP Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Paramètres RSVP
            </CardTitle>
            <CardDescription>
              Configurez comment les invités peuvent répondre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="requires-approval">Approbation requise</Label>
                  <p className="text-sm text-muted-foreground">
                    Les RSVP nécessitent votre approbation
                  </p>
                </div>
                <Switch
                  id="requires-approval"
                  checked={settings.requires_approval}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, requires_approval: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow-changes">Permettre les modifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Les invités peuvent modifier leur RSVP
                  </p>
                </div>
                <Switch
                  id="allow-changes"
                  checked={settings.allow_rsvp_changes}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allow_rsvp_changes: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="plus-ones">Permettre les accompagnants</Label>
                  <p className="text-sm text-muted-foreground">
                    Les invités peuvent amener des accompagnants
                  </p>
                </div>
                <Switch
                  id="plus-ones"
                  checked={settings.allow_guest_plus_ones}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, allow_guest_plus_ones: checked }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline-days">Délai de réponse (jours)</Label>
                  <Input
                    id="deadline-days"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.rsvp_deadline_days}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, rsvp_deadline_days: parseInt(e.target.value) || 7 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-guests">Max accompagnants par invitation</Label>
                  <Input
                    id="max-guests"
                    type="number"
                    min="0"
                    max="10"
                    value={settings.max_guests_per_invite}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, max_guests_per_invite: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Paramètres de confidentialité
            </CardTitle>
            <CardDescription>
              Contrôlez les informations visibles par les invités
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="show-guests">Afficher la liste des invités</Label>
                <p className="text-sm text-muted-foreground">
                  Les invités peuvent voir qui d'autre est invité
                </p>
              </div>
              <Switch
                id="show-guests"
                checked={settings.show_guest_list}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, show_guest_list: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="anonymous-rsvp">RSVP anonyme</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre les réponses sans nom complet
                </p>
              </div>
              <Switch
                id="anonymous-rsvp"
                checked={settings.allow_anonymous_rsvp}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allow_anonymous_rsvp: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require-phone">Numéro de téléphone obligatoire</Label>
                <p className="text-sm text-muted-foreground">
                  Demander le numéro de téléphone lors du RSVP
                </p>
              </div>
              <Switch
                id="require-phone"
                checked={settings.require_phone_number}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, require_phone_number: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Message */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Message personnalisé
            </CardTitle>
            <CardDescription>
              Message affiché aux invités lors du RSVP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ajoutez un message personnalisé pour vos invités..."
              value={settings.custom_message}
              onChange={(e) => setSettings(prev => ({ ...prev, custom_message: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-gradient-primary"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventPrivacySettings;