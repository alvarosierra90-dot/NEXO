-- Migración: documentos en talleres + bucket de Storage
-- Pega en Supabase → SQL Editor → New query → Run

-- 1. Columna documentos en talleres
alter table public.talleres
  add column if not exists documentos jsonb default '[]'::jsonb;

-- 2. Crear bucket público para documentos (si no existe)
insert into storage.buckets (id, name, public)
values ('taller-docs', 'taller-docs', true)
on conflict (id) do nothing;

-- 3. Policies del bucket
drop policy if exists "taller_docs_select" on storage.objects;
drop policy if exists "taller_docs_insert" on storage.objects;
drop policy if exists "taller_docs_delete" on storage.objects;

create policy "taller_docs_select" on storage.objects
  for select using (bucket_id = 'taller-docs');

create policy "taller_docs_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'taller-docs');

create policy "taller_docs_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'taller-docs');
