-- Estado en vivo del juego + historial de jugadas
alter table public.games
  add column half text not null default 'top' check (half in ('top','bot')),
  add column outs smallint not null default 0 check (outs between 0 and 2),
  add column r1 integer references public.players(id) on delete set null,
  add column r2 integer references public.players(id) on delete set null,
  add column r3 integer references public.players(id) on delete set null;

create table public.plays (
  id bigint generated always as identity primary key,
  game_id bigint not null references public.games(id) on delete cascade,
  inning smallint not null,
  half text not null,
  batter_id integer references public.players(id) on delete set null,
  kind text not null,
  runs smallint not null default 0,
  rbi smallint not null default 0,
  summary text,
  raw_text text,
  state_before jsonb not null,       -- para poder deshacer
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index on public.plays (game_id, id desc);

alter table public.plays enable row level security;
create policy "lectura publica" on public.plays for select using (true);
create policy "escritura admin" on public.plays for all to authenticated using (true) with check (true);
alter publication supabase_realtime add table public.plays;
