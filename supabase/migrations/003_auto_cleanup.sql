-- Auto-cleanup function for inactive rooms
create or replace function public.delete_inactive_rooms()
returns void language plpgsql security definer set search_path = public as $$
begin
  -- Waiting rooms not started within 24 hours
  delete from public.rooms
  where status = 'waiting'
    and created_at < now() - interval '24 hours';

  -- Finished rooms older than 7 days
  delete from public.rooms
  where status = 'finished'
    and created_at < now() - interval '7 days';

  -- Playing rooms stuck for more than 48 hours (abandoned mid-game)
  delete from public.rooms
  where status = 'playing'
    and created_at < now() - interval '48 hours';
end;
$$;

-- Schedule cleanup to run every hour via pg_cron
-- Run this in Supabase SQL editor as superuser if the migration runner lacks cron permissions:
--   select cron.schedule('delete-inactive-rooms', '0 * * * *', 'select public.delete_inactive_rooms()');
--
-- To verify the job was registered:
--   select * from cron.job;
--
-- To remove the job:
--   select cron.unschedule('delete-inactive-rooms');
select cron.schedule(
  'delete-inactive-rooms',
  '0 * * * *',
  'select public.delete_inactive_rooms()'
);
