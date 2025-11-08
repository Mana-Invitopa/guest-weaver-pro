import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { workflowId, eventId } = await req.json();

    // Get workflow details
    const { data: workflow, error: workflowError } = await supabaseClient
      .from('event_workflows')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (workflowError) throw workflowError;

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    // Process workflow actions
    const actions = workflow.actions as any[];
    const results = [];

    for (const action of actions) {
      if (action.type === 'email') {
        // Get invitees based on recipients filter
        let query = supabaseClient
          .from('invitees')
          .select('*')
          .eq('event_id', eventId);

        if (action.config?.recipients === 'confirmed') {
          const { data: confirmedRsvps } = await supabaseClient
            .from('rsvps')
            .select('invitee_id')
            .eq('event_id', eventId)
            .eq('status', 'confirmed');
          
          const confirmedIds = confirmedRsvps?.map(r => r.invitee_id) || [];
          query = query.in('id', confirmedIds);
        }

        const { data: invitees } = await query;

        // Send emails to invitees
        if (invitees) {
          for (const invitee of invitees) {
            try {
              const { error: sendError } = await supabaseClient.functions.invoke('send-invitation', {
                body: {
                  to: invitee.email,
                  eventTitle: event.title,
                  eventDate: event.date_time,
                  eventLocation: event.location,
                  invitationLink: `${Deno.env.get('PUBLIC_URL')}/invitation/${invitee.token}`,
                  customMessage: action.config?.message || ''
                }
              });

              if (!sendError) {
                results.push({ success: true, inviteeId: invitee.id });
              }
            } catch (error) {
              console.error('Error sending email:', error);
              results.push({ success: false, inviteeId: invitee.id, error });
            }
          }
        }
      } else if (action.type === 'delay') {
        // Add delay to workflow execution
        const delayMs = action.config?.delay?.value || 0;
        const unit = action.config?.delay?.unit || 'minutes';
        
        let delayInMs = delayMs;
        if (unit === 'hours') delayInMs *= 60;
        if (unit === 'days') delayInMs *= 60 * 24;
        
        await new Promise(resolve => setTimeout(resolve, delayInMs * 60 * 1000));
      }
    }

    // Update workflow execution stats
    const { data: currentWorkflow } = await supabaseClient
      .from('event_workflows')
      .select('execution_count')
      .eq('id', workflowId)
      .single();

    await supabaseClient
      .from('event_workflows')
      .update({
        execution_count: (currentWorkflow?.execution_count || 0) + 1,
        last_executed_at: new Date().toISOString()
      })
      .eq('id', workflowId);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        executionCount: (currentWorkflow?.execution_count || 0) + 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error executing workflow:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
