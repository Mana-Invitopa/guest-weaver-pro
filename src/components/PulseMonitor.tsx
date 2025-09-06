import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  X,
  RefreshCw
} from "lucide-react";
import { usePulseMetrics, useSystemAlerts, useMarkAlertAsRead } from "@/hooks/usePulse";
import { cn } from "@/lib/utils";

const PulseMonitor = () => {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = usePulseMetrics();
  const { data: alerts, isLoading: alertsLoading, refetch: refetchAlerts } = useSystemAlerts();
  const markAsReadMutation = useMarkAlertAsRead();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <X className="w-4 h-4 text-destructive" />;
      default:
        return <Info className="w-4 h-4 text-info" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  if (metricsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Pulse Monitor
          </h2>
          <p className="text-muted-foreground">
            Surveillance en temps réel de vos métriques et alertes système
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchMetrics();
            refetchAlerts();
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="metrics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="metrics">Métriques Temps Réel</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alertes Système
            {alerts?.filter(a => !a.read).length > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground">
                {alerts.filter(a => !a.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics?.map((metric) => (
              <Card key={metric.id} className="shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.name}
                  </CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <div className={cn(
                    "text-xs flex items-center mt-1",
                    metric.trend === 'up' ? "text-success" : 
                    metric.trend === 'down' ? "text-destructive" : 
                    "text-muted-foreground"
                  )}>
                    {metric.change > 0 && "+"}
                    {metric.change}%
                    <span className="ml-1">par rapport à hier</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mis à jour {formatTimestamp(metric.timestamp)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 shadow-card">
            <CardHeader>
              <CardTitle>Graphique de Performance</CardTitle>
              <CardDescription>
                Évolution des métriques sur les dernières 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">
                  Graphique des tendances (à implémenter avec Recharts)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Alertes Système
                  </CardTitle>
                  <CardDescription>
                    Notifications importantes sur votre plateforme
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {alerts?.length || 0} alertes
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts?.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                        !alert.read ? "bg-muted/30 border-primary/20" : "bg-background"
                      )}
                    >
                      <div className="mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          {!alert.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(alert.id)}
                              className="text-xs h-6 px-2"
                            >
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(alert.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!alerts || alerts.length === 0) && (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune alerte système</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PulseMonitor;