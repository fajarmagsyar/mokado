-- Sabotage picks: who gave which red card to whom
create table public.round_sabotage (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds on delete cascade,
  giver_player_id uuid not null references public.players on delete cascade,
  receiver_player_id uuid not null references public.players on delete cascade,
  card_id uuid not null,
  created_at timestamptz default now(),
  unique(round_id, giver_player_id)
);

alter table public.round_sabotage enable row level security;
create policy "sabotage_select" on public.round_sabotage for select using (true);
create policy "sabotage_insert" on public.round_sabotage for insert with check (true);

alter publication supabase_realtime add table public.round_sabotage;

-- Update rounds status check to include new phases
alter table public.rounds drop constraint if exists rounds_status_check;
alter table public.rounds add constraint rounds_status_check
  check (status in ('pitching_green', 'sabotage', 'judging', 'finished'));
