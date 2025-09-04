import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  Target,
  Activity
} from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { useInvitees } from "@/hooks/useInvitees";

const AnalyticsDashboard = () => {
  const { data: events = [] } = useEvents();
  const firstEventId = events?.[0]?.id;
  const { data: allInvitees = [] } = useInvitees(firstEventId || '');

  const analytics = useMemo(() => {
    const now = new Date();
    
    // Events analytics
    const upcomingEvents = events.filter(e => new Date(e.date_time) > now);
    const pastEvents = events.filter(e => new Date(e.date_time) <= now);
    const thisMonthEvents = events.filter(e => {
      const eventDate = new Date(e.date_time);
      return eventDate.getMonth() === now.getMonth() && 
             eventDate.getFullYear() === now.getFullYear();
    });

    // Invitees analytics
    const totalInvitees = allInvitees.length;
    const checkedInInvitees = allInvitees.filter(i => i.is_checked_in).length;
    const attendanceRate = totalInvitees > 0 ? (checkedInInvitees / totalInvitees) * 100 : 0;
    
    // Event type distribution
    const eventTypes = events.reduce((acc, event) => {
      const type = (event as any).event_type || 'Non spécifié';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (mock data for now)
    const monthlyData = [
      { month: 'Jan', events: 2, invitees: 45 },
      { month: 'Fév', events: 3, invitees: 67 },
      { month: 'Mar', events: 1, invitees: 23 },
      { month: 'Avr', events: 4, invitees: 89 },
      { month: 'Mai', events: thisMonthEvents.length, invitees: totalInvitees },
    ];

    return {
      events: {
        total: events.length,
        upcoming: upcomingEvents.length,
        past: pastEvents.length,
        thisMonth: thisMonthEvents.length
      },
      invitees: {
        total: totalInvitees,
        checkedIn: checkedInInvitees,
        attendanceRate: Math.round(attendanceRate),
        withPhone: allInvitees.filter(i => i.phone).length
      },
      eventTypes,
      monthlyData,
      averageGuestsPerEvent: events.length > 0 ? Math.round(totalInvitees / events.length) : 0
    };
  }, [events, allInvitees]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Événements Totaux</p>
                <p className="text-3xl font-bold text-primary">{analytics.events.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.events.upcoming} à venir
                </p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invités Totaux</p>
                <p className="text-3xl font-bold text-success">{analytics.invitees.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.invitees.checkedIn} présents
                </p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux de Présence</p>
                <p className="text-3xl font-bold text-accent">{analytics.invitees.attendanceRate}%</p>
                <div className="mt-2">
                  <Progress 
                    value={analytics.invitees.attendanceRate} 
                    className="h-2"
                  />
                </div>
              </div>
              <Target className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moyenne Invités</p>
                <p className="text-3xl font-bold text-warning">{analytics.averageGuestsPerEvent}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  par événement
                </p>
              </div>
              <Activity className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Performance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance des Événements
            </CardTitle>
            <CardDescription>
              Analyse détaillée de vos événements récents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune donnée d'événement disponible</p>
                <p className="text-sm">Créez vos premiers événements pour voir les analyses</p>
              </div>
            ) : (
              events.slice(0, 5).map((event, index) => {
                const eventInvitees = allInvitees.filter(i => i.event_id === event.id);
                const checkedIn = eventInvitees.filter(i => i.is_checked_in).length;
                const rate = eventInvitees.length > 0 ? (checkedIn / eventInvitees.length) * 100 : 0;
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.date_time).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm">
                          <Users className="w-3 h-3 inline mr-1" />
                          {eventInvitees.length} invités
                        </span>
                        <span className="text-sm">
                          <CheckCircle className="w-3 h-3 inline mr-1 text-success" />
                          {checkedIn} présents
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{Math.round(rate)}%</div>
                      <Badge 
                        variant={rate >= 75 ? "default" : rate >= 50 ? "secondary" : "outline"}
                        className={rate >= 75 ? "bg-success" : rate >= 50 ? "bg-warning" : ""}
                      >
                        {rate >= 75 ? "Excellent" : rate >= 50 ? "Bon" : "À améliorer"}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Types d'Événements
            </CardTitle>
            <CardDescription>
              Répartition par catégorie d'événement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.eventTypes).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune donnée de type disponible</p>
                <p className="text-sm">Les types d'événements s'afficheront ici</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.eventTypes).map(([type, count]) => {
                  const percentage = (count / analytics.events.total) * 100;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{type}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} événement{count > 1 ? 's' : ''} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Tendances Mensuelles
          </CardTitle>
          <CardDescription>
            Évolution de vos événements et invités au fil du temps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {analytics.monthlyData.map((month, index) => (
              <div key={month.month} className="text-center p-4 border rounded-lg">
                <div className="font-medium text-sm text-muted-foreground mb-2">
                  {month.month}
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-2xl font-bold text-primary">{month.events}</div>
                    <div className="text-xs text-muted-foreground">événements</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-success">{month.invitees}</div>
                    <div className="text-xs text-muted-foreground">invités</div>
                  </div>
                </div>
                {index === analytics.monthlyData.length - 1 && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Ce mois
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Insights Rapides
          </CardTitle>
          <CardDescription>
            Recommandations basées sur vos données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.invitees.attendanceRate < 70 && (
              <div className="p-4 border border-warning rounded-lg bg-warning/5">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h4 className="font-medium text-warning">Taux de présence faible</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Considérez d'envoyer des rappels ou d'améliorer la communication avec vos invités.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {analytics.invitees.attendanceRate >= 80 && (
              <div className="p-4 border border-success rounded-lg bg-success/5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success">Excellente participation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vos événements génèrent un excellent taux de participation !
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.events.upcoming > 0 && (
              <div className="p-4 border border-primary rounded-lg bg-primary/5">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary">Événements à venir</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vous avez {analytics.events.upcoming} événement{analytics.events.upcoming > 1 ? 's' : ''} planifié{analytics.events.upcoming > 1 ? 's' : ''}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.invitees.withPhone / analytics.invitees.total < 0.5 && analytics.invitees.total > 0 && (
              <div className="p-4 border border-accent rounded-lg bg-accent/5">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h4 className="font-medium text-accent">Collecte de téléphones</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Collectez plus de numéros de téléphone pour améliorer la communication.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;