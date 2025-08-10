import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";

const AdminDashboard = () => {
  // Mock data - will be replaced with real data from Supabase
  const stats = {
    totalInvitees: 245,
    confirmed: 187,
    declined: 23,
    pending: 35,
    checkedIn: 92
  };

  const recentEvents = [
    { id: 1, name: "Mariage de Marie & Paul", date: "2024-03-15", status: "active", invitees: 120 },
    { id: 2, name: "Anniversaire Entreprise", date: "2024-03-22", status: "draft", invitees: 85 },
    { id: 3, name: "Soirée de Gala", date: "2024-04-05", status: "completed", invitees: 200 }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord</h1>
            <p className="text-muted-foreground">Gérez vos événements et invitations</p>
          </div>
          <Button className="bg-gradient-primary hover:shadow-gold transition-smooth transform hover:scale-105">
            <Plus className="w-4 h-4 mr-2" />
            Créer un Événement
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invités</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalInvitees}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confirmés</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Déclinés</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.declined}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Présents</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.checkedIn}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="invitees">Invités</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Événements Récents</CardTitle>
                <CardDescription>
                  Gérez vos événements et suivez leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-smooth">
                      <div className="flex flex-col">
                        <span className="font-medium">{event.name}</span>
                        <span className="text-sm text-muted-foreground">{event.date} • {event.invitees} invités</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={event.status === 'active' ? 'default' : event.status === 'completed' ? 'secondary' : 'outline'}>
                          {event.status === 'active' ? 'Actif' : event.status === 'completed' ? 'Terminé' : 'Brouillon'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Gérer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitees" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Liste des Invités</CardTitle>
                <CardDescription>
                  Gérez vos invités et leurs réponses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  La gestion des invités sera disponible une fois Supabase connecté.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Analyses & Statistiques</CardTitle>
                <CardDescription>
                  Suivez les performances de vos événements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Les analyses détaillées seront disponibles une fois Supabase connecté.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;