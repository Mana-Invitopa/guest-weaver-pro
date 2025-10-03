import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Plus } from "lucide-react";
import ProfessionalCalendar from "@/components/ProfessionalCalendar";
import EventScheduler from "@/components/EventScheduler";
import { addDays } from "date-fns";

const SchedulerPage = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  // Événements d'exemple pour la démo
  const sampleEvents = [
    {
      id: '1',
      date: new Date(),
      title: 'Réunion équipe',
      time: '09:00',
      color: 'bg-blue-500/10 text-blue-700'
    },
    {
      id: '2',
      date: addDays(new Date(), 2),
      title: 'Conférence client',
      time: '14:00',
      color: 'bg-green-500/10 text-green-700'
    },
    {
      id: '3',
      date: addDays(new Date(), 5),
      title: 'Formation équipe',
      time: '10:30',
      color: 'bg-purple-500/10 text-purple-700'
    }
  ];

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
          <Button className="bg-gradient-primary w-full sm:w-auto">
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
            <ProfessionalCalendar 
              events={sampleEvents}
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
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
              <CardDescription className="text-xs">Événements ce mois</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">12</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Événements à venir</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">8</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Événements terminés</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">4</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Participants total</CardDescription>
              <CardTitle className="text-2xl md:text-3xl">248</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;