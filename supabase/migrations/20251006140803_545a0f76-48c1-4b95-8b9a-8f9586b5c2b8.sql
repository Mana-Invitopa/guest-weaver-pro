-- 1) Pulse tables
create table if not exists public.pulse_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  value numeric not null default 0,
  change numeric not null default 0,
  trend text not null check (trend in ('up','down','stable')),
  timestamp timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pulse_metrics enable row level security;

drop policy if exists "Users can manage own pulse metrics" on public.pulse_metrics;
create policy "Users can manage own pulse metrics"
  on public.pulse_metrics
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- simple updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_pulse_metrics_updated on public.pulse_metrics;
create trigger trg_pulse_metrics_updated
before update on public.pulse_metrics
for each row execute function public.set_updated_at();

-- system_alerts
create table if not exists public.system_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('info','warning','error','success')),
  title text not null,
  message text not null,
  timestamp timestamptz not null default now(),
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.system_alerts enable row level security;

drop policy if exists "Users can manage own system alerts" on public.system_alerts;
create policy "Users can manage own system alerts"
  on public.system_alerts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists trg_system_alerts_updated on public.system_alerts;
create trigger trg_system_alerts_updated
before update on public.system_alerts
for each row execute function public.set_updated_at();

-- 2) Default invitation templates per event type
-- We insert for categories: wedding, party, conference
insert into public.notification_templates (id, name, type, subject, content, variables, category, is_default, created_by)
values
  (gen_random_uuid(),'Classique élégante','email','Invitation à {event_title}','Bonjour {guest_name},\n\nVous êtes chaleureusement invité(e) à {event_title}.\nLieu: {event_location}\nDate: {event_date}\n\nConfirmez votre présence ici : {invitation_url}\n\nAu plaisir de vous voir !', '["guest_name","event_title","event_location","event_date","invitation_url"]'::jsonb, 'wedding', true, gen_random_uuid()),
  (gen_random_uuid(),'Romantique chic','email','{event_title} — Partagez ce moment avec nous','Cher(ère) {guest_name},\n\nNous serions honorés de vous compter parmi nous pour {event_title}.\nTous les détails et RSVP : {invitation_url}\n\nAvec toute notre affection.', '["guest_name","event_title","invitation_url"]'::jsonb, 'wedding', true, gen_random_uuid()),
  (gen_random_uuid(),'Festif & raffiné','email','Célébrons {event_title} ensemble','{guest_name},\n\nRejoignez-nous pour célébrer {event_title}.\nInfos pratiques : {invitation_url}\n\nTenue élégante recommandée.', '["guest_name","event_title","invitation_url"]'::jsonb, 'wedding', true, gen_random_uuid()),

  (gen_random_uuid(),'Ambiance conviviale','email','Tu es invité(e) ! {event_title}','Hello {guest_name} !\n\nOn organise {event_title} 🎉\nTous les détails et RSVP : {invitation_url}\n\nHâte de te voir !', '["guest_name","event_title","invitation_url"]'::jsonb, 'party', true, gen_random_uuid()),
  (gen_random_uuid(),'Classique amicale','email','Invitation — {event_title}','Bonjour {guest_name},\n\nNous serions ravis de vous avoir parmi nous pour {event_title}.\nConfirmez ici : {invitation_url}', '["guest_name","event_title","invitation_url"]'::jsonb, 'party', true, gen_random_uuid()),
  (gen_random_uuid(),'Afterwork moderne','email','{event_title} — On se retrouve ?','{guest_name},\n\nRetrouvons-nous pour {event_title}.\nInfos et RSVP : {invitation_url}', '["guest_name","event_title","invitation_url"]'::jsonb, 'party', true, gen_random_uuid()),

  (gen_random_uuid(),'Professionnel sobre','email','Invitation à {event_title}','Bonjour {guest_name},\n\nVous êtes invité(e) à {event_title}.\nProgramme et inscription : {invitation_url}', '["guest_name","event_title","invitation_url"]'::jsonb, 'conference', true, gen_random_uuid()),
  (gen_random_uuid(),'Premium exécutif','email','{event_title} — Réservez votre place','{guest_name},\n\nNous serions honorés de votre présence à {event_title}.\nInscription : {invitation_url}', '["guest_name","event_title","invitation_url"]'::jsonb, 'conference', true, gen_random_uuid()),
  (gen_random_uuid(),'Networking engageant','email','Rejoignez-nous pour {event_title}','Bonjour {guest_name},\n\nParticipez à {event_title} et développez votre réseau.\nDétails : {invitation_url}', '["guest_name","event_title","invitation_url"]'::jsonb, 'conference', true, gen_random_uuid())
ON CONFLICT DO NOTHING;