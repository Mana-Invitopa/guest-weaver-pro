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

    const channel = supabase
      .channel('rsvp-changes')
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
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['rsvps', eventId] });
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const rsvpData = payload.new as any;
            
            // Fetch invitee details
            const { data: invitee } = await supabase
              .from('invitees')
              .select('name, email')
              .eq('id', rsvpData.invitee_id)
              .single();
            
            const guestName = invitee?.name || 'Un invité';
            const statusText = rsvpData.status === 'confirmed' ? 'confirmé sa présence' : 'décliné l\'invitation';
            const guestCountText = rsvpData.guest_count > 1 ? ` (${rsvpData.guest_count} personnes)` : '';
            
            toast({
              title: "🔔 Nouvelle réponse",
              description: `${guestName} a ${statusText}${guestCountText}`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, user, toast, queryClient]);
};
