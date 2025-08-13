import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Calendar, Mail, QrCode, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useInvitees } from "@/hooks/useInvitees";
import { useState } from "react";

const Analytics = () => {
  const { data: events = [] } = useEvents();
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  
  // Calculate stats
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const totalGuests = events.reduce((sum, event) => sum + (event.current_guests || 0), 0);
  
  // Mock data for demonstration
  const stats = [
    {
      title: "Événements Totaux",
      value: totalEvents,
      change: "+12%",
      trend: "up" as const,
      icon: Calendar,
      color: "text-primary"
    },
    {
      title: "Invités Totaux",
      value: totalGuests,
      change: "+23%",
      trend: "up" as const,
      icon: Users,
      color: "text-accent"
    },
    {
      title: "Événements Actifs",
      value: activeEvents,
      change: "+8%",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-success"
    },
    {
      title: "Taux de Réponse",
      value: "87%",
      change: "-2%",
      trend: "down" as const,
      icon: Mail,
      color: "text-warning"
    }
  ];

  const eventsByStatus = [
    { status: "Brouillon", count: events.filter(e => e.status === 'draft').length, color: "bg-muted" },
    { status: "Publié", count: events.filter(e => e.status === 'published').length, color: "bg-primary" },
    { status: "Actif", count: activeEvents, color: "bg-success" },
    { status: "Terminé", count: completedEvents, color: "bg-muted-foreground" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analyses & Statistiques</h1>
          <p className="text-muted-foreground">
            Suivez les performances de vos événements et l'engagement des invités
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">3 derniers mois</SelectItem>
            <SelectItem value="365">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="mt-4 flex items-center text-sm">
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 text-success mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-destructive mr-1" />
                )}
                <span className={stat.trend === 'up' ? 'text-success' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground ml-1">
                  vs période précédente
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="guests">Invités</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Répartition par Statut</CardTitle>
                <CardDescription>
                  Distribution de vos événements par statut
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {eventsByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
                <CardDescription>
                  Dernières actions sur vos événements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nouvel événement créé</p>
                      <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">15 invitations envoyées</p>
                      <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">5 RSVP confirmés</p>
                      <p className="text-xs text-muted-foreground">Il y a 6 heures</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Performance des Événements</CardTitle>
              <CardDescription>
                Analysez le succès de vos événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.slice(0, 5).map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{event.current_guests || 0}</p>
                        <p className="text-muted-foreground">Invités</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">85%</p>
                        <p className="text-muted-foreground">Taux RSVP</p>
                      </div>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Statistiques des Invités</CardTitle>
              <CardDescription>
                Analyse détaillée de vos invités et leurs interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-6 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{totalGuests}</p>
                  <p className="text-sm text-muted-foreground">Invités Totaux</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <QrCode className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">{Math.floor(totalGuests * 0.72)}</p>
                  <p className="text-sm text-muted-foreground">QR Codes Scannés</p>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-success" />
                  <p className="text-2xl font-bold">{Math.floor(totalGuests * 0.89)}</p>
                  <p className="text-sm text-muted-foreground">Pages Vues</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Engagement des Invités</CardTitle>
              <CardDescription>
                Mesurez l'interaction de vos invités avec vos événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Temps de Réponse Moyen</h3>
                    <p className="text-2xl font-bold text-primary">2.4 jours</p>
                    <p className="text-sm text-muted-foreground">Pour confirmer la présence</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Taux d'Ouverture</h3>
                    <p className="text-2xl font-bold text-accent">94%</p>
                    <p className="text-sm text-muted-foreground">Des invitations envoyées</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Canaux de Communication</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">E-mail</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">WhatsApp</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full" style={{ width: '62%' }} />
                        </div>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;