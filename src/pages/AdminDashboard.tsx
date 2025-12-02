import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, CheckCircle, XCircle, Clock, Plus, BarChart3, QrCode, UserCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEvents, useEvent } from "@/hooks/useEvents";
import { useInvitees } from "@/hooks/useInvitees";
import { useAuth } from "@/contexts/AuthContext";
import GuestManagement from "@/components/GuestManagement";
import EventPreviewCard from "@/components/EventPreviewCard";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import CheckInSystem from "@/components/CheckInSystem";
import EventManagementDashboard from "@/components/EventManagementDashboard";
import GuestbookManagement from "@/components/GuestbookManagement";
import CollaboratorManagement from "@/components/CollaboratorManagement";
import InviteesDashboard from "@/components/InviteesDashboard";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAllEventsRSVPRealtime } from "@/hooks/useRSVPRealtime";

const AdminDashboard = () => {
  // Enable real-time RSVP notifications
  useAllEventsRSVPRealtime();
  const { eventId } = useParams();
  const { user } = useAuth();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { data: selectedEvent } = useEvent(eventId || '');
  const { data: eventInvitees = [] } = useInvitees(eventId || '');

  // If eventId is provided, show event management dashboard
  if (eventId) {
    return <EventManagementDashboard />;
  }

  // Calculate real stats from events data
  const stats = {
    totalEvents: events?.length || 0,
    totalInvitees: 0, // Will be calculated from invitees data
    confirmed: 0,
    declined: 0,
    pending: 0,
    checkedIn: 0
  };

  const getEventStatus = (dateTime: string) => {
    const eventDate = new Date(dateTime);
    const now = new Date();
    const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) return 'completed';
    if (daysDiff <= 7) return 'active';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de Bord</h1>
            <p className="text-muted-foreground">Gérez vos événements et invitations</p>
          </div>
          <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth transform hover:scale-105">
            <Link to="/admin/events/new">
              <Plus className="w-4 h-4 mr-2" />
              Créer un Événement
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalEvents}</div>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Présents</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
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
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Chargement des événements...</p>
                    </div>
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                      <EventPreviewCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun événement</h3>
                    <p className="text-sm text-muted-foreground mb-4">Créez votre premier événement pour commencer</p>
                    <Button asChild className="bg-gradient-primary hover:shadow-gold transition-smooth">
                      <Link to="/admin/events/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Créer un Événement
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitees" className="space-y-6">
            <InviteesDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;