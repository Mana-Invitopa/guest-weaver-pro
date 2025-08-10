-- Fix security warnings by updating function search paths
DROP FUNCTION IF EXISTS public.generate_invitation_token();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;