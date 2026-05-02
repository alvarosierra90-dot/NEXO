-- ============================================================
-- NEXO · Setup completo para demo compartida
-- Pega TODO este archivo en Supabase → SQL Editor → New query → Run
-- ============================================================
-- Este archivo:
-- 1. Crea las tablas si no existen (schema base)
-- 2. Aplica todas las migraciones (objetivos, documentos, lastseen, chat)
-- 3. Añade las columnas nuevas (equipos, delegaciones, motivoRechazo, etc.)
-- 4. Abre las RLS para acceso anónimo (cualquiera con el link)
-- ============================================================

-- ───────────────────────────── 1. SCHEMA BASE ─────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text,
  apellidos text,
  equipo text default 'Sin equipo',
  nivel int default 2 check (nivel in (1, 2, 3)),
  rol text default 'usuario' check (rol in ('admin', 'usuario')),
  talleres text[] default '{}',
  onboarded boolean default false,
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.talleres (
  id text primary key,
  numero int,
  nombre text not null,
  lider text,
  dia_a_dia text,
  area text,
  estado text,
  descripcion text,
  objetivos jsonb default '[]'::jsonb,
  documentos jsonb default '[]'::jsonb,
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.herramientas (
  id text primary key,
  nombre text not null,
  descripcion text,
  categoria text,
  origen text default 'externa',
  funcionalidades text[] default '{}',
  areas text[] default '{}',
  equipos text[] default '{}',
  todos_equipos boolean default false,
  delegaciones text[] default '{}',
  todas_delegaciones boolean default false,
  todas_delegaciones_espana boolean default false,
  toda_compania_usuarios boolean default false,
  numero_usuarios int default 0,
  licencias_contratadas int default 0,
  licencias_activas int default 0,
  coste_anual numeric default 0,
  sin_coste_licencia boolean default false,
  tipo_licencia text,
  alerta text,
  fecha_alta date,
  solicitudes_licencia jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.iniciativas (
  id text primary key,
  titulo text not null,
  autor_id uuid references public.profiles(id) on delete set null,
  autor text,
  taller_id text references public.talleres(id) on delete set null,
  area text,
  estado text,
  descripcion text,
  created_at timestamptz default now()
);

create table if not exists public.tareas (
  id text primary key,
  tarea text not null,
  persona_id uuid references public.profiles(id) on delete set null,
  taller_id text references public.talleres(id) on delete set null,
  taller_origen_id text references public.talleres(id) on delete set null,
  creador_id uuid references public.profiles(id) on delete set null,
  deadline text,
  estado text default 'pendiente' check (estado in ('pendiente', 'completada')),
  prioridad text default 'media' check (prioridad in ('alta', 'media', 'baja')),
  fecha_creacion timestamptz default now()
);

create table if not exists public.historico (
  id text primary key,
  taller_id text references public.talleres(id) on delete cascade,
  fecha date,
  tipo text,
  titulo text,
  descripcion text,
  autor_id uuid references public.profiles(id) on delete set null,
  idea_id text,
  reunion_id text,
  objetivo_id text,
  created_at timestamptz default now()
);

create table if not exists public.reuniones (
  id text primary key,
  titulo text not null,
  fecha date,
  asistentes uuid[] default '{}',
  estado text default 'borrador',
  notas text,
  agenda text[] default '{}',
  ideas jsonb default '[]'::jsonb,
  taller_ids text[] default '{}',
  fuente text,
  created_at timestamptz default now()
);

create table if not exists public.convocatorias (
  id text primary key,
  titulo text not null,
  descripcion text,
  fecha date,
  hora text,
  duracion int default 60,
  recurrente boolean default false,
  frecuencia text,
  integrantes uuid[] default '{}',
  organizador_id uuid references public.profiles(id) on delete set null,
  agenda text[] default '{}',
  destacada boolean default true,
  estado text default 'pendiente',
  fecha_creacion timestamptz default now()
);

create table if not exists public.solapamientos (
  id text primary key,
  tipo text,
  titulo text not null,
  descripcion text,
  talleres_implicados text[] default '{}',
  herramientas_implicadas text[] default '{}',
  riesgo text check (riesgo in ('alto', 'medio', 'bajo')),
  recomendacion text,
  estado text default 'activo' check (estado in ('activo', 'resuelto', 'falso_positivo')),
  fecha_deteccion date,
  detectado_por text,
  ahorro_estimado numeric,
  peticion_relacionada_id text,
  created_at timestamptz default now()
);

create table if not exists public.peticiones (
  id text primary key,
  titulo text not null,
  descripcion text,
  equipo text,
  delegacion text,
  solicitante_id uuid references public.profiles(id) on delete set null,
  solicitante_nombre text,
  canalizado_por_id uuid references public.profiles(id) on delete set null,
  tipo_solicitud text,
  funcionalidades text[] default '{}',
  estado text default 'nueva',
  taller_asignado_id text references public.talleres(id) on delete set null,
  prioridad text default 'media' check (prioridad in ('alta', 'media', 'baja')),
  fecha date default current_date,
  evaluacion text,
  impacto_estimado text,
  motivo_rechazo text,
  fecha_rechazo timestamptz,
  rechazado_por_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.mensajes (
  id text primary key,
  autor_id uuid references public.profiles(id) on delete set null,
  texto text not null,
  created_at timestamptz default now()
);

-- ───────────────────────── 2. ALTER si ya existían ─────────────────────────
-- Estos ALTER añaden columnas si la tabla ya estaba creada con un schema antiguo.

alter table public.talleres
  add column if not exists objetivos jsonb default '[]'::jsonb,
  add column if not exists documentos jsonb default '[]'::jsonb,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists updated_by uuid references public.profiles(id) on delete set null;

alter table public.herramientas
  add column if not exists origen text default 'externa',
  add column if not exists equipos text[] default '{}',
  add column if not exists todos_equipos boolean default false,
  add column if not exists delegaciones text[] default '{}',
  add column if not exists todas_delegaciones boolean default false,
  add column if not exists todas_delegaciones_espana boolean default false,
  add column if not exists toda_compania_usuarios boolean default false,
  add column if not exists numero_usuarios int default 0,
  add column if not exists sin_coste_licencia boolean default false,
  add column if not exists tipo_licencia text,
  add column if not exists solicitudes_licencia jsonb default '[]'::jsonb;

alter table public.peticiones
  add column if not exists delegacion text,
  add column if not exists solicitante_nombre text,
  add column if not exists canalizado_por_id uuid references public.profiles(id) on delete set null,
  add column if not exists motivo_rechazo text,
  add column if not exists fecha_rechazo timestamptz,
  add column if not exists rechazado_por_id uuid references public.profiles(id) on delete set null;

alter table public.tareas
  add column if not exists taller_origen_id text references public.talleres(id) on delete set null,
  add column if not exists creador_id uuid references public.profiles(id) on delete set null;

alter table public.historico
  add column if not exists reunion_id text,
  add column if not exists objetivo_id text;

alter table public.reuniones
  add column if not exists taller_ids text[] default '{}',
  add column if not exists fuente text;

alter table public.profiles
  add column if not exists last_seen_at timestamptz default now();

-- ─────────────── 3. RLS ABIERTA PARA ACCESO ANÓNIMO (DEMO) ─────────────────
-- Cualquiera con el link puede leer y escribir. Para producción, IT debe
-- restringir esto a usuarios autenticados. Para el demo, abrimos.

alter table public.profiles enable row level security;
alter table public.talleres enable row level security;
alter table public.herramientas enable row level security;
alter table public.iniciativas enable row level security;
alter table public.tareas enable row level security;
alter table public.historico enable row level security;
alter table public.reuniones enable row level security;
alter table public.convocatorias enable row level security;
alter table public.solapamientos enable row level security;
alter table public.peticiones enable row level security;
alter table public.mensajes enable row level security;

do $$ declare t text;
begin
  for t in select unnest(array['profiles','talleres','herramientas','iniciativas','tareas','historico','reuniones','convocatorias','solapamientos','peticiones','mensajes']) loop
    execute format('drop policy if exists %s_select_all on public.%s', t, t);
    execute format('drop policy if exists %s_insert_all on public.%s', t, t);
    execute format('drop policy if exists %s_update_all on public.%s', t, t);
    execute format('drop policy if exists %s_delete_all on public.%s', t, t);
    execute format('drop policy if exists %s_select on public.%s', t, t);
    execute format('drop policy if exists %s_insert on public.%s', t, t);
    execute format('drop policy if exists %s_update on public.%s', t, t);
    execute format('drop policy if exists %s_delete on public.%s', t, t);
    execute format('drop policy if exists profiles_select_all on public.%s', t);
    execute format('drop policy if exists profiles_update_own on public.%s', t);
    execute format('create policy %s_select_all on public.%s for select using (true)', t, t);
    execute format('create policy %s_insert_all on public.%s for insert with check (true)', t, t);
    execute format('create policy %s_update_all on public.%s for update using (true) with check (true)', t, t);
    execute format('create policy %s_delete_all on public.%s for delete using (true)', t, t);
  end loop;
end $$;

-- ─────────────────── 4. STORAGE bucket para documentos ─────────────────────

insert into storage.buckets (id, name, public)
values ('taller-docs', 'taller-docs', true)
on conflict (id) do nothing;

drop policy if exists "taller_docs_select" on storage.objects;
drop policy if exists "taller_docs_insert" on storage.objects;
drop policy if exists "taller_docs_delete" on storage.objects;

create policy "taller_docs_select" on storage.objects
  for select using (bucket_id = 'taller-docs');

create policy "taller_docs_insert" on storage.objects
  for insert with check (bucket_id = 'taller-docs');

create policy "taller_docs_delete" on storage.objects
  for delete using (bucket_id = 'taller-docs');

-- ─────────────────── 5. Realtime para mensajes (chat) ──────────────────────

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'mensajes'
  ) then
    alter publication supabase_realtime add table public.mensajes;
  end if;
end $$;
