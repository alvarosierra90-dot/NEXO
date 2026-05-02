-- ============================================================
-- NEXO · Datos iniciales (talleres y herramientas)
-- Pega después de schema.sql en Supabase → SQL Editor → Run
-- ============================================================

insert into public.talleres (id, numero, nombre, lider, dia_a_dia, area, estado, descripcion) values
('t1', 1, 'Innovación', 'Líder Innovación', 'Líder Property Data', 'Tecnología', 'En curso', 'Foro de Innovación con asistente IA para consultas de negocio, chatbot de incidencias en Property, IA para análisis de RFPs.'),
('t2', 2, 'Mejora de Procesos', 'Líder Procesos', null, 'Tecnología', 'En curso', 'Análisis de procesos en áreas de alto riesgo (Arquitectura, Valoraciones, Property) y soporte crítico (Jurídico, Financiero). Primera oleada con tercero externo.'),
('t3', 3, 'Property Data Base', 'Líder Property Data', null, 'Tecnología', 'Diseño', 'Base de datos centralizada de Property. Plataforma interna end-to-end conectando equipos, activos y propietarios. Integración con CRM corporativo y Data Lake.'),
('t4', 4, 'Flex Transversal (Co-Workings, Work There, etc)', 'Líder Servicios Transversales', null, 'Servicios transversales', 'Activo', 'Estrategia transversal de espacios flexibles: co-workings, Work There y otros formatos.'),
('t5', 5, 'Capital Advisors (CF + Investment Banking)', 'Líder Capital Advisors', null, 'Servicios transversales', 'En curso', 'Línea de servicios Capital Advisors: Corporate Finance e Investment Banking.'),
('t6', 6, 'Propuestas Multidisciplinares (Best use y otros)', 'Líder Multidisciplinares', null, 'Servicios transversales', 'Planificado', 'Propuestas integradas multidisciplinares: best use, valoraciones cruzadas y otros formatos combinados.'),
('t7', 7, 'Usuarios', 'Líder Clientes', null, 'Clientes', 'En curso', 'Estrategia de relación con usuarios: experiencia, segmentación y propuesta de valor.'),
('t8', 8, 'Aproximación Cliente (excepto usuarios)', 'Líder Aproximación Cliente', null, 'Clientes', 'En curso', 'Modelo de aproximación al cliente corporativo, institucional e inversor.'),
('t9', 9, 'Comisiones, Remuneración Trasversal y Sistema retributivo', 'Líder Retribución', null, 'Sistema de retribución', 'Planificado', 'Revisión del modelo retributivo: comisiones, remuneración trasversal y sistema retributivo de la compañía.'),
('t10', 10, 'Plan de talento, Formación y Plan de Carrera', 'Líder Talento', null, 'Talento, Formación y Plan de Carrera', 'En curso', 'Plan de talento (9 Grid Box), formación del equipo directivo, plan de contingencia directiva y plan de carrera "lateral".'),
('t11', 11, 'Gobernanza de la compañía', 'Líder Gobernanza / Líder Innovación', null, 'Gobernanza', 'Activo', 'Gobernanza de la compañía, incluyendo Comité de Dirección y órganos de gobierno.'),
('t12', 12, 'Refuerzo Mensaje de Cultura / Marca Corporativa', 'Líder Gobernanza', null, 'Cultura', 'En curso', 'Refuerzo del mensaje de cultura corporativa y consolidación de la marca.'),
('t13', 13, 'Plan Juventud', 'Líder Plan Juventud', null, 'Cultura', 'Planificado', 'Plan Juventud: incorporación, retención y desarrollo de talento joven.'),
('t14', 14, 'Geografías y red de prescriptores', 'Líder Geografías', null, 'Diversificación', 'En curso', 'Diversificación geográfica y desarrollo de la red de prescriptores.'),
('t15', 15, 'Nuevas líneas de negocio', 'Líder Diversificación', null, 'Diversificación', 'Exploratorio', 'Identificación y arranque de nuevas líneas de negocio.'),
('t16', 16, 'Involucración en gestión de niveles N2 y N3', 'Líder Niveles N2-N3', null, 'Otros', 'En curso', 'Delegación de responsabilidades, madurez organizativa e involucración de niveles N2 y N3 en la gestión.'),
('tx1', null, 'Plataforma Integrada', 'IT Local', null, 'Plataforma transversal', 'Diseño', 'Plataforma interna end-to-end que conecta equipos, activos y propietarios. Integración con CRM corporativo y Data Lake. Asistente chat para consultas de facturación y pipeline.'),
('tx2', null, 'Repositorio 360', 'IT Local', null, 'Plataforma transversal', 'Mockup', 'Evolución del repositorio documental hacia visión 360 integrada con Plataforma Integrada. Mockup funcional construido.')
on conflict (id) do nothing;

insert into public.herramientas (id, nombre, descripcion, categoria, funcionalidades, areas, licencias_contratadas, licencias_activas, coste_anual, alerta) values
('h1', 'CRM corporativo', 'CRM principal de la compañía. Pipeline comercial, gestión de cuentas y facturación integrada.', 'CRM', array['CRM','Pipeline','Facturación'], array['Toda la compañía'], 200, 175, 50000, null),
('h2', 'Asistente IA productividad', 'Asistente de IA generativa integrado en la suite ofimática. Borradores, resúmenes, análisis de documentos.', 'IA', array['Asistente IA','Productividad'], array['Arquitectura','Valoraciones','Jurídico','Capital'], 100, 60, 30000, 'Infrautilizada'),
('h3', 'Sales Intelligence', 'Herramienta de inteligencia comercial: networking, contactos, oportunidades cruzadas.', 'Sales Intelligence', array['Sales Intelligence','Networking'], array['Capital'], 40, 15, 18000, 'Infrautilizada'),
('h4', 'BI Suite A', 'Herramienta BI legacy en el área de Valoraciones. Dashboards y reporting.', 'BI', array['BI','Reporting','Dashboards'], array['Valoraciones'], 20, 8, 12000, 'Duplica BI Suite B'),
('h5', 'BI Suite B', 'Herramienta BI estándar de la compañía. Dashboards, reporting e integración con CRM.', 'BI', array['BI','Reporting','Dashboards'], array['Arquitectura','Valoraciones','Property','Capital'], 100, 90, 15000, null),
('h6', 'Firma Digital A', 'Plataforma estándar de firma electrónica corporativa.', 'Firma', array['Firma electrónica'], array['Toda la compañía'], 60, 55, 9000, null),
('h7', 'Firma Digital B', 'Plataforma alternativa de firma electrónica activa solo en Property.', 'Firma', array['Firma electrónica'], array['Property'], 10, 3, 6000, 'Duplica Firma Digital A'),
('h8', 'Repositorio documental', 'Gestor documental corporativo para áreas técnicas.', 'Documental', array['Gestión documental'], array['Arquitectura','Valoraciones'], 80, 70, 20000, null),
('h9', 'Doc Manager Property', 'Gestor documental específico de Property Management implantado en primera oleada.', 'Documental', array['Gestión documental','Property'], array['Property'], 25, 24, 15000, null)
on conflict (id) do nothing;
