import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GuestbookEntry {
  id: string;
  event_id: string;
  invitee_id?: string;
  name: string;
  message: string;
  photo_url?: string;
  created_at: string;
}

export interface CreateGuestbookEntryData {
  event_id: string;
  invitee_id?: string;
  name: string;
  message: string;
  photo_url?: string;
}

export const useGuestbook = (eventId: string) => {
  return useQuery({
    queryKey: ['guestbook', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GuestbookEntry[];
    },
    enabled: !!eventId,
  });
};

export const useCreateGuestbookEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryData: CreateGuestbookEntryData) => {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .insert([entryData])
        .select()
        .single();

      if (error) throw error;
      return data as GuestbookEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guestbook', data.event_id] });
    },
  });
};