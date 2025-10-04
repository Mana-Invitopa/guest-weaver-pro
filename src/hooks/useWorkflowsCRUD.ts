import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WorkflowAction {
  id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'telegram' | 'delay';
  config: {
    template?: string;
    delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
    recipients?: 'all' | 'confirmed' | 'pending' | 'declined';
    message?: string;
  };
}

export interface EventWorkflow {
  id: string;
  event_id: string;
  name: string;
  description: string;
  trigger_type: 'manual' | 'scheduled' | 'conditional';
  trigger_conditions: any;
  actions: WorkflowAction[];
  status: 'active' | 'paused' | 'completed';
  execution_count: number;
  last_executed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Fetch workflows for an event
export const useEventWorkflows = (eventId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['event-workflows', eventId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('event_workflows')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as EventWorkflow[];
    },
    enabled: !!user && !!eventId,
  });
};

// Create workflow
export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (workflow: Omit<EventWorkflow, 'id' | 'created_by' | 'created_at' | 'updated_at' | 'execution_count' | 'last_executed_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('event_workflows')
        .insert({
          event_id: workflow.event_id,
          name: workflow.name,
          description: workflow.description,
          trigger_type: workflow.trigger_type,
          trigger_conditions: workflow.trigger_conditions as any,
          actions: workflow.actions as any,
          status: workflow.status,
          created_by: user.id,
          execution_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as EventWorkflow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-workflows', data.event_id] });
      toast.success('Workflow créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la création du workflow');
    }
  });
};

// Update workflow
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId, updates }: { id: string; eventId: string; updates: Partial<EventWorkflow> }) => {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.status) updateData.status = updates.status;
      if (updates.trigger_type) updateData.trigger_type = updates.trigger_type;
      if (updates.trigger_conditions) updateData.trigger_conditions = updates.trigger_conditions;
      if (updates.actions) updateData.actions = updates.actions;
      
      const { data, error } = await supabase
        .from('event_workflows')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: data as unknown as EventWorkflow, eventId };
    },
    onSuccess: ({ eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event-workflows', eventId] });
      toast.success('Workflow mis à jour');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la mise à jour');
    }
  });
};

// Delete workflow
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      const { error } = await supabase
        .from('event_workflows')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return eventId;
    },
    onSuccess: (eventId) => {
      queryClient.invalidateQueries({ queryKey: ['event-workflows', eventId] });
      toast.success('Workflow supprimé');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la suppression');
    }
  });
};

// Toggle workflow status
export const useToggleWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId, currentStatus }: { id: string; eventId: string; currentStatus: 'active' | 'paused' | 'completed' }) => {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { data, error } = await supabase
        .from('event_workflows')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: data as unknown as EventWorkflow, eventId };
    },
    onSuccess: ({ eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event-workflows', eventId] });
      toast.success('Statut du workflow mis à jour');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de la mise à jour');
    }
  });
};

// Execute workflow
export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, eventId }: { id: string; eventId: string }) => {
      // Simulate workflow execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // First get current execution count
      const { data: currentData, error: fetchError } = await supabase
        .from('event_workflows')
        .select('execution_count')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Then update with incremented count
      const { data, error } = await supabase
        .from('event_workflows')
        .update({ 
          execution_count: (currentData.execution_count || 0) + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data: data as unknown as EventWorkflow, eventId };
    },
    onSuccess: ({ eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event-workflows', eventId] });
      toast.success('Workflow exécuté avec succès');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erreur lors de l\'exécution');
    }
  });
};
