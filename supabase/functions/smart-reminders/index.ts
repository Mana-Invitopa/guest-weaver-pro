import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingInvitee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_id: string;
  created_at: string;
  event_title: string;
  event_date: string;
  event_location: string;
  days_since_invited: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting smart reminders check...');

    // Find invitees who haven't responded and need reminders
    // Strategy: Send reminders at day 3, 7, and 14 after invitation
    const { data: pendingInvitees, error: inviteesError } = await supabase
      .from('invitees')
      .select(`
        id,
        name,
        email,
        phone,
        event_id,
        created_at,
        events!inner (
          title,
          date_time,
          location,
          admin_id
        )
      `)
      .not('id', 'in', 
        supabase
          .from('rsvps')
          .select('invitee_id')
      );

    if (inviteesError) {
      console.error('Error fetching pending invitees:', inviteesError);
      throw inviteesError;
    }

    // Get invitees without RSVP manually
    const { data: allInvitees, error: allError } = await supabase
      .from('invitees')
      .select(`
        id,
        name,
        email,
        phone,
        event_id,
        created_at
      `);

    if (allError) throw allError;

    const { data: allRsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('invitee_id');

    if (rsvpError) throw rsvpError;

    const rsvpInviteeIds = new Set(allRsvps?.map(r => r.invitee_id) || []);
    const pendingInviteesList = allInvitees?.filter(i => !rsvpInviteeIds.has(i.id)) || [];

    console.log(`Found ${pendingInviteesList.length} invitees without RSVP`);

    // Get event details for pending invitees
    const eventIds = [...new Set(pendingInviteesList.map(i => i.event_id))];
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, title, date_time, location, admin_id')
      .in('id', eventIds);

    if (eventsError) throw eventsError;

    const eventsMap = new Map(events?.map(e => [e.id, e]) || []);

    // Check existing reminders to avoid duplicates
    const { data: existingReminders, error: remindersError } = await supabase
      .from('event_reminders')
      .select('invitee_id, scheduled_at, status')
      .in('invitee_id', pendingInviteesList.map(i => i.id))
      .eq('status', 'pending');

    if (remindersError) throw remindersError;

    const existingReminderMap = new Map<string, Date[]>();
    existingReminders?.forEach(r => {
      const dates = existingReminderMap.get(r.invitee_id) || [];
      dates.push(new Date(r.scheduled_at));
      existingReminderMap.set(r.invitee_id, dates);
    });

    const now = new Date();
    const remindersToCreate: any[] = [];
    const reminderDays = [3, 7, 14]; // Days after invitation to send reminders

    for (const invitee of pendingInviteesList) {
      const event = eventsMap.get(invitee.event_id);
      if (!event) continue;

      const eventDate = new Date(event.date_time);
      // Don't send reminders for past events
      if (eventDate < now) continue;

      const invitedAt = new Date(invitee.created_at);
      const daysSinceInvited = Math.floor((now.getTime() - invitedAt.getTime()) / (1000 * 60 * 60 * 24));

      // Check which reminder tier we're at
      for (const reminderDay of reminderDays) {
        if (daysSinceInvited >= reminderDay) {
          // Check if we already sent this tier reminder
          const existingDates = existingReminderMap.get(invitee.id) || [];
          const alreadySent = existingDates.some(d => {
            const daysDiff = Math.abs(Math.floor((d.getTime() - invitedAt.getTime()) / (1000 * 60 * 60 * 24)) - reminderDay);
            return daysDiff <= 1; // Within 1 day tolerance
          });

          if (!alreadySent) {
            const personalizedMessage = generatePersonalizedMessage(
              invitee.name,
              event.title,
              daysSinceInvited,
              eventDate
            );

            remindersToCreate.push({
              event_id: invitee.event_id,
              invitee_id: invitee.id,
              reminder_type: invitee.phone ? 'sms' : 'email',
              scheduled_at: now.toISOString(),
              status: 'pending',
              personalized_message: personalizedMessage,
              message_template: `reminder_day_${reminderDay}`
            });
          }
        }
      }
    }

    console.log(`Creating ${remindersToCreate.length} new reminders`);

    if (remindersToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from('event_reminders')
        .insert(remindersToCreate);

      if (insertError) {
        console.error('Error creating reminders:', insertError);
        throw insertError;
      }
    }

    // Process pending reminders (when Resend is configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let sentCount = 0;

    if (resendApiKey) {
      const { data: pendingReminders, error: pendingError } = await supabase
        .from('event_reminders')
        .select(`
          *,
          invitees (name, email, phone)
        `)
        .eq('status', 'pending')
        .limit(50);

      if (!pendingError && pendingReminders) {
        for (const reminder of pendingReminders) {
          try {
            // Send email reminder
            if (reminder.reminder_type === 'email' && reminder.invitees?.email) {
              const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${resendApiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  from: 'Events <onboarding@resend.dev>',
                  to: [reminder.invitees.email],
                  subject: `Rappel: N'oubliez pas de confirmer votre présence`,
                  html: reminder.personalized_message,
                }),
              });

              if (response.ok) {
                await supabase
                  .from('event_reminders')
                  .update({ 
                    status: 'sent', 
                    sent_at: new Date().toISOString() 
                  })
                  .eq('id', reminder.id);
                sentCount++;
              } else {
                const errorText = await response.text();
                await supabase
                  .from('event_reminders')
                  .update({ 
                    status: 'failed',
                    error_message: errorText,
                    retry_count: (reminder.retry_count || 0) + 1
                  })
                  .eq('id', reminder.id);
              }
            }
          } catch (error) {
            console.error(`Error sending reminder ${reminder.id}:`, error);
            await supabase
              .from('event_reminders')
              .update({ 
                status: 'failed',
                error_message: error.message,
                retry_count: (reminder.retry_count || 0) + 1
              })
              .eq('id', reminder.id);
          }
        }
      }
    } else {
      console.log('RESEND_API_KEY not configured - reminders created but not sent');
    }

    return new Response(JSON.stringify({
      success: true,
      remindersCreated: remindersToCreate.length,
      remindersSent: sentCount,
      pendingInvitees: pendingInviteesList.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Smart reminders error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generatePersonalizedMessage(
  name: string, 
  eventTitle: string, 
  daysSinceInvited: number,
  eventDate: Date
): string {
  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const formattedDate = eventDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let urgencyLevel = 'gentle';
  if (daysUntilEvent <= 3) urgencyLevel = 'urgent';
  else if (daysUntilEvent <= 7) urgencyLevel = 'moderate';

  const templates = {
    gentle: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Bonjour ${name} 👋</h2>
        <p>Nous espérons que vous allez bien !</p>
        <p>Nous avons remarqué que vous n'avez pas encore confirmé votre présence pour <strong>${eventTitle}</strong>.</p>
        <p>L'événement aura lieu le <strong>${formattedDate}</strong>.</p>
        <p>Nous serions ravis de vous compter parmi nous ! N'hésitez pas à confirmer votre présence dès que possible.</p>
        <p style="color: #666; font-size: 14px;">Cordialement,<br>L'équipe d'organisation</p>
      </div>
    `,
    moderate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Cher(e) ${name} 📅</h2>
        <p><strong>${eventTitle}</strong> approche à grands pas !</p>
        <p>L'événement est prévu le <strong>${formattedDate}</strong> (dans ${daysUntilEvent} jours).</p>
        <p>Pour nous aider à mieux organiser, pourriez-vous confirmer votre présence ?</p>
        <p>Nous avons hâte de vous voir !</p>
        <p style="color: #666; font-size: 14px;">L'équipe d'organisation</p>
      </div>
    `,
    urgent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #f39c12;">
        <h2 style="color: #e74c3c;">⚠️ Dernier rappel - ${name}</h2>
        <p><strong>${eventTitle}</strong> c'est dans <strong>${daysUntilEvent} jour(s)</strong> !</p>
        <p>Date: <strong>${formattedDate}</strong></p>
        <p>Nous n'avons pas encore reçu votre réponse. Merci de confirmer votre présence <strong>aujourd'hui</strong> pour nous permettre de finaliser l'organisation.</p>
        <p style="color: #666; font-size: 14px;">Merci de votre compréhension,<br>L'équipe d'organisation</p>
      </div>
    `
  };

  return templates[urgencyLevel];
}
