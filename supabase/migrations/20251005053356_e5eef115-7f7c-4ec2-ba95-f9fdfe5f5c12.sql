-- Fix infinite recursion in events table RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage own events" ON public.events;
DROP POLICY IF EXISTS "Collaborators can view their events" ON public.events;
DROP POLICY IF EXISTS "Public can view public events" ON public.events;

-- Create new policies without recursion
CREATE POLICY "Admins can manage own events"
ON public.events
FOR ALL
TO authenticated
USING (auth.uid() = admin_id)
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Collaborators can view events"
ON public.events
FOR SELECT
TO authenticated
USING (
  auth.uid() = admin_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.event_collaborators
    WHERE event_collaborators.event_id = events.id
    AND event_collaborators.user_id = auth.uid()
  )
);

CREATE POLICY "Public can view public events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (is_public = true);