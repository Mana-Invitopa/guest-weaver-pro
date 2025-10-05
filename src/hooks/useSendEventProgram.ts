import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SendProgramParams {
  eventId: string;
}

export const useSendEventProgram = () => {
  return useMutation({
    mutationFn: async ({ eventId }: SendProgramParams) => {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      // Get event program
      const { data: programs, error: programError } = await supabase
        .from('event_programs')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (programError) throw programError;

      // Get confirmed RSVPs with invitee details (email method only)
      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select(`
          *,
          invitees!inner(name, email, invitation_method)
        `)
        .eq('event_id', eventId)
        .eq('status', 'confirmed')
        .eq('invitees.invitation_method', 'email');

      if (rsvpError) throw rsvpError;

      if (!rsvps || rsvps.length === 0) {
        throw new Error('Aucun invité confirmé avec invitation par email');
      }

      // Build program HTML
      let programHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            Programme de l'événement
          </h1>
          <h2 style="color: #666;">${event.title}</h2>
          <p style="color: #888; margin-bottom: 30px;">
            ${new Date(event.date_time).toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
      `;

      if (programs.length === 0) {
        programHtml += '<p>Le programme détaillé sera communiqué prochainement.</p>';
      } else {
        programHtml += '<div style="margin-top: 20px;">';
        programs.forEach((program: any) => {
          const startTime = new Date(program.start_time).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          const endTime = new Date(program.end_time).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          programHtml += `
            <div style="background: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${program.title}</h3>
              <p style="margin: 5px 0; color: #666;">
                <strong>⏰ ${startTime} - ${endTime}</strong>
              </p>
              ${program.location ? `<p style="margin: 5px 0; color: #666;">📍 ${program.location}</p>` : ''}
              ${program.description ? `<p style="margin: 10px 0 0 0; color: #555;">${program.description}</p>` : ''}
            </div>
          `;
        });
        programHtml += '</div>';
      }

      programHtml += `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
            <p>Nous avons hâte de vous voir à l'événement !</p>
          </div>
        </div>
      `;

      // Send email to each confirmed invitee (via edge function would be ideal)
      // For now, we'll return the data for the UI to handle or trigger edge function
      return {
        event,
        programs,
        recipients: rsvps.map((rsvp: any) => ({
          name: rsvp.invitees.name,
          email: rsvp.invitees.email,
        })),
        programHtml,
        count: rsvps.length,
      };
    },
  });
};
