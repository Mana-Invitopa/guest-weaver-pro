import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageCircle, 
  Send, 
  Mail, 
  Smartphone,
  Settings,
  Key,
  CheckCircle,
  XCircle,
  Save
} from "lucide-react";

interface IntegrationConfig {
  enabled: boolean;
  configured: boolean;
  apiKey?: string;
  webhookUrl?: string;
  phoneNumber?: string;
  senderName?: string;
}

interface IntegrationsState {
  whatsapp: IntegrationConfig;
  telegram: IntegrationConfig;
  sms: IntegrationConfig;
  email: IntegrationConfig;
}

const IntegrationsSettings = () => {
  const { toast } = useToast();
  
  const [integrations, setIntegrations] = useState<IntegrationsState>({
    whatsapp: { enabled: false, configured: false },
    telegram: { enabled: false, configured: false },
    sms: { enabled: false, configured: false },
    email: { enabled: true, configured: true } // Email is pre-configured with Resend
  });

  const [formData, setFormData] = useState({
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
      provider: "twilio" // Default provider
    },
    email: {
      fromName: "InviTopia",
      replyTo: "",
    }
  });

  const handleToggleIntegration = (integration: keyof IntegrationsState) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration],
        enabled: !prev[integration].enabled
      }
    }));
  };

  const handleSaveIntegration = async (integration: keyof IntegrationsState) => {
    try {
      // Here we would save to Supabase or your backend
      // For now, we'll just simulate saving and mark as configured
      
      setIntegrations(prev => ({
        ...prev,
        [integration]: {
          ...prev[integration],
          configured: true
        }
      }));

      toast({
        title: "Configuration sauvegardée",
        description: `L'intégration ${integration.toUpperCase()} a été configurée avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration.",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (integration: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [integration]: {
        ...prev[integration as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const IntegrationCard = ({ 
    title, 
    description, 
    icon: Icon, 
    integration, 
    children 
  }: {
    title: string;
    description: string;
    icon: any;
    integration: keyof IntegrationsState;
    children: React.ReactNode;
  }) => {
    const config = integrations[integration];
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {config.configured ? (
                <Badge variant="default" className="bg-success text-success-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Configuré
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-3 h-3 mr-1" />
                  Non configuré
                </Badge>
              )}
              <Switch
                checked={config.enabled}
                onCheckedChange={() => handleToggleIntegration(integration)}
              />
            </div>
          </div>
        </CardHeader>
        {config.enabled && (
          <CardContent>
            {children}
            <Button 
              onClick={() => handleSaveIntegration(integration)}
              className="w-full mt-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder la configuration
            </Button>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intégrations API</h1>
          <p className="text-muted-foreground">
            Configurez vos intégrations pour partager les invitations via différents canaux
          </p>
        </div>
      </div>

      <Tabs defaultValue="messaging" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messaging">Messagerie</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="messaging" className="space-y-6">
          {/* WhatsApp Business API */}
          <IntegrationCard
            title="WhatsApp Business"
            description="Envoyez des invitations via l'API WhatsApp Business"
            icon={MessageCircle}
            integration="whatsapp"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp-api-key">Clé API WhatsApp Business</Label>
                <Input
                  id="whatsapp-api-key"
                  type="password"
                  placeholder="Entrez votre clé API"
                  value={formData.whatsapp.apiKey}
                  onChange={(e) => updateFormData("whatsapp", "apiKey", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-phone">Numéro de téléphone</Label>
                <Input
                  id="whatsapp-phone"
                  placeholder="+33123456789"
                  value={formData.whatsapp.phoneNumber}
                  onChange={(e) => updateFormData("whatsapp", "phoneNumber", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="whatsapp-webhook">URL Webhook (optionnel)</Label>
                <Input
                  id="whatsapp-webhook"
                  placeholder="https://votre-webhook.com/whatsapp"
                  value={formData.whatsapp.webhookUrl}
                  onChange={(e) => updateFormData("whatsapp", "webhookUrl", e.target.value)}
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
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="telegram-token">Token du Bot Telegram</Label>
                <Input
                  id="telegram-token"
                  type="password"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  value={formData.telegram.botToken}
                  onChange={(e) => updateFormData("telegram", "botToken", e.target.value)}
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
                  value={formData.telegram.webhookUrl}
                  onChange={(e) => updateFormData("telegram", "webhookUrl", e.target.value)}
                />
              </div>
            </div>
          </IntegrationCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* SMS Integration */}
          <IntegrationCard
            title="SMS (Twilio/Vonage)"
            description="Envoyez des invitations par SMS"
            icon={Smartphone}
            integration="sms"
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="sms-api-key">Clé API SMS</Label>
                <Input
                  id="sms-api-key"
                  type="password"
                  placeholder="Clé API de votre fournisseur SMS"
                  value={formData.sms.apiKey}
                  onChange={(e) => updateFormData("sms", "apiKey", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sms-sender">Nom de l'expéditeur</Label>
                <Input
                  id="sms-sender"
                  placeholder="InviTopia"
                  value={formData.sms.senderName}
                  onChange={(e) => updateFormData("sms", "senderName", e.target.value)}
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
          >
            <div className="space-y-4">
              <div>
                <Label htmlFor="email-from">Nom de l'expéditeur</Label>
                <Input
                  id="email-from"
                  placeholder="InviTopia Events"
                  value={formData.email.fromName}
                  onChange={(e) => updateFormData("email", "fromName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email-reply">Email de réponse (optionnel)</Label>
                <Input
                  id="email-reply"
                  type="email"
                  placeholder="contact@votredomaine.com"
                  value={formData.email.replyTo}
                  onChange={(e) => updateFormData("email", "replyTo", e.target.value)}
                />
              </div>
            </div>
          </IntegrationCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsSettings;