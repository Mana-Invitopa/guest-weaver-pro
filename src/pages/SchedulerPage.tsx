import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import ProfessionalCalendar from "@/components/ProfessionalCalendar";
import EventScheduler from "@/components/EventScheduler";
import { useEvents } from "@/hooks/useEvents";
import { useNavigate } from "react-router-dom";

const SchedulerPage = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const { data: events = [], isLoading } = useEvents();
  const navigate = useNavigate();

  // Convert events to calendar format
  const calendarEvents = events.map(event => ({
    id: event.id,
    date: new Date(event.date_time),
    title: event.title,
    time: new Date(event.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    color: 'bg-accent/10 text-accent'
  }));

  const upcomingEvents = events.filter(e => new Date(e.date_time) >= new Date()).length;
  const pastEvents = events.filter(e => new Date(e.date_time) < new Date()).length;
  const totalParticipants = events.reduce((sum, e) => sum + (e.current_guests || 0), 0);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total événements</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{events.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Événements à venir</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{upcomingEvents}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Événements terminés</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{pastEvents}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Participants total</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">{totalParticipants}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;