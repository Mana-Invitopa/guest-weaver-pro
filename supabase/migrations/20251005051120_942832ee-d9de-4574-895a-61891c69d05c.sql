-- Add fields for SMS verification system
ALTER TABLE public.invitees 
ADD COLUMN invitation_method TEXT DEFAULT 'email' CHECK (invitation_method IN ('email', 'sms')),
ADD COLUMN verification_code TEXT,
ADD COLUMN code_expires_at TIMESTAMP WITH TIME ZONE;

-- Function to generate a 6-digit verification code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate random 6-digit code
  code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  RETURN code;
END;
$$;

-- Function to automatically set code expiry based on event date
CREATE OR REPLACE FUNCTION public.set_verification_code_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get event date
  SELECT date_time INTO event_date 
  FROM public.events 
  WHERE id = NEW.event_id;
  
  -- Set expiry to 24 hours after event
  IF NEW.verification_code IS NOT NULL THEN
    NEW.code_expires_at := event_date + INTERVAL '24 hours';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically set code expiry
CREATE TRIGGER set_code_expiry_on_invitee
BEFORE INSERT OR UPDATE OF verification_code ON public.invitees
FOR EACH ROW
WHEN (NEW.verification_code IS NOT NULL)
EXECUTE FUNCTION public.set_verification_code_expiry();

-- Function to clean up expired verification codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete invitees with expired codes (SMS-only invitations)
  DELETE FROM public.invitees
  WHERE invitation_method = 'sms' 
    AND code_expires_at IS NOT NULL 
    AND code_expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Create index for better performance on verification code lookups
CREATE INDEX idx_invitees_verification_code ON public.invitees(verification_code) 
WHERE verification_code IS NOT NULL;