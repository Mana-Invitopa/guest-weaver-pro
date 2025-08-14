-- Fix the generate_invitation_token function to use correct syntax
DROP FUNCTION IF EXISTS public.generate_invitation_token();

CREATE OR REPLACE FUNCTION public.generate_invitation_token()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use gen_random_uuid() and encode it as hex to create a unique token
  RETURN encode(decode(replace(gen_random_uuid()::text, '-', ''), 'hex'), 'hex');
END;
$function$;