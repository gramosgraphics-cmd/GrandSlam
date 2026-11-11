-- GrandSlam · instalación completa (pégalo entero en Supabase → SQL Editor → Run)

-- ===== migrations/0001_init.sql =====
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

-- ===== migrations/0002_plays.sql =====
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

-- ===== migrations/0003_count.sql =====
-- Conteo de bolas y strikes del turno al bate actual
alter table public.games
  add column balls smallint not null default 0 check (balls between 0 and 3),
  add column strikes smallint not null default 0 check (strikes between 0 and 2);

-- ===== seed.sql =====
-- Datos de DEMOSTRACIÓN (los mismos de la página). Reemplázalos por tu liga real.
insert into public.teams (id,name,abbr) values
  (1,'Tiburones de Neo-Guayana','TNG'),
  (2,'Centinelas de Capital','CC'),
  (3,'Leones del Valle','LV'),
  (4,'Águilas del Litoral','AL'),
  (5,'Bravos del Puerto','BP'),
  (6,'Cóndores del Sur','CS');

insert into public.players (id,team_id,name,pos,is_starter,rookie,avg,obp,slg,hr,rbi,era,whip,fip) values
  (100,1,'Carlos “El Rayo” Mendoza','C',true,false,0.230,0.295,0.370,0,18,2.10,0.95,1.80),
  (101,1,'Anthony Salazar','1B',true,false,0.231,0.309,0.410,13,83,3.40,1.08,3.70),
  (102,1,'Luis Colmenares','2B',true,false,0.232,0.298,0.450,26,78,4.70,1.21,4.90),
  (103,1,'Diego Zambrano','3B',true,false,0.233,0.312,0.400,12,73,2.80,1.34,2.90),
  (104,1,'Mateo Villasmil','SS',true,false,0.234,0.301,0.440,25,68,4.10,1.07,4.10),
  (105,1,'Jhonny Ledezma','LF',true,false,0.235,0.315,0.390,11,63,2.20,1.20,2.10),
  (106,1,'Ender Navas','CF',true,false,0.236,0.304,0.430,24,58,3.50,1.33,3.30),
  (107,1,'Rafael Pérez','RF',true,false,0.237,0.318,0.380,10,53,4.80,1.06,4.50),
  (108,1,'Kevin Rivas','BD',true,false,0.238,0.307,0.420,23,48,2.90,1.19,3.20),
  (109,1,'Omar Ocando','P',true,false,0.239,0.321,0.460,9,43,4.20,1.32,4.40),
  (110,1,'Félix Duarte','UT',false,true,0.240,0.310,0.410,22,38,2.30,1.05,2.40),
  (111,1,'Andrés Peña','UT',false,true,0.241,0.324,0.450,8,33,3.60,1.18,3.60),
  (112,1,'Héctor Camacho','UT',false,true,0.242,0.313,0.400,21,28,4.90,1.31,4.80),
  (200,2,'Anthony Ocando','C',true,false,0.259,0.341,0.450,17,33,3.80,1.12,3.80),
  (201,2,'Luis Duarte','1B',true,false,0.260,0.330,0.400,3,28,5.10,1.25,5.00),
  (202,2,'Diego Peña','2B',true,false,0.261,0.344,0.440,16,23,3.20,0.98,3.00),
  (203,2,'Mateo Camacho','3B',true,false,0.262,0.333,0.480,2,18,4.50,1.11,4.20),
  (204,2,'Jhonny Torrealba','SS',true,false,0.263,0.347,0.430,15,83,2.60,1.24,2.90),
  (205,2,'Ender Quintero','LF',true,false,0.264,0.336,0.470,1,78,3.90,0.97,4.10),
  (206,2,'Rafael Arteaga','CF',true,false,0.265,0.350,0.420,14,73,5.20,1.10,5.30),
  (207,2,'Kevin Bastidas','RF',true,false,0.266,0.339,0.460,0,68,3.30,1.23,3.30),
  (208,2,'Omar Linares','BD',true,false,0.267,0.353,0.410,13,63,4.60,0.96,4.50),
  (209,2,'Félix Rojas','P',true,false,0.268,0.342,0.450,26,58,2.70,1.09,2.50),
  (210,2,'Andrés Ibarra','UT',false,true,0.269,0.356,0.490,12,53,4.00,1.22,3.70),
  (211,2,'Héctor Mendoza','UT',false,true,0.270,0.345,0.440,25,48,2.10,0.95,2.40),
  (212,2,'Carlos Salazar','UT',false,true,0.271,0.359,0.480,11,43,3.40,1.08,3.60),
  (300,3,'Luis Rojas','C',true,false,0.288,0.362,0.440,7,48,2.30,1.29,2.60),
  (301,3,'Diego Ibarra','1B',true,false,0.289,0.376,0.480,20,43,3.60,1.02,3.80),
  (302,3,'Mateo Mendoza','2B',true,false,0.290,0.365,0.430,6,38,4.90,1.15,5.00),
  (303,3,'Jhonny Salazar','3B',true,false,0.291,0.379,0.470,19,33,3.00,1.28,3.00),
  (304,3,'Ender Colmenares','SS',true,false,0.292,0.368,0.510,5,28,4.30,1.01,4.20),
  (305,3,'Rafael Zambrano','LF',true,false,0.293,0.382,0.460,18,23,2.40,1.14,2.20),
  (306,3,'Kevin Villasmil','CF',true,false,0.294,0.371,0.500,4,18,3.70,1.27,3.40),
  (307,3,'Omar Ledezma','RF',true,false,0.295,0.360,0.450,17,83,5.00,1.00,5.30),
  (308,3,'Félix Navas','BD',true,false,0.296,0.374,0.490,3,78,3.10,1.13,3.30),
  (309,3,'Andrés Pérez','P',true,false,0.297,0.363,0.440,16,73,4.40,1.26,4.50),
  (310,3,'Héctor Rivas','UT',false,true,0.298,0.377,0.480,2,68,2.50,0.99,2.50),
  (311,3,'Carlos Ocando','UT',false,true,0.299,0.366,0.520,15,63,3.80,1.12,3.70),
  (312,3,'Anthony Duarte','UT',false,true,0.300,0.380,0.470,1,58,5.10,1.25,4.90),
  (400,4,'Diego Pérez','C',true,false,0.317,0.383,0.520,24,63,4.00,1.06,3.90),
  (401,4,'Mateo Rivas','1B',true,false,0.318,0.397,0.470,10,58,2.10,1.19,1.90),
  (402,4,'Jhonny Ocando','2B',true,false,0.319,0.386,0.510,23,53,3.40,1.32,3.10),
  (403,4,'Ender Duarte','3B',true,false,0.230,0.310,0.370,9,48,4.70,1.05,5.00),
  (404,4,'Rafael Peña','SS',true,false,0.231,0.299,0.410,22,43,2.80,1.18,3.00),
  (405,4,'Kevin Camacho','LF',true,false,0.232,0.313,0.450,8,38,4.10,1.31,4.20),
  (406,4,'Omar Torrealba','CF',true,false,0.233,0.302,0.400,21,33,2.20,1.04,2.20),
  (407,4,'Félix Quintero','RF',true,false,0.234,0.316,0.440,7,28,3.50,1.17,3.40),
  (408,4,'Andrés Arteaga','BD',true,false,0.235,0.305,0.390,20,23,4.80,1.30,4.60),
  (409,4,'Héctor Bastidas','P',true,false,0.236,0.319,0.430,6,18,2.90,1.03,2.60),
  (410,4,'Carlos Linares','UT',false,true,0.237,0.308,0.380,19,83,4.20,1.16,4.50),
  (411,4,'Anthony Rojas','UT',false,true,0.238,0.322,0.420,5,78,2.30,1.29,2.50),
  (412,4,'Luis Ibarra','UT',false,true,0.239,0.311,0.460,18,73,3.60,1.02,3.70),
  (500,5,'Mateo Bastidas','C',true,false,0.256,0.339,0.420,14,78,2.50,1.23,2.70),
  (501,5,'Jhonny Linares','1B',true,false,0.257,0.328,0.460,0,73,3.80,0.96,3.90),
  (502,5,'Ender Rojas','2B',true,false,0.258,0.342,0.410,13,68,5.10,1.09,5.10),
  (503,5,'Rafael Ibarra','3B',true,false,0.259,0.331,0.450,26,63,3.20,1.22,3.10),
  (504,5,'Kevin Mendoza','SS',true,false,0.260,0.345,0.400,12,58,4.50,0.95,4.30),
  (505,5,'Omar Salazar','LF',true,false,0.261,0.334,0.440,25,53,2.60,1.08,2.30),
  (506,5,'Félix Colmenares','CF',true,false,0.262,0.348,0.480,11,48,3.90,1.21,4.20),
  (507,5,'Andrés Zambrano','RF',true,false,0.263,0.337,0.430,24,43,5.20,1.34,5.40),
  (508,5,'Héctor Villasmil','BD',true,false,0.264,0.351,0.470,10,38,3.30,1.07,3.40),
  (509,5,'Carlos Ledezma','P',true,false,0.265,0.340,0.420,23,33,4.60,1.20,4.60),
  (510,5,'Anthony Navas','UT',false,true,0.266,0.354,0.460,9,28,2.70,1.33,2.60),
  (511,5,'Luis Pérez','UT',false,true,0.267,0.343,0.410,22,23,4.00,1.06,3.80),
  (512,5,'Diego Rivas','UT',false,true,0.268,0.357,0.450,8,18,2.10,1.19,1.80),
  (600,6,'Jhonny Ledezma','C',true,false,0.285,0.360,0.500,4,23,4.20,1.00,4.00),
  (601,6,'Ender Navas','1B',true,false,0.286,0.374,0.450,17,18,2.30,1.13,2.00),
  (602,6,'Rafael Pérez','2B',true,false,0.287,0.363,0.490,3,83,3.60,1.26,3.90),
  (603,6,'Kevin Rivas','3B',true,false,0.288,0.377,0.440,16,78,4.90,0.99,5.10),
  (604,6,'Omar Ocando','SS',true,false,0.289,0.366,0.480,2,73,3.00,1.12,3.10),
  (605,6,'Félix Duarte','LF',true,false,0.290,0.355,0.430,15,68,4.30,1.25,4.30),
  (606,6,'Andrés Peña','CF',true,false,0.291,0.369,0.470,1,63,2.40,0.98,2.30),
  (607,6,'Héctor Camacho','RF',true,false,0.292,0.358,0.510,14,58,3.70,1.11,3.50),
  (608,6,'Carlos Torrealba','BD',true,false,0.293,0.372,0.460,0,53,5.00,1.24,4.70),
  (609,6,'Anthony Quintero','P',true,false,0.294,0.361,0.500,13,48,3.10,0.97,3.40),
  (610,6,'Luis Arteaga','UT',false,true,0.295,0.375,0.450,26,43,4.40,1.10,4.60),
  (611,6,'Diego Bastidas','UT',false,true,0.296,0.364,0.490,12,38,2.50,1.23,2.60),
  (612,6,'Mateo Linares','UT',false,true,0.297,0.378,0.440,25,33,3.80,0.96,3.80);

