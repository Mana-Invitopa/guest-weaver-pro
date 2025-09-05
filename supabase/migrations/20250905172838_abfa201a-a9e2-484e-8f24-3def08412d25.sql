-- Create event workflows table for advanced event automation
CREATE TABLE public.event_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual, scheduled, conditional
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_executed_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0
);

-- Create event reminders table
CREATE TABLE public.event_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  workflow_id UUID,
  invitee_id UUID,
  reminder_type TEXT NOT NULL DEFAULT 'email', -- email, sms, whatsapp, telegram
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed, cancelled
  message_template TEXT,
  personalized_message TEXT,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- email, sms, whatsapp, telegram
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Array of available variables
  category TEXT NOT NULL DEFAULT 'general', -- invitation, reminder, confirmation, update
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event privacy settings table
CREATE TABLE public.event_privacy_settings (
  event_id UUID NOT NULL PRIMARY KEY,
  visibility TEXT NOT NULL DEFAULT 'private', -- public, private, unlisted
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  allow_guest_plus_ones BOOLEAN NOT NULL DEFAULT true,
  show_guest_list BOOLEAN NOT NULL DEFAULT true,
  allow_rsvp_changes BOOLEAN NOT NULL DEFAULT true,
  rsvp_deadline_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event schedules table for recurring events
CREATE TABLE public.event_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  schedule_type TEXT NOT NULL DEFAULT 'single', -- single, daily, weekly, monthly, yearly, custom
  recurrence_pattern JSONB, -- Stores complex recurrence rules
  start_date DATE NOT NULL,
  end_date DATE,
  max_occurrences INTEGER,
  created_occurrences INTEGER DEFAULT 0,
  next_occurrence_date TIMESTAMP WITH TIME ZONE,
  timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.event_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_workflows
CREATE POLICY "Event admins can manage workflows" 
ON public.event_workflows 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_workflows.event_id 
  AND events.admin_id = auth.uid()
));

-- RLS Policies for event_reminders
CREATE POLICY "Event admins can manage reminders" 
ON public.event_reminders 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_reminders.event_id 
  AND events.admin_id = auth.uid()
));

-- RLS Policies for notification_templates
CREATE POLICY "Users can manage their own templates" 
ON public.notification_templates 
FOR ALL 
USING (created_by = auth.uid());

CREATE POLICY "Users can view default templates" 
ON public.notification_templates 
FOR SELECT 
USING (is_default = true);

-- RLS Policies for event_privacy_settings
CREATE POLICY "Event admins can manage privacy settings" 
ON public.event_privacy_settings 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_privacy_settings.event_id 
  AND events.admin_id = auth.uid()
));

CREATE POLICY "Public can view public event privacy settings" 
ON public.event_privacy_settings 
FOR SELECT 
USING (visibility = 'public');

-- RLS Policies for event_schedules
CREATE POLICY "Event admins can manage schedules" 
ON public.event_schedules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_schedules.event_id 
  AND events.admin_id = auth.uid()
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_event_workflows_updated_at
BEFORE UPDATE ON public.event_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_reminders_updated_at
BEFORE UPDATE ON public.event_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_privacy_settings_updated_at
BEFORE UPDATE ON public.event_privacy_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_schedules_updated_at
BEFORE UPDATE ON public.event_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, content, variables, category, is_default, created_by) VALUES
('Invitation Email Standard', 'email', 'Vous êtes invité(e) à {{event_title}}', 
'Bonjour {{invitee_name}},

Vous êtes cordialement invité(e) à participer à :

**{{event_title}}**

📅 Date : {{event_date}}
🕐 Heure : {{event_time}}
📍 Lieu : {{event_location}}

{{event_description}}

Merci de confirmer votre présence avant le {{rsvp_deadline}}.

[Confirmer ma présence]({{rsvp_link}})

Cordialement,
L''équipe organisatrice', 
'["invitee_name", "event_title", "event_date", "event_time", "event_location", "event_description", "rsvp_deadline", "rsvp_link"]', 
'invitation', true, '00000000-0000-0000-0000-000000000000'::uuid),

('Rappel Événement', 'email', 'Rappel : {{event_title}} approche !', 
'Bonjour {{invitee_name}},

Nous vous rappelons que l''événement {{event_title}} aura lieu dans {{days_until}} jour(s).

📅 Date : {{event_date}}
🕐 Heure : {{event_time}}
📍 Lieu : {{event_location}}

N''oubliez pas de venir !

À bientôt,
L''équipe organisatrice', 
'["invitee_name", "event_title", "event_date", "event_time", "event_location", "days_until"]', 
'reminder', true, '00000000-0000-0000-0000-000000000000'::uuid),

('Confirmation RSVP', 'email', 'Confirmation de votre RSVP pour {{event_title}}', 
'Bonjour {{invitee_name}},

Nous avons bien reçu votre réponse pour l''événement {{event_title}}.

Statut : {{rsvp_status}}
Nombre de participants : {{guest_count}}

Nous avons hâte de vous voir !

Cordialement,
L''équipe organisatrice', 
'["invitee_name", "event_title", "rsvp_status", "guest_count"]', 
'confirmation', true, '00000000-0000-0000-0000-000000000000'::uuid);

-- Add avatar bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);