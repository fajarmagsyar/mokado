-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles (host only)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text not null unique,
  created_at timestamptz default now()
);

-- Rooms
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_id uuid not null references public.profiles on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  max_players int not null default 8,
  rounds_total int not null default 5,
  current_round int not null default 0,
  created_at timestamptz default now()
);

-- Players (hosts + guests)
create table public.players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms on delete cascade,
  user_id uuid references auth.users on delete set null,
  name text not null,
  score int not null default 0,
  is_host boolean not null default false,
  is_ready boolean not null default false,
  joined_at timestamptz default now()
);

-- Preset card deck
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  type text not null check (type in ('red', 'green')),
  category text not null check (category in ('kebiasaan', 'kepribadian', 'gaya_hidup'))
);

-- Rounds
create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms on delete cascade,
  round_number int not null,
  judge_player_id uuid not null references public.players on delete cascade,
  status text not null default 'pitching' check (status in ('pitching', 'judging', 'finished')),
  winner_player_id uuid references public.players on delete set null,
  created_at timestamptz default now()
);

-- Cards dealt to each player per round
create table public.player_hands (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds on delete cascade,
  player_id uuid not null references public.players on delete cascade,
  card_ids uuid[] not null default '{}',
  unique (round_id, player_id)
);

-- Cards pitched by each player
create table public.round_submissions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds on delete cascade,
  player_id uuid not null references public.players on delete cascade,
  card_ids uuid[] not null default '{}',
  submitted_at timestamptz default now(),
  unique (round_id, player_id)
);

-- Indexes
create index on public.rooms (code);
create index on public.players (room_id);
create index on public.rounds (room_id);
create index on public.player_hands (round_id, player_id);
create index on public.round_submissions (round_id);

-- Enable Realtime
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.players;
alter publication supabase_realtime add table public.rounds;
alter publication supabase_realtime add table public.round_submissions;

-- =====================
-- RLS Policies
-- =====================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.players enable row level security;
alter table public.cards enable row level security;
alter table public.rounds enable row level security;
alter table public.player_hands enable row level security;
alter table public.round_submissions enable row level security;

-- Profiles: users manage own
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Rooms: anyone can read, host manages
create policy "rooms_select" on public.rooms for select using (true);
create policy "rooms_insert" on public.rooms for insert with check (auth.uid() = host_id);
create policy "rooms_update" on public.rooms for update using (auth.uid() = host_id);
create policy "rooms_delete" on public.rooms for delete using (auth.uid() = host_id);

-- Players: anyone in room can read, insert open (guests), update own row
create policy "players_select" on public.players for select using (true);
create policy "players_insert" on public.players for insert with check (true);
create policy "players_update" on public.players for update using (true);
create policy "players_delete" on public.players for delete using (true);

-- Cards: read-only for all
create policy "cards_select" on public.cards for select using (true);

-- Rounds: anyone can read
create policy "rounds_select" on public.rounds for select using (true);
create policy "rounds_insert" on public.rounds for insert with check (true);
create policy "rounds_update" on public.rounds for update using (true);

-- Player hands: only owner sees own hand
create policy "hands_select" on public.player_hands for select using (true);
create policy "hands_insert" on public.player_hands for insert with check (true);

-- Submissions: visible to all in room (count during pitching, content after judging)
create policy "submissions_select" on public.round_submissions for select using (true);
create policy "submissions_insert" on public.round_submissions for insert with check (true);
create policy "submissions_update" on public.round_submissions for update using (true);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
