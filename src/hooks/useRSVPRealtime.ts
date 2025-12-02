import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export const useRSVPRealtime = (eventId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !eventId) return;

    console.log('Setting up RSVP realtime subscription for event:', eventId);

    const channel = supabase
      .channel(`rsvp-changes-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          console.log('RSVP change detected:', payload);
          
          // Invalidate queries to refresh data immediately
          queryClient.invalidateQueries({ queryKey: ['rsvps', eventId] });
          queryClient.invalidateQueries({ queryKey: ['invitees', eventId] });
          queryClient.invalidateQueries({ queryKey: ['event', eventId] });
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const rsvpData = payload.new as any;
            
            // Fetch invitee details
            const { data: invitee } = await supabase
              .from('invitees')
              .select('name, email')
              .eq('id', rsvpData.invitee_id)
              .single();
            
            const guestName = invitee?.name || 'Un invité';
            const statusText = rsvpData.status === 'confirmed' 
              ? 'a confirmé sa présence' 
              : rsvpData.status === 'declined' 
              ? 'a décliné l\'invitation' 
              : 'a mis à jour sa réponse';
            const guestCountText = rsvpData.guest_count > 1 ? ` (${rsvpData.guest_count} personnes)` : '';
            
            toast({
              title: rsvpData.status === 'confirmed' ? "🎉 Nouvelle confirmation !" : "📩 Nouvelle réponse",
              description: `${guestName} ${statusText}${guestCountText}`,
              duration: 5000,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invitees',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('New invitee detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['invitees', eventId] });
        }
      )
      .subscribe((status) => {
        console.log('RSVP realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up RSVP realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [eventId, user, toast, queryClient]);
};

// Hook for all user events realtime updates
export const useAllEventsRSVPRealtime = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up global RSVP realtime subscription');

    const channel = supabase
      .channel('global-rsvp-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rsvps',
        },
        async (payload) => {
          console.log('Global RSVP change detected:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const rsvpData = payload.new as any;
            
            // Check if this event belongs to the current user
            const { data: eventData } = await supabase
              .from('events')
              .select('id, title, admin_id')
              .eq('id', rsvpData.event_id)
              .single();
            
            if (eventData?.admin_id === user.id) {
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ['rsvps', rsvpData.event_id] });
              queryClient.invalidateQueries({ queryKey: ['invitees', rsvpData.event_id] });
              queryClient.invalidateQueries({ queryKey: ['events'] });
              
              // Fetch invitee details
              const { data: invitee } = await supabase
                .from('invitees')
                .select('name, email')
                .eq('id', rsvpData.invitee_id)
                .single();
              
              const guestName = invitee?.name || 'Un invité';
              const statusText = rsvpData.status === 'confirmed' 
                ? 'a confirmé sa présence' 
                : rsvpData.status === 'declined' 
                ? 'a décliné l\'invitation' 
                : 'a mis à jour sa réponse';
              
              toast({
                title: rsvpData.status === 'confirmed' ? "🎉 Nouvelle confirmation !" : "📩 Nouvelle réponse",
                description: `${guestName} ${statusText} pour "${eventData.title}"`,
                duration: 6000,
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Global RSVP realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up global RSVP realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast, queryClient]);
};
