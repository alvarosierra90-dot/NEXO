-- ============================================================
-- NEXO · Import del estado actual de la demo de Álvaro
-- Pega TODO en Supabase → SQL Editor → New query → Run
-- ============================================================
-- Este archivo:
-- 1. Migra el schema: cambia columnas uuid → text (los IDs del demo son p1, p4...
--    no UUIDs reales) y elimina las FKs incompatibles.
-- 2. Limpia las tablas (idempotente: lo puedes correr varias veces).
-- 3. Inserta todos los datos del dump del 2 mayo 2026.
-- ============================================================

-- ─────────────────────── 1. MIGRACIÓN DE SCHEMA ────────────────────────────
-- Hay que SOLTAR todas las FKs PRIMERO y luego cambiar los tipos. No
-- dependemos del nombre del constraint: buscamos dinámicamente cualquier FK
-- que referencie profiles.id y la soltamos.

-- 1a. Brute force: soltar TODAS las foreign keys y CHECK constraints del
-- schema public. No las recreamos porque para el demo abierto no son
-- necesarias y nos evitamos conflictos de tipos / valores legacy.
do $$
declare r record;
begin
  for r in
    select n.nspname as schema_name,
           c.relname as table_name,
           con.conname as constraint_name
    from pg_constraint con
    join pg_class c on c.oid = con.conrelid
    join pg_namespace n on n.oid = c.relnamespace
    where con.contype in ('f', 'c')
      and n.nspname = 'public'
      and con.conname not like '%_pkey'
      and con.conname not like '%_not_null'
  loop
    execute format('alter table %I.%I drop constraint %I',
      r.schema_name, r.table_name, r.constraint_name);
  end loop;
end $$;

-- 1c. Cambiar tipo de columnas. Ahora que las FKs están soltadas, no fallará.
alter table public.profiles alter column id type text;
alter table public.iniciativas alter column autor_id type text;
alter table public.tareas alter column persona_id type text;
alter table public.tareas alter column creador_id type text;
alter table public.historico alter column autor_id type text;
alter table public.reuniones alter column asistentes type text[] using asistentes::text[];
alter table public.convocatorias alter column integrantes type text[] using integrantes::text[];
alter table public.convocatorias alter column organizador_id type text;
alter table public.peticiones alter column solicitante_id type text;
alter table public.peticiones alter column canalizado_por_id type text;
alter table public.peticiones alter column rechazado_por_id type text;
alter table public.mensajes alter column autor_id type text;
alter table public.talleres alter column updated_by type text;

-- ─────────────────────── 2. LIMPIAR TABLAS ─────────────────────────────────

delete from public.mensajes;
delete from public.solapamientos;
delete from public.peticiones;
delete from public.convocatorias;
delete from public.reuniones;
delete from public.historico;
delete from public.tareas;
delete from public.iniciativas;
delete from public.herramientas;
delete from public.profiles;
delete from public.talleres;

-- ─────────────────────── 3. TALLERES ──────────────────────────────────────

