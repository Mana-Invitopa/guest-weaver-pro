import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, List, Plus, TrendingUp, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import ProfessionalCalendar from "@/components/ProfessionalCalendar";
import EventScheduler from "@/components/EventScheduler";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { format, isPast, isToday, isTomorrow, isThisWeek, isThisMonth } from "date-fns";
import { fr } from "date-fns/locale";

const SchedulerPage = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const { data: events = [], isLoading } = useEvents();
  const navigate = useNavigate();

  // Advanced event analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const upcoming = events.filter(e => new Date(e.date_time) >= now);
    const past = events.filter(e => isPast(new Date(e.date_time)));
    const today = events.filter(e => isToday(new Date(e.date_time)));
    const thisWeek = events.filter(e => isThisWeek(new Date(e.date_time), { locale: fr }));
    const thisMonth = events.filter(e => isThisMonth(new Date(e.date_time)));
    const totalGuests = events.reduce((sum, e) => sum + (e.current_guests || 0), 0);
    const avgGuestsPerEvent = events.length > 0 ? Math.round(totalGuests / events.length) : 0;
    
    return {
      total: events.length,
      upcoming: upcoming.length,
      past: past.length,
      today: today.length,
      thisWeek: thisWeek.length,
      thisMonth: thisMonth.length,
      totalGuests,
      avgGuestsPerEvent,
      completionRate: events.length > 0 ? Math.round((past.length / events.length) * 100) : 0
    };
  }, [events]);

  // Convert events to calendar format with smart coloring
  const calendarEvents = events.map(event => {
    const eventDate = new Date(event.date_time);
    let color = 'bg-accent/10 text-accent';
    
    if (isPast(eventDate)) {
      color = 'bg-muted text-muted-foreground';
    } else if (isToday(eventDate)) {
      color = 'bg-primary/20 text-primary';
    } else if (isTomorrow(eventDate)) {
      color = 'bg-warning/20 text-warning';
    }
    
    return {
      id: event.id,
      date: eventDate,
      title: event.title,
      time: format(eventDate, 'HH:mm', { locale: fr }),
      color
    };
  });

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6 max-w-7xl">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Programmation d'Événements</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Planifiez et gérez vos événements avec un calendrier professionnel
            </p>
          </div>
          <Button onClick={() => navigate('/event-creation')} className="bg-gradient-primary w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Nouvel </span>Événement
          </Button>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'list')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendrier
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Liste
            </TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-4 space-y-4">
            {isLoading ? (
              <Card className="shadow-card">
                <CardContent className="flex justify-center items-center p-12">
                  <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
                </CardContent>
              </Card>
            ) : (
              <ProfessionalCalendar 
                events={calendarEvents}
                onEventClick={(event) => navigate(`/admin/events/${event.id}`)}
              />
            )}
          </TabsContent>

          {/* List View */}
          <TabsContent value="list" className="mt-4">
            <EventScheduler eventId="global" />
          </TabsContent>
        </Tabs>

        {/* Advanced Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Total événements</CardDescription>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{analytics.total}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {analytics.thisMonth} ce mois
                </Badge>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-l-4 border-l-accent">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">À venir</CardDescription>
                <Clock className="w-4 h-4 text-accent" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{analytics.upcoming}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {analytics.today > 0 && (
                  <Badge variant="default" className="text-xs bg-primary">
                    {analytics.today} aujourd'hui
                  </Badge>
                )}
                {analytics.thisWeek > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {analytics.thisWeek} cette semaine
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
          
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Participants</CardDescription>
                <Users className="w-4 h-4 text-success" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{analytics.totalGuests}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  ~{analytics.avgGuestsPerEvent} moy./événement
                </Badge>
              </div>
            </CardHeader>
          </Card>
          
          <Card className="shadow-elegant hover:shadow-glow transition-smooth border-l-4 border-l-muted">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs">Terminés</CardDescription>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">{analytics.past}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {analytics.completionRate}% complétés
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
        
        {/* Quick Actions & Alerts */}
        {analytics.today > 0 && (
          <Card className="shadow-elegant border-l-4 border-l-warning bg-warning/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Événements d'aujourd'hui</p>
                <p className="text-xs text-muted-foreground">
                  Vous avez {analytics.today} événement{analytics.today > 1 ? 's' : ''} prévu{analytics.today > 1 ? 's' : ''} aujourd'hui
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setView('list')}>
                Voir les détails
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchedulerPage;