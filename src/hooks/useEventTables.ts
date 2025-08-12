import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EventTable {
  id: string;
  event_id: string;
  table_number: number;
  table_name: string;
  max_seats: number;
  current_seats: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEventTableData {
  event_id: string;
  table_number: number;
  table_name: string;
  max_seats: number;
}

export const useEventTables = (eventId: string) => {
  return useQuery({
    queryKey: ['event-tables', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_tables' as any)
        .select('*')
        .eq('event_id', eventId)
        .order('table_number', { ascending: true });

      if (error) throw error;
      return (data as unknown) as EventTable[];
    },
    enabled: !!eventId,
  });
};

export const useCreateEventTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tableData: CreateEventTableData) => {
      const { data, error } = await supabase
        .from('event_tables' as any)
        .insert([tableData])
        .select()
        .single();

      if (error) throw error;
      return (data as unknown) as EventTable;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-tables', data.event_id] });
    },
  });
};

export const useDeleteEventTable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tableId: string) => {
      const { error } = await supabase
        .from('event_tables' as any)
        .delete()
        .eq('id', tableId);

      if (error) throw error;
    },
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: ['event-tables'] });
    },
  });
};