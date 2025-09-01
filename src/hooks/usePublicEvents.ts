import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicEvent {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  location: string;
  event_type?: string;
  theme?: string;
  background_image_url?: string;
  current_guests?: number;
  max_guests?: number;
  created_at: string;
}

export interface PublicEventsFilters {
  event_type?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  location?: string;
}

// Hook to get public events with filters
export const usePublicEvents = (filters?: PublicEventsFilters) => {
  return useQuery({
    queryKey: ['public_events', filters],
    queryFn: async () => {
      let query = supabase
        .from('public_events')
        .select('*')
        .order('date_time', { ascending: true });

      // Apply filters
      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }

      if (filters?.date_from) {
        query = query.gte('date_time', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('date_time', filters.date_to);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PublicEvent[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get public event by ID (for detail view)
export const usePublicEvent = (eventId: string) => {
  return useQuery({
    queryKey: ['public_event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('privacy', 'public')
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!eventId,
  });
};

// Get event types for filter options
export const useEventTypes = () => {
  return useQuery({
    queryKey: ['event_types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_events')
        .select('event_type')
        .not('event_type', 'is', null);

      if (error) throw error;
      
      // Get unique event types
      const uniqueTypes = [...new Set(data.map(item => item.event_type))];
      return uniqueTypes.filter(Boolean) as string[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get locations for filter options
export const useEventLocations = () => {
  return useQuery({
    queryKey: ['event_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_events')
        .select('location');

      if (error) throw error;
      
      // Get unique locations
      const uniqueLocations = [...new Set(data.map(item => item.location))];
      return uniqueLocations.filter(Boolean) as string[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};