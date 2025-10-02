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
import { User, Bell, Shield, Palette, Globe, Download, Trash2, Save, Zap, MessageCircle, Send, Mail, Smartphone, Settings as SettingsIcon, Key, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import IntegrationCard from "@/components/IntegrationCard";
import IdentityVerification from "@/components/IdentityVerification";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const createProfileMutation = useCreateProfile();
  const updateProfileMutation = useUpdateProfile();

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
    country: "",
    city: "",
  });

  const [notifications, setNotifications] = useState({
    email_invitations: true,
    event_reminders: true,
    guest_responses: true,
    system_updates: false,
  });

  const [preferences, setPreferences] = useState({
    theme: "system",
    language: "fr",
    timezone: "Europe/Paris",
  });

  const [integrations, setIntegrations] = useState({
    whatsapp: { enabled: false, configured: false },
    telegram: { enabled: false, configured: false },
    sms: { enabled: false, configured: false },
    email: { enabled: true, configured: true }
  });

  const [integrationFormData, setIntegrationFormData] = useState({
    whatsapp: {
      apiKey: "",
      webhookUrl: "",
      phoneNumber: "",
    },
    telegram: {
      botToken: "",
      webhookUrl: "",
    },
    sms: {
      apiKey: "",
      senderName: "",
      provider: "twilio"
    },
    email: {
      fromName: "InviTopia",
      replyTo: "",
    }
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || "",
        email: profile.email || user?.email || "",
        avatar_url: (profile as any).avatar_url || "",
        country: (profile as any).country || "",
        city: (profile as any).city || "",
      });
    } else if (user) {
      setProfileForm({
        full_name: "",
        email: user.email || "",
        avatar_url: "",
        country: "",
        city: "",
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

  const handleToggleIntegration = (integration: keyof typeof integrations) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        enabled: !prev[integration].enabled
      }
    }));
  };

  const handleSaveIntegration = async (integration: keyof typeof integrations) => {
    try {
      setIntegrations(prev => ({
        ...prev,
        [integration]: {
          ...prev[integration],
          configured: true
        }
      }));

      toast.success(`L'intégration ${integration.toUpperCase()} a été configurée avec succès.`);
    } catch (error) {
      toast.error("Impossible de sauvegarder la configuration.");
    }
  };

  const updateIntegrationFormData = (integration: string, field: string, value: string) => {
    setIntegrationFormData(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        [field]: value
      }
    }));
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="verification">Vérification</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ProfilePhotoUpload 
                currentPhotoUrl={profileForm.avatar_url}
                onPhotoUploaded={(url) => setProfileForm(prev => ({ ...prev, avatar_url: url }))}
                userName={profileForm.full_name}
              />
              
              <Card className="shadow-card">
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country">Pays</Label>
                        <Input
                          id="country"
                          value={profileForm.country}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            country: e.target.value
                          }))}
                          placeholder="Ex: France"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input
                          id="city"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            city: e.target.value
                          }))}
                          placeholder="Ex: Paris"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit" 
                      className="bg-gradient-primary w-full"
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
            
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={profileForm.avatar_url} />
                  <AvatarFallback className="text-lg bg-gradient-primary text-white">
                    {profileForm.full_name ? profileForm.full_name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profileForm.full_name || 'Nom non défini'}</CardTitle>
                <CardDescription>{profileForm.email}</CardDescription>
                <Badge variant="secondary" className="w-fit mx-auto">
                  Administrateur
                </Badge>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <IdentityVerification />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <ThemeToggle />
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">Intégrations API</h2>
              <p className="text-muted-foreground">
                Configurez vos intégrations pour partager les invitations via différents canaux
              </p>
            </div>
          </div>

          {/* WhatsApp Business API */}
          <IntegrationCard
            title="WhatsApp Business"
            description="Envoyez des invitations via l'API WhatsApp Business"
            icon={MessageCircle}
            integration="whatsapp"
            integrations={integrations}
            onToggleIntegration={handleToggleIntegration}
            onSaveIntegration={handleSaveIntegration}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp-api-key">Clé API WhatsApp Business</Label>
                <Input
                  id="whatsapp-api-key"
                  type="password"
                  placeholder="Entrez votre clé API"
                  value={integrationFormData.whatsapp.apiKey}
                  onChange={(e) => updateIntegrationFormData("whatsapp", "apiKey", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-phone">Numéro de téléphone</Label>
                <Input
                  id="whatsapp-phone"
                  placeholder="+33123456789"
                  value={integrationFormData.whatsapp.phoneNumber}
                  onChange={(e) => updateIntegrationFormData("whatsapp", "phoneNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-webhook">URL Webhook (optionnel)</Label>
                <Input
                  id="whatsapp-webhook"
                  placeholder="https://votre-webhook.com/whatsapp"
                  value={integrationFormData.whatsapp.webhookUrl}
                  onChange={(e) => updateIntegrationFormData("whatsapp", "webhookUrl", e.target.value)}
                />
              </div>
            </div>
          </IntegrationCard>

          {/* Telegram Bot */}
          <IntegrationCard
            title="Telegram Bot"
            description="Créez un bot Telegram pour envoyer des invitations"
            icon={Send}
            integration="telegram"
            integrations={integrations}
            onToggleIntegration={handleToggleIntegration}
            onSaveIntegration={handleSaveIntegration}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="telegram-token">Token du Bot Telegram</Label>
                <Input
                  id="telegram-token"
                  type="password"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  value={integrationFormData.telegram.botToken}
                  onChange={(e) => updateIntegrationFormData("telegram", "botToken", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Obtenez votre token en créant un bot via @BotFather sur Telegram
                </p>
              </div>
              <div>
                <Label htmlFor="telegram-webhook">URL Webhook (optionnel)</Label>
                <Input
                  id="telegram-webhook"
                  placeholder="https://votre-webhook.com/telegram"
                  value={integrationFormData.telegram.webhookUrl}
                  onChange={(e) => updateIntegrationFormData("telegram", "webhookUrl", e.target.value)}
                />
              </div>
            </div>
          </IntegrationCard>

          {/* SMS Integration */}
          <IntegrationCard
            title="SMS (Twilio/Vonage)"
            description="Envoyez des invitations par SMS"
            icon={Smartphone}
            integration="sms"
            integrations={integrations}
            onToggleIntegration={handleToggleIntegration}
            onSaveIntegration={handleSaveIntegration}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="sms-api-key">Clé API SMS</Label>
                <Input
                  id="sms-api-key"
                  type="password"
                  placeholder="Clé API de votre fournisseur SMS"
                  value={integrationFormData.sms.apiKey}
                  onChange={(e) => updateIntegrationFormData("sms", "apiKey", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sms-sender">Nom de l'expéditeur</Label>
                <Input
                  id="sms-sender"
                  placeholder="InviTopia"
                  value={integrationFormData.sms.senderName}
                  onChange={(e) => updateIntegrationFormData("sms", "senderName", e.target.value)}
                />
              </div>
            </div>
          </IntegrationCard>

          {/* Email Configuration */}
          <IntegrationCard
            title="Configuration Email"
            description="Personnalisez vos paramètres d'envoi d'emails"
            icon={Mail}
            integration="email"
            integrations={integrations}
            onToggleIntegration={handleToggleIntegration}
            onSaveIntegration={handleSaveIntegration}
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-from">Nom de l'expéditeur</Label>
                <Input
                  id="email-from"
                  placeholder="InviTopia Events"
                  value={integrationFormData.email.fromName}
                  onChange={(e) => updateIntegrationFormData("email", "fromName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email-reply">Email de réponse (optionnel)</Label>
                <Input
                  id="email-reply"
                  type="email"
                  placeholder="contact@votredomaine.com"
                  value={integrationFormData.email.replyTo}
                  onChange={(e) => updateIntegrationFormData("email", "replyTo", e.target.value)}
                />
              </div>
            </div>
          </IntegrationCard>
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