insert into public.games (round_idx,slot,home_id,away_id,status,home_score,away_score,inning,half,outs,scheduled_time) values
  (0,0,1,6,'fin',2,1,9,'top',0,'13:00'),
  (0,1,2,5,'fin',5,4,9,'top',0,'16:00'),
  (0,2,3,4,'fin',6,0,9,'top',0,'19:30'),
  (1,0,5,1,'fin',5,3,9,'top',0,'13:00'),
  (1,1,4,6,'fin',7,6,9,'top',0,'16:00'),
  (1,2,3,2,'fin',1,2,9,'top',0,'19:30'),
  (2,0,1,4,'fin',0,5,9,'top',0,'13:00'),
  (2,1,5,3,'fin',2,1,9,'top',0,'16:00'),
  (2,2,6,2,'fin',5,4,9,'top',0,'19:30'),
  (3,0,3,1,'fin',3,0,9,'top',0,'13:00'),
  (3,1,2,4,'fin',5,3,9,'top',0,'16:00'),
  (3,2,6,5,'fin',7,6,9,'top',0,'19:30'),
  (4,0,1,2,'fin',6,2,9,'top',0,'13:00'),
  (4,1,3,6,'fin',0,5,9,'top',0,'16:00'),
  (4,2,4,5,'fin',2,1,9,'top',0,'19:30'),
  (5,0,6,1,'live',1,4,6,'bot',0,'13:00'),
  (5,1,5,2,'fin',3,0,9,'top',0,'16:00'),
  (5,2,4,3,'prog',0,0,0,'top',0,'19:30'),
  (6,0,1,5,'prog',0,0,0,'top',0,'13:00'),
  (6,1,6,4,'prog',0,0,0,'top',0,'16:00'),
  (6,2,2,3,'prog',0,0,0,'top',0,'19:30'),
  (7,0,4,1,'prog',0,0,0,'top',0,'13:00'),
  (7,1,3,5,'prog',0,0,0,'top',0,'16:00'),
  (7,2,2,6,'prog',0,0,0,'top',0,'19:30'),
  (8,0,1,3,'prog',0,0,0,'top',0,'13:00'),
  (8,1,4,2,'prog',0,0,0,'top',0,'16:00'),
  (8,2,5,6,'prog',0,0,0,'top',0,'19:30'),
  (9,0,2,1,'prog',0,0,0,'top',0,'13:00'),
  (9,1,6,3,'prog',0,0,0,'top',0,'16:00'),
  (9,2,5,4,'prog',0,0,0,'top',0,'19:30'),
  (10,0,1,5,'prog',0,0,0,'top',0,'13:00'),
  (10,1,3,2,'prog',0,0,0,'top',0,'16:00'),
  (11,0,1,3,'prog',0,0,0,'top',0,'13:00');

insert into public.news (title,body) values
  ('Los Tiburones aseguran el primer lugar','Con una racha de ocho victorias, Neo-Guayana llega a la semifinal como líder de la ronda regular.'),
  ('Abridor de Leones lanza siete entradas en blanco','Anthony Pérez dominó la ofensiva rival con nueve ponches y ninguna base por bolas.'),
  ('Novato de Cóndores del Sur sorprende con 12 jonrones','El jardinero lidera a los debutantes y compite por el premio Novato del Año.'),
  ('Centinelas de Capital refuerza su bullpen','El cuerpo técnico anunció cambios en la rotación para la fase final.');

insert into public.transactions (kind,body) values
  ('Firma','Bravos del Puerto firman al relevista Héctor Villasmil por dos temporadas.'),
  ('Cambio','Águilas del Litoral envían al segunda base Diego Salazar a Leones del Valle por dos prospectos.'),
  ('Rumor','Se menciona a Carlos “El Rayo” Mendoza como objetivo de Centinelas de Capital para la próxima temporada.'),
  ('Contratación','Cóndores del Sur incorporan un nuevo coach de bateo para la serie final.'),
  ('Rumor','Fuentes cercanas indican que Tiburones buscan un cerrador antes de la final.');
