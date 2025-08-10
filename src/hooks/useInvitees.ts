import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invitee {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone?: string;
  token: string;
  qr_code_data?: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInviteeData {
  event_id: string;
  name: string;
  email: string;
  phone?: string;
}

export const useInvitees = (eventId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['invitees', eventId],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('invitees')
        .select(`
          *,
          events!inner(admin_id)
        `)
        .eq('event_id', eventId)
        .eq('events.admin_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        event_id: item.event_id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        token: item.token,
        qr_code_data: item.qr_code_data,
        is_checked_in: item.is_checked_in,
        checked_in_at: item.checked_in_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
      })) as Invitee[];
    },
    enabled: !!eventId && !!user,
  });
};

export const useCreateInvitee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteeData: CreateInviteeData) => {
      // Generate unique token
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');

      if (tokenError) throw tokenError;

      const { data, error } = await supabase
        .from('invitees')
        .insert([{
          ...inviteeData,
          token: tokenData,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Invitee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitees', data.event_id] });
    },
  });
};

export const useInviteeByToken = (token: string) => {
  return useQuery({
    queryKey: ['invitee', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitees')
        .select(`
          *,
          events(*)
        `)
        .eq('token', token)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
};

export const useCheckInInvitee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const { data, error } = await supabase
        .from('invitees')
        .update({
          is_checked_in: true,
          checked_in_at: new Date().toISOString(),
        })
        .eq('token', token)
        .select()
        .single();

      if (error) throw error;
      return data as Invitee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitees', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['invitee', data.token] });
    },
  });
};