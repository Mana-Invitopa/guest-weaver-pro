import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RSVP {
  id: string;
  invitee_id: string;
  event_id: string;
  status: 'confirmed' | 'declined' | 'pending';
  guest_count: number;
  drink_preferences: string[];
  dietary_restrictions?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRSVPData {
  invitee_id: string;
  event_id: string;
  status: 'confirmed' | 'declined';
  guest_count: number;
  drink_preferences: string[];
  dietary_restrictions?: string;
}

export const useRSVP = (inviteeId: string) => {
  return useQuery({
    queryKey: ['rsvp', inviteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .eq('invitee_id', inviteeId)
        .maybeSingle();

      if (error) throw error;
      return data as RSVP | null;
    },
    enabled: !!inviteeId,
  });
};

export const useCreateOrUpdateRSVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rsvpData: CreateRSVPData) => {
      const { data, error } = await supabase
        .from('rsvps')
        .upsert([{
          ...rsvpData,
          responded_at: new Date().toISOString(),
        }], {
          onConflict: 'invitee_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data as RSVP;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rsvp', data.invitee_id] });
      queryClient.invalidateQueries({ queryKey: ['rsvps', data.event_id] });
    },
  });
};

export const useEventRSVPs = (eventId: string) => {
  return useQuery({
    queryKey: ['rsvps', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select(`
          *,
          invitees(name, email)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};