insert into public.talleres (id, numero, nombre, lider, dia_a_dia, area, estado, descripcion, objetivos, documentos) values
('t1', 1, 'Innovación', 'Líder Innovación', 'Líder Property Data', 'Tecnología', 'En curso', $$Foro de Innovación con asistente IA para consultas de negocio, chatbot de incidencias en Property, IA para análisis de RFPs.$$, $$[{"id":"obj-1777665089436","titulo":"CAMBIAR ESTADO","fecha":"2026-10-22","estado":"pendiente","fechaCreacion":"2026-05-01","eventoCumplimientoId":null}]$$::jsonb, '[]'::jsonb),
('t2', 2, 'Mejora de Procesos', 'Líder Procesos', null, 'Tecnología', 'En curso', $$Análisis de procesos en áreas de alto riesgo (Arquitectura, Valoraciones, Property) y soporte crítico (Jurídico, Financiero). Primera oleada con tercero externo.$$, '[]'::jsonb, '[]'::jsonb),
('t3', 3, 'Property Data Base', 'Líder Property Data', null, 'Tecnología', 'Diseño', $$Base de datos centralizada de Property. Plataforma interna end-to-end conectando equipos, activos y propietarios. Integración con CRM corporativo y Data Lake.$$, $$[{"id":"obj-1777728692853","titulo":"Reuniones con todos los equipos","fecha":"2026-04-02","estado":"pendiente","fechaCreacion":"2026-05-02","eventoCumplimientoId":null},{"id":"obj-1777728724255","titulo":"Crear un mockup visual para diseñar profunidad de la herramienta","fecha":"2026-04-30","estado":"completado","fechaCreacion":"2026-05-02","eventoCumplimientoId":"e-obj-1777730551671"},{"id":"obj-1777728746985","titulo":"Crear los flujos de cada una de las funcionalidades","fecha":"2026-05-18","estado":"completado","fechaCreacion":"2026-05-02","eventoCumplimientoId":"e-obj-1777729244428"},{"id":"obj-1777728771082","titulo":"reunirse con los equipos","fecha":"2026-06-01","estado":"completado","fechaCreacion":"2026-05-02","eventoCumplimientoId":"e-obj-1777729243419"}]$$::jsonb, '[]'::jsonb),
('t4', 4, 'Flex Transversal (Co-Workings, Work There, etc)', 'Líder Servicios Transversales', null, 'Servicios transversales', 'Activo', 'Estrategia transversal de espacios flexibles: co-workings, Work There y otros formatos.', '[]'::jsonb, '[]'::jsonb),
('t5', 5, 'Capital Advisors (CF + Investment Banking)', 'Líder Capital Advisors', null, 'Servicios transversales', 'En curso', 'Línea de servicios Capital Advisors: Corporate Finance e Investment Banking.', '[]'::jsonb, '[]'::jsonb),
('t6', 6, 'Propuestas Multidisciplinares (Best use y otros)', 'Líder Multidisciplinares', null, 'Servicios transversales', 'Planificado', 'Propuestas integradas multidisciplinares: best use, valoraciones cruzadas y otros formatos combinados.', '[]'::jsonb, '[]'::jsonb),
('t7', 7, 'Usuarios', 'Líder Clientes', null, 'Clientes', 'En curso', 'Estrategia de relación con usuarios: experiencia, segmentación y propuesta de valor.', '[]'::jsonb, '[]'::jsonb),
('t8', 8, 'Aproximación Cliente (excepto usuarios)', 'Líder Aproximación Cliente', null, 'Clientes', 'En curso', 'Modelo de aproximación al cliente corporativo, institucional e inversor.', '[]'::jsonb, '[]'::jsonb),
('t9', 9, 'Comisiones, Remuneración Trasversal y Sistema retributivo', 'Líder Retribución', null, 'Sistema de retribución', 'Planificado', 'Revisión del modelo retributivo: comisiones, remuneración trasversal y sistema retributivo de la compañía.', '[]'::jsonb, '[]'::jsonb),
('t10', 10, 'Plan de talento, Formación y Plan de Carrera', 'Líder Talento', null, 'Talento, Formación y Plan de Carrera', 'En curso', $$Plan de talento (9 Grid Box), formación del equipo directivo, plan de contingencia directiva y plan de carrera "lateral".$$, '[]'::jsonb, '[]'::jsonb),
('t11', 11, 'Gobernanza de la compañía', 'Líder Gobernanza / Líder Innovación', null, 'Gobernanza', 'Activo', 'Gobernanza de la compañía, incluyendo Comité de Dirección y órganos de gobierno.', '[]'::jsonb, '[]'::jsonb),
('t12', 12, 'Refuerzo Mensaje de Cultura / Marca Corporativa', 'Líder Gobernanza', null, 'Cultura', 'En curso', 'Refuerzo del mensaje de cultura corporativa y consolidación de la marca.', '[]'::jsonb, '[]'::jsonb),
('t13', 13, 'Plan Juventud', 'Líder Plan Juventud', null, 'Cultura', 'Planificado', 'Plan Juventud: incorporación, retención y desarrollo de talento joven.', '[]'::jsonb, '[]'::jsonb),
('t14', 14, 'Geografías y red de prescriptores', 'Líder Geografías', null, 'Diversificación', 'En curso', 'Diversificación geográfica y desarrollo de la red de prescriptores.', '[]'::jsonb, '[]'::jsonb),
('t15', 15, 'Nuevas líneas de negocio', 'Líder Diversificación', null, 'Diversificación', 'Exploratorio', 'Identificación y arranque de nuevas líneas de negocio.', '[]'::jsonb, '[]'::jsonb),
('t16', 16, 'Involucración en gestión de niveles N2 y N3', 'Líder Niveles N2-N3', null, 'Otros', 'En curso', 'Delegación de responsabilidades, madurez organizativa e involucración de niveles N2 y N3 en la gestión.', '[]'::jsonb, '[]'::jsonb),
('tx1', null, 'Plataforma Integrada', 'IT Local', null, 'Plataforma transversal', 'Diseño', 'Plataforma interna end-to-end que conecta equipos, activos y propietarios. Integración con CRM corporativo y Data Lake. Asistente chat para consultas de facturación y pipeline. Iniciativa transversal del Plan Estratégico, fuera de la numeración oficial pero crítica para varios talleres.', '[]'::jsonb, '[]'::jsonb),
('tx2', null, 'Repositorio 360', 'IT Local', null, 'Plataforma transversal', 'Mockup', 'Evolución del repositorio documental Repositorio Doc hacia visión 360 integrada con Plataforma Integrada. Mockup funcional construido. Iniciativa transversal del Plan Estratégico, fuera de la numeración oficial.', '[]'::jsonb, '[]'::jsonb);

-- ─────────────────────── 4. PROFILES (personas) ────────────────────────────

