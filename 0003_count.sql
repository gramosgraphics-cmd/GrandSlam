-- Conteo de bolas y strikes del turno al bate actual
alter table public.games
  add column balls smallint not null default 0 check (balls between 0 and 3),
  add column strikes smallint not null default 0 check (strikes between 0 and 2);
