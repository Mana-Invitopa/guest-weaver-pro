-- Create storage bucket for invitation designs
INSERT INTO storage.buckets (id, name, public) VALUES ('invitation-designs', 'invitation-designs', true);

-- Create policies for invitation uploads
CREATE POLICY "Users can upload their invitation designs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'invitation-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their invitation designs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'invitation-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their invitation designs" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'invitation-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their invitation designs" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'invitation-designs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public access for invitations when shared
CREATE POLICY "Public can view invitation designs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'invitation-designs');

-- Add invitation_design_url column to events table
ALTER TABLE public.events ADD COLUMN invitation_design_url TEXT;