insert into public.profiles (id, email, nombre, apellidos, equipo, nivel, talleres, onboarded) values
('p1', 'lider.servicios.trans@compania.es', 'Líder Servicios Transversales', null, 'Comité de seguimiento · Servicios transversales', 1, ARRAY['t4','t1','t2','t3']::text[], false),
('p2', 'lider.clientes@compania.es', 'Líder Clientes', null, 'Comité de seguimiento · Clientes', 1, ARRAY['t7']::text[], false),
('p3', 'lider.diversificacion@compania.es', 'Líder Diversificación', null, 'Comité de seguimiento · Diversificación', 1, ARRAY['t15']::text[], false),
('p4', 'lider.innovacion@compania.es', 'Líder Innovación', null, 'Tecnología · Innovación', 1, ARRAY['t1','t11']::text[], false),
('p5', 'lider.procesos@compania.es', 'Líder Procesos', null, 'Tecnología · Procesos', 1, ARRAY['t2']::text[], false),
('p6', 'lider.property.data@compania.es', 'Líder Property Data', null, 'Tecnología · Property Data Base', 1, ARRAY['t1','t3']::text[], false),
('p7', 'lider.capital@compania.es', 'Líder Capital Advisors', null, 'Servicios transversales · Capital Advisors', 1, ARRAY['t5']::text[], false),
('p8', 'lider.multi@compania.es', 'Líder Multidisciplinares', null, 'Servicios transversales · Multidisciplinares', 1, ARRAY['t6']::text[], false),
('p9', 'lider.aprox.cliente@compania.es', 'Líder Aproximación Cliente', null, 'Clientes · Aproximación Cliente', 1, ARRAY['t8']::text[], false),
('p10', 'lider.retribucion@compania.es', 'Líder Retribución', null, 'Sistema de retribución', 1, ARRAY['t9']::text[], false),
('p11', 'lider.talento@compania.es', 'Líder Talento', null, 'Talento, Formación y Plan de Carrera', 1, ARRAY['t10']::text[], false),
('p12', 'lider.gobernanza@compania.es', 'Líder Gobernanza', null, 'Gobernanza y Cultura', 1, ARRAY['t11','t12']::text[], false),
('p13', 'lider.juventud@compania.es', 'Líder Plan Juventud', null, 'Cultura · Plan Juventud', 1, ARRAY['t13']::text[], false),
('p14', 'lider.geografias@compania.es', 'Líder Geografías', null, 'Diversificación · Geografías', 1, ARRAY['t14']::text[], false),
('p15', 'lider.n2n3@compania.es', 'Líder Niveles N2-N3', null, 'Otros · Niveles N2 y N3', 1, ARRAY['t16']::text[], false),
('p16', 'coordinador.nexo@compania.es', 'Coordinador Nexo', null, 'Nexo · Coordinación', 1, ARRAY['t1','t2','t3','t4','t5','t6','t7','t8','t9','t10','t11','t12','t13','t14','t15','t16','tx1','tx2']::text[], false),
('p17', 'equipo.procesos.1@compania.es', 'Equipo Procesos 1', null, 'Procesos', 2, ARRAY['t2']::text[], false),
('p18', 'equipo.procesos.2@compania.es', 'Equipo Procesos 2', null, 'Procesos', 2, ARRAY['t2']::text[], false),
('p19', 'equipo.procesos.3@compania.es', 'Equipo Procesos 3', null, 'Procesos', 2, ARRAY['t2']::text[], false),
('p20', 'equipo.procesos.4@compania.es', 'Equipo Procesos 4', null, 'Procesos', 3, ARRAY['t2']::text[], false),
('p21', 'equipo.procesos.5@compania.es', 'Equipo Procesos 5', null, 'Procesos', 3, ARRAY['t2']::text[], false),
('p22', 'lider.juridico@compania.es', 'Líder Jurídico', null, 'Jurídico', 1, ARRAY['t2']::text[], false),
('p23', 'cesar@compania.com', 'IT Internacional', null, 'IT Internacional', 2, ARRAY['tx1']::text[], false),
('p24', 'lider.property.res@compania.es', 'Líder Property Residencial', null, 'Property Residencial', 2, ARRAY['t1','tx1']::text[], false),
('p25', 'it@compania.es', 'IT Local', null, 'IT Local', 1, ARRAY['t2','t3','tx1','tx2']::text[], false),
('p26', 'marketing@compania.es', 'Marketing', null, 'Marketing', 3, ARRAY['t12']::text[], false),
('u_momyhjxg', 'hola@prueba.com', 'as', 'bn', 'Sin equipo', 2, ARRAY['t1','t2','t3','t6']::text[], true);

-- ─────────────────────── 5. HERRAMIENTAS ───────────────────────────────────

