import { useParams, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, QrCode, UserCheck, Table, Mail, FileText, Settings, Eye, Share, ClipboardList } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";
import { useInvitees } from "@/hooks/useInvitees";
import { useRSVPRealtime } from "@/hooks/useRSVPRealtime";
import EventEditor from "./EventEditor";
import GuestManagement from "./GuestManagement";
import QRCodeGenerator from "./QRCodeGenerator";
import CheckInSystem from "./CheckInSystem";
import TableManagement from "./TableManagement";
import InvitationSender from "./InvitationSender";
import InvitationSharing from "./InvitationSharing";
import GuestbookManagement from "./GuestbookManagement";
import EnhancedThemeSelector from "./EnhancedThemeSelector";
import DrinkPreferencesManager from "./DrinkPreferencesManager";
import EventProgramManager from "./EventProgramManager";
import CollaboratorManagement from "./CollaboratorManagement";

const EventManagementDashboard = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  
  // Enable real-time RSVP notifications for this event
  useRSVPRealtime(eventId);
  
  if (!eventId) {
    return <div>Événement non trouvé</div>;
  }

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: invitees = [] } = useInvitees(eventId);

  if (eventLoading) {
    return <div>Chargement...</div>;
  }

  if (!event) {
    return <div>Événement non trouvé</div>;
  }

  // Déterminer l'onglet actif basé sur l'URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/guests')) return 'guests';
    if (path.includes('/qr')) return 'qr';
    if (path.includes('/checkin')) return 'checkin';
    if (path.includes('/tables')) return 'tables';
    if (path.includes('/invitations')) return 'invitations';
    if (path.includes('/share')) return 'share';
    if (path.includes('/guestbook')) return 'guestbook';
    if (path.includes('/program')) return 'program';
    if (path.includes('/settings')) return 'settings';
    return 'overview';
  };

  const getEventStatus = (dateTime: string) => {
    const eventDate = new Date(dateTime);
    const now = new Date();
    
    if (eventDate > now) {
      return <Badge className="bg-primary text-primary-foreground">À venir</Badge>;
    } else if (eventDate.toDateString() === now.toDateString()) {
      return <Badge className="bg-success text-success-foreground">En cours</Badge>;
    } else {
      return <Badge variant="secondary">Terminé</Badge>;
    }
  };

  const stats = {
    totalInvitees: invitees.length,
    checkedIn: invitees.filter(i => i.is_checked_in).length,
    attendanceRate: invitees.length > 0 ? Math.round((invitees.filter(i => i.is_checked_in).length / invitees.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {new Date(event.date_time).toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })} • {event.location}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {getEventStatus(event.date_time)}
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Aperçu Public
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalInvitees}</div>
              <div className="text-sm text-muted-foreground">Invités Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.checkedIn}</div>
              <div className="text-sm text-muted-foreground">Présents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.attendanceRate}%</div>
              <div className="text-sm text-muted-foreground">Taux de Présence</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs value={getActiveTab()} className="space-y-4">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="guests" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Invités
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            QR Codes
          </TabsTrigger>
          <TabsTrigger value="checkin" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Table className="w-4 h-4" />
            Tables
          </TabsTrigger>
          <TabsTrigger value="program" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Programme
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Partager
          </TabsTrigger>
          <TabsTrigger value="guestbook" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Livre d'Or
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EventEditor 
            eventId={eventId} 
            onSave={() => {
              // Handle save callback
            }}
            onDelete={() => {
              // Handle delete callback
            }}
          />
        </TabsContent>

        <TabsContent value="guests">
          <GuestManagement eventId={eventId} />
        </TabsContent>

        <TabsContent value="qr">
          <div className="space-y-4">
            {invitees.map((invitee) => (
              <QRCodeGenerator 
                key={invitee.id}
                data={`${window.location.origin}/invitation/${invitee.token}`}
                title={`QR Code - ${invitee.name}`}
                description={`Code QR pour ${invitee.name} - Table ${invitee.table_number || 'Non assignée'}`}
              />
            ))}
            {invitees.length === 0 && (
              <Card className="shadow-card">
                <CardContent className="p-6 text-center">
                  <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun invité trouvé pour générer des QR codes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="checkin">
          <CheckInSystem eventId={eventId} />
        </TabsContent>

        <TabsContent value="tables">
          <TableManagement eventId={eventId} />
        </TabsContent>

        <TabsContent value="program">
          <EventProgramManager eventId={eventId} />
        </TabsContent>

        <TabsContent value="invitations">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Envoi d'Invitations</CardTitle>
              <CardDescription>
                Envoyez des invitations par email et WhatsApp à vos invités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationSender eventId={eventId} invitees={invitees} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Partage d'Invitations</CardTitle>
              <CardDescription>
                Partagez les invitations via WhatsApp, Telegram, SMS et Email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvitationSharing 
                eventId={eventId}
                eventTitle={event.title}
                invitationUrl={`${window.location.origin}/invitation/`}
                invitees={invitees.map(i => ({
                  id: i.id,
                  name: i.name,
                  email: i.email,
                  phone: i.phone
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guestbook">
          <GuestbookManagement eventId={eventId} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Choix du Thème</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de votre événement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedThemeSelector 
                  eventId={eventId} 
                  eventType={(event as any)?.event_type}
                  currentTheme={(event as any)?.theme}
                />
              </CardContent>
            </Card>
            
            <DrinkPreferencesManager eventId={eventId} />
            
            <CollaboratorManagement eventId={eventId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventManagementDashboard;