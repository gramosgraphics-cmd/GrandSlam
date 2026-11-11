-- GrandSlam · esquema inicial
create table public.teams (
  id smallint primary key,
  name text not null,
  abbr text not null unique
);

create table public.players (
  id integer primary key,
  team_id smallint not null references public.teams(id) on delete cascade,
  name text not null,
  pos text not null check (pos in ('C','1B','2B','3B','SS','LF','CF','RF','BD','P','UT')),
  is_starter boolean not null default false,
  rookie boolean not null default false,
  avg numeric(4,3), obp numeric(4,3), slg numeric(4,3),
  hr smallint default 0, rbi smallint default 0,
  era numeric(4,2), whip numeric(4,2), fip numeric(4,2)
);

create table public.games (
  id bigint generated always as identity primary key,
  round_idx smallint not null,            -- 0-9 jornadas, 10 semifinal, 11 final
  slot smallint not null,                 -- posición del juego dentro de la jornada
  home_id smallint not null references public.teams(id),
  away_id smallint not null references public.teams(id),
  status text not null default 'prog' check (status in ('prog','live','fin')),
  home_score smallint not null default 0,
  away_score smallint not null default 0,
  inning smallint not null default 0,
  scheduled_time time,
  unique (round_idx, slot)
);

create table public.news (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.transactions (
  id bigint generated always as identity primary key,
  kind text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Posiciones calculadas a partir de los juegos finalizados (ronda regular)
create view public.standings as
select t.id as team_id, t.name,
  count(*) filter (where (g.home_id = t.id and g.home_score > g.away_score) or (g.away_id = t.id and g.away_score > g.home_score)) as wins,
  count(*) filter (where (g.home_id = t.id and g.home_score < g.away_score) or (g.away_id = t.id and g.away_score < g.home_score)) as losses
from public.teams t
left join public.games g on g.status = 'fin' and g.round_idx < 10 and t.id in (g.home_id, g.away_id)
group by t.id, t.name;

-- Seguridad: lectura pública, escritura solo para usuarios autenticados (admin)
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.games enable row level security;
alter table public.news enable row level security;
alter table public.transactions enable row level security;

do $$
declare t text;
begin
  foreach t in array array['teams','players','games','news','transactions'] loop
    execute format('create policy "lectura publica" on public.%I for select using (true)', t);
    execute format('create policy "escritura admin" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

alter publication supabase_realtime add table public.games;
