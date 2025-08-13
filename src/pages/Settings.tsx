import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useCreateProfile, useUpdateProfile } from "@/hooks/useProfiles";
import { User, Bell, Shield, Palette, Globe, Download, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
  });

  const [notifications, setNotifications] = useState({
    email_invitations: true,
    event_reminders: true,
    guest_responses: true,
    system_updates: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "fr",
    timezone: "Europe/Paris",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: profile.email || user?.email || "",
      });
    } else if (user) {
      setProfileForm({
        full_name: "",
        email: user.email || "",
      });
    }
  }, [profile, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile) {
      updateProfileMutation.mutate(profileForm);
    } else {
      createProfileMutation.mutate(profileForm);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez votre profil et les paramètres de l'application
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {profileForm.full_name ? getUserInitials(profileForm.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profileForm.full_name || 'Nom non défini'}</CardTitle>
                <CardDescription>{profileForm.email}</CardDescription>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Administrateur
                </Badge>
              </CardHeader>
            </Card>

            <Card className="md:col-span-2 shadow-card">
              <CardHeader>
                <CardTitle>Informations du profil</CardTitle>
                <CardDescription>
                  Mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        full_name: e.target.value
                      }))}
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      placeholder="votre@email.com"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-gradient-primary"
                    disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {createProfileMutation.isPending || updateProfileMutation.isPending 
                      ? "Sauvegarde..." 
                      : "Sauvegarder"
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>
                Configurez quand et comment vous souhaitez être notifié
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      {key === 'email_invitations' && 'Notifications d\'invitation par e-mail'}
                      {key === 'event_reminders' && 'Rappels d\'événements'}
                      {key === 'guest_responses' && 'Réponses des invités'}
                      {key === 'system_updates' && 'Mises à jour système'}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {key === 'email_invitations' && 'Recevoir les notifications pour les nouvelles invitations'}
                      {key === 'event_reminders' && 'Recevoir des rappels avant vos événements'}
                      {key === 'guest_responses' && 'Être notifié des RSVP et des réponses'}
                      {key === 'system_updates' && 'Recevoir les notifications de mise à jour'}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({
                        ...prev,
                        [key]: checked
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Préférences de l'application</CardTitle>
              <CardDescription>
                Personnalisez votre expérience utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Thème</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={preferences.theme}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      theme: e.target.value
                    }))}
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="system">Système</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Langue</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={preferences.timezone}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      timezone: e.target.value
                    }))}
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification il y a 30 jours
                    </p>
                  </div>
                  <Button variant="outline">
                    Changer le mot de passe
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Authentification à deux facteurs</h3>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez une couche de sécurité supplémentaire
                    </p>
                  </div>
                  <Button variant="outline">
                    Configurer 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Zone de danger</CardTitle>
                <CardDescription>
                  Actions irréversibles pour votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h3 className="font-medium">Exporter les données</h3>
                    <p className="text-sm text-muted-foreground">
                      Téléchargez toutes vos données
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h3 className="font-medium text-destructive">Supprimer le compte</h3>
                    <p className="text-sm text-muted-foreground">
                      Supprimez définitivement votre compte et toutes vos données
                    </p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h3 className="font-medium">Déconnexion</h3>
                    <p className="text-sm text-muted-foreground">
                      Se déconnecter de cette session
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    Se déconnecter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;