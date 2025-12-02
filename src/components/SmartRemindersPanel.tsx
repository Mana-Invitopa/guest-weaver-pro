import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  RefreshCw, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Mail,
  MessageSquare,
  Zap,
  Activity
} from 'lucide-react';
import { useEventReminders, useTriggerSmartReminders, useReminderStats, useKeepAlive } from '@/hooks/useSmartReminders';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SmartRemindersPanelProps {
  eventId: string;
}

export default function SmartRemindersPanel({ eventId }: SmartRemindersPanelProps) {
  const { data: reminders, isLoading, refetch } = useEventReminders(eventId);
  const { data: stats } = useReminderStats(eventId);
  const triggerReminders = useTriggerSmartReminders();
  const keepAlive = useKeepAlive();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Envoyé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReminderTypeIcon = (type: string) => {
    return type === 'sms' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Rappels Intelligents</CardTitle>
              <CardDescription>Rappels automatiques pour les invités sans réponse</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => keepAlive.mutate()}
              disabled={keepAlive.isPending}
            >
              <Activity className={`w-4 h-4 mr-2 ${keepAlive.isPending ? 'animate-pulse' : ''}`} />
              Keep Alive
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button
              onClick={() => triggerReminders.mutate()}
              disabled={triggerReminders.isPending}
              size="sm"
            >
              <Zap className={`w-4 h-4 mr-2 ${triggerReminders.isPending ? 'animate-spin' : ''}`} />
              Lancer les rappels
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border/50 text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-xs text-yellow-400/80">En attente</div>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.sent}</div>
              <div className="text-xs text-green-400/80">Envoyés</div>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
              <div className="text-xs text-red-400/80">Échoués</div>
            </div>
          </div>
        )}

        {/* Reminder schedule info */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Calendrier des rappels automatiques
          </h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-muted-foreground">Jour 3: Rappel doux</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <span className="text-muted-foreground">Jour 7: Rappel modéré</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400"></div>
              <span className="text-muted-foreground">Jour 14: Rappel urgent</span>
            </div>
          </div>
        </div>

        {/* Reminders list */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : reminders && reminders.length > 0 ? (
              reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted/50">
                        {getReminderTypeIcon(reminder.reminder_type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {reminder.invitees?.name || 'Invité inconnu'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.invitees?.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {reminder.message_template?.replace('reminder_day_', 'Rappel jour ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(reminder.status)}
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(reminder.scheduled_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  {reminder.error_message && (
                    <div className="mt-2 p-2 rounded bg-red-500/10 text-red-400 text-xs">
                      {reminder.error_message}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">Aucun rappel programmé</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Les rappels seront créés automatiquement pour les invités sans réponse
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
