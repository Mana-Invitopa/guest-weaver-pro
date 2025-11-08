import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export interface GlobalNotification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'rsvp_confirmed' | 'rsvp_declined' | 'check_in' | 'workflow_completed' | 'reminder_sent';
  eventId?: string;
  eventTitle?: string;
}

export const useGlobalNotifications = () => {
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Listen to RSVP changes across all user's events
    const rsvpChannel = supabase
      .channel('global-rsvp-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
        },
        async (payload) => {
          const rsvpData = payload.new as any;
          
          // Check if this RSVP belongs to one of the user's events
          const { data: event } = await supabase
            .from('events')
            .select('id, title')
            .eq('id', rsvpData.event_id)
            .eq('admin_id', user.id)
            .maybeSingle();

          if (event) {
            // Fetch invitee details
            const { data: invitee } = await supabase
              .from('invitees')
              .select('name')
              .eq('id', rsvpData.invitee_id)
              .single();

            const guestName = invitee?.name || 'Un invité';
            const notificationType = rsvpData.status === 'confirmed' ? 'rsvp_confirmed' : 'rsvp_declined';
            const statusText = rsvpData.status === 'confirmed' 
              ? 'a confirmé sa présence' 
              : 'a décliné l\'invitation';
            const guestCountText = rsvpData.guest_count > 1 ? ` (${rsvpData.guest_count} personnes)` : '';

            setNotifications(prev => [{
              id: crypto.randomUUID(),
              message: `${guestName} ${statusText}${guestCountText}`,
              timestamp: new Date(),
              read: false,
              type: notificationType,
              eventId: event.id,
              eventTitle: event.title
            }, ...prev.slice(0, 49)]); // Keep last 50 notifications

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['rsvps', event.id] });
            queryClient.invalidateQueries({ queryKey: ['event-analytics', event.id] });
          }
        }
      )
      .subscribe();

    // Listen to check-in events
    const checkInChannel = supabase
      .channel('global-checkin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'invitees',
          filter: 'is_checked_in=eq.true'
        },
        async (payload) => {
          const inviteeData = payload.new as any;
          
          // Check if this invitee belongs to one of the user's events
          const { data: event } = await supabase
            .from('events')
            .select('id, title')
            .eq('id', inviteeData.event_id)
            .eq('admin_id', user.id)
            .maybeSingle();

          if (event) {
            setNotifications(prev => [{
              id: crypto.randomUUID(),
              message: `${inviteeData.name} s'est enregistré à l'événement`,
              timestamp: new Date(),
              read: false,
              type: 'check_in',
              eventId: event.id,
              eventTitle: event.title
            }, ...prev.slice(0, 49)]);

            queryClient.invalidateQueries({ queryKey: ['invitees', event.id] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(rsvpChannel);
      supabase.removeChannel(checkInChannel);
    };
  }, [user, queryClient]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll
  };
};
