-- Migración: añadir columna objetivos a talleres
-- Pega este snippet en Supabase → SQL Editor → New query → Run

alter table public.talleres
  add column if not exists objetivos jsonb default '[]'::jsonb;