insert into public.herramientas (id, nombre, descripcion, categoria, origen, funcionalidades, areas, equipos, todos_equipos, delegaciones, todas_delegaciones, todas_delegaciones_espana, toda_compania_usuarios, numero_usuarios, licencias_contratadas, licencias_activas, coste_anual, sin_coste_licencia, tipo_licencia, alerta, fecha_alta, solicitudes_licencia) values
('h1', 'Microsoft Dynamics', 'CRM principal de la compañía. Pipeline comercial, gestión de cuentas y facturación integrada.', 'CRM', 'externa', ARRAY['CRM','Pipeline','Facturación']::text[], ARRAY['Toda la compañía']::text[], ARRAY[]::text[], true, ARRAY[]::text[], true, false, true, 0, 500, 400, 540000, false, '', null, null, '[]'::jsonb),
('h2', 'Copilot Premium', 'Asistente de IA generativa integrado en la suite ofimática. Borradores, resúmenes, análisis de documentos.', 'IA', 'externa', ARRAY['Asistente IA','Productividad']::text[], ARRAY['Arquitectura','Valoraciones','Jurídico','Capital']::text[], ARRAY[]::text[], true, ARRAY[]::text[], true, false, false, 18, 18, 10, 8640, false, '', 'Infrautilizada', null, '[]'::jsonb),
('h3', 'KATO', 'Herramienta de inteligencia comercial: networking, contactos, oportunidades cruzadas.', 'Sales Intelligence', 'externa', ARRAY['Sales Intelligence','Networking']::text[], ARRAY['Capital']::text[], ARRAY['Oficinas','Capital Markets','Retail','Industrial/Logístico']::text[], false, ARRAY['Portugal']::text[], false, false, false, 40, 40, 15, 24000, false, '', 'Infrautilizada', null, '[]'::jsonb),
('h4', 'Power BI', 'Herramienta BI legacy en el área de Valoraciones. Dashboards y reporting.', 'BI', 'externa', ARRAY['BI','Reporting','Dashboards']::text[], ARRAY['Valoraciones']::text[], ARRAY['Valoraciones']::text[], false, ARRAY[]::text[], true, false, false, 20, 0, 0, 0, true, '', 'Duplica BI Suite B', null, '[]'::jsonb),
('h5', 'BI Suite B', 'Herramienta BI estándar de la compañía. Dashboards, reporting e integración con CRM.', 'BI', 'externa', ARRAY['BI','Reporting','Dashboards']::text[], ARRAY['Arquitectura','Valoraciones','Property','Capital']::text[], ARRAY[]::text[], false, ARRAY[]::text[], false, false, false, 100, 100, 90, 15000, false, '', null, null, '[]'::jsonb),
('h6', 'Firma Digital A', 'Plataforma estándar de firma electrónica corporativa.', 'Firma', 'externa', ARRAY['Firma electrónica']::text[], ARRAY['Toda la compañía']::text[], ARRAY[]::text[], false, ARRAY[]::text[], false, false, false, 60, 60, 55, 9000, false, '', null, null, '[]'::jsonb),
('h7', 'Firma Digital B', 'Plataforma alternativa de firma electrónica activa solo en Property.', 'Firma', 'externa', ARRAY['Firma electrónica']::text[], ARRAY['Property']::text[], ARRAY[]::text[], false, ARRAY[]::text[], false, false, false, 10, 10, 3, 6000, false, '', 'Duplica Firma Digital A', null, '[]'::jsonb),
('h8', 'Share point', 'Gestor documental corporativo para áreas técnicas.', 'Documental', 'externa', ARRAY['Gestión documental']::text[], ARRAY['Arquitectura','Valoraciones']::text[], ARRAY[]::text[], false, ARRAY[]::text[], false, false, false, 80, 80, 70, 20160, false, '', null, null, '[]'::jsonb),
('h9', 'Doc Manager Property', 'Gestor documental específico de Property Management implantado en primera oleada.', 'Documental', 'externa', ARRAY['Gestión documental','Property']::text[], ARRAY['Property']::text[], ARRAY[]::text[], false, ARRAY[]::text[], false, false, false, 25, 25, 24, 15000, false, '', null, null, '[]'::jsonb),
('h-1777711499651', 'MSCI RCA', 'herramienta para ver operaciones de capital markets y portfolios a nivel europeo.', 'Database transacciones y portfolios', 'externa', ARRAY['Database','BI']::text[], ARRAY['Capital markets']::text[], ARRAY['Capital Markets Oficinas']::text[], false, ARRAY[]::text[], false, true, false, 4, 4, 4, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777714516438', 'Eagle', 'Sirve para ver edificios y datos de mercado', 'Research, Database transacciones y portfolios', 'inhouse', ARRAY['datos de mercado']::text[], ARRAY['Hoteles','Centros comerciales']::text[], ARRAY[]::text[], false, ARRAY[]::text[], false, false, false, 0, 100, 100, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777714584090', 'Alma', 'Misma funcionalidad que eagle', 'Database transacciones y portfolios, Research, Property Database', 'inhouse', ARRAY['Database','BI']::text[], ARRAY['Centros comerciales','Research']::text[], ARRAY['Retail','Capital Markets Oficinas','Capital Markets Industrial Logístico','Capital Markets Retail','Capital Markets Alternativos','Capital Markets Living','Capital Markets Hoteles']::text[], false, ARRAY[]::text[], false, true, false, 1, 0, 0, 0, true, '', null, '2026-05-02', '[]'::jsonb),
('h-1777714647495', 'Property Raptor', 'base de datos de living, también sirve para temas comerciales', 'Property Database, Sales Intelligence', 'externa', ARRAY['base de datos de living']::text[], ARRAY['Living']::text[], ARRAY['Living','Capital Markets Living']::text[], false, ARRAY[]::text[], false, true, false, 1, 1, 0, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777714947780', 'Athena', 'Property database que usa Londres, es un agregador de datos de diferentes webs', 'Sales Intelligence, Property Database', 'inhouse', ARRAY[]::text[], ARRAY['Retail','Oficinas y Logístico/Industrial']::text[], ARRAY['Retail','Oficinas','Industrial/Logístico']::text[], false, ARRAY['Londres']::text[], false, false, false, 1, 1, 0, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777716330973', 'Idealista', 'Ver disponibilidad de productos', 'Database transacciones y portfolios, Datos de mercado, Sales Intelligence', 'externa', ARRAY['ver datos de mercado']::text[], ARRAY['Living']::text[], ARRAY[]::text[], true, ARRAY[]::text[], true, false, false, 0, 200, 200, 0, true, '', null, '2026-05-02', '[]'::jsonb),
('h-1777720240111', 'ANIS', 'Heramienta que cubre casi todos los procesos, pero ya obsoleta', 'Database transacciones y portfolios, ERP / Finanzas, Property Database, CRM, Research, Datos de mercado', 'inhouse', ARRAY['reporting','CRM','transaccional']::text[], ARRAY['Oficinas','Industrial/logístico','Oficinas']::text[], ARRAY['Oficinas','Oficinas','Industrial/Logístico']::text[], false, ARRAY['Madrid','Barcelona']::text[], false, false, false, 0, 80, 80, 0, true, '', null, '2026-05-02', '[]'::jsonb),
('h-1777733544328', 'Chatgpt', 'herramienta de IA', 'IA', 'externa', ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], true, ARRAY[]::text[], true, false, true, 0, 0, 0, 0, true, '', null, '2026-05-02', '[]'::jsonb),
('h-1777733692018', 'Alimarket', $$Alimarket es una empresa de información económica y bases de datos sectoriales en España.

🧩 Qué es exactamente

👉 No es un software ni un CRM.
👉 Es un proveedor de inteligencia de mercado (market intelligence).

Analiza sectores económicos
Publica informes, rankings y noticias
Tiene bases de datos de empresas y directivos
Funciona principalmente por suscripción de pago

📌 Es, en esencia, una mezcla de:

medio especializado
base de datos empresarial
consultora de información$$, 'Datos de mercado, Research, Sales Intelligence', 'externa', ARRAY[]::text[], ARRAY[]::text[], ARRAY['Hoteles']::text[], false, ARRAY['Madrid','Barcelona','Valencia','Málaga','Sevilla']::text[], false, false, false, 1, 1, 0, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777733779785', 'TB Gold', 'TB Gold es un software vertical inmobiliario diseñado para gestionar activos, contratos y explotación de portfolios.', 'Database transacciones y portfolios, Property Database', 'externa', ARRAY[]::text[], ARRAY[]::text[], ARRAY['Centros Comerciales']::text[], false, ARRAY['Madrid','Valencia','Barcelona','Málaga','Sevilla']::text[], false, false, false, 1, 1, 0, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777734129233', 'Billing Portal', 'Billing Portal es una herramienta interna (in-house) diseñada para centralizar, estructurar y visualizar la información de actividad y facturación de la compañía.', 'ERP / Finanzas, BI', 'inhouse', ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], true, ARRAY['Madrid','Barcelona','Valencia','Málaga','Sevilla']::text[], false, false, true, 0, 1, 0, 0, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777734336898', 'Yardi', 'Yardi es una plataforma de gestión inmobiliaria integral enfocada a property management, que permite controlar operativa, financiera y contractual de activos inmobiliarios.', 'ERP / Finanzas, Property Management', 'externa', ARRAY[]::text[], ARRAY[]::text[], ARRAY['Property Management']::text[], false, ARRAY['Madrid','Barcelona','Valencia','Málaga','Sevilla']::text[], false, false, false, 1, 150, 120, 216000, false, '', null, '2026-05-02', '[]'::jsonb),
('h-1777734495487', 'CoStar', 'CoStar es una plataforma web de inteligencia inmobiliaria especializada en real estate comercial (oficinas, retail, logística, hoteles, etc.).', 'Datos de mercado, BI, Research', 'externa', ARRAY[]::text[], ARRAY[]::text[], ARRAY['Oficinas','Retail','Industrial/Logístico']::text[], false, ARRAY[]::text[], true, false, false, 1, 0, 0, 0, true, '', null, '2026-05-02', '[]'::jsonb),
('h-1777736270987', 'PrineX', $$Software inmobiliario integral usado en España para:

Promotoras
Gestoras patrimoniales
Property managers$$, 'ERP / Finanzas, Property Management', 'externa', ARRAY[]::text[], ARRAY[]::text[], ARRAY['Property Management']::text[], false, ARRAY[]::text[], false, true, false, 1, 100, 90, 84000, false, '', null, '2026-05-02', '[]'::jsonb);

