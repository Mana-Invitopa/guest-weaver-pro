import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EventReminder {
  id: string;
  event_id: string;
  invitee_id: string | null;
  reminder_type: string;
  scheduled_at: string;
  sent_at: string | null;
  status: string;
  personalized_message: string | null;
  message_template: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  invitees?: {
    name: string;
    email: string;
  };
}

export const useEventReminders = (eventId: string) => {
  return useQuery({
    queryKey: ['event-reminders', eventId],
    queryFn: async () => {
      const { data: reminders, error } = await supabase
        .from('event_reminders')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch invitee details separately
      const inviteeIds = reminders?.map(r => r.invitee_id).filter(Boolean) as string[];
      let inviteesMap: Record<string, { name: string; email: string }> = {};
      
      if (inviteeIds.length > 0) {
        const { data: invitees } = await supabase
          .from('invitees')
          .select('id, name, email')
          .in('id', inviteeIds);
        
        inviteesMap = (invitees || []).reduce((acc, inv) => {
          acc[inv.id] = { name: inv.name, email: inv.email };
          return acc;
        }, {} as Record<string, { name: string; email: string }>);
      }

      return (reminders || []).map(r => ({
        ...r,
        invitees: r.invitee_id ? inviteesMap[r.invitee_id] : undefined
      })) as EventReminder[];
    },
    enabled: !!eventId,
  });
};

export const useTriggerSmartReminders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('smart-reminders', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-reminders'] });
      toast.success('Rappels intelligents traités', {
        description: `${data.remindersCreated} rappels créés, ${data.remindersSent} envoyés`
      });
    },
    onError: (error: any) => {
      toast.error('Erreur lors du traitement des rappels', {
        description: error?.message
      });
    }
  });
};

export const useKeepAlive = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('keep-alive', {
        body: {}
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Base de données active', {
        description: `${data.stats.events_count} événements, ${data.stats.invitees_count} invités`
      });
    },
    onError: (error: any) => {
      toast.error('Erreur keep-alive', {
        description: error?.message
      });
    }
  });
};

export const useReminderStats = (eventId: string) => {
  return useQuery({
    queryKey: ['reminder-stats', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_reminders')
        .select('status')
        .eq('event_id', eventId);

      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        sent: data.filter(r => r.status === 'sent').length,
        failed: data.filter(r => r.status === 'failed').length
      };

      return stats;
    },
    enabled: !!eventId,
  });
};
