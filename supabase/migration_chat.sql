-- Migración: tabla mensajes para el módulo Chat
-- Pega en Supabase → SQL Editor → New query → Run

create table if not exists public.mensajes (
  id text primary key,
  autor_id uuid references public.profiles(id) on delete set null,
  texto text not null,
  created_at timestamptz default now()
);

alter table public.mensajes enable row level security;

drop policy if exists mensajes_select on public.mensajes;
drop policy if exists mensajes_insert on public.mensajes;
drop policy if exists mensajes_delete on public.mensajes;

create policy mensajes_select on public.mensajes for select using (auth.uid() is not null);
create policy mensajes_insert on public.mensajes for insert with check (auth.uid() is not null);
create policy mensajes_delete on public.mensajes for delete using (auth.uid() = autor_id);

-- Habilitar realtime para esta tabla
alter publication supabase_realtime add table public.mensajes;
