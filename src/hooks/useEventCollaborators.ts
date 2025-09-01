import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EventCollaborator {
  id: string;
  event_id: string;
  user_id: string;
  role: 'admin' | 'collaborator';
  permissions: {
    manage_guests?: boolean;
    manage_tables?: boolean;
    view_analytics?: boolean;
  };
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

export interface CreateCollaboratorData {
  event_id: string;
  user_email: string;
  role?: 'collaborator';
  permissions?: {
    manage_guests?: boolean;
    manage_tables?: boolean;
    view_analytics?: boolean;
  };
}

// Hook to get collaborators for an event
export const useEventCollaborators = (eventId: string) => {
  return useQuery({
    queryKey: ['collaborators', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_collaborators')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data as EventCollaborator[];
    },
    enabled: !!eventId,
  });
};

// Hook to add a collaborator to an event
export const useAddCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (collaboratorData: CreateCollaboratorData) => {
      // First, get the user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', collaboratorData.user_email)
        .single();

      if (profileError || !profile) {
        throw new Error('Utilisateur non trouvé avec cet email');
      }

      // Check if already a collaborator
      const { data: existing } = await supabase
        .from('event_collaborators')
        .select('id')
        .eq('event_id', collaboratorData.event_id)
        .eq('user_id', profile.user_id)
        .single();

      if (existing) {
        throw new Error('Cet utilisateur est déjà collaborateur de cet événement');
      }

      // Add collaborator
      const { data, error } = await supabase
        .from('event_collaborators')
        .insert([{
          event_id: collaboratorData.event_id,
          user_id: profile.user_id,
          role: collaboratorData.role || 'collaborator',
          permissions: collaboratorData.permissions || {
            manage_guests: true,
            manage_tables: true,
            view_analytics: true
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', data.event_id] });
      toast({
        title: "Collaborateur ajouté",
        description: "Le collaborateur a été ajouté avec succès à l'événement",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook to remove a collaborator
export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (collaboratorId: string) => {
      const { error } = await supabase
        .from('event_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;
      return collaboratorId;
    },
    onSuccess: (_, collaboratorId) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      toast({
        title: "Collaborateur supprimé",
        description: "Le collaborateur a été supprimé de l'événement",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le collaborateur",
        variant: "destructive",
      });
    },
  });
};

// Hook to update collaborator permissions
export const useUpdateCollaboratorPermissions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      collaboratorId, 
      permissions 
    }: { 
      collaboratorId: string; 
      permissions: EventCollaborator['permissions'] 
    }) => {
      const { data, error } = await supabase
        .from('event_collaborators')
        .update({ permissions })
        .eq('id', collaboratorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', data.event_id] });
      toast({
        title: "Permissions mises à jour",
        description: "Les permissions du collaborateur ont été mises à jour",
      });
    },
  });
};