-- ─────────────────────── 6. TAREAS ─────────────────────────────────────────

insert into public.tareas (id, tarea, persona_id, taller_id, taller_origen_id, creador_id, deadline, estado, prioridad, fecha_creacion) values
('ta1', 'Convocar reunión hito Q2 + nexo propuesto', 'p1', 't2', null, 'p16', 'Hoy', 'pendiente', 'baja', null),
('ta2', 'Email a equipo procesos: Antonio, Patricia, Jorge, Juan, Elena', 'p16', 't2', null, 'p16', '2 días', 'pendiente', 'alta', null),
('ta3', 'Reenviar propuesta del tercero al equipo ampliado', 'p16', 't2', null, 'p16', '3 días', 'pendiente', 'media', null),
('ta4', 'Elevar propuesta al G3 para validación', 'p16', 't2', null, 'p16', '1 semana', 'pendiente', 'alta', null),
('ta5', 'Coordinar análisis con tercero · alinear Property Data Base e IT', 'p16', 't3', null, 'p16', '1 semana', 'pendiente', 'alta', null),
('ta6', 'Foro Innovación: presentar comunicación interna', 'p4', 't1', null, 'p16', '2 semanas', 'pendiente', 'media', null),
('ta7', 'Plan comunicación interna innovación con Marketing', 'p26', 't1', null, 'p16', '3 semanas', 'pendiente', 'media', null),
('ta8', 'Proceso de gobierno de herramientas y licencias', 'p16', 't2', null, 'p16', '3 semanas', 'pendiente', 'alta', null),
('ta9', 'Publicar informes facturación CRM', 'p23', 'tx1', null, 'p16', '2 semanas', 'pendiente', 'media', null),
('ta10', 'Revisar IA productividad y Sales Intelligence · consolidar suscripciones', 'p16', 't2', null, 'p16', '2 semanas', 'pendiente', 'alta', null),
('t-1777644491592', 'Reunirte con proveedor X', 'p5', 'tx2', 't13', 'u_momyhjxg', '6 meses', 'completada', 'alta', '2026-05-01'),
('ta-ag-1777660725209', 'Tarea para el Líder de Innovación', 'p4', null, null, 'p16', '1 semana', 'pendiente', 'media', '2026-05-01T18:38:45.209Z'),
('ta-ag-1777660771776', 'Reunión del día 12 de junio', 'p16', null, null, 'p16', '12 de junio', 'pendiente', 'media', '2026-05-01T18:39:31.776Z'),
('ta-chat-1777666051062', 'JAVIER MANDA EL DOCUMENTO', 'p16', 'tx1', null, 'p16', 'Sin fecha', 'pendiente', 'media', '2026-05-01T20:07:31.062Z'),
('ta-chat-1777671880785', 'alvaro habla con Carlos y le prefuntas por Adobe', 'p16', 't7', null, 'p16', 'Sin fecha', 'pendiente', 'baja', '2026-05-01T21:44:40.785Z'),
('t-1777719435207', 'saber las caracteristicas tecnicas', 'p1', 't4', 't7', 'p2', '6 meses', 'pendiente', 'media', '2026-05-02T10:57:15.207Z');

-- ─────────────────────── 7. HISTÓRICO ──────────────────────────────────────

insert into public.historico (id, taller_id, fecha, tipo, titulo, descripcion, autor_id, idea_id, reunion_id, objetivo_id) values
('e1', 't1', '2026-01-15', 'hito', 'Retoma del proyecto desde Plan Estratégico anterior', 'Se decide retomar el proyecto de mejora de procesos con apoyo de certificaciones y auditorías internas.', 'p1', null, null, null),
('e2', 't1', '2026-02-10', 'decision', 'Selección de áreas objetivo', 'Acordadas 6 áreas: Arquitectura, Valoraciones, Property y Jurídico/Financiero como soporte crítico.', 'p6', null, null, null),
('e3', 't1', '2026-03-05', 'avance', 'Acuerdo con Líder Jurídico para Jurídico', 'Jurídico confirmado dentro de la primera oleada del análisis con tercero externo.', 'p7', null, null, null),
('e4', 't1', '2026-04-12', 'avance', 'Doc Manager Property implantada en Property', 'Herramienta documental Doc Manager Property operativa para Property. Lista para entrar en primera oleada.', 'p16', null, null, null),
('e5', 't1', '2026-04-25', 'decision', 'Plan de fases acordado', 'Fase 1: 16 semanas. Fase 2: 16 semanas. Objetivo: análisis de 6 áreas antes de fin de año con quick wins progresivos.', 'p6', null, null, null),
('e6', 't2', '2026-02-01', 'hito', 'Constitución del Foro de Innovación', 'Liderazgo formal de Líder Innovación, gestión del día a día por Líder Property Data.', 'p4', null, null, null),
('e7', 't2', '2026-03-20', 'iniciativa', 'Chatbot incidencias Property Residencial', 'Líder Property Residencial presenta el chatbot al Foro. Recibido positivamente.', 'p14', null, null, null),
('e8', 't2', '2026-04-08', 'iniciativa', 'IA para análisis de RFPs', 'Identificada como oportunidad clave para el área de Arquitectura. Pendiente de pilotaje.', 'p4', null, null, null),
('e9', 't2', '2026-04-22', 'riesgo', 'Conflicto detectado con Plataforma Integrada', 'El asistente IA propuesto en el taller solapa con el roadmap del asistente chat de Plataforma Integrada. Requiere alineación urgente.', 'p6', null, null, null),
('e10', 't3', '2026-01-20', 'hito', 'Visión de plataforma 360 definida', 'Plataforma Integrada orquesta el ciclo completo del negocio: captación, negociación, facturación y cobro. Integración con CRM corporativo y Data Lake.', 'p16', null, null, null),
('e11', 't3', '2026-03-15', 'avance', 'Mockup funcional construido', 'Prototipo de Repositorio 360 listo. En diseño de flujos con TI considerando seguridad y escalabilidad.', 'p16', null, null, null),
('e12', 't3', '2026-04-10', 'avance', 'Asistente chat en diseño', 'Asistente interno para consultas de negocio (facturación de un cliente, pipeline por equipo) entrando en fase de diseño.', 'p13', null, null, null),
('e13', 't5', '2026-04-05', 'riesgo', 'Compra fuera de circuito detectada', 'Factura de 700€ tramitada sin aprobación IT. Síntoma de fragmentación de gasto en herramientas.', 'p16', null, null, null),
('e14', 't5', '2026-04-18', 'avance', 'Inventario inicial de licencias', 'Identificadas IA productividad y Sales Intelligence con uso premium muy bajo. Candidatas a reasignación.', 'p16', null, null, null),
('e15', 't6', '2026-03-25', 'avance', 'Diseño de Repositorio 360 iniciado', 'Evolución de Repositorio Doc hacia visión 360 alineada con Plataforma Integrada. Mockup funcional construido.', 'p16', null, null, null),
('e-1777719223617', 't1', '2026-05-02', 'avance', 'Reunión: Reunión con Portugal sobre procesos comerciales y herramienta KATO', 'La reunión analiza el uso de la herramienta KATO en Portugal para gestionar procesos comerciales. Se destaca la eficiencia y agilidad que aporta KATO, aunque se identifica la falta de integración con Microsoft Dynamics como un gap. La herramienta se considera estratégica para la comercialización y la trazabilidad de la demanda.', null, null, 'r-1777719223616', null),
('e-obj-1777729243419', 't3', '2026-05-02', 'hito', 'Objetivo cumplido: reunirse con los equipos', $$Objetivo "reunirse con los equipos" del taller marcado como completado.$$, 'p16', null, null, 'obj-1777728771082'),
('e-obj-1777729244428', 't3', '2026-05-02', 'hito', 'Objetivo cumplido: Crear los flujos de cada una de las funcionalidades', $$Objetivo "Crear los flujos de cada una de las funcionalidades" del taller marcado como completado.$$, 'p16', null, null, 'obj-1777728746985'),
('e-obj-1777730551671', 't3', '2026-05-02', 'objetivo', 'Objetivo cumplido: Crear un mockup visual para diseñar profunidad de la herramienta', $$Objetivo "Crear un mockup visual para diseñar profunidad de la herramienta" del taller marcado como completado.$$, 'p16', null, null, 'obj-1777728724255');

-- ─────────────────────── 8. REUNIONES ──────────────────────────────────────

insert into public.reuniones (id, titulo, fecha, asistentes, estado, notas, agenda, ideas, taller_ids, fuente) values
('r1', 'Sincronización del Plan Estratégico', '2026-04-25', ARRAY['p1','p2','p3','p6','p4']::text[], 'procesada', 'Se ha constituido un comité de seguimiento para 14 talleres del Plan Estratégico. Reunión clave el hito Q2. Mejora de procesos retomada del Plan Estratégico anterior. Innovación liderada por Líder Innovación, día a día Líder Property Data. Nexo operativo: Coordinador. Plataforma Integrada debe ser plataforma end-to-end. Detectada compra de compras fuera de circuito. herramientas IA y Sales Intelligence infrautilizadas.', ARRAY[]::text[], $$[{"id":"idea-r1-1","texto":"Constituir comité de seguimiento para 14 talleres","tipo":"decision","tallerId":"t1","publicada":true,"eventoId":"e2"},{"id":"idea-r1-2","texto":"Designar nexo operativo (Álvaro) entre talleres, IT y Foro de Innovación","tipo":"decision","tallerId":"t1","publicada":true,"eventoId":null},{"id":"idea-r1-3","texto":"Detectada compra de compras fuera de circuito","tipo":"riesgo","tallerId":"t5","publicada":true,"eventoId":"e13"},{"id":"idea-r1-4","texto":"Reasignar licencias infrautilizadas de IA productividad y Sales Intelligence","tipo":"avance","tallerId":"t5","publicada":true,"eventoId":"e14"}]$$::jsonb, ARRAY[]::text[], null),
('r-1777644668493', 'REUNION CONSEJO ', null, ARRAY['p1','p2','p3','p4']::text[], 'borrador', '', ARRAY['CAMBIAR PROCESOS','ESTRUCTURAR CAMBIOS','NUEVAS HERRAMIENTAS']::text[], '[]'::jsonb, ARRAY[]::text[], null),
('r-1777719223616', 'Reunión con Portugal sobre procesos comerciales y herramienta KATO', '2026-05-02', ARRAY['p4']::text[], 'procesada', $$RESUMEN:
La reunión analiza el uso de la herramienta KATO en Portugal para gestionar procesos comerciales. Se destaca la eficiencia y agilidad que aporta KATO, aunque se identifica la falta de integración con Microsoft Dynamics como un gap. La herramienta se considera estratégica para la comercialización y la trazabilidad de la demanda.

TEMAS:
• procesos comerciales
• herramienta KATO$$, ARRAY['procesos comerciales','herramienta KATO']::text[], '[]'::jsonb, ARRAY['t1']::text[], 'resumen_express');

