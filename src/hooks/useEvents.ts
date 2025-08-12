import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Event {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location: string;
  background_image_url?: string;
  template: string;
  admin_id: string;
  created_at: string;
  updated_at: string;
  status?: string;
  max_guests?: number;
  current_guests?: number;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date_time: string;
  location: string;
  background_image_url?: string;
  template?: string;
  max_guests?: number;
  status?: string;
}

export interface UpdateEventData {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location: string;
  background_image_url?: string;
  template?: string;
  max_guests?: number;
  status?: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('admin_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          admin_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!eventId,
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventData: UpdateEventData) => {
      if (!user) throw new Error('User not authenticated');

      const { id, ...updateData } = eventData;
      const { data, error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('admin_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Event;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('admin_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};