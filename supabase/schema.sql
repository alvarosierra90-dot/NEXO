-- ============================================================
-- NEXO · Esquema de base de datos
-- Pega este archivo entero en Supabase → SQL Editor → "New query" → Run
-- ============================================================

-- 1. profiles (extiende auth.users)
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger: crea profile automáticamente al registrarse en auth
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

-- 2. talleres
create table if not exists public.talleres (
  id text primary key,
  numero int,
  nombre text not null,
  lider text,
  dia_a_dia text,
  area text,
  estado text,
  descripcion text,
  created_at timestamptz default now()
);

-- 3. herramientas
create table if not exists public.herramientas (
  id text primary key,
  nombre text not null,
  descripcion text,
  categoria text,
  funcionalidades text[] default '{}',
  areas text[] default '{}',
  licencias_contratadas int default 0,
  licencias_activas int default 0,
  coste_anual numeric default 0,
  alerta text,
  fecha_alta date,
  created_at timestamptz default now()
);

-- 4. iniciativas
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

-- 5. tareas
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

-- 6. historico (eventos de talleres)
create table if not exists public.historico (
  id text primary key,
  taller_id text references public.talleres(id) on delete cascade,
  fecha date,
  tipo text,
  titulo text,
  descripcion text,
  autor_id uuid references public.profiles(id) on delete set null,
  idea_id text,
  created_at timestamptz default now()
);

-- 7. reuniones
create table if not exists public.reuniones (
  id text primary key,
  titulo text not null,
  fecha date,
  asistentes uuid[] default '{}',
  estado text default 'borrador',
  notas text,
  agenda text[] default '{}',
  ideas jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 8. convocatorias
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

-- 9. solapamientos / conflictos
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

-- 10. peticiones
create table if not exists public.peticiones (
  id text primary key,
  titulo text not null,
  descripcion text,
  equipo text,
  solicitante_id uuid references public.profiles(id) on delete set null,
  tipo_solicitud text check (tipo_solicitud in ('herramienta_nueva', 'mejora_herramienta', 'mejora_proceso', 'contratar_perfil')),
  funcionalidades text[] default '{}',
  estado text default 'nueva',
  taller_asignado_id text references public.talleres(id) on delete set null,
  prioridad text default 'media' check (prioridad in ('alta', 'media', 'baja')),
  fecha date default current_date,
  evaluacion text,
  impacto_estimado text,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS — Row Level Security
-- Inicial: cualquier usuario autenticado puede leer y escribir
-- (lo refinamos en una pasada posterior)
-- ============================================================

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

-- profiles: leer todos, actualizar solo el propio
drop policy if exists profiles_select_all on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_all on public.profiles for select using (auth.uid() is not null);
create policy profiles_update_own on public.profiles for update using (auth.uid() = id);

-- Resto: lectura/escritura para autenticados
do $$ declare t text;
begin
  for t in select unnest(array['talleres','herramientas','iniciativas','tareas','historico','reuniones','convocatorias','solapamientos','peticiones']) loop
    execute format('drop policy if exists %s_select on public.%s', t, t);
    execute format('drop policy if exists %s_insert on public.%s', t, t);
    execute format('drop policy if exists %s_update on public.%s', t, t);
    execute format('drop policy if exists %s_delete on public.%s', t, t);
    execute format('create policy %s_select on public.%s for select using (auth.uid() is not null)', t, t);
    execute format('create policy %s_insert on public.%s for insert with check (auth.uid() is not null)', t, t);
    execute format('create policy %s_update on public.%s for update using (auth.uid() is not null)', t, t);
    execute format('create policy %s_delete on public.%s for delete using (auth.uid() is not null)', t, t);
  end loop;
end $$;