-- ─────────────────────── 9. PETICIONES ─────────────────────────────────────

insert into public.peticiones (id, titulo, descripcion, equipo, delegacion, solicitante_id, solicitante_nombre, canalizado_por_id, tipo_solicitud, funcionalidades, estado, taller_asignado_id, prioridad, fecha, evaluacion, impacto_estimado, motivo_rechazo, fecha_rechazo, rechazado_por_id) values
('pet1', 'Herramienta para análisis de pliegos y RFPs', 'Necesitamos una herramienta que lea y analice pliegos de concursos públicos y RFPs entrantes, extraiga requisitos clave, identifique riesgos y nos ayude a redactar propuestas más rápido. Ahora hacemos todo manualmente y perdemos oportunidades.', 'Capital', null, 'p4', null, null, 'herramienta', ARRAY['extracción de requisitos','análisis de riesgos','generación de propuestas','IA generativa']::text[], 'rechazada', null, 'alta', '2026-04-26', null, null, 'Coste no justificado por el impacto estimado.', '2026-05-02T10:56:11.706Z', 'p16'),
('pet2', 'Mejora del proceso de alta de clientes', 'El proceso actual de alta de clientes en Property tiene 8 pasos manuales que tardan 3-5 días. Equipo solicita revisar el flujo completo y proponer automatizaciones, especialmente la verificación KYC y la firma de contratos.', 'Property', null, 'p14', null, null, 'proceso', ARRAY['automatización KYC','firma digital','flujo de aprobación']::text[], 'en_revision', 't1', 'media', '2026-04-20', 'Encaja con el taller de Mejora de Procesos. Equipo Procesos 1 ya está mapeando AS-IS de procesos similares.', 'Reducir tiempo de alta de 3-5 días a 1 día. Liberar ~15h/semana del equipo.', null, null, null),
('pet3', 'Sugerencia de Marketing: campaña automatizada con IA', 'Equipo de marketing quiere implementar generación automatizada de pitch decks y materiales personalizados por cliente usando IA generativa. Plantean integrarlo con CRM Salesforce.', 'Marketing', null, 'p15', null, null, 'iniciativa', ARRAY['generación contenido','personalización CRM','IA generativa']::text[], 'asignada', 't2', 'media', '2026-04-15', 'Asignado al taller de Innovación. Líder Property Data evaluará viabilidad técnica y conflicto con asistente IA de Plataforma Integrada.', 'Si funciona, ahorro estimado de 20% del tiempo de generación de propuestas comerciales.', null, null, null),
('pet4', 'Retail: necesidad de visualización de pipeline en tiempo real', 'El equipo de Retail (locales comerciales) necesita un dashboard de pipeline en tiempo real, similar al de Office. Actualmente usa Excel manual cada lunes y la información llega tarde a dirección.', 'Retail', null, 'p13', null, null, 'herramienta', ARRAY['dashboard tiempo real','pipeline comercial','alertas']::text[], 'nueva', null, 'media', '2026-04-28', null, null, null, null, null),
('pet5', 'Jurídico: revisión automática de contratos', 'Equipo jurídico solicita herramienta de IA que revise contratos entrantes detectando cláusulas no estándar, plazos de pago atípicos, riesgos legales. Ahora la revisión manual es cuello de botella.', 'Jurídico', null, 'p7', null, null, 'herramienta', ARRAY['análisis de contratos','detección anomalías','IA generativa','redlining']::text[], 'aprobada', 't1', 'alta', '2026-04-08', 'Aprobada en comité del 17 de abril. Encaja con el taller de Mejora de Procesos (primera oleada con Líder Jurídico).', 'Reducir tiempo de revisión de contratos de 2-3 días a 4 horas. Detección preventiva de cláusulas problemáticas.', null, null, null),
('pet-1777716589207', 'Yardi', 'nuevo crm de property management', 'Sin equipo', null, null, null, 'p16', 'herramienta_nueva', ARRAY[]::text[], 'asignada', 't13', 'media', '2026-05-02', 'herramienta de crm ', null, null, null, null);

-- ─────────────────────── 10. INICIATIVAS ──────────────────────────────────

insert into public.iniciativas (id, titulo, autor_id, autor, taller_id, area, estado, descripcion) values
('i2', 'IA para análisis de concursos y RFPs', null, 'Foro de Innovación', null, 'Arquitectura', 'Oportunidad', 'Análisis automático de pliegos de concursos para extraer criterios, riesgos y checklist de respuesta.'),
('i3', 'Informes de facturación CRM automatizados', null, 'IT Internacional / IT Internacional', null, 'Transversal', 'En 2 semanas', 'Reportes automáticos de facturación generados desde el CRM y enviados a directores de área.'),
('i-1777665052416', 'Analisis de YARDI como property database', 'p1', 'Líder Servicios Transversales', 't2', 'Tecnología', 'Nueva', 'se esta teniendo en cuenta yardi como una PDB');

-- ─────────────────────── 11. CONVOCATORIAS ────────────────────────────────

