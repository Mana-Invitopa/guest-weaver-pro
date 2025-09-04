import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, CheckCircle, XCircle, Save } from "lucide-react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  integration: string;
  children: ReactNode;
  integrations: Record<string, { enabled: boolean; configured: boolean }>;
  onToggleIntegration: (integration: string) => void;
  onSaveIntegration: (integration: string) => void;
}

const IntegrationCard = ({ 
  title, 
  description, 
  icon: Icon, 
  integration, 
  children,
  integrations,
  onToggleIntegration,
  onSaveIntegration
}: IntegrationCardProps) => {
  const currentIntegration = integrations[integration];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={currentIntegration?.configured ? "default" : "secondary"}>
              {currentIntegration?.configured ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {currentIntegration?.configured ? "Configuré" : "Non configuré"}
            </Badge>
            <Switch
              checked={currentIntegration?.enabled}
              onCheckedChange={() => onToggleIntegration(integration)}
            />
          </div>
        </div>
      </CardHeader>
      
      {currentIntegration?.enabled && (
        <CardContent className="space-y-4">
          {children}
          
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={() => onSaveIntegration(integration)}
              className="bg-gradient-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder la configuration
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default IntegrationCard;