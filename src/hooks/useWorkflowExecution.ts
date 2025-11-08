import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExecuteWorkflowParams {
  workflowId: string;
  eventId: string;
}

export const useWorkflowExecution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId, eventId }: ExecuteWorkflowParams) => {
      // Get workflow details
      const { data: workflow, error: workflowError } = await supabase
        .from('event_workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError) throw workflowError;

      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get invitees based on workflow criteria
      let inviteesQuery = supabase
        .from('invitees')
        .select('*')
        .eq('event_id', eventId);

      // Apply filters based on workflow actions
      const actions = workflow.actions as any[];
      const emailAction = actions.find(a => a.type === 'email');
      
      if (emailAction?.config?.recipients) {
        if (emailAction.config.recipients === 'confirmed') {
          const { data: confirmedRsvps } = await supabase
            .from('rsvps')
            .select('invitee_id')
            .eq('event_id', eventId)
            .eq('status', 'confirmed');
          
          const confirmedIds = confirmedRsvps?.map(r => r.invitee_id) || [];
          inviteesQuery = inviteesQuery.in('id', confirmedIds);
        } else if (emailAction.config.recipients === 'pending') {
          const { data: pendingRsvps } = await supabase
            .from('rsvps')
            .select('invitee_id')
            .eq('event_id', eventId)
            .eq('status', 'pending');
          
          const pendingIds = pendingRsvps?.map(r => r.invitee_id) || [];
          inviteesQuery = inviteesQuery.in('id', pendingIds);
        }
      }

      const { data: invitees, error: inviteesError } = await inviteesQuery;

      if (inviteesError) throw inviteesError;

      // Execute actions sequentially
      let successCount = 0;
      
      for (const action of actions) {
        if (action.type === 'email' && invitees) {
          // Call edge function to send emails
          for (const invitee of invitees) {
            try {
              const { error: sendError } = await supabase.functions.invoke('send-invitation', {
                body: {
                  to: invitee.email,
                  eventTitle: event.title,
                  eventDate: event.date_time,
                  eventLocation: event.location,
                  invitationLink: `${window.location.origin}/invitation/${invitee.token}`,
                  customMessage: action.config?.message || ''
                }
              });
              
              if (!sendError) successCount++;
            } catch (error) {
              console.error('Error sending email:', error);
            }
          }
        } else if (action.type === 'delay') {
          // Simulate delay (in real implementation, this would be scheduled)
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update workflow execution stats
      const { data: currentWorkflow } = await supabase
        .from('event_workflows')
        .select('execution_count')
        .eq('id', workflowId)
        .single();

      await supabase
        .from('event_workflows')
        .update({
          execution_count: (currentWorkflow?.execution_count || 0) + 1,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      return { successCount, totalInvitees: invitees?.length || 0 };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-workflows', variables.eventId] });
      toast.success(`Workflow exécuté avec succès`, {
        description: `${data.successCount}/${data.totalInvitees} actions effectuées`
      });
    },
    onError: (error: any) => {
      toast.error('Erreur lors de l\'exécution du workflow', {
        description: error?.message || 'Une erreur est survenue'
      });
    }
  });
};
