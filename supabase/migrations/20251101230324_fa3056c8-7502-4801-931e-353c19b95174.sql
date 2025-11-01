-- Fix infinite recursion in RLS policies by using security definer functions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Collaborators can view events" ON public.events;
DROP POLICY IF EXISTS "Event admins can manage collaborators" ON public.event_collaborators;
DROP POLICY IF EXISTS "Collaborators can view their own access" ON public.event_collaborators;

-- Recreate the policies using existing security definer functions
CREATE POLICY "Collaborators can view events"
  ON public.events
  FOR SELECT
  USING (
    auth.uid() = admin_id OR 
    public.is_event_collaborator(id, auth.uid())
  );

CREATE POLICY "Event admins can manage collaborators"
  ON public.event_collaborators
  FOR ALL
  USING (public.is_event_admin(event_id, auth.uid()))
  WITH CHECK (public.is_event_admin(event_id, auth.uid()));

CREATE POLICY "Collaborators can view their own access"
  ON public.event_collaborators
  FOR SELECT
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.is_event_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_collaborator(uuid, uuid) TO authenticated;