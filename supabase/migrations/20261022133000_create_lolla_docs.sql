-- Documentos e confirmações da viagem (arquivo guardado em base64, só a dona vê)
create table public.lolla_docs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titulo text not null,
  categoria text not null default 'outros' check (categoria in ('hospedagem','ingresso','voo','identidade','outros')),
  nota text not null default '',
  arquivo_nome text,
  mime text,
  tamanho integer check (tamanho is null or tamanho <= 7000000),
  conteudo text,
  criado_em timestamptz not null default now()
);
create index lolla_docs_user_idx on public.lolla_docs(user_id, criado_em desc);
alter table public.lolla_docs enable row level security;
create policy "docs: ler os meus" on public.lolla_docs for select to authenticated using ((select auth.uid()) = user_id);
create policy "docs: criar os meus" on public.lolla_docs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "docs: editar os meus" on public.lolla_docs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "docs: apagar os meus" on public.lolla_docs for delete to authenticated using ((select auth.uid()) = user_id);