insert into public.convocatorias (id, titulo, descripcion, fecha, hora, duracion, recurrente, frecuencia, integrantes, organizador_id, agenda, destacada, estado, fecha_creacion) values
('cv1', 'Comité de seguimiento + líderes de talleres', 'Alinear próximos pasos · formalizar modelo de trabajo', '2026-05-14', '10:00', 90, false, null, ARRAY['p1','p2','p3','p4','p6']::text[], 'p6', ARRAY['Revisión de avances de cada taller','Solapamientos detectados y decisiones','Formalización del rol del nexo','Próximos hitos del Plan Estratégico']::text[], true, 'pendiente', '2026-04-22'),
('cv-1777646282052', 'Reunión actualización Plan estrategico', '', '2026-05-08', '10:00', 60, false, null, ARRAY['u_momyhjxg','p2','p5','p8','p7','p10','p14','p15']::text[], 'p16', ARRAY[]::text[], true, 'pendiente', '2026-05-01');

-- ─────────────────────── 12. SOLAPAMIENTOS ────────────────────────────────

insert into public.solapamientos (id, tipo, titulo, descripcion, talleres_implicados, herramientas_implicadas, riesgo, recomendacion, estado, fecha_deteccion, detectado_por) values
('s1', 'funcional', 'Asistente IA: Innovación ↔ Plataforma Integrada', 'El taller de Innovación propone un asistente IA para consultas de negocio, mientras que Plataforma Integrada ya tiene en su roadmap un asistente chat para facturación y pipeline. Mismo caso de uso, mismo público objetivo, dos stacks tecnológicos distintos.', ARRAY['t1','tx1']::text[], ARRAY[]::text[], 'alto', 'Llevar al comité del el hito Q2. Proponer que el asistente IA forme parte de Plataforma Integrada, no como iniciativa paralela.', 'activo', '2026-04-22', 'p16'),
('s2', 'tecnico', 'Repositorio documental: SharePoint vs Repositorio 360', 'Algunos equipos están proponiendo SharePoint para gestión documental, lo cual choca con la visión de Repositorio 360 integrado en Plataforma Integrada. Riesgo de fragmentar el dato y romper la visión 360.', ARRAY['tx1','tx2']::text[], ARRAY[]::text[], 'medio', 'Comunicar a las áreas que Repositorio 360 es el repositorio único objetivo. Bloquear nuevas altas de SharePoint para casos de uso documental cubiertos por Repositorio Doc.', 'activo', '2026-04-25', 'p16'),
('s3', 'personas', 'Procesos ↔ Property Data Base · sobrecarga de IT', 'Los talleres de Mejora de Procesos y Property Data Base compiten por la disponibilidad del equipo de IT Local. Ambos son técnicos y tienen plazos en abril-mayo.', ARRAY['t2','t3']::text[], ARRAY[]::text[], 'medio', 'Priorizar carga de IT entre Líder Procesos y Líder Property Data. Posible secuenciar entregables.', 'activo', '2026-04-20', 'p16'),
('s4', 'herramienta', 'BI Suite B ↔ BI Suite A en Valoraciones', 'Valoraciones tiene contratadas licencias de BI Suite A y BI Suite B cubriendo la misma funcionalidad de BI/Reporting. Sobrecoste anual estimado de 12k€ por duplicidad.', ARRAY['t2']::text[], ARRAY[]::text[], 'medio', 'Migrar usuarios de BI Suite A a BI Suite B y dar de baja las licencias. Consolidar sobre BI Suite B por estandarización con resto de áreas.', 'activo', '2026-04-18', 'p16'),
('s5', 'herramienta', 'Firma Digital A ↔ Firma Digital B en Property', 'Property mantiene Firma Digital B con muy bajo uso (3/10 activas) cuando Firma Digital A cubre la misma funcionalidad y es estándar en otras áreas.', ARRAY[]::text[], ARRAY[]::text[], 'bajo', 'Dar de baja Firma Digital B tras migrar firmas pendientes a Firma Digital A. Ahorro ~6k€/año.', 'falso_positivo', '2026-04-10', 'p16'),
('s-chat-1777671182597-0', 'funcional', 'Duplicidad de funcionalidades en Innovación y Plataforma Integrada', 'Duplicidad de esfuerzos en la asistencia de IA', ARRAY['t1','tx1']::text[], ARRAY[]::text[], 'medio', 'Revisar y coordinar esfuerzos para evitar duplicidad', 'activo', '2026-05-01', 'IA'),
('s-chat-1777671182597-1', 'tecnico', 'Confusión entre Repositorio documental y Repositorio 360', 'Confusión sobre qué herramienta utilizar', ARRAY['tx2']::text[], ARRAY[]::text[], 'bajo', 'Establecer claridad sobre el uso de cada herramienta', 'activo', '2026-05-01', 'IA'),
('s-chat-1777671182597-2', 'personas', 'Sobrecarga de trabajo en IT', 'Sobrecarga de trabajo en el equipo de IT', ARRAY['t2','t3']::text[], ARRAY[]::text[], 'medio', 'Revisar y priorizar tareas para evitar sobrecarga', 'activo', '2026-05-01', 'IA'),
('s-chat-1777671182597-3', 'herramienta', 'Duplicidad de funcionalidades en BI Suite A y BI Suite B', 'Duplicidad de funcionalidades', ARRAY[]::text[], ARRAY[]::text[], 'bajo', 'Revisar y eliminar duplicidad', 'activo', '2026-05-01', 'IA'),
('s-chat-1777671182597-4', 'herramienta', 'Duplicidad de funcionalidades en Firma Digital A y Firma Digital B', 'Duplicidad de funcionalidades', ARRAY[]::text[], ARRAY[]::text[], 'bajo', 'Revisar y eliminar duplicidad', 'activo', '2026-05-01', 'IA');

-- ─────────────────────── 13. MENSAJES ──────────────────────────────────────

insert into public.mensajes (id, autor_id, texto, created_at) values
('m-1777737920019', 'p16', 'pregunta por Adobe', '2026-05-02T16:05:20.019Z');
