-- Ajouter pays et ville au profil utilisateur
ALTER TABLE public.profiles 
ADD COLUMN country TEXT,
ADD COLUMN city TEXT;

-- Table pour la vérification d'identité
CREATE TABLE public.identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  document_type TEXT NOT NULL CHECK (document_type IN ('national_id', 'passport', 'driver_license')),
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on identity_verifications
ALTER TABLE public.identity_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own verification
CREATE POLICY "Users can view own verification"
ON public.identity_verifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create their own verification
CREATE POLICY "Users can create own verification"
ON public.identity_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their pending verification
CREATE POLICY "Users can update pending verification"
ON public.identity_verifications
FOR UPDATE
USING (auth.uid() = user_id AND verification_status = 'pending');

-- Table pour le programme des événements
CREATE TABLE public.event_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_programs
ALTER TABLE public.event_programs ENABLE ROW LEVEL SECURITY;

-- Policy: Event admins can manage programs
CREATE POLICY "Event admins can manage programs"
ON public.event_programs
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.events
  WHERE events.id = event_programs.event_id
  AND events.admin_id = auth.uid()
));

-- Policy: Public can view programs for public events
CREATE POLICY "Public can view programs for public events"
ON public.event_programs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.events
  WHERE events.id = event_programs.event_id
  AND events.is_public = true
));

-- Policy: Invitees can view programs via token
CREATE POLICY "Invitees can view programs"
ON public.event_programs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.invitees
  WHERE invitees.event_id = event_programs.event_id
));

-- Créer index pour améliorer les performances
CREATE INDEX idx_identity_verifications_user_id ON public.identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_status ON public.identity_verifications(verification_status);
CREATE INDEX idx_event_programs_event_id ON public.event_programs(event_id);
CREATE INDEX idx_event_programs_order ON public.event_programs(event_id, display_order);

-- Trigger pour updated_at
CREATE TRIGGER update_identity_verifications_updated_at
BEFORE UPDATE ON public.identity_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_programs_updated_at
BEFORE UPDATE ON public.event_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.identity_verifications IS 'Stores identity verification documents for event organizers';
COMMENT ON TABLE public.event_programs IS 'Stores detailed program/schedule for events';