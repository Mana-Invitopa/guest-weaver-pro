-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  background_image_url TEXT,
  template TEXT DEFAULT 'default',
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invitees table
CREATE TABLE public.invitees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  token TEXT UNIQUE NOT NULL,
  qr_code_data TEXT,
  is_checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RSVPs table
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitee_id UUID REFERENCES public.invitees(id) ON DELETE CASCADE NOT NULL UNIQUE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'declined', 'pending')) DEFAULT 'pending',
  guest_count INTEGER DEFAULT 1,
  drink_preferences JSONB DEFAULT '[]',
  dietary_restrictions TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create guestbook entries table
CREATE TABLE public.guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  invitee_id UUID REFERENCES public.invitees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Admins can manage own events" ON public.events
  FOR ALL USING (auth.uid() = admin_id);

CREATE POLICY "Public can view events" ON public.events
  FOR SELECT USING (true);

-- Invitees policies
CREATE POLICY "Admins can manage invitees for their events" ON public.invitees
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = invitees.event_id 
      AND events.admin_id = auth.uid()
    )
  );

CREATE POLICY "Public can view invitees by token" ON public.invitees
  FOR SELECT USING (true);

-- RSVPs policies
CREATE POLICY "Admins can view RSVPs for their events" ON public.rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = rsvps.event_id 
      AND events.admin_id = auth.uid()
    )
  );

CREATE POLICY "Public can insert/update RSVPs" ON public.rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update RSVPs" ON public.rsvps
  FOR UPDATE USING (true);

-- Guestbook policies
CREATE POLICY "Public can view guestbook entries" ON public.guestbook_entries
  FOR SELECT USING (true);

CREATE POLICY "Public can insert guestbook entries" ON public.guestbook_entries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage guestbook entries for their events" ON public.guestbook_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = guestbook_entries.event_id 
      AND events.admin_id = auth.uid()
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('event-images', 'event-images', true),
  ('guestbook-photos', 'guestbook-photos', true);

-- Storage policies for event images
CREATE POLICY "Authenticated users can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Users can update their event images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'event-images' AND auth.role() = 'authenticated');

-- Storage policies for guestbook photos
CREATE POLICY "Anyone can upload guestbook photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'guestbook-photos');

CREATE POLICY "Public can view guestbook photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'guestbook-photos');

-- Create function to generate unique tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invitees_updated_at
  BEFORE UPDATE ON public.invitees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rsvps_updated_at
  BEFORE UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();