-- Migración: tracking de última conexión en profiles
-- Pega en Supabase → SQL Editor → New query → Run

alter table public.profiles
  add column if not exists last_seen_at timestamptz default now();
