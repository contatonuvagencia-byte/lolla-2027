-- Estado de cada página do site Lolla 2027 (planner, roteiro, compras).
create table public.lolla_state (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  pagina text not null check (pagina in ('planner','roteiro','compras')),
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, pagina)
);

alter table public.lolla_state enable row level security;

create policy "ver os próprios dados" on public.lolla_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "criar os próprios dados" on public.lolla_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "editar os próprios dados" on public.lolla_state
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "apagar os próprios dados" on public.lolla_state
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.lolla_touch() returns trigger
language plpgsql set search_path = '' as $$
begin new.atualizado_em := now(); return new; end; $$;

create trigger lolla_state_touch before update on public.lolla_state
  for each row execute function public.lolla_touch();
