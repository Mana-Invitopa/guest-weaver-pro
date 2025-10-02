import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventProgram {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useEventPrograms = (eventId: string) => {
  return useQuery({
    queryKey: ['event-programs', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_programs')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as EventProgram[];
    },
    enabled: !!eventId,
  });
};
