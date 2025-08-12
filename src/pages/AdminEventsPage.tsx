import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Search, Filter, Eye, Edit, Users, MapPin, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const AdminEventsPage = () => {
  const { data: events = [], isLoading } = useEvents();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_desc");

  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.date_time);
    
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed' || eventDate < now) return 'completed';
    if (event.status === 'active') return 'active';
    if (event.status === 'published') return 'published';
    return 'draft';
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      published: { label: "Publié", variant: "default" as const },
      active: { label: "Actif", variant: "default" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.draft;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || getEventStatus(event) === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date_time).getTime() - new Date(a.date_time).getTime();
        case 'date_asc':
          return new Date(a.date_time).getTime() - new Date(b.date_time).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  const getEventsByStatus = (status: string) => {
    return filteredEvents.filter(event => getEventStatus(event) === status);
  };

  const stats = {
    total: events.length,
    draft: events.filter(e => getEventStatus(e) === 'draft').length,
    published: events.filter(e => getEventStatus(e) === 'published').length,
    active: events.filter(e => getEventStatus(e) === 'active').length,
    completed: events.filter(e => getEventStatus(e) === 'completed').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Événements</h1>
          <p className="text-muted-foreground">
            Gérez tous vos événements et suivez leur progression
          </p>
        </div>
        <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth">
          <Link to="/admin/events/new">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Événement
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{stats.draft}</div>
            <div className="text-sm text-muted-foreground">Brouillons</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{stats.published}</div>
            <div className="text-sm text-muted-foreground">Publiés</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.active}</div>
            <div className="text-sm text-muted-foreground">Actifs</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Terminés</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillons</SelectItem>
                  <SelectItem value="published">Publiés</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="completed">Terminés</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Date (récent)</SelectItem>
                  <SelectItem value="date_asc">Date (ancien)</SelectItem>
                  <SelectItem value="title_asc">Titre (A-Z)</SelectItem>
                  <SelectItem value="title_desc">Titre (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Events List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Tous ({filteredEvents.length})</TabsTrigger>
          <TabsTrigger value="draft">Brouillons ({getEventsByStatus('draft').length})</TabsTrigger>
          <TabsTrigger value="published">Publiés ({getEventsByStatus('published').length})</TabsTrigger>
          <TabsTrigger value="active">Actifs ({getEventsByStatus('active').length})</TabsTrigger>
          <TabsTrigger value="completed">Terminés ({getEventsByStatus('completed').length})</TabsTrigger>
          <TabsTrigger value="cancelled">Annulés ({getEventsByStatus('cancelled').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EventsList events={filteredEvents} />
        </TabsContent>
        
        <TabsContent value="draft">
          <EventsList events={getEventsByStatus('draft')} />
        </TabsContent>
        
        <TabsContent value="published">
          <EventsList events={getEventsByStatus('published')} />
        </TabsContent>
        
        <TabsContent value="active">
          <EventsList events={getEventsByStatus('active')} />
        </TabsContent>
        
        <TabsContent value="completed">
          <EventsList events={getEventsByStatus('completed')} />
        </TabsContent>
        
        <TabsContent value="cancelled">
          <EventsList events={getEventsByStatus('cancelled')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EventsList = ({ events }: { events: any[] }) => {
  const getEventStatus = (event: any) => {
    const now = new Date();
    const eventDate = new Date(event.date_time);
    
    if (event.status === 'cancelled') return 'cancelled';
    if (event.status === 'completed' || eventDate < now) return 'completed';
    if (event.status === 'active') return 'active';
    if (event.status === 'published') return 'published';
    return 'draft';
  };

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: "Brouillon", variant: "secondary" as const },
      published: { label: "Publié", variant: "default" as const },
      active: { label: "Actif", variant: "default" as const },
      completed: { label: "Terminé", variant: "outline" as const },
      cancelled: { label: "Annulé", variant: "destructive" as const }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.draft;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  if (events.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun événement trouvé</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Créez votre premier événement ou modifiez vos filtres
          </p>
          <Button asChild className="bg-gradient-primary">
            <Link to="/admin/events/new">
              <Plus className="w-4 h-4 mr-2" />
              Créer un Événement
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => {
        const status = getEventStatus(event);
        
        return (
          <Card key={event.id} className="shadow-card hover:shadow-elegant transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold truncate">{event.title}</h3>
                    {getStatusBadge(status)}
                  </div>
                  
                  {event.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.date_time), 'PPP', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(event.date_time), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{event.current_guests || 0} invités</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/invitation/${event.id}`} target="_blank">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/events/${event.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link to={`/admin/events/${event.id}`}>
                      Gérer
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminEventsPage;