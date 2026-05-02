import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, MessageSquare, Layers, Sparkles, Workflow,
  Wrench, CheckSquare, AlertTriangle, Send, Plus, X, Loader2,
  Calendar, Users, FileText, Search, ArrowRight, Zap, Mail,
  TrendingUp, Package, Settings, ChevronRight, FileSearch, User, Filter,
  Clock, Activity, Flag, GitBranch, Lightbulb, AlertOctagon, ArrowLeft, RadioTower,
  Mic, Tag, CheckCircle2, LogOut
} from 'lucide-react';
import { supabase, rowToCamel } from './lib/supabase.js';
import { useAuth, useSupabaseTable } from './lib/supabaseHooks.js';

const STORAGE_KEYS = {
  talleres: 'nexo2:talleres',
  herramientas: 'nexo2:herramientas',
  iniciativas: 'nexo2:iniciativas',
  tareas: 'nexo2:tareas',
  personas: 'nexo2:personas',
  historico: 'nexo2:historico',
  reuniones: 'nexo2:reuniones',
  convocatorias: 'nexo2:convocatorias',
  solapamientos: 'nexo2:solapamientos',
  peticiones: 'nexo2:peticiones',
  usuarioActual: 'nexo2:usuarioActual',
  chat: 'nexo2:chat',
  session: 'nexo2:session',
  mensajes: 'nexo2:mensajes',
};

const SEED_TALLERES = [
  { id: 't1', numero: 1, nombre: 'Innovación', lider: 'Líder Innovación', diaADia: 'Líder Property Data', area: 'Tecnología', estado: 'En curso', descripcion: 'Foro de Innovación con asistente IA para consultas de negocio, chatbot de incidencias en Property, IA para análisis de RFPs.' },
  { id: 't2', numero: 2, nombre: 'Mejora de Procesos', lider: 'Líder Procesos', area: 'Tecnología', estado: 'En curso', descripcion: 'Análisis de procesos en áreas de alto riesgo (Arquitectura, Valoraciones, Property) y soporte crítico (Jurídico, Financiero). Primera oleada con tercero externo.' },
  { id: 't3', numero: 3, nombre: 'Property Data Base', lider: 'Líder Property Data', area: 'Tecnología', estado: 'Diseño', descripcion: 'Base de datos centralizada de Property. Plataforma interna end-to-end conectando equipos, activos y propietarios. Integración con CRM corporativo y Data Lake.' },
  { id: 't4', numero: 4, nombre: 'Flex Transversal (Co-Workings, Work There, etc)', lider: 'Líder Servicios Transversales', area: 'Servicios transversales', estado: 'Activo', descripcion: 'Estrategia transversal de espacios flexibles: co-workings, Work There y otros formatos.' },
  { id: 't5', numero: 5, nombre: 'Capital Advisors (CF + Investment Banking)', lider: 'Líder Capital Advisors', area: 'Servicios transversales', estado: 'En curso', descripcion: 'Línea de servicios Capital Advisors: Corporate Finance e Investment Banking.' },
  { id: 't6', numero: 6, nombre: 'Propuestas Multidisciplinares (Best use y otros)', lider: 'Líder Multidisciplinares', area: 'Servicios transversales', estado: 'Planificado', descripcion: 'Propuestas integradas multidisciplinares: best use, valoraciones cruzadas y otros formatos combinados.' },
  { id: 't7', numero: 7, nombre: 'Usuarios', lider: 'Líder Clientes', area: 'Clientes', estado: 'En curso', descripcion: 'Estrategia de relación con usuarios: experiencia, segmentación y propuesta de valor.' },
  { id: 't8', numero: 8, nombre: 'Aproximación Cliente (excepto usuarios)', lider: 'Líder Aproximación Cliente', area: 'Clientes', estado: 'En curso', descripcion: 'Modelo de aproximación al cliente corporativo, institucional e inversor.' },
  { id: 't9', numero: 9, nombre: 'Comisiones, Remuneración Trasversal y Sistema retributivo', lider: 'Líder Retribución', area: 'Sistema de retribución', estado: 'Planificado', descripcion: 'Revisión del modelo retributivo: comisiones, remuneración trasversal y sistema retributivo de la compañía.' },
  { id: 't10', numero: 10, nombre: 'Plan de talento, Formación y Plan de Carrera', lider: 'Líder Talento', area: 'Talento, Formación y Plan de Carrera', estado: 'En curso', descripcion: 'Plan de talento (9 Grid Box), formación del equipo directivo, plan de contingencia directiva y plan de carrera "lateral".' },
  { id: 't11', numero: 11, nombre: 'Gobernanza de la compañía', lider: 'Líder Gobernanza / Líder Innovación', area: 'Gobernanza', estado: 'Activo', descripcion: 'Gobernanza de la compañía, incluyendo Comité de Dirección y órganos de gobierno.' },
  { id: 't12', numero: 12, nombre: 'Refuerzo Mensaje de Cultura / Marca Corporativa', lider: 'Líder Gobernanza', area: 'Cultura', estado: 'En curso', descripcion: 'Refuerzo del mensaje de cultura corporativa y consolidación de la marca.' },
  { id: 't13', numero: 13, nombre: 'Plan Juventud', lider: 'Líder Plan Juventud', area: 'Cultura', estado: 'Planificado', descripcion: 'Plan Juventud: incorporación, retención y desarrollo de talento joven.' },
  { id: 't14', numero: 14, nombre: 'Geografías y red de prescriptores', lider: 'Líder Geografías', area: 'Diversificación', estado: 'En curso', descripcion: 'Diversificación geográfica y desarrollo de la red de prescriptores.' },
  { id: 't15', numero: 15, nombre: 'Nuevas líneas de negocio', lider: 'Líder Diversificación', area: 'Diversificación', estado: 'Exploratorio', descripcion: 'Identificación y arranque de nuevas líneas de negocio.' },
  { id: 't16', numero: 16, nombre: 'Involucración en gestión de niveles N2 y N3', lider: 'Líder Niveles N2-N3', area: 'Otros', estado: 'En curso', descripcion: 'Delegación de responsabilidades, madurez organizativa e involucración de niveles N2 y N3 en la gestión.' },
  { id: 'tx1', numero: null, nombre: 'Plataforma Integrada', lider: 'IT Local', area: 'Plataforma transversal', estado: 'Diseño', descripcion: 'Plataforma interna end-to-end que conecta equipos, activos y propietarios. Integración con CRM corporativo y Data Lake. Asistente chat para consultas de facturación y pipeline. Iniciativa transversal del Plan Estratégico, fuera de la numeración oficial pero crítica para varios talleres.' },
  { id: 'tx2', numero: null, nombre: 'Repositorio 360', lider: 'IT Local', area: 'Plataforma transversal', estado: 'Mockup', descripcion: 'Evolución del repositorio documental Repositorio Doc hacia visión 360 integrada con Plataforma Integrada. Mockup funcional construido. Iniciativa transversal del Plan Estratégico, fuera de la numeración oficial.' },
];

const SEED_HERRAMIENTAS = [
  { id: 'h1', nombre: 'CRM corporativo', descripcion: 'CRM principal de la compañía. Pipeline comercial, gestión de cuentas y facturación integrada.', categoria: 'CRM', origen: 'externa', funcionalidades: ['CRM', 'Pipeline', 'Facturación'], equipos: [], todosEquipos: true, todaCompaniaUsuarios: true, numeroUsuarios: 0, delegaciones: [], todasDelegaciones: true, licenciasContratadas: 200, licenciasActivas: 175, costeAnual: 50000, sinCosteLicencia: false, tipoLicencia: 'Suscripción anual', solicitudesLicencia: [
    { id: 's1-h1', personaId: 'p17', fecha: '2026-04-22T10:00:00.000Z' },
    { id: 's2-h1', personaId: 'p26', fecha: '2026-04-25T09:30:00.000Z' },
  ] },
  { id: 'h2', nombre: 'Asistente IA productividad', descripcion: 'Asistente de IA generativa integrado en la suite ofimática. Borradores, resúmenes, análisis de documentos.', categoria: 'IA', origen: 'externa', funcionalidades: ['Asistente IA', 'Productividad'], equipos: ['Arquitectura', 'Valoraciones', 'Capital Markets Oficinas', 'Financiero'], todaCompaniaUsuarios: false, numeroUsuarios: 120, delegaciones: ['Madrid', 'Barcelona'], licenciasContratadas: 100, licenciasActivas: 60, costeAnual: 30000, sinCosteLicencia: false, tipoLicencia: 'Por usuario/mes', alerta: 'Infrautilizada', solicitudesLicencia: [
    { id: 's1-h2', personaId: 'p9', fecha: '2026-04-15T08:00:00.000Z' },
    { id: 's2-h2', personaId: 'p11', fecha: '2026-04-18T14:00:00.000Z' },
    { id: 's3-h2', personaId: 'p13', fecha: '2026-04-20T09:30:00.000Z' },
    { id: 's4-h2', personaId: 'p14', fecha: '2026-04-23T11:15:00.000Z' },
    { id: 's5-h2', personaId: 'p17', fecha: '2026-04-26T10:00:00.000Z' },
    { id: 's6-h2', personaId: 'p25', fecha: '2026-04-28T16:30:00.000Z' },
  ] },
  { id: 'h3', nombre: 'Sales Intelligence', descripcion: 'Herramienta de inteligencia comercial: networking, contactos, oportunidades cruzadas.', categoria: 'Sales Intelligence', origen: 'externa', funcionalidades: ['Sales Intelligence', 'Networking'], equipos: ['Capital Markets Oficinas', 'Desarrollo de Negocio'], todaCompaniaUsuarios: false, numeroUsuarios: 45, delegaciones: ['Madrid'], licenciasContratadas: 40, licenciasActivas: 15, costeAnual: 18000, sinCosteLicencia: false, tipoLicencia: 'Por usuario/año', alerta: 'Infrautilizada' },
  { id: 'h4', nombre: 'BI Suite A', descripcion: 'Herramienta BI legacy en el área de Valoraciones. Dashboards y reporting.', categoria: 'BI', origen: 'externa', funcionalidades: ['BI', 'Reporting', 'Dashboards'], equipos: ['Valoraciones'], todaCompaniaUsuarios: false, numeroUsuarios: 22, delegaciones: ['Madrid'], licenciasContratadas: 20, licenciasActivas: 8, costeAnual: 12000, sinCosteLicencia: false, tipoLicencia: 'Por usuario/año', alerta: 'Duplica BI Suite B' },
  { id: 'h5', nombre: 'BI Suite B', descripcion: 'Herramienta BI estándar de la compañía. Dashboards, reporting e integración con CRM.', categoria: 'BI', origen: 'externa', funcionalidades: ['BI', 'Reporting', 'Dashboards'], equipos: ['Arquitectura', 'Valoraciones', 'Property Management', 'Capital Markets Oficinas'], todaCompaniaUsuarios: false, numeroUsuarios: 110, delegaciones: ['Madrid', 'Barcelona', 'Valencia'], licenciasContratadas: 100, licenciasActivas: 90, costeAnual: 15000, sinCosteLicencia: false, tipoLicencia: 'Por usuario/año', solicitudesLicencia: [
    { id: 's1-h5', personaId: 'p18', fecha: '2026-04-19T12:00:00.000Z' },
    { id: 's2-h5', personaId: 'p21', fecha: '2026-04-24T10:45:00.000Z' },
  ] },
  { id: 'h6', nombre: 'Firma Digital A', descripcion: 'Plataforma estándar de firma electrónica corporativa.', categoria: 'Firma', origen: 'externa', funcionalidades: ['Firma electrónica'], equipos: [], todosEquipos: true, todaCompaniaUsuarios: true, numeroUsuarios: 0, delegaciones: [], todasDelegaciones: true, licenciasContratadas: 60, licenciasActivas: 55, costeAnual: 9000, sinCosteLicencia: false, tipoLicencia: 'Por firma', solicitudesLicencia: [
    { id: 's1-h6', personaId: 'p13', fecha: '2026-04-21T15:00:00.000Z' },
    { id: 's2-h6', personaId: 'p20', fecha: '2026-04-23T09:15:00.000Z' },
    { id: 's3-h6', personaId: 'p22', fecha: '2026-04-25T13:30:00.000Z' },
    { id: 's4-h6', personaId: 'p26', fecha: '2026-04-27T11:00:00.000Z' },
  ] },
  { id: 'h7', nombre: 'Firma Digital B', descripcion: 'Plataforma alternativa de firma electrónica activa solo en Property.', categoria: 'Firma', origen: 'externa', funcionalidades: ['Firma electrónica'], equipos: ['Property Management'], todaCompaniaUsuarios: false, numeroUsuarios: 12, delegaciones: ['Madrid'], licenciasContratadas: 10, licenciasActivas: 3, costeAnual: 6000, sinCosteLicencia: false, tipoLicencia: 'Por firma', alerta: 'Duplica Firma Digital A' },
  { id: 'h8', nombre: 'Repositorio documental', descripcion: 'Gestor documental corporativo para áreas técnicas.', categoria: 'Documental', origen: 'externa', funcionalidades: ['Gestión documental'], equipos: ['Arquitectura', 'Valoraciones'], todaCompaniaUsuarios: false, numeroUsuarios: 95, delegaciones: ['Madrid', 'Barcelona'], licenciasContratadas: 80, licenciasActivas: 70, costeAnual: 20000, sinCosteLicencia: false, tipoLicencia: 'Por usuario/año', solicitudesLicencia: [
    { id: 's1-h8', personaId: 'p24', fecha: '2026-04-22T08:30:00.000Z' },
  ] },
  { id: 'h9', nombre: 'Doc Manager Property', descripcion: 'Gestor documental específico de Property Management implantado en primera oleada.', categoria: 'Documental', origen: 'externa', funcionalidades: ['Gestión documental', 'Property'], equipos: ['Property Management'], todaCompaniaUsuarios: false, numeroUsuarios: 28, delegaciones: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'], licenciasContratadas: 25, licenciasActivas: 24, costeAnual: 15000, sinCosteLicencia: false, tipoLicencia: 'Por usuario/año', solicitudesLicencia: [
    { id: 's1-h9', personaId: 'p17', fecha: '2026-04-20T10:00:00.000Z' },
    { id: 's2-h9', personaId: 'p19', fecha: '2026-04-24T15:30:00.000Z' },
    { id: 's3-h9', personaId: 'p23', fecha: '2026-04-26T09:45:00.000Z' },
  ] },
  { id: 'h10', nombre: 'Plataforma Integrada', descripcion: 'Plataforma interna end-to-end que conecta equipos, activos y propietarios. Integración con CRM corporativo y Data Lake. Desarrollada por el equipo de IT Local.', categoria: 'Property Database', origen: 'inhouse', funcionalidades: ['Property', 'Pipeline', 'Integración CRM', 'Data Lake'], equipos: ['Property Management', 'Capital Markets Oficinas', 'Arquitectura', 'IT'], todaCompaniaUsuarios: false, numeroUsuarios: 60, delegaciones: ['Madrid', 'Barcelona'], licenciasContratadas: 0, licenciasActivas: 0, costeAnual: 0, sinCosteLicencia: true, tipoLicencia: '', solicitudesLicencia: [
    { id: 's1-h10', personaId: 'p9', fecha: '2026-04-25T11:00:00.000Z' },
    { id: 's2-h10', personaId: 'p18', fecha: '2026-04-27T14:30:00.000Z' },
  ] },
  { id: 'h11', nombre: 'Repositorio 360', descripcion: 'Repositorio documental 360º conectado a Plataforma Integrada. Mockup funcional construido por IT Local.', categoria: 'Documental', origen: 'inhouse', funcionalidades: ['Gestión documental', 'Property', 'Visión 360'], equipos: ['Property Management', 'Arquitectura'], todaCompaniaUsuarios: false, numeroUsuarios: 35, delegaciones: ['Madrid'], licenciasContratadas: 0, licenciasActivas: 0, costeAnual: 0, sinCosteLicencia: true, tipoLicencia: '' },
];

const SEED_INICIATIVAS = [
  { id: 'i1', titulo: 'Chatbot de incidencias Property Residencial', autor: 'Líder Property Residencial', area: 'Property', estado: 'Presentada', descripcion: 'Bot conversacional para gestionar incidencias de inquilinos en cartera residencial.' },
  { id: 'i2', titulo: 'IA para análisis de concursos y RFPs', autor: 'Foro de Innovación', area: 'Arquitectura', estado: 'Oportunidad', descripcion: 'Análisis automático de pliegos de concursos para extraer criterios, riesgos y checklist de respuesta.' },
  { id: 'i3', titulo: 'Informes de facturación CRM automatizados', autor: 'IT Internacional / IT Internacional', area: 'Transversal', estado: 'En 2 semanas', descripcion: 'Reportes automáticos de facturación generados desde el CRM y enviados a directores de área.' },
];

const SEED_PERSONAS = [
  { id: 'p1', nombre: 'Líder Servicios Transversales', equipo: 'Comité de seguimiento · Servicios transversales', nivel: 1, email: 'lider.servicios.trans@compania.es', talleres: ['t4'] },
  { id: 'p2', nombre: 'Líder Clientes', equipo: 'Comité de seguimiento · Clientes', nivel: 1, email: 'lider.clientes@compania.es', talleres: ['t7'] },
  { id: 'p3', nombre: 'Líder Diversificación', equipo: 'Comité de seguimiento · Diversificación', nivel: 1, email: 'lider.diversificacion@compania.es', talleres: ['t15'] },
  { id: 'p4', nombre: 'Líder Innovación', equipo: 'Tecnología · Innovación', nivel: 1, email: 'lider.innovacion@compania.es', talleres: ['t1', 't11'] },
  { id: 'p5', nombre: 'Líder Procesos', equipo: 'Tecnología · Procesos', nivel: 1, email: 'lider.procesos@compania.es', talleres: ['t2'] },
  { id: 'p6', nombre: 'Líder Property Data', equipo: 'Tecnología · Property Data Base', nivel: 1, email: 'lider.property.data@compania.es', talleres: ['t1', 't3'] },
  { id: 'p7', nombre: 'Líder Capital Advisors', equipo: 'Servicios transversales · Capital Advisors', nivel: 1, email: 'lider.capital@compania.es', talleres: ['t5'] },
  { id: 'p8', nombre: 'Líder Multidisciplinares', equipo: 'Servicios transversales · Multidisciplinares', nivel: 1, email: 'lider.multi@compania.es', talleres: ['t6'] },
  { id: 'p9', nombre: 'Líder Aproximación Cliente', equipo: 'Clientes · Aproximación Cliente', nivel: 1, email: 'lider.aprox.cliente@compania.es', talleres: ['t8'] },
  { id: 'p10', nombre: 'Líder Retribución', equipo: 'Sistema de retribución', nivel: 1, email: 'lider.retribucion@compania.es', talleres: ['t9'] },
  { id: 'p11', nombre: 'Líder Talento', equipo: 'Talento, Formación y Plan de Carrera', nivel: 1, email: 'lider.talento@compania.es', talleres: ['t10'] },
  { id: 'p12', nombre: 'Líder Gobernanza', equipo: 'Gobernanza y Cultura', nivel: 1, email: 'lider.gobernanza@compania.es', talleres: ['t11', 't12'] },
  { id: 'p13', nombre: 'Líder Plan Juventud', equipo: 'Cultura · Plan Juventud', nivel: 1, email: 'lider.juventud@compania.es', talleres: ['t13'] },
  { id: 'p14', nombre: 'Líder Geografías', equipo: 'Diversificación · Geografías', nivel: 1, email: 'lider.geografias@compania.es', talleres: ['t14'] },
  { id: 'p15', nombre: 'Líder Niveles N2-N3', equipo: 'Otros · Niveles N2 y N3', nivel: 1, email: 'lider.n2n3@compania.es', talleres: ['t16'] },
  { id: 'p16', nombre: 'Coordinador Nexo', equipo: 'Nexo · Coordinación', nivel: 1, email: 'coordinador.nexo@compania.es', talleres: ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9', 't10', 't11', 't12', 't13', 't14', 't15', 't16', 'tx1', 'tx2'] },
  { id: 'p17', nombre: 'Equipo Procesos 1', equipo: 'Procesos', nivel: 2, email: 'equipo.procesos.1@compania.es', talleres: ['t2'] },
  { id: 'p18', nombre: 'Equipo Procesos 2', equipo: 'Procesos', nivel: 2, email: 'equipo.procesos.2@compania.es', talleres: ['t2'] },
  { id: 'p19', nombre: 'Equipo Procesos 3', equipo: 'Procesos', nivel: 2, email: 'equipo.procesos.3@compania.es', talleres: ['t2'] },
  { id: 'p20', nombre: 'Equipo Procesos 4', equipo: 'Procesos', nivel: 3, email: 'equipo.procesos.4@compania.es', talleres: ['t2'] },
  { id: 'p21', nombre: 'Equipo Procesos 5', equipo: 'Procesos', nivel: 3, email: 'equipo.procesos.5@compania.es', talleres: ['t2'] },
  { id: 'p22', nombre: 'Líder Jurídico', equipo: 'Jurídico', nivel: 1, email: 'lider.juridico@compania.es', talleres: ['t2'] },
  { id: 'p23', nombre: 'IT Internacional', equipo: 'IT Internacional', nivel: 2, email: 'cesar@compania.com', talleres: ['tx1'] },
  { id: 'p24', nombre: 'Líder Property Residencial', equipo: 'Property Residencial', nivel: 2, email: 'lider.property.res@compania.es', talleres: ['t1', 'tx1'] },
  { id: 'p25', nombre: 'IT Local', equipo: 'IT Local', nivel: 1, email: 'it@compania.es', talleres: ['t2', 't3', 'tx1', 'tx2'] },
  { id: 'p26', nombre: 'Marketing', equipo: 'Marketing', nivel: 3, email: 'marketing@compania.es', talleres: ['t12'] },
];

const SEED_TAREAS = [
  { id: 'ta1', tarea: 'Convocar reunión hito Q2 + nexo propuesto', personaId: 'p1', tallerId: 't2', creadorId: 'p16', deadline: 'Hoy', estado: 'pendiente', prioridad: 'alta' },
  { id: 'ta2', tarea: 'Email a equipo procesos: Antonio, Patricia, Jorge, Juan, Elena', personaId: 'p16', tallerId: 't2', creadorId: 'p16', deadline: '2 días', estado: 'pendiente', prioridad: 'alta' },
  { id: 'ta3', tarea: 'Reenviar propuesta del tercero al equipo ampliado', personaId: 'p16', tallerId: 't2', creadorId: 'p16', deadline: '3 días', estado: 'pendiente', prioridad: 'media' },
  { id: 'ta4', tarea: 'Elevar propuesta al G3 para validación', personaId: 'p16', tallerId: 't2', creadorId: 'p16', deadline: '1 semana', estado: 'pendiente', prioridad: 'alta' },
  { id: 'ta5', tarea: 'Coordinar análisis con tercero · alinear Property Data Base e IT', personaId: 'p16', tallerId: 't3', creadorId: 'p16', deadline: '1 semana', estado: 'pendiente', prioridad: 'alta' },
  { id: 'ta6', tarea: 'Foro Innovación: presentar comunicación interna', personaId: 'p4', tallerId: 't1', creadorId: 'p16', deadline: '2 semanas', estado: 'pendiente', prioridad: 'media' },
  { id: 'ta7', tarea: 'Plan comunicación interna innovación con Marketing', personaId: 'p26', tallerId: 't1', creadorId: 'p16', deadline: '3 semanas', estado: 'pendiente', prioridad: 'media' },
  { id: 'ta8', tarea: 'Proceso de gobierno de herramientas y licencias', personaId: 'p16', tallerId: 't2', creadorId: 'p16', deadline: '3 semanas', estado: 'pendiente', prioridad: 'alta' },
  { id: 'ta9', tarea: 'Publicar informes facturación CRM', personaId: 'p23', tallerId: 'tx1', creadorId: 'p16', deadline: '2 semanas', estado: 'pendiente', prioridad: 'media' },
  { id: 'ta10', tarea: 'Revisar IA productividad y Sales Intelligence · consolidar suscripciones', personaId: 'p16', tallerId: 't2', creadorId: 'p16', deadline: '2 semanas', estado: 'pendiente', prioridad: 'alta' },
];

const SEED_SOLAPAMIENTOS = [
  { id: 's1', tipo: 'funcional', titulo: 'Asistente IA: Innovación ↔ Plataforma Integrada', descripcion: 'El taller de Innovación propone un asistente IA para consultas de negocio, mientras que Plataforma Integrada ya tiene en su roadmap un asistente chat para facturación y pipeline. Mismo caso de uso, mismo público objetivo, dos stacks tecnológicos distintos.', talleresImplicados: ['t1', 'tx1'], herramientasImplicadas: [], riesgo: 'alto', recomendacion: 'Llevar al comité del el hito Q2. Proponer que el asistente IA forme parte de Plataforma Integrada, no como iniciativa paralela.', estado: 'activo', fechaDeteccion: '2026-04-22', detectadoPor: 'p16' },
  { id: 's2', tipo: 'tecnico', titulo: 'Repositorio documental: SharePoint vs Repositorio 360', descripcion: 'Algunos equipos están proponiendo SharePoint para gestión documental, lo cual choca con la visión de Repositorio 360 integrado en Plataforma Integrada. Riesgo de fragmentar el dato y romper la visión 360.', talleresImplicados: ['tx1', 'tx2'], herramientasImplicadas: [], riesgo: 'medio', recomendacion: 'Comunicar a las áreas que Repositorio 360 es el repositorio único objetivo. Bloquear nuevas altas de SharePoint para casos de uso documental cubiertos por Repositorio Doc.', estado: 'activo', fechaDeteccion: '2026-04-25', detectadoPor: 'p16' },
  { id: 's3', tipo: 'personas', titulo: 'Procesos ↔ Property Data Base · sobrecarga de IT', descripcion: 'Los talleres de Mejora de Procesos y Property Data Base compiten por la disponibilidad del equipo de IT Local. Ambos son técnicos y tienen plazos en abril-mayo.', talleresImplicados: ['t2', 't3'], herramientasImplicadas: [], riesgo: 'medio', recomendacion: 'Priorizar carga de IT entre Líder Procesos y Líder Property Data. Posible secuenciar entregables.', estado: 'activo', fechaDeteccion: '2026-04-20', detectadoPor: 'p16' },
  { id: 's4', tipo: 'herramienta', titulo: 'BI Suite B ↔ BI Suite A en Valoraciones', descripcion: 'Valoraciones tiene contratadas licencias de BI Suite A y BI Suite B cubriendo la misma funcionalidad de BI/Reporting. Sobrecoste anual estimado de 12k€ por duplicidad.', talleresImplicados: ['t2'], herramientasImplicadas: [], riesgo: 'medio', recomendacion: 'Migrar usuarios de BI Suite A a BI Suite B y dar de baja las licencias. Consolidar sobre BI Suite B por estandarización con resto de áreas.', estado: 'activo', fechaDeteccion: '2026-04-18', detectadoPor: 'p16' },
  { id: 's5', tipo: 'herramienta', titulo: 'Firma Digital A ↔ Firma Digital B en Property', descripcion: 'Property mantiene Firma Digital B con muy bajo uso (3/10 activas) cuando Firma Digital A cubre la misma funcionalidad y es estándar en otras áreas.', talleresImplicados: [], herramientasImplicadas: [], riesgo: 'bajo', recomendacion: 'Dar de baja Firma Digital B tras migrar firmas pendientes a Firma Digital A. Ahorro ~6k€/año.', estado: 'activo', fechaDeteccion: '2026-04-10', detectadoPor: 'p16' },
];

const SEED_PETICIONES = [
  { id: 'pet1', titulo: 'Herramienta para análisis de pliegos y RFPs', descripcion: 'Necesitamos una herramienta que lea y analice pliegos de concursos públicos y RFPs entrantes, extraiga requisitos clave, identifique riesgos y nos ayude a redactar propuestas más rápido. Ahora hacemos todo manualmente y perdemos oportunidades.', equipo: 'Capital Markets Oficinas', delegacion: 'Madrid', solicitanteId: 'p4', tipoSolicitud: 'herramienta', funcionalidades: ['extracción de requisitos', 'análisis de riesgos', 'generación de propuestas', 'IA generativa'], estado: 'nueva', tallerAsignadoId: null, prioridad: 'alta', fecha: '2026-04-26', evaluacion: null, impactoEstimado: null },
  { id: 'pet2', titulo: 'Mejora del proceso de alta de clientes', descripcion: 'El proceso actual de alta de clientes en Property tiene 8 pasos manuales que tardan 3-5 días. Equipo solicita revisar el flujo completo y proponer automatizaciones, especialmente la verificación KYC y la firma de contratos.', equipo: 'Property Management', delegacion: 'Madrid', solicitanteId: 'p14', tipoSolicitud: 'proceso', funcionalidades: ['automatización KYC', 'firma digital', 'flujo de aprobación'], estado: 'en_revision', tallerAsignadoId: 't1', prioridad: 'media', fecha: '2026-04-20', evaluacion: 'Encaja con el taller de Mejora de Procesos. Equipo Procesos 1 ya está mapeando AS-IS de procesos similares.', impactoEstimado: 'Reducir tiempo de alta de 3-5 días a 1 día. Liberar ~15h/semana del equipo.' },
  { id: 'pet3', titulo: 'Generación automatizada de pitch decks con IA', descripcion: 'Equipo de Desarrollo de Negocio quiere implementar generación automatizada de pitch decks y materiales personalizados por cliente usando IA generativa. Plantean integrarlo con CRM Salesforce.', equipo: 'Desarrollo de Negocio', delegacion: 'Barcelona', solicitanteId: 'p15', tipoSolicitud: 'iniciativa', funcionalidades: ['generación contenido', 'personalización CRM', 'IA generativa'], estado: 'asignada', tallerAsignadoId: 't2', prioridad: 'media', fecha: '2026-04-15', evaluacion: 'Asignado al taller de Innovación. Líder Property Data evaluará viabilidad técnica y conflicto con asistente IA de Plataforma Integrada.', impactoEstimado: 'Si funciona, ahorro estimado de 20% del tiempo de generación de propuestas comerciales.' },
  { id: 'pet4', titulo: 'Retail: necesidad de visualización de pipeline en tiempo real', descripcion: 'El equipo de Retail (locales comerciales) necesita un dashboard de pipeline en tiempo real, similar al de Office. Actualmente usa Excel manual cada lunes y la información llega tarde a dirección.', equipo: 'Retail', delegacion: 'Valencia', solicitanteId: 'p13', tipoSolicitud: 'herramienta', funcionalidades: ['dashboard tiempo real', 'pipeline comercial', 'alertas'], estado: 'nueva', tallerAsignadoId: null, prioridad: 'media', fecha: '2026-04-28', evaluacion: null, impactoEstimado: null },
  { id: 'pet5', titulo: 'Revisión automática de contratos', descripcion: 'Equipo financiero/jurídico solicita herramienta de IA que revise contratos entrantes detectando cláusulas no estándar, plazos de pago atípicos, riesgos legales. Ahora la revisión manual es cuello de botella.', equipo: 'Financiero', delegacion: 'Madrid', solicitanteId: 'p7', tipoSolicitud: 'herramienta', funcionalidades: ['análisis de contratos', 'detección anomalías', 'IA generativa', 'redlining'], estado: 'aprobada', tallerAsignadoId: 't1', prioridad: 'alta', fecha: '2026-04-08', evaluacion: 'Aprobada en comité del 17 de abril. Encaja con el taller de Mejora de Procesos (primera oleada).', impactoEstimado: 'Reducir tiempo de revisión de contratos de 2-3 días a 4 horas. Detección preventiva de cláusulas problemáticas.' },
];

const SEED_CONVOCATORIAS = [
  { id: 'cv1', titulo: 'Comité de seguimiento + líderes de talleres', descripcion: 'Alinear próximos pasos · formalizar modelo de trabajo', fecha: '2026-05-14', hora: '10:00', duracion: 90, recurrente: false, frecuencia: null, integrantes: ['p1', 'p2', 'p3', 'p4', 'p6'], organizadorId: 'p6', agenda: ['Revisión de avances de cada taller', 'Solapamientos detectados y decisiones', 'Formalización del rol del nexo', 'Próximos hitos del Plan Estratégico'], destacada: true, estado: 'pendiente', fechaCreacion: '2026-04-22' },
];

const SEED_REUNIONES = [
  { id: 'r1', titulo: 'Sincronización del Plan Estratégico', fecha: '2026-04-25', asistentes: ['p1', 'p2', 'p3', 'p6', 'p4'], estado: 'procesada', notas: 'Se ha constituido un comité de seguimiento para 14 talleres del Plan Estratégico. Reunión clave el hito Q2. Mejora de procesos retomada del Plan Estratégico anterior. Innovación liderada por Líder Innovación, día a día Líder Property Data. Nexo operativo: Coordinador. Plataforma Integrada debe ser plataforma end-to-end. Detectada compra de compras fuera de circuito. herramientas IA y Sales Intelligence infrautilizadas.', ideas: [{ id: 'idea-r1-1', texto: 'Constituir comité de seguimiento para 14 talleres', tipo: 'decision', tallerId: 't1', publicada: true, eventoId: 'e2' }, { id: 'idea-r1-2', texto: 'Designar nexo operativo (Álvaro) entre talleres, IT y Foro de Innovación', tipo: 'decision', tallerId: 't1', publicada: true, eventoId: null }, { id: 'idea-r1-3', texto: 'Detectada compra de compras fuera de circuito', tipo: 'riesgo', tallerId: 't5', publicada: true, eventoId: 'e13' }, { id: 'idea-r1-4', texto: 'Reasignar licencias infrautilizadas de IA productividad y Sales Intelligence', tipo: 'avance', tallerId: 't5', publicada: true, eventoId: 'e14' }] },
];

const SEED_HISTORICO = [
  { id: 'e1', tallerId: 't1', fecha: '2026-01-15', tipo: 'hito', titulo: 'Retoma del proyecto desde Plan Estratégico anterior', descripcion: 'Se decide retomar el proyecto de mejora de procesos con apoyo de certificaciones y auditorías internas.', autorId: 'p1' },
  { id: 'e2', tallerId: 't1', fecha: '2026-02-10', tipo: 'decision', titulo: 'Selección de áreas objetivo', descripcion: 'Acordadas 6 áreas: Arquitectura, Valoraciones, Property y Jurídico/Financiero como soporte crítico.', autorId: 'p6' },
  { id: 'e3', tallerId: 't1', fecha: '2026-03-05', tipo: 'avance', titulo: 'Acuerdo con Líder Jurídico para Jurídico', descripcion: 'Jurídico confirmado dentro de la primera oleada del análisis con tercero externo.', autorId: 'p7' },
  { id: 'e4', tallerId: 't1', fecha: '2026-04-12', tipo: 'avance', titulo: 'Doc Manager Property implantada en Property', descripcion: 'Herramienta documental Doc Manager Property operativa para Property. Lista para entrar en primera oleada.', autorId: 'p16' },
  { id: 'e5', tallerId: 't1', fecha: '2026-04-25', tipo: 'decision', titulo: 'Plan de fases acordado', descripcion: 'Fase 1: 16 semanas. Fase 2: 16 semanas. Objetivo: análisis de 6 áreas antes de fin de año con quick wins progresivos.', autorId: 'p6' },
  { id: 'e6', tallerId: 't2', fecha: '2026-02-01', tipo: 'hito', titulo: 'Constitución del Foro de Innovación', descripcion: 'Liderazgo formal de Líder Innovación, gestión del día a día por Líder Property Data.', autorId: 'p4' },
  { id: 'e7', tallerId: 't2', fecha: '2026-03-20', tipo: 'iniciativa', titulo: 'Chatbot incidencias Property Residencial', descripcion: 'Líder Property Residencial presenta el chatbot al Foro. Recibido positivamente.', autorId: 'p14' },
  { id: 'e8', tallerId: 't2', fecha: '2026-04-08', tipo: 'iniciativa', titulo: 'IA para análisis de RFPs', descripcion: 'Identificada como oportunidad clave para el área de Arquitectura. Pendiente de pilotaje.', autorId: 'p4' },
  { id: 'e9', tallerId: 't2', fecha: '2026-04-22', tipo: 'riesgo', titulo: 'Conflicto detectado con Plataforma Integrada', descripcion: 'El asistente IA propuesto en el taller solapa con el roadmap del asistente chat de Plataforma Integrada. Requiere alineación urgente.', autorId: 'p6' },
  { id: 'e10', tallerId: 't3', fecha: '2026-01-20', tipo: 'hito', titulo: 'Visión de plataforma 360 definida', descripcion: 'Plataforma Integrada orquesta el ciclo completo del negocio: captación, negociación, facturación y cobro. Integración con CRM corporativo y Data Lake.', autorId: 'p16' },
  { id: 'e11', tallerId: 't3', fecha: '2026-03-15', tipo: 'avance', titulo: 'Mockup funcional construido', descripcion: 'Prototipo de Repositorio 360 listo. En diseño de flujos con TI considerando seguridad y escalabilidad.', autorId: 'p16' },
  { id: 'e12', tallerId: 't3', fecha: '2026-04-10', tipo: 'avance', titulo: 'Asistente chat en diseño', descripcion: 'Asistente interno para consultas de negocio (facturación de un cliente, pipeline por equipo) entrando en fase de diseño.', autorId: 'p13' },
  { id: 'e13', tallerId: 't5', fecha: '2026-04-05', tipo: 'riesgo', titulo: 'Compra fuera de circuito detectada', descripcion: 'Factura de 700€ tramitada sin aprobación IT. Síntoma de fragmentación de gasto en herramientas.', autorId: 'p16' },
  { id: 'e14', tallerId: 't5', fecha: '2026-04-18', tipo: 'avance', titulo: 'Inventario inicial de licencias', descripcion: 'Identificadas IA productividad y Sales Intelligence con uso premium muy bajo. Candidatas a reasignación.', autorId: 'p16' },
  { id: 'e15', tallerId: 't6', fecha: '2026-03-25', tipo: 'avance', titulo: 'Diseño de Repositorio 360 iniciado', descripcion: 'Evolución de Repositorio Doc hacia visión 360 alineada con Plataforma Integrada. Mockup funcional construido.', autorId: 'p16' },
];

async function callClaude(systemPrompt, userMessage, conversationHistory = []) {
  try {
    const messages = [...conversationHistory, { role: 'user', content: userMessage }];
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        max_tokens: 1500,
        system: systemPrompt,
        messages,
      }),
    });
    const data = await response.json();
    if (data.content && data.content[0]) {
      return data.content[0].text;
    }
    if (data.error) {
      return `Error: ${data.error.message || data.error}`;
    }
    return 'No he podido procesar la consulta.';
  } catch (e) {
    return `Error de conexión: ${e.message}`;
  }
}

function useStored(key, seed) {
  const [value, setValue] = useState(seed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(key);
        if (r && r.value) setValue(JSON.parse(r.value));
      } catch (e) { /* primera vez */ }
      setLoaded(true);
    })();
  }, [key]);

  const update = async (newValue) => {
    setValue(newValue);
    try {
      await window.storage.set(key, JSON.stringify(newValue));
    } catch (e) { /* ignore */ }
  };

  return [value, update, loaded];
}

function Sidebar({ active, setActive, usuarioActualId, setUsuarioActualId, personas, tareas, onAbrirChat, onLogout, sessionUser, demoMode }) {
  const usuario = personas.find(p => p.id === usuarioActualId);
  const misTareasCount = tareas.filter(t => (t.personaId === usuarioActualId || t.creadorId === usuarioActualId) && t.estado === 'pendiente').length;

  const items = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'talleres', label: 'Talleres', icon: Layers },
    { id: 'personas', label: 'Personas', icon: Users },
    { id: 'reuniones', label: 'Reuniones', icon: Mic },
    { id: 'mis-tareas', label: 'Mis Tareas', icon: User, badge: misTareasCount },
    { id: 'herramientas', label: 'Herramientas', icon: Wrench },
    { id: 'peticiones', label: 'Peticiones', icon: Workflow },
    { id: 'solapamientos', label: 'Conflictos', icon: AlertTriangle },
    { id: 'tareas', label: 'Tareas', icon: CheckSquare },
    { id: 'innovacion', label: 'Innovación', icon: Sparkles },
    { id: 'chat', label: 'Chat', icon: MessageSquare, accent: 'gold' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center shadow-sm">
            <span className="text-stone-50 font-display text-lg" style={{ fontWeight: 600 }}>N</span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gold-400 border-2 border-white"></span>
          </div>
          <div>
            <p className="eyebrow text-navy-700" style={{ fontSize: '10px' }}>la compañía</p>
            <p className="font-display text-xl text-navy-900 leading-none mt-0.5" style={{ fontWeight: 600 }}>Nexo</p>
          </div>
        </div>
        {demoMode && (
          <>
            <div className="mt-3 flex items-center gap-2 bg-gold-100 border border-gold-300 rounded-md px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gold-800">Modo demo</p>
              <button onClick={onLogout} className="ml-auto text-[10px] text-gold-800 hover:text-gold-900 font-bold underline-offset-2 hover:underline">Salir</button>
            </div>
            <button
              onClick={() => {
                const dump = {};
                Object.keys(localStorage).filter(k => k.startsWith('nexo2:')).forEach(k => {
                  try { dump[k] = JSON.parse(localStorage.getItem(k)); } catch (e) { dump[k] = localStorage.getItem(k); }
                });
                const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nexo-demo-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="mt-2 w-full text-[10px] uppercase tracking-widest font-bold text-stone-700 hover:text-navy-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-md px-2.5 py-1.5 transition-colors"
            >📥 Exportar datos demo</button>
          </>
        )}
      </div>
      <nav className="flex-1 p-2.5">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          const isGold = item.accent === 'gold';

          let cls;
          if (isActive && isGold) {
            cls = 'bg-gold-400 text-navy-900 border-gold-500 shadow-md shadow-gold-500/30 ring-2 ring-navy-900/20';
          } else if (isActive) {
            cls = 'bg-navy-900 text-stone-50 border-navy-900 shadow-md shadow-navy-900/20 ring-2 ring-gold-400/40';
          } else if (isGold) {
            cls = 'text-gold-800 bg-gold-50/50 border-gold-200 hover:bg-gold-100 hover:border-gold-400';
          } else {
            cls = 'text-stone-700 border-transparent hover:bg-navy-50 hover:text-navy-900 hover:border-navy-100';
          }

          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all mb-1 border ${cls}`}
            >
              <Icon size={17} className={isActive ? (isGold ? 'text-navy-900' : 'text-gold-400') : (isGold ? 'text-gold-700' : '')} />
              <span className="flex-1 text-left">{item.label}</span>
              {isGold && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
              )}
              {item.badge != null && item.badge > 0 && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-gold-400 text-navy-900' : 'bg-gold-100 text-gold-800'
                }`}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {onAbrirChat && (
        <div className="px-3 pt-3 pb-2 border-t border-stone-200">
          <button
            onClick={onAbrirChat}
            className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-stone-50 transition-all hover:shadow-md"
          >
            <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={14} className="text-navy-900" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium leading-tight">Asistente Nexo</p>
              <p className="text-xs text-stone-300 leading-tight mt-0.5">Pregunta o pide algo</p>
            </div>
            <ChevronRight size={12} className="text-stone-400 group-hover:text-stone-50 transition-colors flex-shrink-0" />
          </button>
        </div>
      )}

      <div className="px-4 py-3 border-t border-stone-200">
        {sessionUser && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-7 h-7 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-medium text-[10px] flex-shrink-0">
              {`${sessionUser.nombre || ''} ${sessionUser.apellidos || ''}`.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'N'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-stone-900 truncate">{sessionUser.nombre} {sessionUser.apellidos}</p>
              <p className="text-[10px] text-stone-500 truncate">{sessionUser.email}</p>
            </div>
            {onLogout && (
              <button onClick={onLogout} className="p-1.5 rounded hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors" title="Cerrar sesión">
                <LogOut size={13} />
              </button>
            )}
          </div>
        )}
        {usuario && (
          <p className="text-[10px] text-stone-500 mt-1 px-1">{getEquipo(usuario)}</p>
        )}
        <button
          onClick={async () => {
            if (!confirm('Esto borrará el chat local. ¿Continuar?')) return;
            try { await window.storage.delete('nexo2:chat'); } catch (e) {}
            window.location.reload();
          }}
          className="w-full mt-2 text-[10px] text-stone-400 hover:text-stone-700 transition-colors"
          title="Borra solo la caché local del chat"
        >Limpiar caché local</button>
      </div>
    </aside>
  );
}

const FRECUENCIAS = {
  semanal: { label: 'Semanal', dias: 7 },
  quincenal: { label: 'Quincenal', dias: 14 },
  mensual: { label: 'Mensual', dias: 30 },
};

function ConvocatoriasDestacadas({ convocatorias, setConvocatorias, personas, usuarioActualId }) {
  const [creando, setCreando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [borrador, setBorrador] = useState({
    titulo: '',
    descripcion: '',
    fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    hora: '10:00',
    duracion: 60,
    recurrente: false,
    frecuencia: 'semanal',
    integrantes: [],
    agenda: '',
  });

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));

  const abrirNueva = () => {
    setBorrador({
      titulo: '',
      descripcion: '',
      fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      hora: '10:00',
      duracion: 60,
      recurrente: false,
      frecuencia: 'semanal',
      integrantes: [usuarioActualId].filter(Boolean),
      agenda: '',
    });
    setEditandoId(null);
    setCreando(true);
  };

  const abrirEdicion = (cv) => {
    setBorrador({
      titulo: cv.titulo,
      descripcion: cv.descripcion || '',
      fecha: cv.fecha,
      hora: cv.hora || '10:00',
      duracion: cv.duracion || 60,
      recurrente: cv.recurrente || false,
      frecuencia: cv.frecuencia || 'semanal',
      integrantes: cv.integrantes || [],
      agenda: (cv.agenda || []).join('\n'),
    });
    setEditandoId(cv.id);
    setCreando(true);
  };

  const cerrarFormulario = () => {
    setCreando(false);
    setEditandoId(null);
  };

  const toggleIntegrante = (id) => {
    setBorrador({
      ...borrador,
      integrantes: borrador.integrantes.includes(id)
        ? borrador.integrantes.filter(i => i !== id)
        : [...borrador.integrantes, id],
    });
  };

  const guardar = async () => {
    if (!borrador.titulo.trim() || !borrador.fecha) return;
    const agendaItems = borrador.agenda
      .split('\n')
      .map(l => l.replace(/^[\s•\-*·]+/, '').trim())
      .filter(Boolean);
    const data = {
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim(),
      fecha: borrador.fecha,
      hora: borrador.hora,
      duracion: Number(borrador.duracion) || 60,
      recurrente: borrador.recurrente,
      frecuencia: borrador.recurrente ? borrador.frecuencia : null,
      integrantes: borrador.integrantes,
      organizadorId: usuarioActualId,
      agenda: agendaItems,
      destacada: true,
    };
    if (editandoId) {
      await setConvocatorias(convocatorias.map(c => c.id === editandoId ? { ...c, ...data } : c));
    } else {
      const nueva = {
        id: `cv-${Date.now()}`,
        ...data,
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString().slice(0, 10),
      };
      await setConvocatorias([...convocatorias, nueva]);
    }
    cerrarFormulario();
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta convocatoria?')) return;
    await setConvocatorias(convocatorias.filter(c => c.id !== id));
    cerrarFormulario();
  };

  const calcularDias = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const obj = new Date(fecha);
    obj.setHours(0, 0, 0, 0);
    const diff = Math.round((obj - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const convocatoriasOrdenadas = [...convocatorias]
    .filter(c => c.destacada)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold-500"></span>
          <p className="text-base font-bold text-navy-900 tracking-tight">Convocatorias destacadas</p>
        </div>
        <button
          onClick={abrirNueva}
          className="flex items-center gap-1.5 px-3 py-2 bg-gold-400 hover:bg-gold-500 text-navy-900 rounded-md text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={13} /> Nueva convocatoria
        </button>
      </div>

      {convocatoriasOrdenadas.length === 0 && !creando && (
        <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-8 text-center">
          <Calendar size={28} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-600 mb-1">No hay convocatorias programadas</p>
          <p className="text-xs text-stone-500">Pulsa "Nueva convocatoria" para crear una</p>
        </div>
      )}

      {convocatoriasOrdenadas.length > 0 && (() => {
        const proxima = convocatoriasOrdenadas.find(c => calcularDias(c.fecha) >= 0) || convocatoriasOrdenadas[convocatoriasOrdenadas.length - 1];
        const otras = convocatoriasOrdenadas.filter(c => c.id !== proxima.id);
        const dias = calcularDias(proxima.fecha);
        const integrantes = (proxima.integrantes || []).map(id => personaById[id]).filter(Boolean);
        const esPasada = dias < 0;
        const esUrgente = dias >= 0 && dias <= 7;

        const accentBar = esUrgente ? 'bg-red-500' : esPasada ? 'bg-stone-300' : 'bg-gold-500';
        const accentText = esUrgente ? 'text-red-700' : esPasada ? 'text-stone-500' : 'text-gold-700';

        return (
          <>
            <div
              onClick={() => abrirEdicion(proxima)}
              className="group relative bg-gradient-to-br from-gold-50 via-white to-gold-50/30 border-2 border-gold-300 rounded-2xl overflow-hidden mb-3 cursor-pointer hover:border-gold-500 hover:shadow-lg hover:shadow-gold-500/10 transition-all flex"
            >
              <div className={`w-2 ${accentBar} flex-shrink-0`}></div>

              <div className="flex-1 p-5">
                <div className="flex items-start gap-5">
                  <div className="flex flex-col items-center justify-center bg-sand-50 rounded-xl px-4 py-3 flex-shrink-0 border border-stone-200/60 min-w-[78px]">
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${accentText}`}>
                      {new Date(proxima.fecha).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                    </span>
                    <span className="font-display text-4xl text-navy-900 leading-none mt-0.5">{new Date(proxima.fecha).getDate()}</span>
                    <span className="text-[10px] uppercase tracking-wider text-stone-500 mt-1">
                      {new Date(proxima.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 eyebrow ${accentText}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${esUrgente ? 'bg-gold-500 animate-pulse' : esPasada ? 'bg-stone-400' : 'bg-navy-800'}`}></span>
                            {esPasada && `Hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}`}
                            {dias === 0 && 'Hoy'}
                            {dias === 1 && 'Mañana'}
                            {dias > 1 && `En ${dias} días`}
                          </span>
                          {proxima.recurrente && proxima.frecuencia && (
                            <span className="eyebrow text-stone-500">
                              · {FRECUENCIAS[proxima.frecuencia]?.label || proxima.frecuencia}
                            </span>
                          )}
                        </div>
                        <h2 className="font-display text-xl text-navy-900 leading-tight">{proxima.titulo}</h2>
                        {proxima.descripcion && (
                          <p className="text-sm text-stone-600 leading-relaxed mt-1 line-clamp-2">{proxima.descripcion}</p>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); abrirEdicion(proxima); }}
                        className="text-xs text-stone-500 hover:text-navy-800 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
                      >
                        <Settings size={12} /> Editar
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-stone-100 flex-wrap">
                      {proxima.hora && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-600">
                          <Clock size={12} className="text-stone-400" />
                          <span className="font-medium">{proxima.hora}{proxima.duracion ? ` · ${proxima.duracion} min` : ''}</span>
                        </div>
                      )}
                      {integrantes.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {integrantes.slice(0, 5).map(p => (
                              <div
                                key={p.id}
                                className="w-6 h-6 rounded-full bg-navy-800 text-stone-50 flex items-center justify-center text-[9px] font-semibold border-2 border-white"
                                title={p.nombre}
                              >
                                {p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                              </div>
                            ))}
                            {integrantes.length > 5 && (
                              <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[9px] font-semibold border-2 border-white">
                                +{integrantes.length - 5}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-stone-500">{integrantes.length} {integrantes.length === 1 ? 'integrante' : 'integrantes'}</span>
                        </div>
                      )}
                      {(proxima.agenda || []).length > 0 && (
                        <span className="text-xs text-stone-500">
                          <span className="font-medium text-stone-700">{(proxima.agenda || []).length}</span> {(proxima.agenda || []).length === 1 ? 'punto en agenda' : 'puntos en agenda'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {otras.length > 0 && (
              <div className="space-y-2">
                {otras.map(cv => {
                  const diasOtra = calcularDias(cv.fecha);
                  const integOtra = (cv.integrantes || []).map(id => personaById[id]).filter(Boolean);
                  const esPas = diasOtra < 0;

                  return (
                    <button
                      key={cv.id}
                      onClick={() => abrirEdicion(cv)}
                      className={`group w-full text-left bg-gradient-to-br from-gold-50 via-white to-gold-50/30 border-2 border-gold-300 rounded-2xl overflow-hidden cursor-pointer hover:border-gold-500 hover:shadow-md hover:shadow-gold-500/10 transition-all flex ${esPas ? 'opacity-70' : ''}`}
                    >
                      <div className="w-2 bg-gold-500 flex-shrink-0"></div>
                      <div className="flex-1 p-3 flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center bg-sand-50 rounded-lg px-3 py-2 flex-shrink-0 border border-stone-200/60 min-w-[64px]">
                          <span className="text-[10px] uppercase tracking-widest font-semibold text-gold-700">
                            {new Date(cv.fecha).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                          </span>
                          <span className="font-display text-2xl text-navy-900 leading-none mt-0.5">{new Date(cv.fecha).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-widest font-semibold text-gold-700 mb-1">
                            {esPas && `Hace ${Math.abs(diasOtra)} ${Math.abs(diasOtra) === 1 ? 'día' : 'días'}`}
                            {diasOtra === 0 && 'Hoy'}
                            {diasOtra === 1 && 'Mañana'}
                            {diasOtra > 1 && `En ${diasOtra} días`}
                            {cv.recurrente && cv.frecuencia && ` · ${FRECUENCIAS[cv.frecuencia]?.label || cv.frecuencia}`}
                          </p>
                          <p className="text-base font-semibold text-navy-900 leading-snug truncate">{cv.titulo}</p>
                          {cv.hora && (
                            <p className="text-xs text-stone-500 mt-0.5 font-medium">{cv.hora}{cv.duracion ? ` · ${cv.duracion} min` : ''}</p>
                          )}
                        </div>
                        {integOtra.length > 0 && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex -space-x-1.5">
                              {integOtra.slice(0, 4).map(p => (
                                <div
                                  key={p.id}
                                  className="w-6 h-6 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center text-[9px] font-semibold border-2 border-white"
                                  title={p.nombre}
                                >{p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}</div>
                              ))}
                              {integOtra.length > 4 && (
                                <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[9px] font-semibold border-2 border-white">
                                  +{integOtra.length - 4}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        );
      })()}

      {creando && (
        <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={cerrarFormulario}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-1">Convocatoria</p>
                <h2 className="font-serif text-xl text-stone-900">
                  {editandoId ? 'Editar convocatoria' : 'Nueva convocatoria'}
                </h2>
              </div>
              <button onClick={cerrarFormulario} className="text-stone-400 hover:text-stone-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Título</label>
                <input
                  value={borrador.titulo}
                  onChange={e => setBorrador({ ...borrador, titulo: e.target.value })}
                  placeholder="Ej: Comité de seguimiento, Sync de talleres..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción <span className="normal-case text-stone-400">(opcional)</span></label>
                <input
                  value={borrador.descripcion}
                  onChange={e => setBorrador({ ...borrador, descripcion: e.target.value })}
                  placeholder="Una línea con el contexto de la reunión"
                  className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Fecha</label>
                  <input
                    type="date"
                    value={borrador.fecha}
                    onChange={e => setBorrador({ ...borrador, fecha: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Hora</label>
                  <input
                    type="time"
                    value={borrador.hora}
                    onChange={e => setBorrador({ ...borrador, hora: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Duración (min)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={borrador.duracion}
                    onChange={e => setBorrador({ ...borrador, duracion: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
                <button
                  type="button"
                  onClick={() => setBorrador({ ...borrador, recurrente: !borrador.recurrente })}
                  className="w-full flex items-center gap-2 text-left"
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    borrador.recurrente ? 'bg-navy-900 border-navy-900' : 'border-stone-400'
                  }`}>
                    {borrador.recurrente && <span className="text-stone-50 text-[10px] leading-none">✓</span>}
                  </span>
                  <span className="text-sm font-medium text-stone-900">Reunión recurrente</span>
                </button>
                {borrador.recurrente && (
                  <div className="flex gap-1 mt-2">
                    {Object.entries(FRECUENCIAS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => setBorrador({ ...borrador, frecuencia: k })}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                          borrador.frecuencia === k ? 'bg-navy-900 text-stone-50' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >{v.label}</button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-stone-500">Integrantes</label>
                  <span className="text-[10px] text-stone-500">{borrador.integrantes.length} seleccionados</span>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-md p-2 max-h-48 overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {personas.map(p => {
                      const seleccionado = borrador.integrantes.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleIntegrante(p.id)}
                          className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded transition-colors ${
                            seleccionado ? 'bg-navy-900 text-stone-50' : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-medium flex-shrink-0 ${
                            seleccionado ? 'bg-stone-50/20 text-stone-50' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                          </span>
                          <span>{p.nombre}</span>
                          {p.nivel && (
                            <span className={`text-[9px] ${seleccionado ? 'text-stone-400' : 'text-stone-500'}`}>· N{p.nivel}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">Pulsa para añadir o quitar integrantes</p>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Orden del día <span className="normal-case text-stone-400">(opcional)</span></label>
                <textarea
                  value={borrador.agenda}
                  onChange={e => setBorrador({ ...borrador, agenda: e.target.value })}
                  placeholder={`• Tema 1\n• Tema 2\n• Tema 3`}
                  rows={4}
                  className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none"
                />
                <p className="text-[10px] text-stone-500 mt-1">Un tema por línea</p>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 flex items-center justify-between">
              <div>
                {editandoId && (
                  <button
                    onClick={() => eliminar(editandoId)}
                    className="text-xs text-red-700 hover:text-red-800 font-medium"
                  >Eliminar convocatoria</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cerrarFormulario}
                  className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-sm transition-colors"
                >Cancelar</button>
                <button
                  onClick={guardar}
                  disabled={!borrador.titulo.trim() || !borrador.fecha}
                  className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
                >{editandoId ? 'Guardar cambios' : 'Crear convocatoria'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InformeMensual({ talleres, tareas, historico, reuniones, solapamientos, peticiones, iniciativas, herramientas, personas }) {
  const [generando, setGenerando] = useState(false);
  const [informe, setInforme] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState(1); // meses

  const periodos = [
    { meses: 1, label: '1 mes' },
    { meses: 3, label: '3 meses' },
    { meses: 6, label: '6 meses' },
    { meses: 12, label: '1 año' },
  ];

  const ahora = new Date();
  const periodoLabel = periodos.find(p => p.meses === periodo)?.label || `${periodo} meses`;

  const generar = async () => {
    setGenerando(true);
    setError(null);
    const desde = new Date(ahora.getTime() - periodo * 30 * 86400000);

    const enRango = (fechaStr) => fechaStr && new Date(fechaStr) >= desde;

    const eventos = (historico || []).filter(e => enRango(e.fecha));
    const tareasCompletadas = (tareas || []).filter(t => t.estado === 'completada' && enRango(t.fechaCreacion));
    const tareasAbiertas = (tareas || []).filter(t => t.estado === 'pendiente');
    const tareasNuevas = (tareas || []).filter(t => enRango(t.fechaCreacion));
    const conflictosResueltos = (solapamientos || []).filter(s => s.estado === 'resuelto' && enRango(s.fechaDeteccion));
    const conflictosActivos = (solapamientos || []).filter(s => s.estado === 'activo');
    const reunionesPeriodo = (reuniones || []).filter(r => enRango(r.fecha));
    const peticionesPeriodo = (peticiones || []).filter(p => enRango(p.fecha));
    const iniciativasPeriodo = (iniciativas || []);
    const herramientasNuevas = (herramientas || []).filter(h => enRango(h.fechaAlta));

    // Top talleres por actividad (eventos + tareas en el periodo)
    const actividadTaller = {};
    eventos.forEach(e => { actividadTaller[e.tallerId] = (actividadTaller[e.tallerId] || 0) + 1; });
    tareasNuevas.forEach(t => { if (t.tallerId) actividadTaller[t.tallerId] = (actividadTaller[t.tallerId] || 0) + 0.5; });
    const topTalleres = Object.entries(actividadTaller)
      .map(([id, count]) => ({ id, count, nombre: talleres.find(t => t.id === id)?.nombre || 'Sin taller' }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top contribuyentes (autores de eventos + creadores de tareas)
    const aportePersona = {};
    eventos.forEach(e => { if (e.autorId) aportePersona[e.autorId] = (aportePersona[e.autorId] || 0) + 1; });
    tareasNuevas.forEach(t => { if (t.creadorId) aportePersona[t.creadorId] = (aportePersona[t.creadorId] || 0) + 1; });
    const topPersonas = Object.entries(aportePersona)
      .map(([id, count]) => ({ id, count, nombre: personas.find(p => p.id === id)?.nombre || 'Desconocido' }))
      .filter(p => p.nombre !== 'Desconocido')
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Datos por taller (solo los con actividad)
    const talleresConDatos = talleres.map(t => {
      const eventosT = eventos.filter(e => e.tallerId === t.id);
      const tareasNuevasT = tareasNuevas.filter(x => x.tallerId === t.id);
      const tareasCompT = tareasCompletadas.filter(x => x.tallerId === t.id);
      const tareasAbiertasT = tareasAbiertas.filter(x => x.tallerId === t.id);
      const aportesT = {};
      eventosT.forEach(e => { if (e.autorId) aportesT[e.autorId] = (aportesT[e.autorId] || 0) + 1; });
      const topContrib = Object.entries(aportesT).sort((a, b) => b[1] - a[1])[0];
      const topContribNombre = topContrib ? (personas.find(p => p.id === topContrib[0])?.nombre || null) : null;
      // Distribución de tipos de eventos
      const tipos = {};
      eventosT.forEach(e => { tipos[e.tipo || 'otros'] = (tipos[e.tipo || 'otros'] || 0) + 1; });
      const totalCompletadasYAbiertas = tareasCompT.length + tareasAbiertasT.length;
      const completionRate = totalCompletadasYAbiertas > 0 ? Math.round((tareasCompT.length / totalCompletadasYAbiertas) * 100) : 0;
      return {
        id: t.id,
        nombre: t.nombre,
        area: t.area,
        estado: t.estado,
        eventos: eventosT,
        eventosTipos: tipos,
        tareasNuevas: tareasNuevasT.length,
        tareasCompletadas: tareasCompT.length,
        tareasAbiertas: tareasAbiertasT.length,
        completionRate,
        topContribuyente: topContribNombre,
        actividad: eventosT.length + tareasNuevasT.length * 0.5,
      };
    }).filter(t => t.actividad > 0).sort((a, b) => b.actividad - a.actividad);

    // Stats de tareas
    const tareasPorPrioridad = {
      alta: (tareas || []).filter(t => t.prioridad === 'alta').length,
      media: (tareas || []).filter(t => t.prioridad === 'media').length,
      baja: (tareas || []).filter(t => (t.prioridad === 'baja' || !t.prioridad)).length,
    };

    // Stats reuniones
    const reunionesPorEstado = {
      programadas: (reuniones || []).filter(r => r.fecha && new Date(r.fecha) >= ahora).length,
      finalizadas: (reuniones || []).filter(r => r.fecha && new Date(r.fecha) < ahora).length,
      por_programar: (reuniones || []).filter(r => !r.fecha).length,
    };

    // Stats herramientas (estado de uso)
    const calcUso = (h) => {
      const total = h.licenciasContratadas || 0;
      if (total === 0) return 'sin_dato';
      const pct = (h.licenciasActivas || 0) / total;
      if (pct >= 0.8) return 'muy_uso';
      if (pct >= 0.5) return 'uso_moderado';
      if (pct >= 0.2) return 'infrautilizada';
      return 'sin_uso';
    };
    const herramientasPorUso = {
      muy_uso: (herramientas || []).filter(h => calcUso(h) === 'muy_uso').length,
      uso_moderado: (herramientas || []).filter(h => calcUso(h) === 'uso_moderado').length,
      infrautilizada: (herramientas || []).filter(h => calcUso(h) === 'infrautilizada').length,
      sin_uso: (herramientas || []).filter(h => calcUso(h) === 'sin_uso').length,
    };
    const costeAnualTotal = (herramientas || []).reduce((acc, h) => {
      const c = h.costeAnual != null ? h.costeAnual : (h.costePorLicencia || 0) * (h.licenciasContratadas || 0);
      return acc + c;
    }, 0);
    const categoriasHerr = [...new Set((herramientas || []).flatMap(h => {
      if (Array.isArray(h.categorias)) return h.categorias;
      if (h.categoria) return h.categoria.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    }))];

    // Stats personas (por nivel)
    const personasPorNivel = {
      1: personas.filter(p => p.nivel === 1).length,
      2: personas.filter(p => p.nivel === 2).length,
      3: personas.filter(p => p.nivel === 3).length,
    };

    const stats = {
      periodo: periodoLabel,
      desde: desde.toISOString().slice(0, 10),
      hasta: ahora.toISOString().slice(0, 10),
      talleresActivos: talleres.length,
      eventosTotales: eventos.length,
      tareasCompletadas: tareasCompletadas.length,
      tareasNuevas: tareasNuevas.length,
      tareasAbiertas: tareasAbiertas.length,
      conflictosResueltos: conflictosResueltos.length,
      conflictosActivos: conflictosActivos.length,
      reuniones: reunionesPeriodo.length,
      iniciativas: iniciativasPeriodo.length,
      peticionesNuevas: peticionesPeriodo.length,
      herramientasCatalogo: (herramientas || []).length,
      herramientasImplementadas: herramientasNuevas.length,
      personas: personas.length,
    };

    const eventosClave = eventos.slice(0, 15).map(e => {
      const t = talleres.find(x => x.id === e.tallerId);
      return `[${e.fecha}] ${t?.nombre || 'sin taller'} · ${e.tipo}: ${e.titulo}`;
    }).join('\n');

    const conflictosResumen = conflictosActivos.slice(0, 5).map(c => `- ${c.titulo} (riesgo ${c.riesgo}): ${(c.recomendacion || '').slice(0, 120)}`).join('\n');
    const topTalleresTxt = topTalleres.map(t => `- ${t.nombre} (${Math.round(t.count)} eventos/tareas)`).join('\n');
    const topPersonasTxt = topPersonas.map(p => `- ${p.nombre} (${p.count} aportaciones)`).join('\n');
    const herramientasTxt = herramientasNuevas.slice(0, 10).map(h => `- ${h.nombre} (${h.categoria || 'sin categoría'})`).join('\n');

    const talleresActividadTxt = talleresConDatos.slice(0, 10).map(t =>
      `[${t.nombre}] estado=${t.estado || 'sin estado'}, eventos=${t.eventos.length}, tareas nuevas=${t.tareasNuevas}, completadas=${t.tareasCompletadas}, completion=${t.completionRate}%, top contribuyente=${t.topContribuyente || 'n/d'}`
    ).join('\n');

    const prompt = `Genera un informe ejecutivo profesional del Plan Estratégico de la compañía. Periodo analizado: ÚLTIMOS ${periodoLabel.toUpperCase()}. Va al comité y líderes. Tono profesional, claro, accionable. Identifica patrones, no enumeres.

DATOS DEL PERIODO:
${JSON.stringify(stats, null, 2)}

TOP TALLERES POR ACTIVIDAD (con datos):
${talleresActividadTxt || '(ninguno)'}

EVENTOS CLAVE:
${eventosClave || '(sin eventos)'}

PERSONAS QUE MÁS HAN APORTADO:
${topPersonasTxt || '(sin datos)'}

HERRAMIENTAS IMPLEMENTADAS EN EL PERIODO:
${herramientasTxt || '(ninguna nueva)'}

CONFLICTOS ACTIVOS:
${conflictosResumen || '(ninguno)'}

TODOS LOS TALLERES (catálogo): ${talleres.map(t => t.nombre).join(', ')}.

Devuelve SOLO JSON válido sin markdown:
{
  "categoria": "Plan Estratégico · Informe ${periodoLabel}",
  "titular": "titular ejecutivo del periodo (máx 65 caracteres)",
  "subtitular": "frase con la idea clave (máx 150 caracteres)",
  "lead": "1 párrafo (70-100 palabras). Pulso ejecutivo del periodo, identifica la idea fuerza.",
  "resumenEjecutivo": "1 párrafo de cierre del resumen (60-80 palabras). Cierra el lead con dato concreto.",
  "talleresAnalisis": [
    { "id": "id del taller", "narrativa": "1-2 frases (30-50 palabras) sobre lo más relevante de ESTE taller en el periodo. Menciona logros, riesgos o avances concretos." }
  ],
  "personasAnalisis": "1 párrafo (60-80 palabras) sobre quién ha empujado más, qué patrón de implicación se ve, citando NOMBRES del top.",
  "herramientasAnalisis": "1 párrafo (60-80 palabras) sobre el catálogo: implementaciones nuevas, salud de uso, oportunidades de consolidación.",
  "tareasAnalisis": "1 párrafo (60-80 palabras) sobre productividad, prioridades, ratio de completitud, bloqueos.",
  "reunionesAnalisis": "1 párrafo (50-70 palabras) sobre cadencia de reuniones, ideas extraídas, próximas convocatorias.",
  "conflictosAnalisis": "1 párrafo (60-80 palabras) sobre conflictos detectados/resueltos y oportunidades de consolidación. Si no hay, dilo brevemente.",
  "proximosHitos": "1 párrafo (70-90 palabras) sobre prioridades del siguiente periodo, riesgos a vigilar y acciones recomendadas.",
  "cita": "frase ejecutiva memorable (12-25 palabras)",
  "citaAutor": "Comité de seguimiento",
  "datos": [
    {"valor": "${stats.eventosTotales}", "etiqueta": "eventos del periodo"},
    {"valor": "${stats.tareasCompletadas}", "etiqueta": "tareas cerradas"},
    {"valor": "${stats.conflictosResueltos}", "etiqueta": "conflictos resueltos"},
    {"valor": "${stats.herramientasImplementadas}", "etiqueta": "herramientas nuevas"}
  ],
  "callout": "llamada a la acción para el siguiente periodo (1-2 frases)",
  "etiquetas": ["4-5 etiquetas relevantes"]
}

talleresAnalisis: incluye SOLO los talleres con actividad (los del top arriba). Usa el id exacto del taller. Si la actividad es muy baja, una frase basta.`;

    const respuesta = await callClaude('Eres analista del comité de seguimiento del Plan Estratégico. Generas informes ejecutivos a partir de datos. Devuelves SOLO JSON válido.', prompt);

    if (typeof respuesta === 'string' && (respuesta.startsWith('Error') || respuesta.startsWith('No he podido'))) {
      setError(respuesta);
      setGenerando(false);
      return;
    }

    try {
      const m = respuesta.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('respuesta sin JSON');
      const data = JSON.parse(m[0]);
      // Adjuntar datos numéricos calculados al informe
      data._periodoLabel = periodoLabel;
      data._stats = stats;
      data._talleresConDatos = talleresConDatos;
      data._topPersonas = topPersonas;
      data._herramientasNuevas = herramientasNuevas;
      data._tareasPorPrioridad = tareasPorPrioridad;
      data._reunionesPorEstado = reunionesPorEstado;
      data._herramientasPorUso = herramientasPorUso;
      data._costeAnualTotal = costeAnualTotal;
      data._categoriasHerr = categoriasHerr;
      data._personasPorNivel = personasPorNivel;
      data._conflictosActivos = conflictosActivos;
      data._conflictosResueltos = conflictosResueltos;
      setInforme(data);
      setAbierto(true);
    } catch (e) {
      setError('Error procesando: ' + e.message);
    }
    setGenerando(false);
  };

  const imprimirInforme = () => window.print();

  return (
    <>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs text-stone-500 font-semibold mr-1">Informe:</span>
        <div className="flex gap-1 bg-white border border-stone-200 rounded-lg p-1">
          {periodos.map(p => (
            <button
              key={p.meses}
              onClick={() => setPeriodo(p.meses)}
              disabled={generando}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${periodo === p.meses ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}
            >{p.label}</button>
          ))}
        </div>
        <button
          onClick={informe && informe._periodoLabel === periodoLabel ? () => setAbierto(true) : generar}
          disabled={generando}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          {generando ? (
            <><Loader2 size={14} className="animate-spin" /> Generando...</>
          ) : (informe && informe._periodoLabel === periodoLabel) ? (
            <><FileText size={14} className="text-gold-400" /> Ver informe</>
          ) : (
            <><Sparkles size={14} className="text-gold-400" /> Generar informe ({periodoLabel})</>
          )}
        </button>
        {informe && informe._periodoLabel === periodoLabel && (
          <button onClick={generar} disabled={generando} className="text-xs text-stone-500 hover:text-navy-900 font-medium px-2 py-1 transition-colors">Regenerar</button>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-1.5 flex items-center gap-2">
            <AlertTriangle size={12} className="text-red-600" />
            <p className="text-xs text-red-700 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700"><X size={12} /></button>
          </div>
        )}
      </div>

      {abierto && informe && (() => {
        const fechaHoy = ahora.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const periodoActual = informe._periodoLabel || periodoLabel;
        const stats = informe._stats || {};
        const tConDatos = informe._talleresConDatos || [];
        const tHerrPorUso = informe._herramientasPorUso || {};
        const tConflActivos = informe._conflictosActivos || [];
        const tConflResueltos = informe._conflictosResueltos || [];
        const reuPorEstado = informe._reunionesPorEstado || {};
        const tareasPri = informe._tareasPorPrioridad || {};
        const persPorNivel = informe._personasPorNivel || {};
        const topP = informe._topPersonas || [];
        const herrNuevas = informe._herramientasNuevas || [];
        const totalCoste = informe._costeAnualTotal || 0;
        const cats = informe._categoriasHerr || [];

        const Section = ({ titulo, eyebrow, children }) => (
          <section className="px-10 py-12 border-t border-stone-200 print:break-before-page">
            <div className="max-w-3xl mx-auto">
              {eyebrow && <p className="eyebrow text-navy-800 mb-3" style={{ fontSize: '10px' }}>{eyebrow}</p>}
              <h2 className="magazine-serif text-4xl text-navy-900 mb-6 leading-tight" style={{ letterSpacing: '-0.02em', fontWeight: 600 }}>{titulo}</h2>
              <hr className="savills-rule w-32 mb-8" />
              {children}
            </div>
          </section>
        );

        const BarChart = ({ items, max, color = 'bg-navy-700' }) => (
          <div className="space-y-2">
            {items.map((it, i) => {
              const m = max || items.reduce((a, x) => Math.max(a, x.value), 0) || 1;
              const pct = (it.value / m) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-44 text-sm font-medium text-stone-700 truncate">{it.label}</span>
                  <div className="flex-1 h-7 bg-stone-100 rounded-md overflow-hidden">
                    <div className={`h-full ${color} flex items-center justify-end pr-2`} style={{ width: `${Math.max(2, pct)}%` }}>
                      {pct > 18 && <span className="text-xs font-bold text-stone-50">{it.value}</span>}
                    </div>
                  </div>
                  {pct <= 18 && <span className="text-xs font-bold text-navy-900 tabular-nums w-8">{it.value}</span>}
                </div>
              );
            })}
          </div>
        );

        const tipoEventoMeta = {
          avance: { color: 'bg-emerald-500', label: 'Avance' },
          hito: { color: 'bg-stone-700', label: 'Hito' },
          decision: { color: 'bg-blue-500', label: 'Decisión' },
          iniciativa: { color: 'bg-violet-500', label: 'Iniciativa' },
          riesgo: { color: 'bg-gold-500', label: 'Riesgo' },
          bloqueo: { color: 'bg-red-500', label: 'Bloqueo' },
          otros: { color: 'bg-stone-300', label: 'Otros' },
        };

        return (
          <div className="fixed inset-0 bg-navy-950/70 z-50 overflow-y-auto print:bg-white print:p-0 backdrop-blur-sm">
            <style>{`
              @media print {
                .no-print { display: none !important; }
                body { background: white !important; }
                .print\\:break-before-page { break-before: page; }
              }
              .magazine-serif { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.02em; }
            `}</style>

            <div className="no-print sticky top-0 bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center shadow-sm">
                  <span className="font-display text-stone-50 text-base font-bold">N</span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold-400 border-2 border-white"></span>
                </div>
                <div>
                  <p className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Informe ejecutivo</p>
                  <p className="text-sm font-bold text-navy-900">Actividad · últimos {periodoActual}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={imprimirInforme} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-navy-700 text-navy-900 rounded-md text-sm font-semibold transition-colors">
                  <FileText size={14} /> Imprimir / PDF
                </button>
                <button onClick={() => setAbierto(false)} className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-semibold transition-colors">
                  <X size={14} /> Cerrar
                </button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto bg-white shadow-2xl print:shadow-none my-8 print:my-0 rounded-2xl overflow-hidden print:rounded-none">

              {/* PORTADA */}
              <div className="relative px-10 pt-12 pb-10 bg-sand-50">
                <div className="flex items-center justify-between mb-10 text-stone-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gold-500"></div>
                    <p className="eyebrow text-navy-800" style={{ fontSize: '10px' }}>Informe Nexo</p>
                  </div>
                  <p className="text-xs font-medium tabular-nums">{fechaHoy}</p>
                </div>

                {informe.categoria && (
                  <p className="inline-block text-xs uppercase tracking-[0.18em] text-navy-700 font-bold mb-5 pb-1.5 border-b-2 border-gold-500">
                    {informe.categoria}
                  </p>
                )}

                <h1 className="magazine-serif text-5xl leading-[1.05] text-navy-900 mb-4 max-w-3xl" style={{ letterSpacing: '-0.02em' }}>{informe.titular}</h1>
                {informe.subtitular && (
                  <p className="text-lg text-stone-700 leading-relaxed max-w-2xl mb-8">{informe.subtitular}</p>
                )}

                <div className="flex items-center gap-4 text-sm pt-5 border-t border-stone-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-bold text-xs">CS</div>
                    <div>
                      <p className="text-navy-900 font-bold">Comité de seguimiento</p>
                      <p className="text-xs text-stone-500 font-medium">Plan Estratégico · Periodo {periodoActual}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESUMEN EJECUTIVO + KPIs */}
              <Section eyebrow="01 · Resumen ejecutivo" titulo="Pulso del periodo">
                {informe.lead && (
                  <p className="magazine-serif text-2xl leading-relaxed text-navy-900 mb-8 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.9] first-letter:text-gold-600">
                    {informe.lead}
                  </p>
                )}
                {informe.resumenEjecutivo && (
                  <p className="text-base leading-relaxed text-stone-800 mb-8">{informe.resumenEjecutivo}</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8 py-6 border-y border-stone-200">
                  {(informe.datos || []).map((d, idx) => (
                    <div key={idx} className="text-center">
                      <p className="kpi-number text-4xl text-navy-900 mb-2">{d.valor}</p>
                      <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">{d.etiqueta}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* TALLERES */}
              {tConDatos.length > 0 && (
                <Section eyebrow={`02 · Talleres (${tConDatos.length} con actividad)`} titulo="Análisis por taller">
                  <div className="space-y-8">
                    {tConDatos.slice(0, 8).map(t => {
                      const analisis = (informe.talleresAnalisis || []).find(x => x.id === t.id)?.narrativa;
                      const total = Object.values(t.eventosTipos).reduce((a, b) => a + b, 0);
                      return (
                        <div key={t.id} className="border-l-4 border-navy-900 pl-5 py-2">
                          <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                            <h3 className="magazine-serif text-2xl text-navy-900" style={{ fontWeight: 600 }}>{t.nombre}</h3>
                            <span className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>{t.area}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            <div><p className="kpi-number text-2xl text-navy-900">{t.eventos.length}</p><p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mt-1">Eventos</p></div>
                            <div><p className="kpi-number text-2xl text-navy-900">{t.tareasNuevas}</p><p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mt-1">Tareas nuevas</p></div>
                            <div><p className="kpi-number text-2xl text-emerald-700">{t.tareasCompletadas}</p><p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mt-1">Completadas</p></div>
                            <div><p className="kpi-number text-2xl text-gold-700">{t.completionRate}<span className="text-base">%</span></p><p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mt-1">Completion</p></div>
                          </div>
                          {total > 0 && (
                            <div className="flex h-2 rounded-full overflow-hidden bg-stone-100 mb-2">
                              {Object.entries(t.eventosTipos).map(([tipo, count]) => {
                                const meta = tipoEventoMeta[tipo] || tipoEventoMeta.otros;
                                return <div key={tipo} className={`h-full ${meta.color}`} style={{ width: `${(count/total)*100}%` }} title={`${meta.label}: ${count}`}></div>;
                              })}
                            </div>
                          )}
                          {total > 0 && (
                            <div className="flex items-center gap-3 text-[10px] text-stone-500 font-medium flex-wrap mb-3">
                              {Object.entries(t.eventosTipos).map(([tipo, count]) => {
                                const meta = tipoEventoMeta[tipo] || tipoEventoMeta.otros;
                                return <span key={tipo} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${meta.color}`}></span>{meta.label} ({count})</span>;
                              })}
                            </div>
                          )}
                          {t.topContribuyente && (
                            <p className="text-xs text-stone-600 mb-2"><span className="font-semibold text-navy-800">Top contribuyente:</span> {t.topContribuyente}</p>
                          )}
                          {analisis && <p className="text-sm leading-relaxed text-stone-800 mt-3">{analisis}</p>}
                        </div>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* PERSONAS */}
              <Section eyebrow={`03 · Personas (${stats.personas || 0} totales)`} titulo="Quién ha empujado el periodo">
                {topP.length > 0 ? (
                  <div className="mb-6">
                    <p className="eyebrow text-stone-500 mb-3" style={{ fontSize: '10px' }}>Top contribuyentes</p>
                    <BarChart items={topP.map(p => ({ label: p.nombre, value: p.count }))} color="bg-navy-700" />
                  </div>
                ) : <p className="text-sm text-stone-500 italic mb-6">No hay aportaciones registradas en el periodo.</p>}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="kpi-number text-3xl text-navy-900">{persPorNivel[1] || 0}</p>
                    <p className="text-xs text-stone-500 font-semibold mt-1">Nivel 1</p>
                    <p className="text-[10px] text-stone-400">Decisores</p>
                  </div>
                  <div className="text-center bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="kpi-number text-3xl text-navy-900">{persPorNivel[2] || 0}</p>
                    <p className="text-xs text-stone-500 font-semibold mt-1">Nivel 2</p>
                    <p className="text-[10px] text-stone-400">Operativos</p>
                  </div>
                  <div className="text-center bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="kpi-number text-3xl text-navy-900">{persPorNivel[3] || 0}</p>
                    <p className="text-xs text-stone-500 font-semibold mt-1">Nivel 3</p>
                    <p className="text-[10px] text-stone-400">Puntuales</p>
                  </div>
                </div>
                {informe.personasAnalisis && <p className="text-base leading-relaxed text-stone-800">{informe.personasAnalisis}</p>}
              </Section>

              {/* HERRAMIENTAS */}
              <Section eyebrow={`04 · Herramientas (${stats.herramientasCatalogo || 0} en catálogo)`} titulo="Catálogo y consolidación">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="text-center bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="kpi-number text-2xl text-emerald-800">{tHerrPorUso.muy_uso || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold mt-1">Muy en uso</p>
                  </div>
                  <div className="text-center bg-navy-50 border border-navy-100 rounded-lg p-3">
                    <p className="kpi-number text-2xl text-navy-800">{tHerrPorUso.uso_moderado || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-navy-700 font-semibold mt-1">Uso moderado</p>
                  </div>
                  <div className="text-center bg-gold-50 border border-gold-200 rounded-lg p-3">
                    <p className="kpi-number text-2xl text-gold-800">{tHerrPorUso.infrautilizada || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gold-700 font-semibold mt-1">Infrautilizadas</p>
                  </div>
                  <div className="text-center bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="kpi-number text-2xl text-red-800">{tHerrPorUso.sin_uso || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-red-700 font-semibold mt-1">Sin uso</p>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 mb-5">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p className="kpi-number text-3xl text-navy-900">{(totalCoste / 1000).toFixed(0)}k€</p>
                    <p className="text-sm text-stone-600 font-medium">coste anual del catálogo</p>
                  </div>
                  <p className="text-xs text-stone-500 mt-2 font-medium">{cats.length} {cats.length === 1 ? 'categoría' : 'categorías'}: {cats.slice(0, 6).join(' · ')}{cats.length > 6 ? '...' : ''}</p>
                </div>
                {herrNuevas.length > 0 && (
                  <div className="mb-5">
                    <p className="eyebrow text-stone-500 mb-2" style={{ fontSize: '10px' }}>Implementadas en el periodo</p>
                    <div className="space-y-1.5">
                      {herrNuevas.slice(0, 6).map(h => (
                        <div key={h.id} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-navy-900 font-semibold">{h.nombre}</span>
                          <span className="text-stone-500">· {h.categoria || 'Sin categoría'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {informe.herramientasAnalisis && <p className="text-base leading-relaxed text-stone-800">{informe.herramientasAnalisis}</p>}
              </Section>

              {/* TAREAS */}
              <Section eyebrow={`05 · Tareas (${stats.tareasAbiertas || 0} abiertas)`} titulo="Productividad del periodo">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-red-800">{tareasPri.alta || 0}</p>
                    <p className="text-xs uppercase tracking-wider text-red-700 font-semibold mt-1">Alta prioridad</p>
                  </div>
                  <div className="text-center bg-gold-50 border border-gold-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-gold-800">{tareasPri.media || 0}</p>
                    <p className="text-xs uppercase tracking-wider text-gold-700 font-semibold mt-1">Media</p>
                  </div>
                  <div className="text-center bg-stone-50 border border-stone-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-stone-700">{tareasPri.baja || 0}</p>
                    <p className="text-xs uppercase tracking-wider text-stone-600 font-semibold mt-1">Baja</p>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200 mb-5">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <p className="text-xs uppercase tracking-wider text-stone-500 font-bold">Ratio de cierre del periodo</p>
                    <p className="kpi-number text-2xl text-emerald-700">{stats.tareasNuevas > 0 ? Math.round((stats.tareasCompletadas / Math.max(stats.tareasNuevas, 1)) * 100) : 0}%</p>
                  </div>
                  <p className="text-xs text-stone-600 font-medium">{stats.tareasCompletadas || 0} cerradas de {stats.tareasNuevas || 0} creadas</p>
                </div>
                {informe.tareasAnalisis && <p className="text-base leading-relaxed text-stone-800">{informe.tareasAnalisis}</p>}
              </Section>

              {/* REUNIONES */}
              <Section eyebrow="06 · Reuniones" titulo="Cadencia y seguimiento">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-navy-50 border border-navy-100 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-navy-800">{reuPorEstado.programadas || 0}</p>
                    <p className="text-xs uppercase tracking-wider text-navy-700 font-semibold mt-1">Programadas</p>
                  </div>
                  <div className="text-center bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-emerald-800">{reuPorEstado.finalizadas || 0}</p>
                    <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mt-1">Finalizadas</p>
                  </div>
                  <div className="text-center bg-gold-50 border border-gold-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-gold-800">{reuPorEstado.por_programar || 0}</p>
                    <p className="text-xs uppercase tracking-wider text-gold-700 font-semibold mt-1">Por programar</p>
                  </div>
                </div>
                {informe.reunionesAnalisis && <p className="text-base leading-relaxed text-stone-800">{informe.reunionesAnalisis}</p>}
              </Section>

              {/* CONFLICTOS */}
              <Section eyebrow="07 · Conflictos" titulo="Coordinación y consolidación">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-red-800">{tConflActivos.length}</p>
                    <p className="text-xs uppercase tracking-wider text-red-700 font-semibold mt-1">Activos</p>
                  </div>
                  <div className="text-center bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="kpi-number text-3xl text-emerald-800">{tConflResueltos.length}</p>
                    <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mt-1">Resueltos</p>
                  </div>
                </div>
                {tConflActivos.slice(0, 4).length > 0 && (
                  <div className="mb-5 space-y-2">
                    <p className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Activos clave</p>
                    {tConflActivos.slice(0, 4).map(c => (
                      <div key={c.id} className="flex items-start gap-2 p-3 bg-red-50/40 border border-red-100 rounded-md">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.riesgo === 'alto' ? 'bg-red-500' : c.riesgo === 'medio' ? 'bg-gold-500' : 'bg-stone-400'}`}></span>
                        <p className="text-sm text-stone-800 leading-snug"><span className="font-bold text-navy-900">{c.titulo}</span> · riesgo {c.riesgo}</p>
                      </div>
                    ))}
                  </div>
                )}
                {informe.conflictosAnalisis && <p className="text-base leading-relaxed text-stone-800">{informe.conflictosAnalisis}</p>}
              </Section>

              {/* PRÓXIMOS HITOS + CITA + CALLOUT */}
              <Section eyebrow="08 · Mirando adelante" titulo="Próximos hitos y prioridades">
                {informe.proximosHitos && <p className="text-base leading-relaxed text-stone-800 mb-8">{informe.proximosHitos}</p>}

                {informe.cita && (
                  <div className="my-8 px-8 py-2 border-l-4 border-gold-500">
                    <p className="magazine-serif text-3xl leading-snug text-navy-900 italic mb-3" style={{ fontWeight: 600 }}>"{informe.cita}"</p>
                    {informe.citaAutor && (
                      <p className="text-sm text-stone-500 uppercase tracking-widest font-semibold">— {informe.citaAutor}</p>
                    )}
                  </div>
                )}

                {informe.callout && (
                  <div className="my-8 p-6 bg-gradient-to-br from-navy-50 to-gold-50/40 border border-stone-200/60 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gold-500"></div>
                      <p className="eyebrow text-navy-800" style={{ fontSize: '10px' }}>Llamada a la acción</p>
                    </div>
                    <p className="magazine-serif text-2xl text-navy-900 leading-snug" style={{ fontWeight: 600 }}>{informe.callout}</p>
                  </div>
                )}

                {Array.isArray(informe.etiquetas) && informe.etiquetas.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-stone-200 flex items-center gap-2 flex-wrap">
                    <span className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Etiquetas</span>
                    {informe.etiquetas.map(e => (
                      <span key={e} className="text-xs bg-navy-50 text-navy-800 border border-navy-100 px-2.5 py-1 rounded-md font-semibold">{e}</span>
                    ))}
                  </div>
                )}
              </Section>

              <div className="bg-navy-900 text-stone-400 px-10 py-5 flex items-center justify-between text-[10px]">
                <p className="uppercase tracking-widest">Nexo · Plan Estratégico</p>
                <p className="uppercase tracking-widest">Periodo {periodoActual} · Comité de seguimiento</p>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

function AsistenteGuia({ talleres, personas, tareas, historico, iniciativas, peticiones, herramientas, solapamientos, reuniones, convocatorias, usuarioActualId, setTareas, setHistorico, setIniciativas, setPeticiones, setHerramientas, setActive, irATaller, active }) {
  const [input, setInput] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [historial, setHistorial] = useState([]); // { role: 'user'|'asistente', content, action? }
  const [pendiente, setPendiente] = useState(null); // { entidad, campos } cuando hay un flujo de creación abierto
  const [escuchando, setEscuchando] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const recognitionRef = useRef(null);
  const chatContainerRef = useRef(null);

  const ejemplos = [
    '¿Qué quieres hacer?',
    'Llévame a tareas',
    '¿Qué tareas tengo pendientes?',
    'Crea una tarea para María: revisar contrato',
    'Apunta una petición de Retail: dashboard de pipeline',
  ];

  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx(i => (i + 1) % ejemplos.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Voz
  useEffect(() => {
    const SR = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) return;
    const r = new SR();
    r.lang = 'es-ES';
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setEscuchando(false);
    };
    r.onerror = () => setEscuchando(false);
    r.onend = () => setEscuchando(false);
    recognitionRef.current = r;
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [historial.length, procesando]);

  const toggleVoz = () => {
    if (!recognitionRef.current) {
      addAsistente({ texto: 'Tu navegador no soporta reconocimiento de voz. Prueba Chrome o Edge.' });
      return;
    }
    if (escuchando) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setEscuchando(false);
    } else {
      try { recognitionRef.current.start(); setEscuchando(true); } catch (e) { setEscuchando(false); }
    }
  };

  const addAsistente = (data) => {
    setHistorial(h => [...h, { role: 'asistente', ...data }]);
  };

  const usuarioActual = personas.find(p => p.id === usuarioActualId);

  // Resúmenes que el frontend computa para consultas
  const resumenes = {
    mis_tareas: () => {
      const mis = tareas.filter(t => t.personaId === usuarioActualId && t.estado === 'pendiente');
      const altas = mis.filter(t => t.prioridad === 'alta').length;
      return { texto: `Tienes ${mis.length} ${mis.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}${altas > 0 ? `, ${altas} de alta prioridad` : ''}.`, modulo: 'mis-tareas' };
    },
    tareas_abiertas: () => {
      const abiertas = tareas.filter(t => t.estado === 'pendiente').length;
      return { texto: `Hay ${abiertas} tareas abiertas en el sistema.`, modulo: 'tareas' };
    },
    conflictos_abiertos: () => {
      const activos = (solapamientos || []).filter(s => s.estado === 'activo');
      const altos = activos.filter(s => s.riesgo === 'alto').length;
      return { texto: `Hay ${activos.length} conflictos activos${altos > 0 ? `, ${altos} de riesgo alto` : ''}.`, modulo: 'solapamientos' };
    },
    reuniones_semana: () => {
      const ahora = new Date();
      const en7 = new Date(ahora.getTime() + 7 * 86400000);
      const proximas = (reuniones || []).filter(r => r.fecha && new Date(r.fecha) >= ahora && new Date(r.fecha) <= en7);
      return { texto: `Tienes ${proximas.length} ${proximas.length === 1 ? 'reunión esta semana' : 'reuniones esta semana'}.`, modulo: 'reuniones' };
    },
    talleres_total: () => ({ texto: `Hay ${talleres.length} talleres activos en el Plan Estratégico.`, modulo: 'talleres' }),
    herramientas_total: () => ({ texto: `Hay ${herramientas.length} herramientas en el catálogo.`, modulo: 'herramientas' }),
    peticiones_buzon: () => {
      const nuevas = (peticiones || []).filter(p => p.estado === 'nueva').length;
      return { texto: `Hay ${nuevas} peticiones nuevas en el buzón.`, modulo: 'peticiones' };
    },
  };

  const ejecutar = async () => {
    if (!input.trim() || procesando) return;
    const userMsg = input.trim();
    setInput('');
    setHistorial(h => [...h, { role: 'user', content: userMsg }]);
    setProcesando(true);

    const personasCtx = personas.slice(0, 30).map(p => `- "${p.nombre}" (id: ${p.id})`).join('\n');
    const talleresCtx = talleres.map(t => `- "${t.nombre}" (id: ${t.id})`).join('\n');

    const stats = {
      misTareasPendientes: tareas.filter(t => t.personaId === usuarioActualId && t.estado === 'pendiente').length,
      conflictosActivos: (solapamientos || []).filter(s => s.estado === 'activo').length,
      talleresTotal: talleres.length,
      herramientasTotal: herramientas.length,
      peticionesNuevas: (peticiones || []).filter(p => p.estado === 'nueva').length,
    };

    const ctxPendiente = pendiente
      ? `\n\nFLUJO ABIERTO: estás recogiendo datos para crear una ${pendiente.entidad}. Datos ya recogidos: ${JSON.stringify(pendiente.campos)}.`
      : '';

    const systemPrompt = `Eres asistente operativo de Nexo, herramienta de coordinación del Plan Estratégico.
Devuelves SOLO un objeto JSON válido sin markdown ni explicación.

USUARIO ACTUAL: "${usuarioActual?.nombre || 'desconocido'}" (id: ${usuarioActualId})
MÓDULO ACTIVO: ${active}
STATS: ${JSON.stringify(stats)}

PERSONAS:
${personasCtx}

TALLERES:
${talleresCtx}${ctxPendiente}

INTENCIONES POSIBLES (usa la que mejor encaje):
1. "navegar" — el usuario quiere ir a un módulo. datos: { modulo: "dashboard"|"mis-tareas"|"reuniones"|"talleres"|"personas"|"innovacion"|"peticiones"|"solapamientos"|"herramientas"|"tareas", tallerId? }
2. "consultar" — pregunta sobre datos. datos: { tipo: "mis_tareas"|"tareas_abiertas"|"conflictos_abiertos"|"reuniones_semana"|"talleres_total"|"herramientas_total"|"peticiones_buzon" }
3. "crear_tarea" — datos: { tarea, personaId, tallerId, prioridad: "alta"|"media"|"baja", deadline }
   OBLIGATORIO: tallerId. Si no se especifica el taller, devuelve "preguntar" con "¿A qué taller pertenece esta tarea?".
   OBLIGATORIO: la "tarea" debe ser un detalle accionable de mínimo 4 palabras (ej: "revisar contrato del cliente X" o "preparar minuta del comité"). Si el usuario solo dice "crea una tarea para mí en innovación" sin detalle de qué hacer, devuelve "preguntar" con "¿En qué consiste exactamente la tarea? Aunque sea un recordatorio breve, dame algo de detalle." y guarda el resto de campos en campos_recogidos.
4. "crear_reunion" — datos: { titulo, fecha (YYYY-MM-DD), hora?, asistentes (array de personaId), agenda? (array de strings), notas? }
5. "actualizar_taller" — datos: { tallerId, tipo: "avance"|"hito"|"decision"|"riesgo"|"bloqueo"|"iniciativa", titulo, descripcion }
6. "crear_iniciativa" — datos: { titulo, descripcion, tallerId?, autorId }
7. "crear_peticion" — datos: { titulo, descripcion, equipo, tipoSolicitud: "herramienta_nueva"|"mejora_herramienta"|"mejora_proceso"|"contratar_perfil", prioridad, solicitanteId }
8. "crear_herramienta" — datos: { nombre, descripcion, categorias (array), funcionalidades (array), areas (array), licenciasContratadas, costePorLicencia }
9. "preguntar" — falta un dato crítico para una creación. datos: { entidad: "tarea"|"reunion"|"herramienta"|"iniciativa"|"peticion", campos_recogidos: {...}, falta: "nombre del campo", pregunta: "¿...?" }
10. "responder" — solo conversación. datos: { texto }

REGLAS:
- "para mí" / "yo" → personaId = "${usuarioActualId}".
- Resuelve nombres de personas/talleres a sus IDs.
- Si el usuario está en un módulo, usa ese contexto (ej: en talleres, "actualiza esto" se refiere al taller activo).
- Si faltan datos críticos para crear (ej: a quién asignar una tarea), devuelve "preguntar" con la siguiente pregunta clara y corta.
- Si todos los campos están listos, ejecuta la acción de crear.
- Para "navegar" no preguntes, solo navega.
- Para "consultar" devuelve solo el tipo.
- "mensaje" siempre breve y en lenguaje natural.

Devuelve EXACTAMENTE: { "intencion": "...", "datos": {...}, "mensaje": "..." }`;

    const respuesta = await callClaude(systemPrompt, `INPUT: "${userMsg}"`);

    if (typeof respuesta === 'string' && (respuesta.startsWith('Error') || respuesta.startsWith('No he podido'))) {
      addAsistente({ texto: 'Error: ' + respuesta });
      setProcesando(false);
      return;
    }

    try {
      const m = respuesta.match(/\{[\s\S]*\}/);
      if (!m) throw new Error('respuesta sin JSON');
      const parsed = JSON.parse(m[0]);
      const intencion = parsed.intencion;
      const datos = parsed.datos || {};
      const mensaje = parsed.mensaje || '';

      if (intencion === 'navegar' && datos.modulo) {
        if (datos.tallerId && irATaller) {
          irATaller(datos.tallerId);
        } else {
          setActive(datos.modulo);
        }
        addAsistente({ texto: mensaje || `Te llevo a ${datos.modulo}.`, action: 'navegar' });
      }
      else if (intencion === 'consultar' && datos.tipo && resumenes[datos.tipo]) {
        const r = resumenes[datos.tipo]();
        addAsistente({ texto: r.texto, modulo: r.modulo, action: 'consultar' });
      }
      else if (intencion === 'consultar') {
        addAsistente({ texto: mensaje || 'No tengo ese dato concreto. Mira en el módulo correspondiente.' });
      }
      else if (intencion === 'preguntar' && datos.pregunta) {
        setPendiente({ entidad: datos.entidad, campos: datos.campos_recogidos || {} });
        addAsistente({ texto: datos.pregunta, action: 'preguntar' });
      }
      else if (intencion === 'crear_tarea' && datos.tarea) {
        const detalleTarea = (datos.tarea || '').trim();
        if (!detalleTarea || detalleTarea.split(/\s+/).length < 3) {
          setPendiente({ entidad: 'tarea', campos: { ...datos, tarea: undefined } });
          addAsistente({ texto: '¿En qué consiste exactamente la tarea? Aunque sea un recordatorio corto, dame algún detalle para guardarla bien.', action: 'preguntar' });
          setProcesando(false);
          return;
        }
        if (!datos.tallerId) {
          setPendiente({ entidad: 'tarea', campos: { ...datos } });
          addAsistente({ texto: '¿A qué taller pertenece esta tarea? Dime el nombre del taller para guardarla bien.', action: 'preguntar' });
          setProcesando(false);
          return;
        }
        const nueva = {
          id: `ta-ag-${Date.now()}`,
          tarea: datos.tarea,
          personaId: datos.personaId || usuarioActualId,
          tallerId: datos.tallerId,
          creadorId: usuarioActualId,
          deadline: datos.deadline || 'Sin fecha',
          estado: 'pendiente',
          prioridad: datos.prioridad || 'media',
          fechaCreacion: new Date().toISOString(),
        };
        await setTareas([...tareas, nueva]);
        setPendiente(null);
        addAsistente({ texto: mensaje || 'Tarea creada.', modulo: 'mis-tareas', action: 'creado' });
      }
      else if (intencion === 'crear_reunion' && datos.titulo) {
        const nueva = {
          id: `r-ag-${Date.now()}`,
          titulo: datos.titulo,
          fecha: datos.fecha || null,
          hora: datos.hora || null,
          asistentes: datos.asistentes || [],
          estado: 'borrador',
          notas: datos.notas || '',
          agenda: datos.agenda || [],
          ideas: [],
        };
        await (typeof window !== 'undefined' && window.__setReuniones) ?? null;
        addAsistente({ texto: 'Pendiente de wiring: paso reuniones al asistente. Crea la reunión manualmente en el módulo.', modulo: 'reuniones' });
      }
      else if (intencion === 'actualizar_taller' && datos.tallerId) {
        const evento = {
          id: `e-ag-${Date.now()}`,
          tallerId: datos.tallerId,
          fecha: new Date().toISOString().slice(0, 10),
          tipo: datos.tipo || 'avance',
          titulo: datos.titulo,
          descripcion: datos.descripcion,
          autorId: usuarioActualId,
        };
        await setHistorico([...historico, evento]);
        setPendiente(null);
        addAsistente({ texto: mensaje || 'Actualización añadida al taller.', modulo: 'talleres', tallerId: datos.tallerId, action: 'creado' });
      }
      else if (intencion === 'crear_iniciativa' && datos.titulo) {
        const taller = talleres.find(t => t.id === datos.tallerId);
        const autor = personas.find(p => p.id === (datos.autorId || usuarioActualId));
        const nueva = {
          id: `i-ag-${Date.now()}`,
          titulo: datos.titulo,
          descripcion: datos.descripcion || '',
          autorId: datos.autorId || usuarioActualId,
          tallerId: datos.tallerId || null,
          area: taller?.area || 'Transversal',
          autor: autor?.nombre || 'Sin asignar',
          estado: 'Nueva',
        };
        await setIniciativas([...iniciativas, nueva]);
        setPendiente(null);
        addAsistente({ texto: mensaje || 'Iniciativa registrada.', modulo: 'innovacion', action: 'creado' });
      }
      else if (intencion === 'crear_peticion' && datos.titulo) {
        const nueva = {
          id: `pet-ag-${Date.now()}`,
          titulo: datos.titulo,
          descripcion: datos.descripcion || '',
          equipo: datos.equipo || 'Sin especificar',
          solicitanteId: datos.solicitanteId || usuarioActualId,
          tipoSolicitud: datos.tipoSolicitud || 'herramienta_nueva',
          prioridad: datos.prioridad || 'media',
          estado: 'nueva',
          tallerAsignadoId: null,
          fecha: new Date().toISOString().slice(0, 10),
          evaluacion: null,
          impactoEstimado: null,
          funcionalidades: datos.funcionalidades || [],
        };
        await setPeticiones([...(peticiones || []), nueva]);
        setPendiente(null);
        addAsistente({ texto: mensaje || 'Petición añadida al buzón.', modulo: 'peticiones', action: 'creado' });
      }
      else if (intencion === 'crear_herramienta' && datos.nombre && setHerramientas) {
        const cats = Array.isArray(datos.categorias) ? datos.categorias : [];
        const lic = Number(datos.licenciasContratadas) || 1;
        const cl = Number(datos.costePorLicencia) || 0;
        const nueva = {
          id: `h-ag-${Date.now()}`,
          nombre: datos.nombre,
          descripcion: datos.descripcion || '',
          categoria: cats.length > 0 ? cats.join(', ') : 'Sin categoría',
          funcionalidades: datos.funcionalidades || [],
          areas: datos.areas || [],
          licenciasContratadas: lic,
          licenciasActivas: 0,
          costeAnual: cl * lic,
          alerta: null,
          fechaAlta: new Date().toISOString().slice(0, 10),
        };
        await setHerramientas([...(herramientas || []), nueva]);
        setPendiente(null);
        addAsistente({ texto: mensaje || `Herramienta "${datos.nombre}" añadida al catálogo.`, modulo: 'herramientas', action: 'creado' });
      }
      else if (intencion === 'responder') {
        addAsistente({ texto: datos.texto || mensaje || 'Aquí estoy.' });
      }
      else {
        addAsistente({ texto: mensaje || 'No he entendido. Prueba a ser más específico.' });
      }
    } catch (e) {
      addAsistente({ texto: 'Error procesando: ' + e.message });
    }
    setProcesando(false);
  };

  const limpiarChat = () => { setHistorial([]); setPendiente(null); };

  return (
    <div className="relative bg-white border border-stone-200/80 rounded-3xl p-8 mb-8 shadow-sm overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gold-100/40 via-navy-50/30 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gold-100/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 flex items-center justify-center shadow-md shadow-navy-900/10">
              <Sparkles size={18} className="text-gold-400" />
            </div>
            <p className="eyebrow text-navy-800" style={{ fontSize: '11px' }}>Asistente Nexo · Operativo + Voz</p>
          </div>
          {historial.length > 0 && (
            <button onClick={limpiarChat} className="text-xs text-stone-500 hover:text-navy-900 font-medium flex items-center gap-1">
              <X size={12} /> Limpiar
            </button>
          )}
        </div>

        <h2 className="font-display text-navy-900 mb-2 leading-none" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 500, letterSpacing: '-0.02em' }}>¿Qué quieres hacer?</h2>
        <p className="text-base text-stone-600 mb-6 max-w-2xl leading-relaxed">Háblame en lenguaje natural — escribiendo o por voz. Puedo crear tareas, navegar, responder consultas, registrar peticiones, herramientas o reuniones.</p>

        {/* Conversación */}
        {historial.length > 0 && (
          <div ref={chatContainerRef} className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-4 max-h-72 overflow-y-auto space-y-3">
            {historial.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.role === 'user' ? 'bg-navy-900 text-stone-50 rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed">{m.content || m.texto}</p>
                  {m.role === 'asistente' && m.modulo && (
                    <button onClick={() => { if (m.tallerId && irATaller) irATaller(m.tallerId); else setActive(m.modulo); }} className="mt-2 text-xs font-bold text-navy-700 hover:text-navy-900 flex items-center gap-1">
                      Ir al módulo <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {procesando && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
                  <Loader2 size={14} className="animate-spin text-navy-700" />
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center gap-2 bg-stone-50/80 border-2 rounded-2xl p-2 transition-all ${escuchando ? 'border-red-500 bg-red-50/50' : 'border-stone-200 focus-within:border-navy-700 focus-within:bg-white focus-within:shadow-md'}`}>
          <button
            onClick={toggleVoz}
            className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${escuchando ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-stone-200 text-navy-700 hover:bg-navy-50 hover:border-navy-700'}`}
            title={escuchando ? 'Escuchando...' : 'Hablar'}
          >
            <Mic size={18} />
          </button>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') ejecutar(); }}
            placeholder={escuchando ? 'Escuchando...' : ejemplos[placeholderIdx]}
            disabled={procesando}
            className="flex-1 bg-transparent text-lg text-navy-900 placeholder:text-stone-400 outline-none px-2 py-3 font-medium"
          />
          <button
            onClick={ejecutar}
            disabled={!input.trim() || procesando}
            className="px-6 py-3 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 disabled:text-stone-500 text-stone-50 rounded-xl text-base font-semibold transition-all flex items-center gap-2 shadow-md"
          >
            {procesando ? <><Loader2 size={16} className="animate-spin" /></> : <ArrowRight size={18} />}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm flex-wrap">
          <span className="text-stone-500 font-medium">Prueba:</span>
          <button onClick={() => setInput('¿Qué tareas tengo?')} className="text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-1 rounded-md font-semibold transition-colors">Mis tareas</button>
          <span className="text-stone-300">·</span>
          <button onClick={() => setInput('Llévame a conflictos')} className="text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-1 rounded-md font-semibold transition-colors">Ir a conflictos</button>
          <span className="text-stone-300">·</span>
          <button onClick={() => setInput('Crea una tarea para Coordinador Nexo: enviar minuta del comité')} className="text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-1 rounded-md font-semibold transition-colors">+ Tarea</button>
          <span className="text-stone-300">·</span>
          <button onClick={() => setInput('Cuántos conflictos hay abiertos')} className="text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-3 py-1 rounded-md font-semibold transition-colors">Conflictos</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ talleres, herramientas, setHerramientas, tareas, setTareas, iniciativas, setIniciativas, personas, historico, setHistorico, solapamientos, convocatorias, setConvocatorias, peticiones, setPeticiones, reuniones, usuarioActualId, setActive, irATaller, session, active }) {
  const tareasAbiertas = tareas.filter(t => t.estado === 'pendiente').length;
  const solapamientosActivos = (solapamientos || []).filter(s => s.estado === 'activo').length;
  const diasAlHito = 15;

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const actividadReciente = [...historico]
    .sort((a, b) => b.fecha.localeCompare(a.fecha))
    .slice(0, 5);

  return (
    <div className="p-8 w-full">
      <header className="mb-8 flex items-start justify-between gap-6 flex-wrap">
        <div>
          <p className="eyebrow text-navy-800 mb-3">Resumen</p>
          <h1 className="display-1 text-navy-900 mb-3">Buenos días</h1>
          <hr className="savills-rule w-32 mb-4" />
          <p className="text-base text-stone-600 leading-relaxed">Tu pulso del Plan Estratégico, hoy.</p>
        </div>
        {session && (() => {
          const inicial = `${session.nombre || ''} ${session.apellidos || ''}`.trim().split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'N';
          const fechaAcceso = session.loginAt ? new Date(session.loginAt) : new Date();
          const fechaTxt = fechaAcceso.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
          const horaTxt = fechaAcceso.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          return (
            <div className="flex items-center gap-3 bg-white border border-stone-200/80 rounded-xl px-4 py-3 shadow-sm">
              <div className="relative w-10 h-10 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {inicial}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-navy-900 leading-tight">{session.nombre} {session.apellidos}</p>
                <p className="text-xs text-stone-500 mt-0.5 font-medium tabular-nums">Último acceso · {fechaTxt} · {horaTxt}</p>
              </div>
            </div>
          );
        })()}
      </header>

      <AsistenteGuia
        talleres={talleres}
        personas={personas}
        tareas={tareas}
        historico={historico}
        iniciativas={iniciativas}
        peticiones={peticiones}
        herramientas={herramientas}
        solapamientos={solapamientos}
        reuniones={reuniones}
        convocatorias={convocatorias}
        usuarioActualId={usuarioActualId}
        setTareas={setTareas}
        setHistorico={setHistorico}
        setIniciativas={setIniciativas}
        setPeticiones={setPeticiones}
        setHerramientas={setHerramientas}
        setActive={setActive}
        irATaller={irATaller}
        active={active}
      />

      <InformeMensual
        talleres={talleres}
        tareas={tareas}
        historico={historico}
        reuniones={reuniones}
        solapamientos={solapamientos}
        peticiones={peticiones}
        iniciativas={iniciativas}
        herramientas={herramientas}
        personas={personas}
      />

      <ConvocatoriasDestacadas
        convocatorias={convocatorias}
        setConvocatorias={setConvocatorias}
        personas={personas}
        usuarioActualId={usuarioActualId}
      />

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric
          label="Talleres"
          value={talleres.length}
          onClick={() => setActive('talleres')}
          tooltip="Talleres activos del Plan Estratégico que coordina el comité de seguimiento. Pulsa para ver el detalle de cada uno."
        />
        <Metric
          label="Tareas abiertas"
          value={tareasAbiertas}
          onClick={() => setActive('tareas')}
          tooltip="Total de tareas pendientes en todos los talleres y áreas. Pulsa para ver el kanban completo."
        />
        <Metric
          label="Conflictos"
          value={solapamientosActivos}
          accent={solapamientosActivos > 0 ? 'amber' : 'emerald'}
          onClick={() => setActive('solapamientos')}
          tooltip="Conflictos activos entre talleres, herramientas o iniciativas que duplican esfuerzo o chocan técnicamente. Función clave del nexo: levantar la mano cuando dos áreas trabajan en lo mismo sin saberlo."
        />
        {(() => {
          const misTareasCurso = tareas.filter(t => t.personaId === usuarioActualId && t.estado === 'pendiente').length;
          const misAltas = tareas.filter(t => t.personaId === usuarioActualId && t.estado === 'pendiente' && t.prioridad === 'alta').length;
          return (
            <Metric
              label="Mis tareas en curso"
              value={misTareasCurso}
              accent={misAltas > 0 ? 'red' : 'emerald'}
              hint={misAltas > 0 ? `${misAltas} de alta prioridad` : 'al día'}
              onClick={() => setActive('mis-tareas')}
              tooltip="Tareas pendientes asignadas a la persona con sesión activa. Cambia el usuario abajo en la barra lateral para ver las de otros."
            />
          );
        })()}
      </div>

      {(() => {
        const saludByTaller = talleres.map(t => {
          const eventos = historico.filter(e => e.tallerId === t.id);
          const conteoTipos = {};
          eventos.forEach(e => { conteoTipos[e.tipo] = (conteoTipos[e.tipo] || 0) + 1; });
          const riesgos = (conteoTipos.riesgo || 0) + (conteoTipos.bloqueo || 0);
          const avances = conteoTipos.avance || 0;
          const tareasT = tareas.filter(ta => ta.tallerId === t.id && ta.estado === 'pendiente').length;
          const tareasComp = tareas.filter(ta => ta.tallerId === t.id && ta.estado === 'completada').length;
          const tareasTotalT = tareasT + tareasComp;
          const progreso = tareasTotalT > 0 ? (tareasComp / tareasTotalT) * 100 : (avances > 0 ? Math.min(avances * 20, 100) : 0);
          let salud = 'verde';
          if (riesgos >= 2) salud = 'rojo';
          else if (riesgos === 1 || tareasT > 5) salud = 'amber';
          else if (eventos.length === 0) salud = 'gris';
          return { ...t, salud, eventos: eventos.length, riesgos, avances, tareasAbiertas: tareasT, tareasCompletadas: tareasComp, progreso };
        });
        const verdes = saludByTaller.filter(t => t.salud === 'verde').length;
        const ambers = saludByTaller.filter(t => t.salud === 'amber').length;
        const rojos = saludByTaller.filter(t => t.salud === 'rojo').length;
        const grises = saludByTaller.filter(t => t.salud === 'gris').length;
        const total = talleres.length || 1;
        const porcentajeSano = Math.round((verdes / total) * 100);

        const segments = [
          { count: verdes, color: '#7fb89e', cssBg: 'bg-emerald-400', label: 'Saludables', textColor: 'text-emerald-800', borderColor: 'border-emerald-200', bgSoft: 'bg-emerald-50/80' },
          { count: ambers, color: '#e6c66f', cssBg: 'bg-gold-400', label: 'Vigilar', textColor: 'text-gold-800', borderColor: 'border-gold-200', bgSoft: 'bg-gold-50/80' },
          { count: rojos, color: '#d68a82', cssBg: 'bg-red-400', label: 'Atención', textColor: 'text-red-800', borderColor: 'border-red-200', bgSoft: 'bg-red-50/80' },
          { count: grises, color: '#d4d2cd', cssBg: 'bg-stone-300', label: 'Sin actividad', textColor: 'text-stone-700', borderColor: 'border-stone-200', bgSoft: 'bg-stone-50' },
        ];

        const dotColor = {
          verde: 'bg-emerald-400',
          amber: 'bg-gold-400',
          rojo: 'bg-red-400',
          gris: 'bg-stone-300',
        };
        const bgColor = {
          verde: 'bg-emerald-400',
          amber: 'bg-gold-400',
          rojo: 'bg-red-400',
          gris: 'bg-stone-300',
        };

        const segmentMeta = {
          Saludables: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', accent: 'text-emerald-600' },
          Vigilar: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', accent: 'text-amber-600' },
          Atención: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', accent: 'text-red-600' },
          'Sin actividad': { bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700', accent: 'text-stone-500' },
        };

        return (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
                  <Activity size={16} className="text-gold-600" />
                  Estado del Plan Estratégico
                </h3>
                <p className="text-sm text-stone-600 mt-1 font-medium">Salud y progreso de los {total} talleres activos</p>
              </div>
              <button onClick={() => setActive('talleres')} className="text-sm text-navy-800 hover:text-navy-900 font-medium flex items-center gap-1">
                Ver todos <ChevronRight size={14} />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-sand-50 via-white to-navy-50/20 border border-stone-200/60 mb-6">
              <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
                <div>
                  <p className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Pulso global</p>
                  <div className="flex items-baseline gap-3 mt-1">
                    <p className="kpi-number text-5xl text-navy-900">{porcentajeSano}<span className="text-2xl text-stone-400">%</span></p>
                    <p className="text-base text-stone-600 font-medium">saludable · {verdes} de {total} talleres en buen estado</p>
                  </div>
                </div>
              </div>

              <div className="flex h-5 rounded-full overflow-hidden bg-stone-100 shadow-inner mb-4">
                {segments.filter(s => s.count > 0).map(s => (
                  <div
                    key={s.label}
                    className="h-full transition-all relative group"
                    style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
                    title={`${s.label}: ${s.count} taller${s.count !== 1 ? 'es' : ''}`}
                  >
                    {(s.count / total) >= 0.08 && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-stone-900/80">{s.count}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {segments.map(s => (
                  <div key={s.label} className={`relative bg-white border ${s.borderColor} rounded-xl p-4 overflow-hidden`}>
                    <div className={`absolute top-0 left-0 right-0 h-1 ${s.cssBg}`}></div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
                      <span className={`text-sm font-bold ${s.textColor} tracking-tight`}>{s.label}</span>
                    </div>
                    <p className={`kpi-number text-5xl ${s.textColor}`}>{s.count}</p>
                    <p className="text-xs text-stone-500 mt-1 font-medium">{Math.round((s.count / total) * 100)}% del total</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="eyebrow text-navy-800">Detalle por taller</p>
              <p className="text-xs text-stone-400 font-medium">{total} talleres</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {saludByTaller.map(t => (
                <button
                  key={t.id}
                  onClick={() => irATaller(t.id)}
                  className="text-left bg-white hover:border-navy-700 hover:shadow-md border border-stone-200 rounded-lg overflow-hidden transition-all group"
                >
                  <div className={`h-1 ${bgColor[t.salud]}`}></div>
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-medium text-stone-900 leading-snug line-clamp-2 min-h-[2.25rem]">{t.nombre}</p>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${dotColor[t.salud]}`}></div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full transition-all ${bgColor[t.salud]}`}
                          style={{ width: `${Math.max(3, t.progreso)}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-stone-500 font-medium tabular-nums">{Math.round(t.progreso)}%</span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-stone-500">
                      <span className={`flex items-center gap-0.5 ${t.riesgos > 0 ? 'text-amber-700' : ''}`}>
                        <AlertOctagon size={9} /> {t.riesgos}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <CheckSquare size={9} /> {t.tareasAbiertas}
                      </span>
                      <span className="ml-auto">{t.eventos} ev.</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card title="Talleres con alerta">
          {talleres.filter(t => ['Innovación', 'Gobierno de licencias'].includes(t.nombre)).map(t => (
            <button
              key={t.id}
              onClick={(e) => { e.stopPropagation(); irATaller(t.id); }}
              className="w-full text-left flex items-center gap-3 py-2 border-b border-stone-100 last:border-0 hover:bg-navy-50/50 -mx-2 px-2 rounded transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900">{t.nombre}</p>
                <p className="text-xs text-stone-500">{t.lider}{t.diaADia ? ` · día a día ${t.diaADia}` : ''}</p>
              </div>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Solapa</span>
            </button>
          ))}
        </Card>

        <Card title="Licencias infrautilizadas" onClick={() => setActive('herramientas')}>
          {herramientas.filter(h => h.alerta === 'Infrautilizada').map(h => {
            const pct = Math.round(((h.licenciasContratadas - h.licenciasActivas) / h.licenciasContratadas) * 100);
            return (
              <div key={h.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900">{h.nombre}</p>
                  <p className="text-xs text-stone-500">{h.licenciasContratadas - h.licenciasActivas} sin uso · {h.costeAnual.toLocaleString()}€/año</p>
                </div>
                <span className="text-[10px] text-red-800 bg-red-100 px-2 py-0.5 rounded">{pct}%</span>
              </div>
            );
          })}
        </Card>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <RadioTower size={16} className="text-gold-600" />
            Actividad reciente del comité
          </h3>
          <button onClick={() => setActive('talleres')} className="text-sm text-navy-700 hover:text-navy-900 font-medium flex items-center gap-1">
            Ver todo <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {actividadReciente.map(e => {
            const tipo = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.avance;
            const taller = tallerById[e.tallerId];
            const autor = personaById[e.autorId];
            const colorMap = {
              stone: 'bg-stone-200 text-stone-700',
              blue: 'bg-blue-100 text-blue-800',
              emerald: 'bg-emerald-100 text-emerald-800',
              violet: 'bg-violet-100 text-violet-800',
              amber: 'bg-amber-100 text-amber-800',
              red: 'bg-red-100 text-red-800',
              navy: 'bg-navy-100 text-navy-800',
              gold: 'bg-gold-100 text-gold-800',
            };
            const Icon = tipo.icon;
            return (
              <button
                key={e.id}
                onClick={() => taller && irATaller(taller.id)}
                className="w-full text-left flex items-start gap-3 py-2 border-b border-stone-100 last:border-0 hover:bg-navy-50/50 -mx-2 px-2 rounded transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[tipo.color]}`}>
                  <Icon size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-900 font-medium">{e.titulo}</p>
                  <p className="text-xs text-stone-500">
                    <span className="font-semibold text-navy-800">{taller?.nombre}</span>
                    {autor && <> · {autor.nombre}</>}
                    <> · {formatFecha(e.fecha, true)}</>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card title="Iniciativas a comunicar" onClick={() => setActive('innovacion')}>
          {iniciativas.map(i => (
            <div key={i.id} className="py-2 border-b border-stone-100 last:border-0">
              <p className="text-sm font-medium text-stone-900">{i.titulo}</p>
              <p className="text-xs text-stone-500">{i.autor} · {i.area}</p>
            </div>
          ))}
        </Card>

        <Card title="Tareas urgentes" onClick={() => setActive('tareas')}>
          {ordenarTareasReciente(tareas.filter(t => t.prioridad === 'alta' && t.estado === 'pendiente')).slice(0, 4).map(t => {
            const persona = personaById[t.personaId];
            const taller = tallerById[t.tallerId];
            return (
              <div key={t.id} className="flex items-start gap-3 py-2 border-b border-stone-100 last:border-0">
                <div className="w-3.5 h-3.5 border border-stone-400 rounded-sm mt-0.5 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800">{t.tarea}</p>
                  <p className="text-xs text-stone-500">
                    {persona?.nombre || 'Sin asignar'}
                    {taller && <> · <span className="text-stone-400">{taller.nombre}</span></>}
                    <> · {t.deadline}</>
                  </p>
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, accent, onClick, hint, tooltip }) {
  const accentMap = {
    amber: { num: 'text-gold-800', bar: 'bg-gold-500', glow: 'bg-gold-100', dot: 'bg-gold-500', border: 'hover:border-gold-400' },
    emerald: { num: 'text-emerald-800', bar: 'bg-emerald-500', glow: 'bg-emerald-100', dot: 'bg-emerald-500', border: 'hover:border-emerald-400' },
    red: { num: 'text-red-800', bar: 'bg-red-500', glow: 'bg-red-100', dot: 'bg-red-500', border: 'hover:border-red-400' },
  };
  const c = accentMap[accent] || { num: 'text-navy-900', bar: 'bg-navy-900', glow: 'bg-navy-50', dot: 'bg-navy-700', border: 'hover:border-navy-700' };
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`relative bg-white border border-stone-200/80 rounded-2xl p-5 text-left w-full overflow-hidden ${onClick ? `${c.border} hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group` : ''}`}
    >
      <div className={`absolute -top-12 -right-12 w-32 h-32 ${c.glow} rounded-full opacity-40 blur-2xl pointer-events-none`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-700">{label}</p>
            {tooltip && (
              <span className="relative" style={{ display: 'inline-block' }}>
                <span className="peer cursor-help">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400 hover:text-navy-700 transition-colors">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-5 w-60 bg-navy-900 text-stone-50 text-xs leading-relaxed rounded-lg px-3 py-2.5 opacity-0 invisible peer-hover:opacity-100 peer-hover:visible transition-opacity z-30 pointer-events-none shadow-xl"
                  style={{ whiteSpace: 'normal', textAlign: 'left', fontWeight: 'normal', letterSpacing: 0 }}
                >
                  {tooltip}
                </span>
              </span>
            )}
          </div>
          {onClick && <ChevronRight size={14} className="text-stone-300 group-hover:text-navy-700 group-hover:translate-x-0.5 transition-all" />}
        </div>
        <div className="flex items-baseline gap-2">
          <p className={`kpi-number text-[2.75rem] ${c.num}`}>{value}</p>
        </div>
        {hint && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full ${c.dot}`}></span>
            <p className="text-xs text-stone-600 font-medium">{hint}</p>
          </div>
        )}
      </div>
    </Comp>
  );
}

function Card({ title, children, onClick }) {
  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-6 hover:border-navy-700 hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-navy-900 tracking-tight">{title}</h3>
        <ChevronRight size={16} className="text-stone-400" />
      </div>
      <div>{children}</div>
    </div>
  );
}

function Asistente({ talleres, herramientas, iniciativas, tareas, personas, solapamientos, setSolapamientos, peticiones, setPeticiones, usuarioActualId, setTareas, setIniciativas, onClose, modoFlotante }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Buenos días. Soy Nexo. Puedo ayudarte con coordinación de talleres, detección de conflictos entre iniciativas, gobierno de herramientas, evaluación de peticiones de equipos, redacción de comunicaciones y extracción de tareas. ¿Qué necesitas?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ultimaAccion, setUltimaAccion] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const personasContexto = personas.map(p => `${p.nombre} (id ${p.id}, equipo ${getEquipo(p)}${p.nivel ? `, nivel ${p.nivel}` : ''})`).join('; ');
  const talleresContexto = talleres.map(t => `${t.nombre} (id ${t.id}): ${t.descripcion || ''}`).join('\n');
  const herramientasContexto = herramientas.map(h => `${h.nombre} (${h.categoria}): ${(h.funcionalidades || []).join(', ')}${h.alerta ? ' · ALERTA: ' + h.alerta : ''}`).join('\n');
  const iniciativasContexto = iniciativas.map(i => `${i.titulo}${i.taller ? ' (taller ' + i.taller + ')' : ''}: ${i.descripcion || ''}`).join('\n');
  const solapamientosActivos = (solapamientos || []).filter(s => s.estado === 'activo');
  const solapamientosContexto = solapamientosActivos.map(s => `${s.titulo} (${s.tipo}, riesgo ${s.riesgo})`).join('; ');
  const peticionesAbiertas = (peticiones || []).filter(p => p.estado !== 'rechazada' && p.estado !== 'aprobada');
  const peticionesContexto = peticionesAbiertas.map(p => `"${p.titulo}" (de ${p.equipo}, estado ${p.estado})`).join('; ');

  const systemPrompt = `Eres Nexo, asistente operativo del Plan Estratégico de la compañía. Trabajas para Coordinador Nexo, designado nexo entre el Foro de Innovación, el Comité de Innovación, los 14 talleres del Plan Estratégico, Plataforma Integrada e IT.

CONTEXTO:
- Comité de seguimiento: Líder Clientes, Líder Servicios, Líder Diversificación (núcleo); Líder Innovación, Líder Procesos, Líder ampliado 1 (ampliado).
- Plataforma Integrada: plataforma interna end-to-end que conecta equipos, activos y propietarios. Integra CRM corporativo y Data Lake.
- Repositorio 360: evolución del repositorio documental hacia visión integrada con Plataforma Integrada.
- Mejora de Procesos: foco en Arquitectura, Valoraciones, Property, Jurídico, Financiero. Property (Doc Manager Property) y Jurídico (Líder Jurídico) en 1ª oleada. Tercero externo. Plan de 16+16 semanas.
- Foro de Innovación (operativo) ≠ Comité de Innovación (gobierno).
- Reunión clave: el hito Q2, comité + líderes de talleres.

TALLERES ACTIVOS:
${talleresContexto}

HERRAMIENTAS DEL CATÁLOGO:
${herramientasContexto}

INICIATIVAS VIVAS:
${iniciativasContexto}

CONFLICTOS YA DETECTADOS Y ACTIVOS: ${solapamientosContexto || 'ninguno'}.

PETICIONES EN EL BUZÓN: ${peticionesContexto || 'ninguna'}.

PERSONAS REGISTRADAS: ${personasContexto}.

INSTRUCCIONES:
- Responde en español, directo, sin preámbulos.
- Cuando te pidan redactar emails o comunicaciones, devuelve el texto listo para copiar.

ACCIONES ESTRUCTURADAS QUE PUEDES PROPONER:
Cuando detectes algo que merezca registrarse en el sistema, AL FINAL de tu respuesta normal, añade un bloque JSON encerrado en \`\`\`json ... \`\`\` con una de estas formas:

1. Para extraer tareas de una minuta:
{"accion":"crear_tareas","items":[{"tarea":"...","personaId":"...","tallerId":"...","deadline":"...","prioridad":"alta|media|baja"}]}

2. Cuando detectes uno o más conflictos NUEVOS (no repitas los ya detectados):
{"accion":"crear_solapamientos","items":[{"titulo":"...","tipo":"funcional|tecnico|personas|herramienta","descripcion":"...","talleresImplicados":["t1","t2"],"riesgo":"alto|medio|bajo","recomendacion":"..."}]}

3. Cuando alguien describa una necesidad/sugerencia/petición de un equipo (ej: "el equipo de Retail necesita X"):
{"accion":"crear_peticion","item":{"titulo":"...","descripcion":"...","equipo":"...","tipoSolicitud":"herramienta|proceso|iniciativa","prioridad":"alta|media|baja","funcionalidades":["..."]}}

REGLAS:
- Detecta conflictos comparando talleres entre sí, herramientas con funcionalidades duplicadas, e iniciativas que coincidan con talleres existentes.
- Si alguien menciona "fulanito de Retail/Marketing/X me ha pedido", "el equipo de Y quiere", "necesitan en Z", interpreta como petición y créala.
- No crees conflictos triviales o ya conocidos. Solo si aportan valor real.
- Sé conciso. Bullet points cuando aporte. No uses headers excepto cuando se pida explícitamente.`;

  const procesarAccionesEstructuradas = async (response) => {
    const jsonMatches = response.matchAll(/```json\s*([\s\S]*?)\s*```/g);
    let accionRealizada = null;

    for (const match of jsonMatches) {
      try {
        const data = JSON.parse(match[1]);

        if (data.accion === 'crear_tareas' && Array.isArray(data.items)) {
          const tareasConId = data.items.map((t, idx) => ({
            id: `auto-${Date.now()}-${idx}`,
            ...t,
            creadorId: usuarioActualId,
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString().slice(0, 10),
          }));
          await setTareas([...tareas, ...tareasConId]);
          accionRealizada = { tipo: 'tareas', count: tareasConId.length };
        }

        if (data.accion === 'crear_solapamientos' && Array.isArray(data.items)) {
          const nuevos = data.items.map((s, idx) => ({
            id: `s-chat-${Date.now()}-${idx}`,
            ...s,
            herramientasImplicadas: s.herramientasImplicadas || [],
            estado: 'activo',
            fechaDeteccion: new Date().toISOString().slice(0, 10),
            detectadoPor: 'IA',
          }));
          if (nuevos.length > 0) {
            await setSolapamientos([...(solapamientos || []), ...nuevos]);
            accionRealizada = { tipo: 'solapamientos', count: nuevos.length };
          }
        }

        if (data.accion === 'crear_peticion' && data.item) {
          const nueva = {
            id: `pet-chat-${Date.now()}`,
            ...data.item,
            funcionalidades: data.item.funcionalidades || [],
            estado: 'nueva',
            tallerAsignadoId: null,
            solicitanteId: usuarioActualId,
            fecha: new Date().toISOString().slice(0, 10),
            evaluacion: null,
            impactoEstimado: null,
          };
          await setPeticiones([...(peticiones || []), nueva]);
          accionRealizada = { tipo: 'peticion', count: 1, titulo: nueva.titulo };
        }
      } catch (e) { /* ignore */ }
    }

    return accionRealizada;
  };

  const send = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim() || loading) return;
    setInput('');
    setUltimaAccion(null);
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages.slice(0, -1).filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
    const response = await callClaude(systemPrompt, text, history);

    const accion = await procesarAccionesEstructuradas(response);

    const respuestaLimpia = response.replace(/```json[\s\S]*?```/g, '').trim();
    setMessages([...newMessages, { role: 'assistant', content: respuestaLimpia || response }]);
    setLoading(false);
    if (accion) setUltimaAccion(accion);
  };

  const sugerencias = [
    'Analiza conflictos entre iniciativas, herramientas y talleres',
    'El equipo de Retail necesita una herramienta para gestionar pipeline de locales',
    'Redacta la convocatoria del el hito Q2 para Líder Servicios',
    'Genera la píldora de innovación del chatbot de Fernando',
    'Email a Antonio, Patricia, Jorge, Juan y Elena sobre el tercero',
    'Plan de reasignación de licencias de IA productividad',
  ];

  return (
    <div className="flex flex-col h-full">
      <div className={`${modoFlotante ? 'px-4 py-3' : 'px-8 py-5'} border-b border-stone-200 bg-white`}>
        <div className="flex items-center gap-3">
          <div className={`${modoFlotante ? 'w-8 h-8' : 'w-9 h-9'} rounded-md bg-navy-900 flex items-center justify-center flex-shrink-0`}>
            <span className="font-serif text-stone-50 text-sm">N</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`${modoFlotante ? 'text-sm' : 'text-base'} font-medium text-stone-900`}>Asistente Nexo</h2>
            <p className={`${modoFlotante ? 'text-[10px]' : 'text-xs'} text-stone-500 truncate`}>
              {modoFlotante ? 'Conectado a tus datos' : 'Conectado a Plan Estratégico · Plataforma Integrada · Catálogo · Tareas'}
            </p>
          </div>
          {!modoFlotante && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
              <span>Sincronizado</span>
            </div>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 flex-shrink-0 transition-colors"
              title="Cerrar chat"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto ${modoFlotante ? 'px-4 py-4' : 'px-8 py-6'} bg-stone-50`}>
        <div className={`${modoFlotante ? '' : 'max-w-3xl mx-auto'} space-y-5`}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-navy-900 text-stone-50 rounded-2xl rounded-tr-sm px-4 py-2.5'
                  : 'bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-stone-500" />
                <span className="text-xs text-stone-500">Pensando...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${modoFlotante ? 'px-4 py-3' : 'px-8 py-4'} border-t border-stone-200 bg-white`}>
        <div className={`${modoFlotante ? '' : 'max-w-3xl mx-auto'}`}>
          {ultimaAccion && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-700 text-xs">✓</span>
              </div>
              <p className="text-xs text-emerald-900 flex-1">
                {ultimaAccion.tipo === 'tareas' && `Se han creado ${ultimaAccion.count} ${ultimaAccion.count === 1 ? 'tarea' : 'tareas'} en el sistema.`}
                {ultimaAccion.tipo === 'solapamientos' && `Se ${ultimaAccion.count === 1 ? 'ha registrado' : 'han registrado'} ${ultimaAccion.count} ${ultimaAccion.count === 1 ? 'conflicto detectado' : 'conflictos detectados'} en el módulo de Conflictos.`}
                {ultimaAccion.tipo === 'peticion' && `Petición "${ultimaAccion.titulo}" añadida al buzón en Procesos.`}
              </p>
              <button onClick={() => setUltimaAccion(null)} className="text-emerald-700 hover:text-emerald-900 flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          )}

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {sugerencias.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[11px] text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-full transition-colors"
                >{s}</button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-xl p-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Pregunta, pega una minuta, pide un email..."
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none text-sm resize-none px-2 py-1 text-stone-900 placeholder-stone-400"
              style={{ minHeight: '24px', maxHeight: '120px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-md bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SolapamientosView({ talleres, herramientas, iniciativas, personas, solapamientos, setSolapamientos, peticiones, setPeticiones, usuarioActualId, setActive }) {
  const [tabActiva, setTabActiva] = useState('duplicidades');
  const [analizando, setAnalizando] = useState(false);
  const [analizandoDuplicidad, setAnalizandoDuplicidad] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('activo');
  const [errorIA, setErrorIA] = useState(null);
  const [creandoManual, setCreandoManual] = useState(false);
  const [evaluacionLibre, setEvaluacionLibre] = useState('');
  const [resultadoLibre, setResultadoLibre] = useState(null);
  const [analizandoLibre, setAnalizandoLibre] = useState(false);
  const [nuevo, setNuevo] = useState({
    titulo: '',
    tipo: 'funcional',
    descripcion: '',
    talleresImplicados: [],
    riesgo: 'medio',
    recomendacion: '',
  });

  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));
  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));

  const peticionesHerramienta = (peticiones || []).filter(p =>
    ['herramienta', 'herramienta_nueva', 'mejora_herramienta'].includes(p.tipoSolicitud) && p.estado !== 'rechazada'
  );

  const analizarNecesidadLibre = async () => {
    if (!evaluacionLibre.trim()) return;
    setAnalizandoLibre(true);
    setResultadoLibre(null);
    const herramientasCtx = (herramientas || []).map(h => `- "${h.nombre}" (${h.categoria}): ${h.descripcion || ''}. Funcionalidades: ${(h.funcionalidades || []).join(', ')}. Áreas: ${(h.areas || []).join(', ')}. Licencias contratadas: ${h.licenciasContratadas}, activas: ${h.licenciasActivas}, libres: ${h.licenciasContratadas - h.licenciasActivas}. Coste anual: ${h.costeAnual}€.`).join('\n');

    const prompt = `Un equipo en la compañía quiere contratar una herramienta nueva para esta necesidad: "${evaluacionLibre}".

Antes de aprobar el gasto, revisa el catálogo actual y dime si hay herramientas YA contratadas que cubran total o parcialmente esa necesidad. El objetivo es REDUCIR COSTES y maximizar el uso de las licencias existentes.

CATÁLOGO ACTUAL:
${herramientasCtx || '(catálogo vacío)'}

Devuelve SOLO un objeto JSON válido sin markdown:
{
  "alternativas": [
    {
      "herramienta": "nombre exacto de la herramienta del catálogo",
      "match": 85,
      "razon": "1-2 frases explicando qué cubre y qué no",
      "licenciasLibres": número de licencias sin usar disponibles,
      "ahorroPotencial": "estimación del ahorro en € si se usa esta en lugar de contratar una nueva"
    }
  ],
  "veredicto": "una de: 'usar_existente', 'extender_existente', 'contratar_nueva', 'evaluar_mas'",
  "recomendacion": "2-3 frases con la recomendación final concreta",
  "ahorroTotal": "estimación numérica del ahorro anual en € si se sigue la recomendación, o 0 si no aplica"
}

Si no hay alternativas razonables, devuelve alternativas: [] y veredicto: "contratar_nueva".`;

    const respuesta = await callClaude('Eres analista de gobierno de herramientas en la compañía. Tu rol es evitar duplicidades, maximizar uso de licencias existentes y reducir costes. Devuelves SOLO JSON válido.', prompt);
    try {
      const m = respuesta.match(/\{[\s\S]*\}/);
      if (m) {
        setResultadoLibre(JSON.parse(m[0]));
      } else {
        setErrorIA('No se pudo procesar la respuesta.');
      }
    } catch (e) {
      setErrorIA('Error al analizar la necesidad.');
    }
    setAnalizandoLibre(false);
  };

  const analizarDuplicidad = async (peticion) => {
    setAnalizandoDuplicidad(peticion.id);
    const herramientasCtx = (herramientas || []).map(h => `- "${h.nombre}" (${h.categoria}): ${h.descripcion || ''}. Funcionalidades: ${(h.funcionalidades || []).join(', ')}. Áreas: ${(h.areas || []).join(', ')}. Licencias libres: ${h.licenciasContratadas - h.licenciasActivas}. Coste anual: ${h.costeAnual}€.`).join('\n');

    const prompt = `Una petición ha llegado al buzón pidiendo una herramienta nueva. Antes de aprobarla hay que comprobar si el catálogo actual ya cubre la necesidad.

PETICIÓN:
Título: ${peticion.titulo}
Equipo solicitante: ${peticion.equipo}
Descripción: ${peticion.descripcion}
Funcionalidades buscadas: ${(peticion.funcionalidades || []).join(', ') || '(no especificadas)'}

CATÁLOGO ACTUAL:
${herramientasCtx || '(catálogo vacío)'}

Devuelve SOLO un objeto JSON válido sin markdown con esta estructura:
{
  "tieneAlternativas": true/false,
  "alternativas": [{"herramienta": "nombre exacto", "match": 85, "razon": "...", "licenciasLibres": N, "ahorroPotencial": "..."}],
  "veredicto": "usar_existente|extender_existente|contratar_nueva|evaluar_mas",
  "recomendacion": "...",
  "ahorroTotal": número en €
}

Si hay alternativas con match >= 70%, hay que crear un conflicto del tipo "herramienta" para registrarlo.`;

    const respuesta = await callClaude('Eres analista de gobierno de herramientas en la compañía. Tu rol es evitar duplicidades y reducir costes. Devuelves SOLO JSON válido.', prompt);
    try {
      const m = respuesta.match(/\{[\s\S]*\}/);
      if (m) {
        const analisis = JSON.parse(m[0]);
        if (analisis.tieneAlternativas && (analisis.alternativas || []).length > 0) {
          const altsTexto = analisis.alternativas
            .filter(a => a.match >= 70)
            .map(a => `${a.herramienta} (${a.match}% match): ${a.razon}`)
            .join('. ');
          if (altsTexto) {
            const nuevoConflicto = {
              id: `s-pet-${Date.now()}`,
              tipo: 'herramienta',
              titulo: `Petición duplicada: ${peticion.titulo}`,
              descripcion: `${peticion.equipo} pide una herramienta nueva, pero el catálogo ya tiene alternativas: ${altsTexto}`,
              talleresImplicados: [],
              herramientasImplicadas: analisis.alternativas.filter(a => a.match >= 70).map(a => a.herramienta),
              riesgo: analisis.ahorroTotal > 10000 ? 'alto' : analisis.ahorroTotal > 5000 ? 'medio' : 'bajo',
              recomendacion: analisis.recomendacion,
              ahorroEstimado: analisis.ahorroTotal,
              peticionRelacionadaId: peticion.id,
              estado: 'activo',
              fechaDeteccion: new Date().toISOString().slice(0, 10),
              detectadoPor: 'IA',
            };
            await setSolapamientos([...(solapamientos || []), nuevoConflicto]);

            if (setPeticiones) {
              const nuevasPet = peticiones.map(p =>
                p.id === peticion.id
                  ? {
                      ...p,
                      estado: 'en_revision',
                      evaluacion: `Detectadas alternativas en el catálogo: ${altsTexto}`,
                      impactoEstimado: `Ahorro potencial estimado: ${analisis.ahorroTotal?.toLocaleString() || '?'}€/año si se usa una herramienta existente.`,
                    }
                  : p
              );
              await setPeticiones(nuevasPet);
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
    setAnalizandoDuplicidad(null);
  };

  const detectarSolapamientos = async () => {
    setAnalizando(true);
    setErrorIA(null);
    const talleresContexto = talleres.map(t => `- ${t.nombre} (id ${t.id}, líder ${t.lider}${t.diaADia ? `, día a día ${t.diaADia}` : ''}, área ${t.area}): ${t.descripcion}`).join('\n');
    const herramientasContexto = (herramientas || []).map(h => `- ${h.nombre} (${h.categoria}): ${(h.funcionalidades || []).join(', ')}. Usado por ${(h.areas || []).join(', ')}.${h.alerta ? ' ALERTA: ' + h.alerta : ''}`).join('\n');
    const iniciativasContexto = (iniciativas || []).map(i => `- ${i.titulo}${i.taller ? ' (taller ' + i.taller + ')' : ''}: ${i.descripcion || ''}`).join('\n');
    const yaDetectados = (solapamientos || []).map(s => s.titulo).join('; ');

    const prompt = `Analiza el ecosistema completo del Plan Estratégico de la compañía y detecta conflictos entre talleres, herramientas e iniciativas. Considera estos cuatro tipos:

- FUNCIONAL: dos esfuerzos construyendo lo mismo (ej. dos asistentes IA)
- TÉCNICO: decisiones técnicas que se contradicen (ej. SharePoint vs Repositorio 360)
- PERSONAS: dos talleres requieren a las mismas personas/áreas a la vez
- HERRAMIENTA: dos herramientas con funcionalidades duplicadas para el mismo público

Devuelve SOLO un array JSON válido, sin explicación ni markdown. Si no hay conflictos NUEVOS (distintos de los ya detectados), devuelve [].

Cada conflicto debe tener:
- titulo: corto y claro (ej: "Asistente IA: Innovación ↔ Plataforma Integrada")
- tipo: "funcional", "tecnico", "personas" o "herramienta"
- descripcion: 2-3 frases explicando el conflicto concreto
- talleresImplicados: array de IDs de talleres afectados (puede estar vacío si solo afecta a herramientas)
- riesgo: "alto", "medio" o "bajo"
- recomendacion: 1-2 frases con la acción recomendada

YA DETECTADOS (no los repitas): ${yaDetectados || 'ninguno'}

TALLERES:
${talleresContexto}

HERRAMIENTAS DEL CATÁLOGO:
${herramientasContexto || '(ninguna)'}

INICIATIVAS VIVAS:
${iniciativasContexto || '(ninguna)'}

Formato:
[{"titulo":"...","tipo":"funcional","descripcion":"...","talleresImplicados":["t1","t2"],"riesgo":"alto","recomendacion":"..."}]`;

    const respuesta = await callClaude('Eres analista de coordinación del Plan Estratégico de la compañía. Detectas conflictos reales entre talleres, herramientas e iniciativas. Devuelves SOLO JSON válido sin explicación.', prompt);

    try {
      const jsonMatch = respuesta.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const detectados = JSON.parse(jsonMatch[0]);
        const nuevos = detectados.map((s, idx) => ({
          id: `s-auto-${Date.now()}-${idx}`,
          ...s,
          herramientasImplicadas: s.herramientasImplicadas || [],
          estado: 'activo',
          fechaDeteccion: new Date().toISOString().slice(0, 10),
          detectadoPor: 'IA',
        }));
        if (nuevos.length > 0) {
          await setSolapamientos([...(solapamientos || []), ...nuevos]);
        } else {
          setErrorIA('No se han encontrado conflictos nuevos.');
        }
      } else {
        setErrorIA('No he podido procesar la respuesta. Inténtalo de nuevo.');
      }
    } catch (e) {
      setErrorIA('Error al analizar la respuesta de la IA.');
    }
    setAnalizando(false);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    const nuevos = solapamientos.map(s => s.id === id ? { ...s, estado: nuevoEstado } : s);
    await setSolapamientos(nuevos);
  };

  const eliminarSolapamiento = async (id) => {
    if (!confirm('¿Eliminar este conflicto del registro?')) return;
    await setSolapamientos(solapamientos.filter(s => s.id !== id));
  };

  const crearManual = async () => {
    if (!nuevo.titulo.trim() || !nuevo.descripcion.trim()) return;
    const item = {
      id: `s-manual-${Date.now()}`,
      ...nuevo,
      titulo: nuevo.titulo.trim(),
      descripcion: nuevo.descripcion.trim(),
      recomendacion: nuevo.recomendacion.trim(),
      herramientasImplicadas: [],
      estado: 'activo',
      fechaDeteccion: new Date().toISOString().slice(0, 10),
      detectadoPor: usuarioActualId || 'manual',
    };
    await setSolapamientos([...(solapamientos || []), item]);
    setNuevo({ titulo: '', tipo: 'funcional', descripcion: '', talleresImplicados: [], riesgo: 'medio', recomendacion: '' });
    setCreandoManual(false);
  };

  const toggleTallerSolapamiento = (tid) => {
    const ts = nuevo.talleresImplicados;
    setNuevo({ ...nuevo, talleresImplicados: ts.includes(tid) ? ts.filter(t => t !== tid) : [...ts, tid] });
  };

  const solapamientosFiltrados = (solapamientos || []).filter(s => filtroEstado === 'todos' || s.estado === filtroEstado);
  const activosCount = (solapamientos || []).filter(s => s.estado === 'activo').length;
  const resueltosCount = (solapamientos || []).filter(s => s.estado === 'resuelto').length;
  const falsosCount = (solapamientos || []).filter(s => s.estado === 'falso_positivo').length;
  const altosCount = (solapamientos || []).filter(s => s.estado === 'activo' && s.riesgo === 'alto').length;

  const riesgoColor = {
    alto: { bg: 'bg-red-50/70', border: 'border-red-200', text: 'text-red-900', dot: 'bg-red-500', badge: 'bg-red-100 text-red-800', accent: 'bg-red-500' },
    medio: { bg: 'bg-gold-50/70', border: 'border-gold-200', text: 'text-gold-900', dot: 'bg-gold-500', badge: 'bg-gold-100 text-gold-800', accent: 'bg-gold-500' },
    bajo: { bg: 'bg-navy-50/50', border: 'border-navy-100', text: 'text-navy-900', dot: 'bg-navy-400', badge: 'bg-navy-100 text-navy-800', accent: 'bg-navy-400' },
  };

  const tipoLabel = {
    funcional: 'Funcional',
    tecnico: 'Técnico',
    personas: 'Personas',
    herramienta: 'Herramienta',
  };

  return (
    <div className="p-8 w-full">
      <header className="mb-8 flex items-end justify-between gap-6 flex-wrap">
        <div className="max-w-2xl">
          <p className="eyebrow text-navy-800 mb-3">Coordinación</p>
          <h1 className="display-1 text-navy-900 mb-3">Conflictos</h1>
          <hr className="savills-rule w-32 mb-4" />
          <p className="text-base text-stone-600 leading-relaxed">Cruzamos las peticiones nuevas con las herramientas ya contratadas para detectar si alguna existente cubre la necesidad. Evita duplicar licencias y reduce costes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreandoManual(!creandoManual)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 hover:border-navy-700 text-navy-900 rounded-lg text-sm font-medium transition-colors"
          >
            {creandoManual ? <X size={14} /> : <Plus size={14} />}
            {creandoManual ? 'Cancelar' : 'Añadir manual'}
          </button>
          <button
            onClick={detectarSolapamientos}
            disabled={analizando}
            className="flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            {analizando ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-gold-400" />}
            Detectar con IA
          </button>
        </div>
      </header>


      <div className="flex items-center gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTabActiva('duplicidades')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tabActiva === 'duplicidades' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'
          }`}
        >
          <Wrench size={13} className={tabActiva === 'duplicidades' ? 'text-gold-400' : ''} />
          Peticiones vs catálogo
          {peticionesHerramienta.length > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tabActiva === 'duplicidades' ? 'bg-gold-400 text-navy-900' : 'bg-gold-100 text-gold-800'}`}>{peticionesHerramienta.length}</span>}
        </button>
        <button
          onClick={() => setTabActiva('registro')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tabActiva === 'registro' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'
          }`}
        >
          <AlertTriangle size={13} className={tabActiva === 'registro' ? 'text-gold-400' : ''} />
          Registro de conflictos
          {activosCount > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${tabActiva === 'registro' ? 'bg-gold-400 text-navy-900' : 'bg-stone-200 text-stone-700'}`}>{activosCount}</span>}
        </button>
      </div>

      {tabActiva === 'registro' && (<>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric label="Activos" value={activosCount} accent={activosCount > 0 ? 'amber' : undefined} hint="requieren acción" tooltip="Conflictos abiertos que aún no se han resuelto ni descartado." />
        <Metric label="Riesgo alto" value={altosCount} accent={altosCount > 0 ? 'red' : 'emerald'} hint="prioridad máxima" tooltip="Conflictos activos con riesgo alto. Llevarlos al comité del el hito Q2." />
        <Metric label="Resueltos" value={resueltosCount} accent="emerald" hint="cerrados con éxito" tooltip="Conflictos que ya fueron tratados y resueltos." />
        <Metric label="Falsos positivos" value={falsosCount} hint="descartados" tooltip="Conflictos detectados pero descartados tras revisión." />
      </div>

      {errorIA && (
        <div className="bg-stone-100 border border-stone-200 rounded-md px-3 py-2 mb-4 flex items-center gap-2">
          <AlertTriangle size={12} className="text-stone-500" />
          <p className="text-xs text-stone-600">{errorIA}</p>
          <button onClick={() => setErrorIA(null)} className="ml-auto text-stone-400 hover:text-stone-700"><X size={12} /></button>
        </div>
      )}

      {creandoManual && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Registrar conflicto manualmente
          </h3>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Título</label>
          <input
            value={nuevo.titulo}
            onChange={e => setNuevo({ ...nuevo, titulo: e.target.value })}
            placeholder="Ej: Asistente IA en dos talleres"
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 mb-3"
          />

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción del conflicto</label>
          <textarea
            value={nuevo.descripcion}
            onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })}
            placeholder="Explica qué se está solapando y por qué es un problema."
            rows={3}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Tipo</label>
              <div className="flex gap-1 flex-wrap">
                {Object.entries(tipoLabel).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setNuevo({ ...nuevo, tipo: k })}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                      nuevo.tipo === k ? 'bg-navy-900 text-stone-50' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >{v}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Riesgo</label>
              <div className="flex gap-1">
                {[
                  { v: 'alto', l: 'Alto', c: 'bg-red-100 text-red-800' },
                  { v: 'medio', l: 'Medio', c: 'bg-amber-100 text-amber-800' },
                  { v: 'bajo', l: 'Bajo', c: 'bg-stone-100 text-stone-700' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => setNuevo({ ...nuevo, riesgo: opt.v })}
                    className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                      nuevo.riesgo === opt.v ? opt.c : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >{opt.l}</button>
                ))}
              </div>
            </div>
          </div>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Talleres implicados</label>
          <div className="flex flex-wrap gap-1 mb-3">
            {talleres.map(t => (
              <button
                key={t.id}
                onClick={() => toggleTallerSolapamiento(t.id)}
                className={`text-[11px] px-2 py-1 rounded transition-colors ${
                  nuevo.talleresImplicados.includes(t.id) ? 'bg-navy-900 text-stone-50' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >{t.nombre}</button>
            ))}
          </div>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Recomendación</label>
          <textarea
            value={nuevo.recomendacion}
            onChange={e => setNuevo({ ...nuevo, recomendacion: e.target.value })}
            placeholder="¿Qué debería hacerse para resolver este conflicto?"
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
          />

          <button
            onClick={crearManual}
            disabled={!nuevo.titulo.trim() || !nuevo.descripcion.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Registrar
          </button>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="eyebrow text-navy-800 flex items-center gap-2">
            <AlertTriangle size={13} className="text-gold-600" />
            Registro de conflictos
          </h3>
          <div className="flex gap-1 bg-white border border-stone-200 rounded-lg p-1">
            <button onClick={() => setFiltroEstado('activo')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'activo' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}>Activos {activosCount > 0 && `(${activosCount})`}</button>
            <button onClick={() => setFiltroEstado('resuelto')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'resuelto' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}>Resueltos {resueltosCount > 0 && `(${resueltosCount})`}</button>
            <button onClick={() => setFiltroEstado('falso_positivo')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'falso_positivo' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}>Falsos {falsosCount > 0 && `(${falsosCount})`}</button>
            <button onClick={() => setFiltroEstado('todos')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filtroEstado === 'todos' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}>Todos</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {solapamientosFiltrados.length === 0 && (
            <div className="lg:col-span-2 bg-white border border-dashed border-stone-300 rounded-2xl text-center py-16">
              <AlertTriangle size={36} className="text-stone-300 mx-auto mb-3" />
              <p className="text-base text-stone-600 font-medium">
                {(solapamientos || []).length === 0
                  ? 'No hay conflictos registrados todavía.'
                  : `No hay conflictos en estado "${filtroEstado}".`
                }
              </p>
              {(solapamientos || []).length === 0 && (
                <p className="text-sm text-stone-500 mt-2 max-w-md mx-auto">Pulsa "Detectar con IA" para que Nexo analice el ecosistema, o añade uno manualmente.</p>
              )}
            </div>
          )}
          {solapamientosFiltrados.map(s => {
            const c = riesgoColor[s.riesgo] || riesgoColor.medio;
            const detector = s.detectadoPor === 'IA' ? 'Detección IA' : (personaById[s.detectadoPor]?.nombre || 'Manual');
            return (
              <article key={s.id} className={`relative bg-white border border-stone-200/80 rounded-2xl overflow-hidden flex hover:shadow-md hover:border-navy-700 transition-all ${s.estado !== 'activo' ? 'opacity-70' : ''}`}>
                <div className={`w-1.5 ${c.accent} flex-shrink-0`}></div>

                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`eyebrow ${c.text}`}>{tipoLabel[s.tipo] || s.tipo}</span>
                    <span className="text-stone-300">·</span>
                    <span className={`eyebrow ${c.text}`}>Riesgo {s.riesgo}</span>
                    {s.estado === 'resuelto' && (
                      <span className="ml-auto text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Resuelto</span>
                    )}
                    {s.estado === 'falso_positivo' && (
                      <span className="ml-auto text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">Falso positivo</span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl text-navy-900 leading-tight mb-2">{s.titulo}</h3>
                  <p className="text-sm text-stone-700 leading-relaxed mb-3 line-clamp-2">{s.descripcion}</p>

                  {(s.talleresImplicados || []).length > 0 && (
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {(s.talleresImplicados || []).slice(0, 3).map(tid => {
                        const t = tallerById[tid];
                        return t ? (
                          <button
                            key={tid}
                            onClick={() => setActive('talleres')}
                            className="text-xs bg-navy-50 text-navy-800 border border-navy-100 hover:bg-navy-100 hover:border-navy-300 rounded-md px-2 py-0.5 font-medium transition-colors"
                          >{t.nombre}</button>
                        ) : null;
                      })}
                      {(s.talleresImplicados || []).length > 3 && (
                        <span className="text-xs text-stone-500 font-medium">+{(s.talleresImplicados || []).length - 3}</span>
                      )}
                    </div>
                  )}

                  {s.recomendacion && (
                    <div className={`relative pl-3 mb-3 border-l-2 ${c.accent.replace('bg-', 'border-')}`}>
                      <p className="text-sm text-stone-800 leading-snug line-clamp-2"><span className="font-semibold text-navy-900">→ </span>{s.recomendacion}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-3 border-t border-stone-100 flex-wrap">
                    <span className="text-xs text-stone-500">{formatFecha(s.fechaDeteccion)} · {detector}</span>
                    <div className="ml-auto flex items-center gap-1">
                      {s.estado === 'activo' && (
                        <>
                          <button onClick={() => cambiarEstado(s.id, 'resuelto')} className="text-xs px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-emerald-50 rounded-md font-medium transition-colors">Resolver</button>
                          <button onClick={() => cambiarEstado(s.id, 'falso_positivo')} className="text-xs px-2.5 py-1 bg-white border border-stone-300 hover:border-navy-700 text-stone-700 rounded-md font-medium transition-colors">Falso positivo</button>
                        </>
                      )}
                      {s.estado !== 'activo' && (
                        <button onClick={() => cambiarEstado(s.id, 'activo')} className="text-xs px-2.5 py-1 bg-white border border-stone-300 hover:border-navy-700 text-stone-700 rounded-md font-medium transition-colors">Reactivar</button>
                      )}
                      <button onClick={() => eliminarSolapamiento(s.id)} className="text-xs text-stone-400 hover:text-red-700 transition-colors px-1.5">Eliminar</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      </>)}

      {tabActiva === 'duplicidades' && (
        <>
          <div className="bg-navy-900 text-stone-50 rounded-xl p-5 mb-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
                <Search size={16} className="text-stone-900" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-stone-50 mb-0.5">Antes de aprobar una herramienta nueva</h3>
                <p className="text-xs text-stone-300 leading-relaxed">Comprueba si el catálogo actual ya cubre la necesidad. Función clave del nexo para evitar duplicidad de licencias y reducir costes.</p>
              </div>
            </div>
            <textarea
              value={evaluacionLibre}
              onChange={e => setEvaluacionLibre(e.target.value)}
              placeholder="Describe la necesidad. Ej: Equipo de Retail necesita una herramienta para análisis de pipeline en tiempo real con dashboards customizables..."
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm text-stone-50 placeholder-stone-500 outline-none focus:border-amber-400 resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-stone-400">Nexo cruzará la necesidad con las {herramientas.length} herramientas del catálogo.</p>
              <button
                onClick={analizarNecesidadLibre}
                disabled={analizandoLibre || !evaluacionLibre.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-700 disabled:text-stone-400 text-stone-900 rounded-md text-xs font-medium transition-colors"
              >
                {analizandoLibre ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                Buscar alternativas en el catálogo
              </button>
            </div>
          </div>

          {resultadoLibre && (() => {
            const veredictoStyle = {
              usar_existente: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-900', label: 'Usar herramienta existente' },
              extender_existente: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', label: 'Extender herramienta existente' },
              contratar_nueva: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-900', label: 'Justifica contratar nueva' },
              evaluar_mas: { bg: 'bg-stone-50', border: 'border-stone-300', text: 'text-stone-900', label: 'Necesita más evaluación' },
            }[resultadoLibre.veredicto] || { bg: 'bg-stone-50', border: 'border-stone-300', text: 'text-stone-900', label: 'Sin veredicto' };

            return (
              <div className={`${veredictoStyle.bg} border-2 ${veredictoStyle.border} rounded-xl p-5 mb-6`}>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${veredictoStyle.text}`}>Veredicto</span>
                    <span className={`text-sm font-bold ${veredictoStyle.text}`}>{veredictoStyle.label}</span>
                  </div>
                  {resultadoLibre.ahorroTotal > 0 && (
                    <span className={`${veredictoStyle.text} font-serif text-2xl font-bold`}>{Number(resultadoLibre.ahorroTotal).toLocaleString()}€<span className="text-xs font-normal opacity-70">/año ahorro</span></span>
                  )}
                </div>

                {(resultadoLibre.alternativas || []).length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className={`text-[10px] uppercase tracking-wider font-semibold ${veredictoStyle.text} opacity-80`}>Alternativas en el catálogo</p>
                    {resultadoLibre.alternativas.map((a, idx) => (
                      <div key={idx} className="bg-white/60 rounded-md p-3 border border-white">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-stone-900">{a.herramienta}</p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              a.match >= 80 ? 'bg-emerald-200 text-emerald-900' :
                              a.match >= 60 ? 'bg-amber-200 text-amber-900' : 'bg-stone-200 text-stone-700'
                            }`}>{a.match}% match</span>
                          </div>
                        </div>
                        <p className="text-xs text-stone-700 leading-relaxed mb-2">{a.razon}</p>
                        <div className="flex items-center gap-3 text-[10px] text-stone-600">
                          {a.licenciasLibres != null && <span><strong>{a.licenciasLibres}</strong> licencias libres</span>}
                          {a.ahorroPotencial && <span>Ahorro: <strong>{a.ahorroPotencial}</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`pt-3 border-t ${veredictoStyle.border}`}>
                  <p className={`text-[10px] uppercase tracking-wider font-semibold ${veredictoStyle.text} opacity-80 mb-1`}>Recomendación</p>
                  <p className={`text-sm ${veredictoStyle.text} leading-relaxed`}>{resultadoLibre.recomendacion}</p>
                </div>

                <button
                  onClick={() => { setResultadoLibre(null); setEvaluacionLibre(''); }}
                  className="mt-4 text-[11px] text-stone-600 hover:text-stone-900"
                >Limpiar y analizar otra necesidad</button>
              </div>
            );
          })()}

          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="text-sm font-medium text-stone-900 flex items-center gap-2 mb-1">
              <FileSearch size={14} />
              Peticiones de herramienta pendientes de cruzar con el catálogo
            </h3>
            <p className="text-xs text-stone-600 mb-4">{peticionesHerramienta.length === 0 ? 'No hay peticiones de herramienta abiertas.' : `${peticionesHerramienta.length} ${peticionesHerramienta.length === 1 ? 'petición' : 'peticiones'} en el buzón. Pulsa "Analizar duplicidad" para cruzarlas con el catálogo.`}</p>

            {peticionesHerramienta.length === 0 && (
              <div className="text-center py-8 text-xs text-stone-400">
                <Wrench size={28} className="mx-auto mb-2 text-stone-300" />
                <p>Cuando lleguen peticiones de tipo "Herramienta" al buzón, aparecerán aquí para evaluar duplicidad antes de aprobar.</p>
              </div>
            )}

            <div className="space-y-2">
              {peticionesHerramienta.map(p => {
                const conflictoExistente = (solapamientos || []).find(s => s.peticionRelacionadaId === p.id);
                return (
                  <div key={p.id} className="border border-stone-200 rounded-md p-3 bg-stone-50/50">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900">{p.titulo}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">{p.equipo} · {(p.funcionalidades || []).join(', ') || 'sin funcionalidades especificadas'}</p>
                      </div>
                      {conflictoExistente ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex-shrink-0">Analizada</span>
                      ) : (
                        <button
                          onClick={() => analizarDuplicidad(p)}
                          disabled={analizandoDuplicidad === p.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded text-[11px] flex-shrink-0 transition-colors"
                        >
                          {analizandoDuplicidad === p.id ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} />}
                          Analizar duplicidad
                        </button>
                      )}
                    </div>
                    {conflictoExistente && (
                      <div className="mt-2 pt-2 border-t border-stone-200 text-[11px]">
                        <p className="text-stone-700 leading-relaxed">{conflictoExistente.recomendacion}</p>
                        {conflictoExistente.ahorroEstimado > 0 && (
                          <p className="text-emerald-700 font-medium mt-1">Ahorro estimado: {Number(conflictoExistente.ahorroEstimado).toLocaleString()}€/año</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

function TalleresView({ talleres, setTalleres, historico, setHistorico, personas, setPersonas, tareas, reuniones = [], setReuniones, tallerInicialId, onCerrarTaller, usuarioActualId, demoMode }) {
  const [tallerActivoId, setTallerActivoId] = useState(tallerInicialId || null);
  const [creandoTaller, setCreandoTaller] = useState(false);
  const [nuevoTallerForm, setNuevoTallerForm] = useState({ nombre: '', descripcion: '', area: '', estado: 'Planificado', lider: '' });
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroPersona, setFiltroPersona] = useState('todas');
  const [filtroArea, setFiltroArea] = useState('todas');
  const [filtroEstadoTaller, setFiltroEstadoTaller] = useState('todos');
  const [vistaTaller, setVistaTaller] = useState('cartas');

  useEffect(() => {
    if (tallerInicialId) setTallerActivoId(tallerInicialId);
  }, [tallerInicialId]);

  const tallerActivo = tallerActivoId ? talleres.find(t => t.id === tallerActivoId) : null;

  const crearTaller = async () => {
    if (!nuevoTallerForm.nombre.trim() || !nuevoTallerForm.descripcion.trim()) return;
    const nuevo = {
      id: `t-${Date.now()}`,
      numero: null,
      nombre: nuevoTallerForm.nombre.trim(),
      descripcion: nuevoTallerForm.descripcion.trim(),
      area: nuevoTallerForm.area.trim() || 'Sin área',
      estado: nuevoTallerForm.estado || 'Planificado',
      lider: nuevoTallerForm.lider.trim() || '',
      objetivos: [],
      documentos: [],
      updatedAt: new Date().toISOString(),
      updatedBy: usuarioActualId || null,
    };
    await setTalleres([...talleres, nuevo]);
    setNuevoTallerForm({ nombre: '', descripcion: '', area: '', estado: 'Planificado', lider: '' });
    setCreandoTaller(false);
    setTallerActivoId(nuevo.id);
  };

  if (tallerActivo) {
    return <TallerDetalle
      taller={tallerActivo}
      talleres={talleres}
      setTalleres={setTalleres}
      historico={historico}
      setHistorico={setHistorico}
      personas={personas}
      setPersonas={setPersonas}
      tareas={tareas}
      reuniones={reuniones}
      setReuniones={setReuniones}
      usuarioActualId={usuarioActualId}
      demoMode={demoMode}
      onBack={() => { setTallerActivoId(null); onCerrarTaller && onCerrarTaller(); }}
    />;
  }

  const areasDisponibles = [...new Set(talleres.map(t => t.area).filter(Boolean))].sort();
  const estadosDisponibles = [...new Set(talleres.map(t => t.estado).filter(Boolean))].sort();

  const tallerLastTouched = (t) => {
    const candidates = [];
    if (t.updatedAt) candidates.push(new Date(t.updatedAt).getTime());
    historico.forEach(e => { if (e.tallerId === t.id && e.fecha) candidates.push(new Date(e.fecha).getTime()); });
    (t.objetivos || []).forEach(o => {
      if (o.fechaCreacion) candidates.push(new Date(o.fechaCreacion).getTime());
    });
    return candidates.length > 0 ? Math.max(...candidates) : 0;
  };

  const talleresFiltrados = talleres.filter(t => {
    if (filtroNombre.trim()) {
      const q = filtroNombre.trim().toLowerCase();
      if (!t.nombre.toLowerCase().includes(q) && !(t.descripcion || '').toLowerCase().includes(q)) return false;
    }
    if (filtroPersona !== 'todas') {
      const integrante = personas.find(p => p.id === filtroPersona);
      if (!integrante || !(integrante.talleres || []).includes(t.id)) return false;
    }
    if (filtroArea !== 'todas' && t.area !== filtroArea) return false;
    if (filtroEstadoTaller !== 'todos' && t.estado !== filtroEstadoTaller) return false;
    return true;
  }).sort((a, b) => tallerLastTouched(b) - tallerLastTouched(a));

  return (
    <div className="p-8 w-full">
      <header className="mb-6 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">Plan Estratégico</p>
          <h1 className="display-1 text-navy-900">Talleres</h1>
          <p className="text-sm text-stone-600 mt-1">{talleres.length} talleres · pulsa cualquiera para ver su evolución y equipo</p>
        </div>
        <button
          onClick={() => setCreandoTaller(!creandoTaller)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors"
        >
          {creandoTaller ? <X size={14} /> : <Plus size={14} />}
          {creandoTaller ? 'Cancelar' : 'Nuevo taller'}
        </button>
      </header>

      {creandoTaller && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-2">
            <Layers size={14} />
            Nuevo taller
          </h3>
          <p className="text-xs text-stone-600 mb-4">Crea el taller con título y descripción. Después podrás añadir personas, objetivos, tareas, eventos y reuniones desde la vista de detalle.</p>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Título <span className="text-red-600">*</span></label>
          <input
            value={nuevoTallerForm.nombre}
            onChange={e => setNuevoTallerForm({ ...nuevoTallerForm, nombre: e.target.value })}
            placeholder="Ej: Plan de talento"
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 mb-3"
          />

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción <span className="text-red-600">*</span></label>
          <textarea
            value={nuevoTallerForm.descripcion}
            onChange={e => setNuevoTallerForm({ ...nuevoTallerForm, descripcion: e.target.value })}
            placeholder="¿Sobre qué trata este taller? ¿Qué objetivos persigue?"
            rows={3}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Líder</label>
              <input
                value={nuevoTallerForm.lider}
                onChange={e => setNuevoTallerForm({ ...nuevoTallerForm, lider: e.target.value })}
                placeholder="Nombre del responsable"
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Área</label>
              <input
                list="taller-areas"
                value={nuevoTallerForm.area}
                onChange={e => setNuevoTallerForm({ ...nuevoTallerForm, area: e.target.value })}
                placeholder="Tecnología, Cultura, Talento…"
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
              />
              <datalist id="taller-areas">
                {areasDisponibles.map(a => <option key={a} value={a} />)}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Estado inicial</label>
              <select
                value={nuevoTallerForm.estado}
                onChange={e => setNuevoTallerForm({ ...nuevoTallerForm, estado: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
              >
                {['Planificado', 'Diseño', 'En curso', 'Activo', 'Pendiente', 'Mockup', 'Exploratorio'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={crearTaller}
            disabled={!nuevoTallerForm.nombre.trim() || !nuevoTallerForm.descripcion.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Crear taller y abrir
          </button>
        </div>
      )}

      <div className="flex items-center gap-1 mb-4 bg-stone-100 rounded-md p-0.5 w-fit">
        <button
          onClick={() => setVistaTaller('cartas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${vistaTaller === 'cartas' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          <Layers size={12} />
          Cartas
        </button>
        <button
          onClick={() => setVistaTaller('organigrama')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${vistaTaller === 'organigrama' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          <Users size={12} />
          Organigrama
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-3 mb-4 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-stone-50 border border-stone-200 rounded-md px-3 py-1.5">
          <Search size={13} className="text-stone-500" />
          <input
            value={filtroNombre}
            onChange={e => setFiltroNombre(e.target.value)}
            placeholder="Buscar por nombre o descripción…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select value={filtroPersona} onChange={e => setFiltroPersona(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 outline-none">
          <option value="todas">Todas las personas</option>
          {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={filtroArea} onChange={e => setFiltroArea(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 outline-none">
          <option value="todas">Todas las áreas</option>
          {areasDisponibles.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={filtroEstadoTaller} onChange={e => setFiltroEstadoTaller(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 outline-none">
          <option value="todos">Todos los estados</option>
          {estadosDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ml-auto text-xs text-stone-500">{talleresFiltrados.length} de {talleres.length}</span>
        {(filtroNombre.trim() || filtroPersona !== 'todas' || filtroArea !== 'todas' || filtroEstadoTaller !== 'todos') && (
          <button
            onClick={() => { setFiltroNombre(''); setFiltroPersona('todas'); setFiltroArea('todas'); setFiltroEstadoTaller('todos'); }}
            className="text-[11px] text-stone-600 hover:text-navy-900 underline"
          >Limpiar</button>
        )}
      </div>

      {talleresFiltrados.length === 0 && (
        <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center">
          <Layers size={36} className="text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-600 font-medium mb-1">No hay talleres que coincidan con los filtros.</p>
          <p className="text-xs text-stone-400">Ajusta o limpia los filtros para verlos todos.</p>
        </div>
      )}

      {vistaTaller === 'organigrama' && talleresFiltrados.length > 0 && (() => {
        const porArea = {};
        talleresFiltrados.forEach(t => {
          const area = t.area || 'Sin área';
          if (!porArea[area]) porArea[area] = [];
          porArea[area].push(t);
        });
        const areasOrden = Object.keys(porArea).sort();
        return (
          <div className="space-y-6">
            {areasOrden.map(area => (
              <div key={area} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 bg-navy-50 border-b border-stone-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-navy-900 uppercase tracking-wider">{area}</h2>
                  <span className="text-xs text-stone-600">{porArea[area].length} {porArea[area].length === 1 ? 'taller' : 'talleres'}</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {porArea[area].map(t => {
                    const integrantes = personas.filter(p => (p.talleres || []).includes(t.id));
                    const responsable = integrantes.find(p => p.nombre === t.lider);
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTallerActivoId(t.id)}
                        className="text-left bg-stone-50/60 border border-stone-200 rounded-xl p-4 hover:border-navy-700 hover:shadow-sm transition-all"
                      >
                        <div className="mb-3 pb-3 border-b border-stone-200">
                          <h3 className="font-serif text-base font-semibold text-navy-900 leading-snug min-h-[2.6rem] line-clamp-2">{t.nombre}</h3>
                          {responsable ? (
                            <p className="text-[11px] text-stone-600 mt-1">Líder: <span className="font-semibold text-stone-800">{responsable.nombre}</span></p>
                          ) : t.lider ? (
                            <p className="text-[11px] text-stone-600 mt-1">Líder: <span className="font-semibold text-stone-800">{t.lider}</span></p>
                          ) : (
                            <p className="text-[11px] text-stone-400 italic mt-1">Sin líder asignado</p>
                          )}
                        </div>
                        {integrantes.length === 0 ? (
                          <p className="text-xs text-stone-400 italic">Sin integrantes</p>
                        ) : (
                          <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">{integrantes.length} {integrantes.length === 1 ? 'integrante' : 'integrantes'}</p>
                            {integrantes.map(p => {
                              const inic = p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                              const esLider = responsable?.id === p.id || p.nombre === t.lider;
                              const esDiaADia = p.nombre === t.diaADia;
                              const matchFiltro = filtroPersona !== 'todas' && filtroPersona === p.id;
                              return (
                                <div key={p.id} className={`flex items-center gap-2 px-2 py-1 rounded-md ${matchFiltro ? 'bg-gold-100 border border-gold-300' : 'bg-white border border-stone-200'}`}>
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-[9px] flex-shrink-0 ${esLider ? 'bg-navy-900 text-stone-50' : 'bg-stone-200 text-stone-700'}`}>{inic}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-stone-800 truncate">{p.nombre}</p>
                                    <p className="text-[10px] text-stone-500 truncate">{getEquipo(p)}</p>
                                  </div>
                                  {esLider && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-navy-100 text-navy-800 font-bold flex-shrink-0">Líder</span>}
                                  {esDiaADia && !esLider && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold flex-shrink-0">Día a día</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {vistaTaller === 'cartas' && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {talleresFiltrados.map(t => {
          const eventos = historico.filter(e => e.tallerId === t.id);
          const eventosOrdenados = [...eventos].sort((a, b) => b.fecha.localeCompare(a.fecha));
          const ultimoEvento = eventosOrdenados[0];
          const tareasAbiertas = tareas.filter(ta => ta.tallerId === t.id && ta.estado === 'pendiente').length;
          const integrantes = personas.filter(p => (p.talleres || []).includes(t.id));
          const responsable = integrantes.find(p => p.nombre === t.lider);
          const conteoTipos = {};
          eventos.forEach(e => { conteoTipos[e.tipo] = (conteoTipos[e.tipo] || 0) + 1; });
          const riesgos = (conteoTipos.riesgo || 0) + (conteoTipos.bloqueo || 0);
          const avances = conteoTipos.avance || 0;

          let salud = 'verde';
          let saludLabel = 'Saludable';
          if (riesgos >= 2) { salud = 'rojo'; saludLabel = 'Atención'; }
          else if (riesgos === 1 || tareasAbiertas > 5) { salud = 'amber'; saludLabel = 'Vigilar'; }
          else if (eventos.length === 0) { salud = 'gris'; saludLabel = 'Sin actividad'; }

          const saludColor = {
            verde: 'bg-emerald-500',
            amber: 'bg-amber-500',
            rojo: 'bg-red-500',
            gris: 'bg-stone-300',
          }[salud];

          const estadoBg = {
            'En curso': 'bg-emerald-50 text-emerald-800 border-emerald-200',
            'Activo': 'bg-emerald-50 text-emerald-800 border-emerald-200',
            'Diseño': 'bg-blue-50 text-blue-800 border-blue-200',
            'Mockup': 'bg-violet-50 text-violet-800 border-violet-200',
            'Planificado': 'bg-stone-50 text-stone-700 border-stone-200',
            'Pendiente': 'bg-amber-50 text-amber-800 border-amber-200',
          }[t.estado] || 'bg-stone-50 text-stone-700 border-stone-200';

          const ultimosEventos = eventosOrdenados.slice(0, 5).reverse();
          const colorEvento = {
            stone: '#a8a29e', blue: '#378ADD', emerald: '#1D9E75',
            violet: '#8b5cf6', amber: '#BA7517', red: '#A32D2D',
          };

          return (
            <button
              key={t.id}
              onClick={() => setTallerActivoId(t.id)}
              className="text-left bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-400 hover:shadow-md transition-all group"
            >
              <div className={`h-1 ${saludColor}`}></div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-[10px] flex-shrink-0">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${estadoBg}`}>{t.estado}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${saludColor}`}></div>
                    <span className="text-stone-600">{saludLabel}</span>
                  </div>
                </div>

                <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-stone-950 leading-snug min-h-[2.6rem] line-clamp-2 mb-1">{t.nombre}</h3>
                <p className="text-[11px] text-stone-500 mb-3 truncate">{t.area || 'Sin área'}</p>

                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100 min-h-[2.5rem]">
                  {responsable ? (
                    <>
                      <div className="w-7 h-7 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-medium text-[10px] flex-shrink-0">
                        {responsable.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-stone-500">Responsable</p>
                        <p className="text-xs font-medium text-stone-900 truncate">{responsable.nombre}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-stone-400">Responsable</p>
                      <p className="text-xs text-stone-400 italic">{t.lider || 'Sin asignar'}</p>
                    </div>
                  )}
                  {t.diaADia && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-stone-500">Día a día</p>
                      <p className="text-xs text-stone-700 truncate max-w-[100px]">{t.diaADia}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-stone-700 leading-relaxed mb-3 line-clamp-2 min-h-[2.4rem]">{t.descripcion}</p>

                {integrantes.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-1.5">
                      {integrantes.slice(0, 5).map(p => (
                        <div
                          key={p.id}
                          className="w-6 h-6 rounded-full bg-stone-200 border-2 border-white text-stone-700 flex items-center justify-center font-medium text-[9px]"
                          title={p.nombre}
                        >
                          {p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                        </div>
                      ))}
                      {integrantes.length > 5 && (
                        <div className="w-6 h-6 rounded-full bg-stone-100 border-2 border-white text-stone-600 flex items-center justify-center font-medium text-[9px]">
                          +{integrantes.length - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500">{integrantes.length} integrantes</span>
                  </div>
                )}

                {ultimosEventos.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Actividad reciente</p>
                    <div className="flex items-center gap-1">
                      {ultimosEventos.map(e => {
                        const t = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.avance;
                        return (
                          <div
                            key={e.id}
                            className="flex-1 h-7 rounded-sm flex items-center justify-center"
                            style={{ backgroundColor: colorEvento[t.color] + '22' }}
                            title={`${t.label}: ${e.titulo}`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorEvento[t.color] }}></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-stone-50 rounded-md p-2 text-center">
                    <p className="text-base font-medium text-stone-900 leading-none">{eventos.length}</p>
                    <p className="text-[9px] uppercase tracking-wider text-stone-500 mt-0.5">Eventos</p>
                  </div>
                  <div className={`rounded-md p-2 text-center ${avances > 0 ? 'bg-emerald-50' : 'bg-stone-50'}`}>
                    <p className={`text-base font-medium leading-none ${avances > 0 ? 'text-emerald-800' : 'text-stone-900'}`}>{avances}</p>
                    <p className={`text-[9px] uppercase tracking-wider mt-0.5 ${avances > 0 ? 'text-emerald-600' : 'text-stone-500'}`}>Avances</p>
                  </div>
                  <div className={`rounded-md p-2 text-center ${riesgos > 0 ? 'bg-amber-50' : 'bg-stone-50'}`}>
                    <p className={`text-base font-medium leading-none ${riesgos > 0 ? 'text-amber-800' : 'text-stone-900'}`}>{riesgos}</p>
                    <p className={`text-[9px] uppercase tracking-wider mt-0.5 ${riesgos > 0 ? 'text-amber-600' : 'text-stone-500'}`}>Riesgos</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-3 text-[10px] text-stone-500">
                    <div className="flex items-center gap-1">
                      <CheckSquare size={10} /> {tareasAbiertas} tareas
                    </div>
                    {ultimoEvento && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} /> {formatFecha(ultimoEvento.fecha, true)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver detalle <ChevronRight size={11} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}

function getEquipo(persona) {
  if (!persona) return 'Sin equipo';
  return persona.equipo || persona.rol || 'Sin equipo';
}

function getNivel(persona, tallerId) {
  if (!persona) return null;
  if (tallerId && persona.nivelesPorTaller && persona.nivelesPorTaller[tallerId] != null) {
    return persona.nivelesPorTaller[tallerId];
  }
  return persona.nivel != null ? persona.nivel : null;
}

const NIVELES = {
  1: { label: 'Nivel 1', desc: 'Más implicado · decisor', color: 'bg-navy-900 text-stone-50', dot: 'bg-navy-900', light: 'bg-stone-100 text-stone-900' },
  2: { label: 'Nivel 2', desc: 'Implicado · operativo', color: 'bg-stone-500 text-stone-50', dot: 'bg-stone-500', light: 'bg-stone-100 text-stone-700' },
  3: { label: 'Nivel 3', desc: 'Parcial · puntual', color: 'bg-stone-300 text-stone-700', dot: 'bg-stone-300', light: 'bg-stone-50 text-stone-600' },
};

function tareaTimestamp(t) {
  if (t.fechaCreacion) return t.fechaCreacion;
  const m = (t.id || '').match(/-(\d{10,})/);
  if (m) return new Date(parseInt(m[1])).toISOString();
  return '1970-01-01T00:00:00.000Z';
}

function ordenarTareasReciente(arr) {
  return [...arr].sort((a, b) => tareaTimestamp(b).localeCompare(tareaTimestamp(a)));
}

function formatFecha(iso, relativa = false) {
  const d = new Date(iso);
  if (relativa) {
    const ahora = new Date('2026-04-29');
    const diff = Math.floor((ahora - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7) return `Hace ${diff}d`;
    if (diff < 30) return `Hace ${Math.floor(diff/7)}sem`;
    if (diff < 365) return `Hace ${Math.floor(diff/30)}m`;
    return `Hace ${Math.floor(diff/365)}a`;
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

const TIPOS_EVENTO = {
  hito: { label: 'Hito', color: 'stone', icon: Flag },
  decision: { label: 'Decisión', color: 'blue', icon: GitBranch },
  avance: { label: 'Avance', color: 'emerald', icon: TrendingUp },
  iniciativa: { label: 'Iniciativa', color: 'violet', icon: Lightbulb },
  riesgo: { label: 'Riesgo', color: 'amber', icon: AlertOctagon },
  bloqueo: { label: 'Bloqueo', color: 'red', icon: AlertTriangle },
  reunion: { label: 'Reunión', color: 'navy', icon: Mic },
  objetivo: { label: 'Objetivo', color: 'gold', icon: CheckCircle2 },
};

function TallerDetalle({ taller, talleres, setTalleres, historico, setHistorico, personas, setPersonas, tareas, reuniones = [], setReuniones, onBack, usuarioActualId, demoMode }) {
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroTiempo, setFiltroTiempo] = useState('historico');
  const [nuevoTipo, setNuevoTipo] = useState('avance');
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [nuevoAutor, setNuevoAutor] = useState('p6');
  const [añadiendo, setAñadiendo] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [generandoResumen, setGenerandoResumen] = useState(false);
  const [editandoEventoId, setEditandoEventoId] = useState(null);
  const [gestionandoMiembros, setGestionandoMiembros] = useState(false);
  const [editandoTaller, setEditandoTaller] = useState(false);
  const [editTallerForm, setEditTallerForm] = useState({
    nombre: taller.nombre || '',
    descripcion: taller.descripcion || '',
    area: taller.area || '',
    estado: taller.estado || '',
    lider: taller.lider || '',
    diaADia: taller.diaADia || '',
  });

  useEffect(() => {
    setEditTallerForm({
      nombre: taller.nombre || '',
      descripcion: taller.descripcion || '',
      area: taller.area || '',
      estado: taller.estado || '',
      lider: taller.lider || '',
      diaADia: taller.diaADia || '',
    });
  }, [taller.id]);

  const guardarTaller = async () => {
    if (!editTallerForm.nombre.trim() || !editTallerForm.descripcion.trim()) return;
    if (!setTalleres) return;
    const actualizados = talleres.map(t => t.id === taller.id ? {
      ...t,
      nombre: editTallerForm.nombre.trim(),
      descripcion: editTallerForm.descripcion.trim(),
      area: editTallerForm.area.trim(),
      estado: editTallerForm.estado || t.estado,
      lider: editTallerForm.lider.trim(),
      diaADia: editTallerForm.diaADia.trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: usuarioActualId || null,
    } : t);
    await setTalleres(actualizados);
    setEditandoTaller(false);
  };

  const eliminarTaller = async () => {
    if (!setTalleres) return;
    if (!confirm(`¿Eliminar el taller "${taller.nombre}"? Se eliminarán también sus eventos del histórico. Esta acción no se puede deshacer.`)) return;
    await setTalleres(talleres.filter(t => t.id !== taller.id));
    if (setHistorico) await setHistorico(historico.filter(e => e.tallerId !== taller.id));
    onBack && onBack();
  };

  // Objetivos
  const [nuevoObjTitulo, setNuevoObjTitulo] = useState('');
  const [nuevoObjFecha, setNuevoObjFecha] = useState('');
  const objetivos = Array.isArray(taller.objetivos) ? taller.objetivos : [];

  const guardarObjetivos = async (nuevos) => {
    if (!setTalleres || !talleres) return;
    const actualizados = talleres.map(t => t.id === taller.id ? { ...t, objetivos: nuevos } : t);
    await setTalleres(actualizados);
  };

  const añadirObjetivo = async () => {
    if (!nuevoObjTitulo.trim() || !nuevoObjFecha) return;
    const nuevo = {
      id: `obj-${Date.now()}`,
      titulo: nuevoObjTitulo.trim(),
      fecha: nuevoObjFecha,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString().slice(0, 10),
    };
    await guardarObjetivos([...objetivos, nuevo]);
    setNuevoObjTitulo(''); setNuevoObjFecha('');
  };

  const toggleObjetivo = async (objId) => {
    const obj = objetivos.find(o => o.id === objId);
    if (!obj) return;
    const nuevoEstado = obj.estado === 'completado' ? 'pendiente' : 'completado';
    let eventoCumplimientoId = obj.eventoCumplimientoId || null;

    if (nuevoEstado === 'completado') {
      const nuevoEvento = {
        id: `e-obj-${Date.now()}`,
        tallerId: taller.id,
        fecha: new Date().toISOString().slice(0, 10),
        tipo: 'objetivo',
        titulo: `Objetivo cumplido: ${obj.titulo}`,
        descripcion: `Objetivo "${obj.titulo}" del taller marcado como completado.`,
        autorId: usuarioActualId || null,
        objetivoId: obj.id,
      };
      if (setHistorico && historico) {
        await setHistorico([...historico, nuevoEvento]);
      }
      eventoCumplimientoId = nuevoEvento.id;
    } else {
      if (eventoCumplimientoId && setHistorico && historico) {
        await setHistorico(historico.filter(e => e.id !== eventoCumplimientoId));
      }
      eventoCumplimientoId = null;
    }

    await guardarObjetivos(objetivos.map(o => o.id === objId ? { ...o, estado: nuevoEstado, eventoCumplimientoId } : o));
  };

  const eliminarObjetivo = async (objId) => {
    if (!confirm('¿Eliminar este objetivo?')) return;
    const obj = objetivos.find(o => o.id === objId);
    if (obj?.eventoCumplimientoId && setHistorico && historico) {
      await setHistorico(historico.filter(e => e.id !== obj.eventoCumplimientoId));
    }
    await guardarObjetivos(objetivos.filter(o => o.id !== objId));
  };

  const [objetivoActivoId, setObjetivoActivoId] = useState(null);
  const [editandoObjetivo, setEditandoObjetivo] = useState(false);
  const [objetivoEditForm, setObjetivoEditForm] = useState({ titulo: '', fecha: '' });

  useEffect(() => {
    if (objetivoActivoId) {
      const obj = objetivos.find(o => o.id === objetivoActivoId);
      if (obj) setObjetivoEditForm({ titulo: obj.titulo || '', fecha: obj.fecha || '' });
    }
    setEditandoObjetivo(false);
  }, [objetivoActivoId]);

  const guardarEdicionObjetivo = async () => {
    if (!objetivoEditForm.titulo.trim() || !objetivoEditForm.fecha) return;
    const obj = objetivos.find(o => o.id === objetivoActivoId);
    if (!obj) return;
    await guardarObjetivos(objetivos.map(o => o.id === objetivoActivoId ? { ...o, titulo: objetivoEditForm.titulo.trim(), fecha: objetivoEditForm.fecha } : o));
    if (obj.eventoCumplimientoId && setHistorico && historico) {
      const nuevoTitulo = `Objetivo cumplido: ${objetivoEditForm.titulo.trim()}`;
      const nuevaDesc = `Objetivo "${objetivoEditForm.titulo.trim()}" del taller marcado como completado.`;
      await setHistorico(historico.map(e => e.id === obj.eventoCumplimientoId ? { ...e, titulo: nuevoTitulo, descripcion: nuevaDesc } : e));
    }
    setEditandoObjetivo(false);
  };

  const toggleReunionEnObjetivo = async (objId, reunionId) => {
    await guardarObjetivos(objetivos.map(o => {
      if (o.id !== objId) return o;
      const linked = o.reunionIds || [];
      const yaVinculada = linked.includes(reunionId);
      return { ...o, reunionIds: yaVinculada ? linked.filter(id => id !== reunionId) : [...linked, reunionId] };
    }));
  };

  // Documentos
  const documentos = Array.isArray(taller.documentos) ? taller.documentos : [];
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [errorDoc, setErrorDoc] = useState(null);
  const fileInputRef = useRef(null);

  const guardarDocumentos = async (nuevos) => {
    if (!setTalleres || !talleres) return;
    const actualizados = talleres.map(t => t.id === taller.id ? { ...t, documentos: nuevos } : t);
    await setTalleres(actualizados);
  };

  const subirDocumento = async (file) => {
    if (!file) return;
    setErrorDoc(null);
    setSubiendoDoc(true);
    try {
      let url, storagePath = null;
      if (demoMode) {
        url = URL.createObjectURL(file);
      } else {
        const safe = file.name.replace(/[^a-z0-9._-]/gi, '_');
        storagePath = `${taller.id}/${Date.now()}-${safe}`;
        const { error } = await supabase.storage.from('taller-docs').upload(storagePath, file);
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from('taller-docs').getPublicUrl(storagePath);
        url = data.publicUrl;
      }
      const docNuevo = {
        id: `doc-${Date.now()}`,
        nombre: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url,
        storagePath,
        subidoPor: usuarioActualId,
        subidoEn: new Date().toISOString(),
      };
      await guardarDocumentos([...documentos, docNuevo]);
    } catch (e) {
      setErrorDoc('Error subiendo: ' + e.message);
    }
    setSubiendoDoc(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const eliminarDocumento = async (doc) => {
    if (!confirm(`¿Eliminar "${doc.nombre}"?`)) return;
    if (!demoMode && doc.storagePath) {
      try { await supabase.storage.from('taller-docs').remove([doc.storagePath]); } catch (e) { /* continue */ }
    }
    await guardarDocumentos(documentos.filter(d => d.id !== doc.id));
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const iconoDocumento = (mimeType, nombre) => {
    const ext = (nombre || '').split('.').pop()?.toLowerCase() || '';
    if (mimeType?.startsWith('image/')) return { color: 'bg-violet-100 text-violet-700', label: 'IMG' };
    if (ext === 'pdf' || mimeType === 'application/pdf') return { color: 'bg-red-100 text-red-700', label: 'PDF' };
    if (['xlsx', 'xls', 'csv'].includes(ext)) return { color: 'bg-emerald-100 text-emerald-700', label: 'XLS' };
    if (['docx', 'doc'].includes(ext)) return { color: 'bg-blue-100 text-blue-700', label: 'DOC' };
    if (['pptx', 'ppt'].includes(ext)) return { color: 'bg-gold-100 text-gold-700', label: 'PPT' };
    if (['zip', 'rar', '7z'].includes(ext)) return { color: 'bg-stone-200 text-stone-700', label: 'ZIP' };
    return { color: 'bg-stone-100 text-stone-700', label: ext.toUpperCase().slice(0, 3) || 'FILE' };
  };

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));

  const cutoffDiasMap = { mes: 30, '3meses': 90, '6meses': 180, '1ano': 365, '5anos': 365 * 5 };
  const eventoDentroDelRango = (e) => {
    if (filtroTiempo === 'historico') return true;
    const dias = cutoffDiasMap[filtroTiempo];
    if (!dias || !e.fecha) return true;
    const fechaE = new Date(e.fecha);
    if (isNaN(fechaE)) return true;
    const ahora = new Date();
    return (ahora - fechaE) / 86400000 <= dias;
  };

  const eventosOrdenados = historico
    .filter(e => e.tallerId === taller.id)
    .filter(e => filtroTipo === 'todos' || e.tipo === filtroTipo)
    .filter(eventoDentroDelRango)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  const totalEventos = historico.filter(e => e.tallerId === taller.id).length;
  const tareasTaller = tareas.filter(t => t.tallerId === taller.id);
  const tareasAbiertas = tareasTaller.filter(t => t.estado === 'pendiente').length;

  const ultimaModificacion = (() => {
    const candidatos = [];
    if (taller.updatedAt) candidatos.push({ ts: new Date(taller.updatedAt).getTime(), autorId: taller.updatedBy, accion: 'editó la información del taller' });
    historico.filter(e => e.tallerId === taller.id && e.fecha).forEach(e => {
      const tipoLabel = TIPOS_EVENTO[e.tipo]?.label || 'evento';
      candidatos.push({ ts: new Date(e.fecha).getTime(), autorId: e.autorId, accion: `añadió ${tipoLabel.toLowerCase()}: "${e.titulo || ''}"` });
    });
    if (candidatos.length === 0) return null;
    return candidatos.reduce((acc, c) => (c.ts > acc.ts ? c : acc));
  })();
  const ultimaPersona = ultimaModificacion?.autorId ? personaById[ultimaModificacion.autorId] : null;

  const conteoTipos = {};
  historico.filter(e => e.tallerId === taller.id).forEach(e => {
    conteoTipos[e.tipo] = (conteoTipos[e.tipo] || 0) + 1;
  });

  const añadirEvento = async () => {
    if (!nuevoTitulo.trim()) return;
    const nuevo = {
      id: `e-${Date.now()}`,
      tallerId: taller.id,
      fecha: new Date().toISOString().slice(0, 10),
      tipo: nuevoTipo,
      titulo: nuevoTitulo,
      descripcion: nuevaDesc,
      autorId: nuevoAutor,
    };
    await setHistorico([...historico, nuevo]);
    setNuevoTitulo(''); setNuevaDesc(''); setAñadiendo(false);
  };

  const actualizarEvento = async (eventoId, cambios) => {
    const nuevoHistorico = historico.map(e => e.id === eventoId ? { ...e, ...cambios } : e);
    await setHistorico(nuevoHistorico);
  };

  const eliminarEvento = async (eventoId) => {
    if (!confirm('¿Eliminar este evento de la evolución? Esta acción no se puede deshacer.')) return;
    await setHistorico(historico.filter(e => e.id !== eventoId));
  };

  const toggleMiembro = async (personaId) => {
    if (!setPersonas) return;
    const nuevasPersonas = personas.map(p => {
      if (p.id !== personaId) return p;
      const ts = p.talleres || [];
      return { ...p, talleres: ts.includes(taller.id) ? ts.filter(t => t !== taller.id) : [...ts, taller.id] };
    });
    await setPersonas(nuevasPersonas);
  };

  const setNivelEnTaller = async (personaId, nivel) => {
    if (!setPersonas) return;
    const nuevasPersonas = personas.map(p => {
      if (p.id !== personaId) return p;
      const npt = { ...(p.nivelesPorTaller || {}) };
      if (nivel == null) {
        delete npt[taller.id];
      } else {
        npt[taller.id] = nivel;
      }
      return { ...p, nivelesPorTaller: npt };
    });
    await setPersonas(nuevasPersonas);
  };

  const generarResumen = async () => {
    setGenerandoResumen(true);
    setResumen(null);
    const eventos = historico.filter(e => e.tallerId === taller.id).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const prompt = `Genera un resumen ejecutivo del estado y evolución de este taller del Plan Estratégico de la compañía. El resumen va dirigido al Comité y debe ser claro, directo y útil. Estructura:

ESTADO ACTUAL (2 frases)
HITOS ALCANZADOS (3-4 bullets)
EN CURSO (2-3 bullets)
RIESGOS Y ALERTAS (si los hay)
PRÓXIMOS PASOS (2-3 bullets)

TALLER: ${taller.nombre}
LÍDER: ${taller.lider}${taller.diaADia ? ` · día a día ${taller.diaADia}` : ''}
DESCRIPCIÓN: ${taller.descripcion}

EVOLUCIÓN HISTÓRICA (cronológica):
${eventos.map(e => `[${e.fecha}] ${TIPOS_EVENTO[e.tipo]?.label || e.tipo}: ${e.titulo} — ${e.descripcion}`).join('\n')}

TAREAS ABIERTAS: ${tareasAbiertas}`;
    const respuesta = await callClaude('Eres el secretario del Comité de seguimiento del Plan Estratégico de la compañía. Generas resúmenes ejecutivos claros para que el comité tenga un pulso rápido del estado de cada taller.', prompt);
    setResumen(respuesta);
    setGenerandoResumen(false);
  };

  return (
    <div className="p-8 w-full">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 transition-colors">
          <ArrowLeft size={14} /> Volver a talleres
        </button>
        <button
          onClick={() => setEditandoTaller(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-500 text-stone-700 rounded-md text-xs font-medium transition-colors"
        >
          <Settings size={12} /> Editar taller
        </button>
      </div>

      {objetivoActivoId && (() => {
        const obj = objetivos.find(o => o.id === objetivoActivoId);
        if (!obj) return null;
        const reunionesDelTaller = (reuniones || []).filter(r => (r.tallerIds || []).includes(taller.id));
        const linkedIds = obj.reunionIds || [];
        const reunionesVinculadas = reunionesDelTaller.filter(r => linkedIds.includes(r.id));
        const reunionesDisponibles = reunionesDelTaller.filter(r => !linkedIds.includes(r.id));
        const personasUnicas = [...new Set(reunionesVinculadas.flatMap(r => r.asistentes || []))]
          .map(id => personas.find(p => p.id === id))
          .filter(Boolean);
        const completado = obj.estado === 'completado';
        return (
          <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={() => setObjetivoActivoId(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-stone-200 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${completado ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'}`}>
                      {completado ? '✓ Cumplido' : 'Pendiente'}
                    </span>
                    {!editandoObjetivo && (
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Calendar size={11} /> {formatFecha(obj.fecha)}
                      </span>
                    )}
                  </div>
                  {editandoObjetivo ? (
                    <div className="space-y-2">
                      <input
                        value={objetivoEditForm.titulo}
                        onChange={e => setObjetivoEditForm({ ...objetivoEditForm, titulo: e.target.value })}
                        className="w-full font-serif text-2xl text-navy-900 bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 outline-none focus:border-navy-700"
                        placeholder="Título del objetivo"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={objetivoEditForm.fecha}
                          onChange={e => setObjetivoEditForm({ ...objetivoEditForm, fecha: e.target.value })}
                          className="text-sm bg-stone-50 border border-stone-300 rounded-md px-3 py-1.5 outline-none focus:border-navy-700"
                        />
                        <button
                          onClick={guardarEdicionObjetivo}
                          disabled={!objetivoEditForm.titulo.trim() || !objetivoEditForm.fecha}
                          className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-xs font-semibold transition-colors"
                        >Guardar</button>
                        <button onClick={() => { setEditandoObjetivo(false); setObjetivoEditForm({ titulo: obj.titulo, fecha: obj.fecha }); }} className="text-xs text-stone-600 hover:text-stone-900 px-2">Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-2xl text-navy-900">{obj.titulo}</h2>
                      <button
                        onClick={() => setEditandoObjetivo(true)}
                        className="text-[11px] text-stone-500 hover:text-navy-900 underline"
                        title="Editar título y fecha"
                      >Editar</button>
                    </div>
                  )}
                </div>
                <button onClick={() => setObjetivoActivoId(null)} className="text-stone-400 hover:text-stone-700 flex-shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto p-6 space-y-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Personas con las que te has reunido <span className="normal-case text-stone-400 font-normal">· {personasUnicas.length}</span></p>
                  {personasUnicas.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">Aún no hay reuniones vinculadas a este objetivo. Marca abajo qué reuniones del taller están relacionadas.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {personasUnicas.map(p => {
                        const inic = p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
                        return (
                          <div key={p.id} className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-md px-2 py-1">
                            <div className="w-6 h-6 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-semibold text-[10px]">{inic}</div>
                            <div className="text-xs">
                              <p className="font-semibold text-stone-800 leading-tight">{p.nombre}</p>
                              <p className="text-[10px] text-stone-500 leading-tight">{getEquipo(p)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Reuniones vinculadas a este objetivo <span className="normal-case text-stone-400 font-normal">· {reunionesVinculadas.length}</span></p>
                  {reunionesVinculadas.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">Ninguna todavía.</p>
                  ) : (
                    <div className="space-y-2">
                      {reunionesVinculadas.map(r => {
                        const asistentes = (r.asistentes || []).map(id => personas.find(p => p.id === id)).filter(Boolean);
                        return (
                          <div key={r.id} className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Mic size={12} className="text-emerald-700 flex-shrink-0" />
                                  <p className="text-sm font-bold text-navy-900">{r.titulo}</p>
                                </div>
                                <p className="text-[11px] text-stone-600 mt-0.5">{r.fecha ? formatFecha(r.fecha) : 'Sin fecha'} · {asistentes.length} {asistentes.length === 1 ? 'asistente' : 'asistentes'}</p>
                              </div>
                              <button
                                onClick={() => toggleReunionEnObjetivo(obj.id, r.id)}
                                className="text-[11px] text-emerald-700 hover:text-emerald-900 underline flex-shrink-0"
                              >Desvincular</button>
                            </div>
                            {asistentes.length > 0 && (
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                {asistentes.map(p => (
                                  <span key={p.id} className="text-[10px] bg-white border border-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{p.nombre}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {reunionesDisponibles.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Otras reuniones del taller <span className="normal-case text-stone-400 font-normal">· vincula las que estén relacionadas</span></p>
                    <div className="space-y-2">
                      {reunionesDisponibles.map(r => {
                        const asistentes = (r.asistentes || []).map(id => personas.find(p => p.id === id)).filter(Boolean);
                        return (
                          <div key={r.id} className="bg-white border border-stone-200 rounded-md p-3 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Mic size={12} className="text-stone-500 flex-shrink-0" />
                                <p className="text-sm font-semibold text-stone-800">{r.titulo}</p>
                              </div>
                              <p className="text-[11px] text-stone-500 mt-0.5">{r.fecha ? formatFecha(r.fecha) : 'Sin fecha'} · {asistentes.length} {asistentes.length === 1 ? 'asistente' : 'asistentes'}</p>
                            </div>
                            <button
                              onClick={() => toggleReunionEnObjetivo(obj.id, r.id)}
                              className="text-[11px] px-2 py-1 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded font-semibold transition-colors flex-shrink-0"
                            >Vincular</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {reunionesDelTaller.length === 0 && (
                  <div className="bg-stone-50 border border-stone-200 rounded-md p-4 text-xs text-stone-600">
                    Este taller todavía no tiene reuniones registradas. Crea una desde la pestaña <span className="font-semibold">Reuniones</span> y vincúlala a este taller para que aparezca aquí.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-stone-200 flex items-center justify-end">
                <button onClick={() => setObjetivoActivoId(null)} className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors">Cerrar</button>
              </div>
            </div>
          </div>
        );
      })()}

      {editandoTaller && (
        <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={() => setEditandoTaller(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-200 flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-1">Editar taller</p>
                <h2 className="font-serif text-2xl text-stone-900">{taller.nombre}</h2>
              </div>
              <button onClick={() => setEditandoTaller(false)} className="text-stone-400 hover:text-stone-700"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Título <span className="text-red-600">*</span></label>
                <input
                  value={editTallerForm.nombre}
                  onChange={e => setEditTallerForm({ ...editTallerForm, nombre: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción <span className="text-red-600">*</span></label>
                <textarea
                  value={editTallerForm.descripcion}
                  onChange={e => setEditTallerForm({ ...editTallerForm, descripcion: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Líder</label>
                  <input
                    value={editTallerForm.lider}
                    onChange={e => setEditTallerForm({ ...editTallerForm, lider: e.target.value })}
                    placeholder="Nombre del responsable"
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Día a día</label>
                  <input
                    value={editTallerForm.diaADia}
                    onChange={e => setEditTallerForm({ ...editTallerForm, diaADia: e.target.value })}
                    placeholder="Quien lo lleva en el día a día"
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Área</label>
                  <input
                    value={editTallerForm.area}
                    onChange={e => setEditTallerForm({ ...editTallerForm, area: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Estado</label>
                  <select
                    value={editTallerForm.estado}
                    onChange={e => setEditTallerForm({ ...editTallerForm, estado: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  >
                    {['Planificado', 'Diseño', 'En curso', 'Activo', 'Pendiente', 'Mockup', 'Exploratorio', taller.estado].filter((v, i, a) => v && a.indexOf(v) === i).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={eliminarTaller}
                className="text-xs text-red-700 hover:text-red-800 font-medium transition-colors flex items-center gap-1"
              >
                <X size={12} /> Eliminar taller
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditandoTaller(false)} className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-sm">Cancelar</button>
                <button
                  onClick={guardarTaller}
                  disabled={!editTallerForm.nombre.trim() || !editTallerForm.descripcion.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
                >Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 pb-8 border-b border-stone-200">
        <div className="flex items-start justify-between mb-4 gap-6 flex-wrap">
          <div className="max-w-3xl">
            <p className="eyebrow text-navy-800 mb-3">{taller.area}</p>
            <h1 className="display-1 text-navy-900 mb-3">{taller.nombre}</h1>
            <hr className="savills-rule w-32 mb-4" />
            <p className="text-base text-stone-700">
              Liderazgo: <span className="text-navy-900 font-bold">{taller.lider}</span>
              {taller.diaADia && <> · día a día <span className="text-navy-900 font-bold">{taller.diaADia}</span></>}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-navy-800 bg-navy-50 border border-navy-100 px-3 py-1.5 rounded-md">{taller.estado}</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                <RadioTower size={11} /> En vivo
              </div>
            </div>
            {ultimaModificacion && (
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-md px-3 py-1.5" title={ultimaModificacion.accion}>
                <div className={`w-6 h-6 rounded-full text-stone-50 flex items-center justify-center font-semibold text-[10px] flex-shrink-0 ${ultimaPersona ? 'bg-navy-900' : 'bg-stone-400'}`}>
                  {ultimaPersona ? ultimaPersona.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : '?'}
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 leading-none">Última modificación</p>
                  <p className="text-xs font-semibold text-stone-800 leading-tight mt-0.5">
                    {ultimaPersona?.nombre || 'Desconocido'}
                    <span className="text-stone-500 font-normal"> · {formatFecha(new Date(ultimaModificacion.ts).toISOString(), true)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-base text-stone-700 leading-relaxed max-w-3xl">{taller.descripcion}</p>
      </header>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric label="Eventos" value={totalEventos} />
        <Metric label="Tareas abiertas" value={tareasAbiertas} accent={tareasAbiertas > 0 ? 'amber' : undefined} />
        <Metric label="Avances" value={conteoTipos.avance || 0} accent="emerald" />
        <Metric label="Riesgos" value={(conteoTipos.riesgo || 0) + (conteoTipos.bloqueo || 0)} accent={(conteoTipos.riesgo || conteoTipos.bloqueo) ? 'amber' : undefined} />
      </div>

      {(() => {
        const integrantes = personas.filter(p => (p.talleres || []).includes(taller.id));
        const responsable = integrantes.find(p => p.nombre === taller.lider) || integrantes.find(p => (getEquipo(p) || '').toLowerCase().includes('líder'));
        const diaADiaPersona = taller.diaADia ? integrantes.find(p => p.nombre === taller.diaADia) : null;
        const otros = integrantes.filter(p => p.id !== responsable?.id && p.id !== diaADiaPersona?.id);
        return (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
                <Users size={17} className="text-navy-700" />
                Integrantes del taller
                <span className="text-base text-stone-500 font-medium">· {integrantes.length}</span>
              </h3>
              <button
                onClick={() => setGestionandoMiembros(!gestionandoMiembros)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md text-xs transition-colors"
              >
                {gestionandoMiembros ? <X size={12} /> : <Plus size={12} />}
                {gestionandoMiembros ? 'Cerrar' : 'Gestionar miembros'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {responsable && (
                <div className="flex items-center gap-3 p-3 bg-navy-900 rounded-lg">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-stone-50 text-stone-900 flex items-center justify-center font-medium text-xs">
                      {responsable.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {getNivel(responsable, taller.id) && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-navy-900 flex items-center justify-center text-[9px] font-bold ${NIVELES[getNivel(responsable, taller.id)].color}`}>
                        {getNivel(responsable, taller.id)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-0.5">Responsable</p>
                    <p className="text-sm font-medium text-stone-50">{responsable.nombre}</p>
                    <p className="text-[11px] text-stone-400">{getEquipo(responsable)}</p>
                  </div>
                </div>
              )}
              {diaADiaPersona && (
                <div className="flex items-center gap-3 p-3 bg-stone-100 rounded-lg">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-medium text-xs">
                      {diaADiaPersona.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                    </div>
                    {getNivel(diaADiaPersona, taller.id) && (
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-stone-100 flex items-center justify-center text-[9px] font-bold ${NIVELES[getNivel(diaADiaPersona, taller.id)].color}`}>
                        {getNivel(diaADiaPersona, taller.id)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-0.5">Día a día</p>
                    <p className="text-sm font-medium text-stone-900">{diaADiaPersona.nombre}</p>
                    <p className="text-[11px] text-stone-600">{getEquipo(diaADiaPersona)}</p>
                  </div>
                </div>
              )}
            </div>

            {otros.length > 0 && (
              <>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Equipo</p>
                <div className="flex flex-wrap gap-2">
                  {otros.map(p => {
                    const tareasPersona = tareas.filter(t => t.personaId === p.id && t.tallerId === taller.id && t.estado === 'pendiente').length;
                    const nivel = getNivel(p, taller.id);
                    return (
                      <div key={p.id} className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-md px-2.5 py-1.5 group">
                        <div className="relative flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-medium text-[10px]">
                            {p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                          </div>
                          {nivel && (
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-stone-50 flex items-center justify-center text-[8px] font-bold ${NIVELES[nivel].color}`}>
                              {nivel}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-900 leading-tight">{p.nombre}</p>
                          <p className="text-[10px] text-stone-500 leading-tight">{getEquipo(p)}</p>
                        </div>
                        {tareasPersona > 0 && (
                          <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded ml-1">{tareasPersona}</span>
                        )}
                        {gestionandoMiembros && (
                          <>
                            <div className="flex items-center gap-0.5 ml-1 bg-white rounded p-0.5 border border-stone-200">
                              {[1, 2, 3].map(n => (
                                <button
                                  key={n}
                                  onClick={() => setNivelEnTaller(p.id, n)}
                                  title={`${NIVELES[n].label} · ${NIVELES[n].desc}`}
                                  className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
                                    nivel === n ? NIVELES[n].color : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                                  }`}
                                >{n}</button>
                              ))}
                            </div>
                            <button
                              onClick={() => toggleMiembro(p.id)}
                              className="ml-0.5 text-stone-400 hover:text-red-700 transition-colors"
                              title="Quitar del taller"
                            ><X size={12} /></button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {integrantes.length === 0 && !gestionandoMiembros && (
              <p className="text-xs text-stone-500 italic">No hay personas asignadas a este taller. Pulsa "Gestionar miembros" para añadir.</p>
            )}

            {gestionandoMiembros && (
              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-2">Añadir personas al taller</p>
                <div className="flex flex-wrap gap-1.5">
                  {personas.filter(p => !(p.talleres || []).includes(taller.id)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => toggleMiembro(p.id)}
                      className="flex items-center gap-1.5 bg-white border border-stone-200 hover:border-navy-900 hover:bg-navy-900 hover:text-stone-50 rounded-md px-2 py-1 text-xs transition-colors group"
                    >
                      <Plus size={10} />
                      <span>{p.nombre}</span>
                      <span className="text-stone-400 group-hover:text-stone-300">· {getEquipo(p)}</span>
                    </button>
                  ))}
                  {personas.filter(p => !(p.talleres || []).includes(taller.id)).length === 0 && (
                    <p className="text-xs text-stone-500 italic">Todas las personas registradas ya pertenecen a este taller.</p>
                  )}
                </div>
                {integrantes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-200">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Implicación en este taller</p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-stone-600">
                      <span className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${NIVELES[1].color}`}>1</span>Más implicado · decisor</span>
                      <span className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${NIVELES[2].color}`}>2</span>Implicado · operativo</span>
                      <span className="flex items-center gap-1"><span className={`w-3 h-3 rounded-full flex items-center justify-center text-[7px] font-bold ${NIVELES[3].color}`}>3</span>Parcial · puntual</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-2">El nivel se asigna por taller. Una persona puede estar muy implicada en uno y poco en otro.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* TAREAS DEL TALLER */}
      {(() => {
        const tareasDelTaller = ordenarTareasReciente(tareas.filter(t => t.tallerId === taller.id));
        const pendientesT = tareasDelTaller.filter(t => t.estado === 'pendiente');
        const completadasT = tareasDelTaller.filter(t => t.estado === 'completada');
        if (tareasDelTaller.length === 0) return null;
        return (
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
                <CheckSquare size={17} className="text-navy-700" />
                Tareas del taller
                <span className="text-base text-stone-500 font-medium">· {tareasDelTaller.length}</span>
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-gold-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                  {pendientesT.length} pendientes
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {completadasT.length} completadas
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {tareasDelTaller.slice(0, 8).map(t => {
                const persona = personaById[t.personaId];
                const completado = t.estado === 'completada';
                const accentBar = t.prioridad === 'alta' ? 'bg-red-500' : t.prioridad === 'media' ? 'bg-gold-500' : 'bg-stone-400';
                return (
                  <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${completado ? 'border-emerald-200 bg-emerald-50/40' : 'border-stone-200 bg-white'}`}>
                    <div className={`w-1 h-10 rounded-full ${completado ? 'bg-emerald-500' : accentBar} flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${completado ? 'text-stone-500 line-through' : 'text-navy-900'}`}>{t.tarea}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-600 flex-wrap">
                        {persona && (
                          <span className="flex items-center gap-1 font-medium">
                            <span className="w-4 h-4 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center text-[8px] font-bold">{persona.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}</span>
                            {persona.nombre}
                          </span>
                        )}
                        {t.deadline && t.deadline !== 'Sin fecha' && (
                          <span className="text-navy-800 font-semibold bg-navy-50 px-1.5 py-0.5 rounded">{t.deadline}</span>
                        )}
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${t.prioridad === 'alta' ? 'text-red-700' : t.prioridad === 'media' ? 'text-gold-700' : 'text-stone-500'}`}>
                          {t.prioridad}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tareasDelTaller.length > 8 && (
                <p className="text-xs text-stone-500 italic text-center pt-2">+ {tareasDelTaller.length - 8} tareas más en el módulo de Tareas</p>
              )}
            </div>
          </div>
        );
      })()}

      {/* OBJETIVOS DEL TALLER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <Flag size={17} className="text-gold-600" />
            Objetivos
            <span className="text-base text-stone-500 font-medium">· {objetivos.length}</span>
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {objetivos.filter(o => o.estado === 'completado').length} completados
            </span>
            <span className="flex items-center gap-1.5 text-gold-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-gold-500"></span>
              {objetivos.filter(o => o.estado === 'pendiente').length} pendientes
            </span>
          </div>
        </div>

        {objetivos.length === 0 && (
          <p className="text-sm text-stone-500 italic mb-4">No hay objetivos definidos. Añade el primero abajo con su fecha límite.</p>
        )}

        {objetivos.length > 0 && (
          <div className="space-y-2 mb-4">
            {[...objetivos].sort((a, b) => {
              if (a.estado !== b.estado) return a.estado === 'pendiente' ? -1 : 1;
              return (a.fecha || '').localeCompare(b.fecha || '');
            }).map(obj => {
              const completado = obj.estado === 'completado';
              const hoy = new Date(); hoy.setHours(0,0,0,0);
              const fechaObj = new Date(obj.fecha); fechaObj.setHours(0,0,0,0);
              const diasRestantes = Math.round((fechaObj - hoy) / 86400000);
              const vencido = diasRestantes < 0 && !completado;
              const cercano = diasRestantes >= 0 && diasRestantes <= 7 && !completado;

              const accent = completado ? 'border-emerald-300 bg-emerald-50/50' :
                vencido ? 'border-red-300 bg-red-50/50' :
                cercano ? 'border-gold-300 bg-gold-50/50' :
                'border-stone-200 bg-white';

              return (
                <div key={obj.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${accent} transition-colors`}>
                  <button
                    onClick={() => toggleObjetivo(obj.id)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${completado ? 'bg-emerald-500 border-emerald-500' : 'border-stone-400 hover:border-emerald-500'}`}
                  >
                    {completado && <CheckCircle2 size={14} className="text-white" />}
                  </button>
                  <button
                    onClick={() => setObjetivoActivoId(obj.id)}
                    className="flex-1 min-w-0 text-left hover:bg-white/60 rounded px-1 py-0.5 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold leading-tight ${completado ? 'text-stone-500 line-through' : 'text-navy-900 group-hover:text-navy-950'}`}>{obj.titulo}</p>
                      {(obj.reunionIds || []).length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-navy-100 text-navy-800 font-bold flex-shrink-0">
                          <Mic size={9} /> {(obj.reunionIds || []).length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                      <span className={`flex items-center gap-1 font-medium ${completado ? 'text-stone-400' : vencido ? 'text-red-700' : cercano ? 'text-gold-700' : 'text-stone-600'}`}>
                        <Calendar size={11} /> {formatFecha(obj.fecha)}
                      </span>
                      {!completado && (
                        <span className={`font-bold ${vencido ? 'text-red-700' : cercano ? 'text-gold-700' : 'text-stone-500'}`}>
                          {vencido ? `Vencido hace ${Math.abs(diasRestantes)}d` : diasRestantes === 0 ? 'Hoy' : diasRestantes === 1 ? 'Mañana' : `En ${diasRestantes} días`}
                        </span>
                      )}
                      {completado && <span className="text-emerald-700 font-bold">✓ Completado</span>}
                      <span className="ml-auto text-[10px] text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity">Pulsa para ver reuniones →</span>
                    </div>
                  </button>
                  <button onClick={() => eliminarObjetivo(obj.id)} className="text-stone-400 hover:text-red-700 transition-colors p-1" title="Eliminar">
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
          <p className="eyebrow text-stone-500 mb-2" style={{ fontSize: '10px' }}>Añadir objetivo</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={nuevoObjTitulo}
              onChange={e => setNuevoObjTitulo(e.target.value)}
              placeholder="¿Qué hay que conseguir?"
              className="flex-1 bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
            <input
              type="date"
              value={nuevoObjFecha}
              onChange={e => setNuevoObjFecha(e.target.value)}
              className="bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 sm:w-40"
            />
            <button
              onClick={añadirObjetivo}
              disabled={!nuevoObjTitulo.trim() || !nuevoObjFecha}
              className="px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus size={14} /> Añadir
            </button>
          </div>
        </div>
      </div>

      {/* DOCUMENTOS DEL TALLER */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <FileText size={17} className="text-navy-700" />
            Documentos
            <span className="text-base text-stone-500 font-medium">· {documentos.length}</span>
          </h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => subirDocumento(e.target.files?.[0])}
              className="hidden"
              disabled={subiendoDoc}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendoDoc}
              className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-sm font-semibold transition-colors"
            >
              {subiendoDoc ? <><Loader2 size={14} className="animate-spin" /> Subiendo...</> : <><Plus size={14} /> Subir documento</>}
            </button>
          </div>
        </div>

        {errorDoc && (
          <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-600" />
            <p className="text-sm text-red-800 flex-1">{errorDoc}</p>
            <button onClick={() => setErrorDoc(null)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
          </div>
        )}

        {documentos.length === 0 ? (
          <p className="text-sm text-stone-500 italic">No hay documentos. Sube el primero — PDFs, hojas, presentaciones, imágenes, etc.</p>
        ) : (
          <div className="space-y-2">
            {documentos.map(d => {
              const icono = iconoDocumento(d.mimeType, d.nombre);
              const persona = personas.find(p => p.id === d.subidoPor);
              const fecha = d.subidoEn ? new Date(d.subidoEn) : null;
              return (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-navy-700 hover:shadow-sm transition-all bg-white">
                  <div className={`w-10 h-10 rounded-lg ${icono.color} flex items-center justify-center font-bold text-[10px] flex-shrink-0`}>
                    {icono.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-navy-900 hover:text-navy-700 truncate block" title={d.nombre}>
                      {d.nombre}
                    </a>
                    <p className="text-xs text-stone-500 font-medium">
                      {formatBytes(d.size)}
                      {persona && <> · subido por <span className="text-navy-700">{persona.nombre}</span></>}
                      {fecha && <> · {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</>}
                    </p>
                  </div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={d.nombre}
                    className="text-xs font-semibold text-navy-700 hover:text-navy-900 px-3 py-1.5 border border-stone-300 hover:border-navy-700 rounded-md transition-colors"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={() => eliminarDocumento(d)}
                    className="text-stone-400 hover:text-red-700 p-1 transition-colors"
                    title="Eliminar"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {demoMode && documentos.length > 0 && (
          <p className="text-[10px] text-stone-500 italic mt-3">⚠️ En modo demo los archivos se almacenan solo en tu navegador y se pierden al recargar. Usa el modo real (login) para guardarlos en Supabase Storage.</p>
        )}
      </div>

      {(() => {
        const eventosCron = historico
          .filter(e => e.tallerId === taller.id)
          .sort((a, b) => a.fecha.localeCompare(b.fecha));
        if (eventosCron.length === 0) return null;
        const colorMap = {
          stone: { bg: '#f5f5f4', border: '#a8a29e', text: '#44403c', dot: '#78716c' },
          blue: { bg: '#E6F1FB', border: '#378ADD', text: '#0C447C', dot: '#378ADD' },
          emerald: { bg: '#E1F5EE', border: '#1D9E75', text: '#04342C', dot: '#1D9E75' },
          violet: { bg: '#EEEDFE', border: '#8b5cf6', text: '#3C3489', dot: '#8b5cf6' },
          amber: { bg: '#FAEEDA', border: '#BA7517', text: '#633806', dot: '#BA7517' },
          red: { bg: '#FCEBEB', border: '#A32D2D', text: '#791F1F', dot: '#A32D2D' },
          navy: { bg: '#E5EAF3', border: '#1E3A6F', text: '#0E1F3D', dot: '#1E3A6F' },
          gold: { bg: '#FBF3DD', border: '#D4A82C', text: '#5B3F0A', dot: '#D4A82C' },
        };

        const grupos = {};
        eventosCron.forEach(e => {
          const d = new Date(e.fecha);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!grupos[key]) grupos[key] = { mes: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }), eventos: [] };
          grupos[key].eventos.push(e);
        });
        const gruposOrdenados = Object.entries(grupos).sort((a, b) => a[0].localeCompare(b[0]));

        return (
          <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-stone-900 flex items-center gap-2">
                <Activity size={14} />
                Cronograma del taller
                <span className="text-xs text-stone-500 font-normal">· {eventosCron.length} eventos</span>
              </h3>
              <span className="text-[11px] text-stone-500">
                {formatFecha(eventosCron[0].fecha)} → {formatFecha(eventosCron[eventosCron.length - 1].fecha)}
              </span>
            </div>

            <div className="overflow-x-auto pb-2 -mx-5 px-5">
              <div className="flex items-stretch gap-0 min-w-min">
                {gruposOrdenados.map(([key, grupo], grupoIdx) => (
                  <div key={key} className="flex-shrink-0 relative">
                    <div className="px-3 pb-3 sticky left-0">
                      <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">{grupo.mes}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{grupo.eventos.length} {grupo.eventos.length === 1 ? 'evento' : 'eventos'}</p>
                    </div>

                    <div className="relative h-1 bg-stone-100 mx-3 mb-3">
                      {grupoIdx === 0 && <div className="absolute left-0 top-0 bottom-0 w-3 bg-white"></div>}
                      {grupoIdx === gruposOrdenados.length - 1 && <div className="absolute right-0 top-0 bottom-0 w-3 bg-white"></div>}
                      <div className="absolute inset-y-0 left-3 right-3 bg-stone-300"></div>
                    </div>

                    <div className="flex items-stretch gap-2 px-3 relative">
                      {grupo.eventos.map(e => {
                        const tipo = TIPOS_EVENTO[e.tipo] || TIPOS_EVENTO.avance;
                        const Icon = tipo.icon;
                        const c = colorMap[tipo.color];
                        const autor = personaById[e.autorId];
                        return (
                          <div
                            key={e.id}
                            className="flex-shrink-0 w-56 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer relative"
                            style={{ backgroundColor: c.bg, borderLeft: `3px solid ${c.border}` }}
                            onClick={() => setEditandoEventoId(editandoEventoId === e.id ? null : e.id)}
                          >
                            <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: c.border }}></div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <Icon size={11} style={{ color: c.text }} />
                                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: c.text }}>{tipo.label}</span>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: c.text, opacity: 0.7 }}>
                                {new Date(e.fecha).getDate()} {new Date(e.fecha).toLocaleDateString('es-ES', { month: 'short' })}
                              </span>
                            </div>

                            <p className="text-xs font-medium leading-snug mb-1" style={{ color: c.text }}>{e.titulo}</p>

                            {e.descripcion && (
                              <p className="text-[11px] leading-relaxed line-clamp-3" style={{ color: c.text, opacity: 0.85 }}>
                                {e.descripcion}
                              </p>
                            )}

                            {autor && (
                              <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: `1px solid ${c.border}33` }}>
                                <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium" style={{ backgroundColor: c.border, color: c.bg }}>
                                  {autor.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <span className="text-[10px] font-medium" style={{ color: c.text, opacity: 0.8 }}>{autor.nombre}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4 mt-2 border-t border-stone-100">
              {Object.entries(TIPOS_EVENTO).filter(([k]) => conteoTipos[k]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1.5 text-[11px] text-stone-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[v.color].border }}></div>
                  <span>{v.label} · {conteoTipos[k]}</span>
                </div>
              ))}
              <span className="ml-auto text-[10px] text-stone-400 italic">Pulsa una tarjeta para editar</span>
            </div>
          </div>
        );
      })()}

      <div className="bg-white border border-stone-200 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-stone-900 flex items-center gap-2">
            <Sparkles size={15} />
            Resumen ejecutivo para el comité
          </h3>
          <button
            onClick={generarResumen}
            disabled={generandoResumen}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-xs transition-colors"
          >
            {generandoResumen ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {resumen ? 'Regenerar' : 'Generar resumen'}
          </button>
        </div>
        {resumen ? (
          <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
            <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">{resumen}</p>
          </div>
        ) : (
          <p className="text-xs text-stone-500">Genera un resumen del estado actual a partir del histórico para llevar al próximo comité.</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-stone-900">Evolución del taller</h2>
        <button
          onClick={() => setAñadiendo(!añadiendo)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-xs transition-colors"
        >
          <Plus size={12} /> Nuevo evento
        </button>
      </div>

      {añadiendo && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <select
              value={nuevoTipo}
              onChange={e => setNuevoTipo(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none"
            >
              {Object.entries(TIPOS_EVENTO).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <input
              value={nuevoTitulo}
              onChange={e => setNuevoTitulo(e.target.value)}
              placeholder="Título"
              className="col-span-2 bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
            />
          </div>
          <textarea
            value={nuevaDesc}
            onChange={e => setNuevaDesc(e.target.value)}
            placeholder="Descripción"
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-2"
          />
          <div className="flex items-center gap-2">
            <select
              value={nuevoAutor}
              onChange={e => setNuevoAutor(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none"
            >
              {(() => {
                const integrantes = personas.filter(p => (p.talleres || []).includes(taller.id));
                const otros = personas.filter(p => !(p.talleres || []).includes(taller.id));
                return (
                  <>
                    {integrantes.length > 0 && (
                      <optgroup label={`Integrantes de ${taller.nombre}`}>
                        {integrantes.map(p => <option key={p.id} value={p.id}>{p.nombre} · {getEquipo(p)}</option>)}
                      </optgroup>
                    )}
                    {otros.length > 0 && (
                      <optgroup label="Otras personas">
                        {otros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </optgroup>
                    )}
                  </>
                );
              })()}
            </select>
            <button onClick={añadirEvento} className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm transition-colors">
              Publicar al comité
            </button>
            <button onClick={() => setAñadiendo(false)} className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-sm">
              Cancelar
            </button>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">Visible para todos los miembros del comité en tiempo real.</p>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-2 mb-4 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => setFiltroTipo('todos')}
          className={`px-2.5 py-1 rounded text-xs transition-colors ${
            filtroTipo === 'todos' ? 'bg-navy-900 text-stone-50' : 'text-stone-700 hover:bg-stone-100'
          }`}
        >Todos</button>
        {Object.entries(TIPOS_EVENTO).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFiltroTipo(key)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              filtroTipo === key ? 'bg-navy-900 text-stone-50' : 'text-stone-700 hover:bg-stone-100'
            }`}
          >{val.label} {conteoTipos[key] ? `(${conteoTipos[key]})` : ''}</button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Período:</span>
          <select
            value={filtroTiempo}
            onChange={e => setFiltroTiempo(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none"
          >
            <option value="mes">Último mes</option>
            <option value="3meses">Últimos 3 meses</option>
            <option value="6meses">Últimos 6 meses</option>
            <option value="1ano">Último año</option>
            <option value="5anos">Últimos 5 años</option>
            <option value="historico">Histórico (todo)</option>
          </select>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-stone-200"></div>
        <div className="space-y-3">
          {eventosOrdenados.length === 0 && (
            <p className="text-sm text-stone-500 text-center py-8">No hay eventos para este filtro.</p>
          )}
          {eventosOrdenados.map(evento => {
            const tipo = TIPOS_EVENTO[evento.tipo] || TIPOS_EVENTO.avance;
            const Icon = tipo.icon;
            const autor = personaById[evento.autorId];
            const colorMap = {
              stone: 'bg-stone-200 text-stone-700',
              blue: 'bg-blue-100 text-blue-800',
              emerald: 'bg-emerald-100 text-emerald-800',
              violet: 'bg-violet-100 text-violet-800',
              amber: 'bg-amber-100 text-amber-800',
              red: 'bg-red-100 text-red-800',
              navy: 'bg-navy-100 text-navy-800',
              gold: 'bg-gold-100 text-gold-800',
            };
            const editando = editandoEventoId === evento.id;
            return (
              <div key={evento.id} className="relative pl-10">
                <div className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center ${colorMap[tipo.color]}`}>
                  <Icon size={14} />
                </div>
                <div className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors group">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {editando ? (
                      <select
                        value={evento.tipo}
                        onChange={e => actualizarEvento(evento.id, { tipo: e.target.value })}
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded outline-none border-0 ${colorMap[tipo.color]}`}
                      >
                        {Object.entries(TIPOS_EVENTO).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${colorMap[tipo.color]}`}>{tipo.label}</span>
                    )}
                    {editando ? (
                      <input
                        type="date"
                        value={evento.fecha}
                        onChange={e => actualizarEvento(evento.id, { fecha: e.target.value })}
                        className="text-xs bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 outline-none"
                      />
                    ) : (
                      <span className="text-xs text-stone-500">{formatFecha(evento.fecha)}</span>
                    )}
                    <span className="text-xs text-stone-400">·</span>
                    {editando ? (
                      <select
                        value={evento.autorId || ''}
                        onChange={e => actualizarEvento(evento.id, { autorId: e.target.value })}
                        className="text-xs bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 outline-none"
                      >
                        <option value="">— Sin autor —</option>
                        {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                    ) : (
                      <span className="text-xs text-stone-600">{autor?.nombre || 'Sin autor'}</span>
                    )}
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editando ? (
                        <button
                          onClick={() => setEditandoEventoId(null)}
                          className="text-[11px] px-2 py-0.5 bg-navy-900 text-stone-50 rounded hover:bg-navy-800 transition-colors"
                        >Hecho</button>
                      ) : (
                        <button
                          onClick={() => setEditandoEventoId(evento.id)}
                          className="text-[11px] text-stone-500 hover:text-stone-900 transition-colors px-1.5 py-0.5"
                          title="Reclasificar"
                        >Reclasificar</button>
                      )}
                      <button
                        onClick={() => eliminarEvento(evento.id)}
                        className="text-[11px] text-stone-400 hover:text-red-700 transition-colors px-1.5 py-0.5"
                        title="Eliminar"
                      >Eliminar</button>
                    </div>
                  </div>
                  {editando ? (
                    <>
                      <input
                        type="text"
                        value={evento.titulo}
                        onChange={e => actualizarEvento(evento.id, { titulo: e.target.value })}
                        className="w-full text-sm font-medium text-stone-900 bg-stone-50 border border-stone-200 rounded px-2 py-1 outline-none focus:border-stone-400 mb-1"
                      />
                      <textarea
                        value={evento.descripcion || ''}
                        onChange={e => actualizarEvento(evento.id, { descripcion: e.target.value })}
                        rows={2}
                        className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded px-2 py-1 outline-none focus:border-stone-400 resize-none"
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-stone-900 mb-1">{evento.titulo}</p>
                      {evento.descripcion && <p className="text-sm text-stone-700 leading-relaxed">{evento.descripcion}</p>}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const EQUIPOS_NEGOCIO_GRUPOS = {
  transaccional: ['Oficinas', 'Retail', 'Hoteles', 'Living', 'Industrial/Logístico', 'Agrobusiness', 'Alternativos', 'Centros Comerciales'],
  capital_markets: ['Capital Markets Oficinas', 'Capital Markets Industrial Logístico', 'Capital Markets Retail', 'Capital Markets Alternativos', 'Capital Markets Living', 'Capital Markets Hoteles', 'Capital Markets Centros Comerciales'],
  no_transaccional: ['Property Management', 'Facility Management', 'Arquitectura', 'Valoraciones', 'Financiero', 'IT', 'Desarrollo de Negocio', 'Research', 'Consultoría'],
};

const EQUIPOS_NEGOCIO = [
  ...EQUIPOS_NEGOCIO_GRUPOS.transaccional,
  ...EQUIPOS_NEGOCIO_GRUPOS.capital_markets,
  ...EQUIPOS_NEGOCIO_GRUPOS.no_transaccional,
];

const DELEGACIONES_ESPANA = ['Madrid', 'Barcelona', 'Valencia', 'Málaga', 'Sevilla'];
const DELEGACIONES_INTERNACIONALES = ['Portugal', 'Londres'];
const DELEGACIONES = [...DELEGACIONES_ESPANA, ...DELEGACIONES_INTERNACIONALES];

const CATEGORIAS_HERRAMIENTAS_PREDEFINIDAS = [
  'BI',
  'CRM',
  'Ciberseguridad',
  'Comunicación',
  'Datos de mercado',
  'Documental',
  'ERP / Finanzas',
  'Firma',
  'IA',
  'Marketing',
  'Productividad',
  'Project Management',
  'Property Database',
  'Property Management',
  'Research',
  'Sales Intelligence',
  'Valoraciones',
];

const CATEGORIAS_DESCRIPCIONES = {
  'BI': 'Análisis de datos, dashboards y reporting de negocio.',
  'CRM': 'Gestión comercial: pipeline, cuentas, contactos y oportunidades.',
  'Ciberseguridad': 'Protección de datos, control de accesos y cumplimiento normativo.',
  'Comunicación': 'Mensajería interna, videollamadas y colaboración (Slack, Teams).',
  'Datos de mercado': 'Fuentes externas de datos inmobiliarios y de mercado (Idealista, Fotocasa, MSCI RCA, CoStar).',
  'Documental': 'Gestión y almacenamiento de documentos corporativos.',
  'ERP / Finanzas': 'Contabilidad, facturación, tesorería y gestión financiera.',
  'Firma': 'Firma electrónica de contratos y documentos.',
  'IA': 'Inteligencia artificial generativa, asistentes y automatización con LLMs.',
  'Marketing': 'Captación, branding, comunicación externa y campañas.',
  'Productividad': 'Suite ofimática y herramientas de trabajo diario (Microsoft 365, Google Workspace).',
  'Project Management': 'Gestión de proyectos, tareas y planificación (Asana, Trello, Jira).',
  'Property Database': 'Base de datos interna de activos, propietarios y carteras.',
  'Property Management': 'Gestión operativa de inmuebles: contratos, incidencias, inquilinos, mantenimiento y facturación.',
  'Research': 'Estudios de mercado, análisis sectorial y prospectiva.',
  'Sales Intelligence': 'Inteligencia comercial: networking, contactos y cuentas objetivo.',
  'Valoraciones': 'Tasaciones y valoración de activos inmobiliarios.',
};

function HerramientasView({ herramientas, setHerramientas, personas = [], usuarioActualId }) {
  const [solicitud, setSolicitud] = useState('');
  const [analizando, setAnalizando] = useState(false);
  const [alternativas, setAlternativas] = useState(null);
  const [vistaSolicitud, setVistaSolicitud] = useState(false);
  const [vistaAlta, setVistaAlta] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroOrigen, setFiltroOrigen] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [vistaCatalogo, setVistaCatalogo] = useState('catalogo');
  const [subTabEquiposAlta, setSubTabEquiposAlta] = useState('transaccional');
  const [subTabEquiposEdicion, setSubTabEquiposEdicion] = useState('transaccional');
  const [subTabEquiposPorUso, setSubTabEquiposPorUso] = useState('transaccional');
  const [requierenAtencionAbierto, setRequierenAtencionAbierto] = useState(false);
  const [filtroPorUsoEquipos, setFiltroPorUsoEquipos] = useState([]);
  const [filtroPorUsoDelegaciones, setFiltroPorUsoDelegaciones] = useState([]);
  const [filtroPorUsoCategorias, setFiltroPorUsoCategorias] = useState([]);
  const [filtroPorUsoCoste, setFiltroPorUsoCoste] = useState('todos');
  const [filtroPorUsoOrigen, setFiltroPorUsoOrigen] = useState('todos');

  const [editandoId, setEditandoId] = useState(null);
  const [edicion, setEdicion] = useState(null);

  const initialNuevaHerr = {
    nombre: '',
    descripcion: '',
    categorias: [],
    nuevaCategoria: '',
    origen: 'externa',
    funcionalidadesSel: [],
    nuevaFuncionalidad: '',
    equipos: [],
    todosEquipos: false,
    delegaciones: [],
    nuevaDelegacion: '',
    todasDelegaciones: false,
    todasDelegacionesEspana: false,
    todaCompaniaUsuarios: false,
    numeroUsuarios: 1,
    sinCosteLicencia: false,
    tipoLicencia: '',
    licenciasContratadas: 1,
    licenciasActivas: 0,
    costePorLicencia: 0,
  };
  const [nuevaHerr, setNuevaHerr] = useState(initialNuevaHerr);
  // Defensas: si el state queda con shape antigua, garantiza arrays
  const nuevaHerrSafe = {
    ...nuevaHerr,
    categorias: Array.isArray(nuevaHerr.categorias) ? nuevaHerr.categorias : [],
    nuevaCategoria: nuevaHerr.nuevaCategoria || '',
  };

  const buscarAlternativas = async () => {
    if (!solicitud.trim()) return;
    setAnalizando(true);
    setAlternativas(null);
    const prompt = `Un equipo en la compañía quiere contratar una nueva herramienta para esta necesidad: "${solicitud}".

Antes de aprobar, revisa el catálogo actual y dime si hay herramientas ya contratadas que cubran total o parcialmente esa necesidad. Lista las alternativas con porcentaje estimado de match y razón. Si no hay nada que encaje, dilo claramente.

CATÁLOGO ACTUAL:
${herramientas.map(h => `- ${h.nombre} (${h.categoria}): ${h.descripcion || ''} cubre ${(h.funcionalidades || []).join(', ')}. Usado por ${(h.areas || []).join(', ')}. ${h.licenciasContratadas - h.licenciasActivas} licencias sin asignar.`).join('\n')}

Responde en formato:
ALTERNATIVAS DETECTADAS:
- [nombre] · [match %] · [razón]
RECOMENDACIÓN: [una frase]`;
    const respuesta = await callClaude('Eres analista de gobierno de herramientas en la compañía. Tu rol es evitar duplicidades y maximizar uso de licencias existentes.', prompt);
    setAlternativas(respuesta);
    setAnalizando(false);
  };

  const totalCoste = herramientas.reduce((acc, h) => acc + (h.costeAnual || 0), 0);
  const totalLicencias = herramientas.reduce((acc, h) => acc + (h.licenciasContratadas || 0), 0);
  const licenciasActivas = herramientas.reduce((acc, h) => acc + (h.licenciasActivas || 0), 0);
  const sinUso = totalLicencias - licenciasActivas;
  const usoMedio = totalLicencias > 0 ? Math.round((licenciasActivas / totalLicencias) * 100) : 0;

  // Categorías de una herramienta — soporta multi (categoría con comas separa varias)
  const categoriasDe = (h) => {
    if (Array.isArray(h.categorias) && h.categorias.length) return h.categorias;
    if (h.categoria) return h.categoria.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  };

  // Coste por licencia (derivado) y coste anual (almacenado como total)
  const costePorLicenciaDe = (h) => {
    if (h.costePorLicencia != null) return h.costePorLicencia;
    if (h.costeAnual && h.licenciasContratadas > 0) {
      return Math.round(h.costeAnual / h.licenciasContratadas);
    }
    return 0;
  };

  // Estado de uso calculado a partir del ratio activas/contratadas
  const calcularUsoEstado = (h) => {
    const total = h.licenciasContratadas || 0;
    if (total === 0) return { key: 'sin_dato', label: 'Sin licencias', color: 'stone', pct: 0 };
    const pct = Math.round(((h.licenciasActivas || 0) / total) * 100);
    if (pct >= 80) return { key: 'muy_uso', label: 'Muy en uso', color: 'emerald', pct };
    if (pct >= 50) return { key: 'uso_moderado', label: 'Uso moderado', color: 'navy', pct };
    if (pct >= 20) return { key: 'infrautilizada', label: 'Infrautilizada', color: 'gold', pct };
    return { key: 'sin_uso', label: 'Sin uso', color: 'red', pct };
  };

  const herramientasConUso = herramientas.map(h => ({ ...h, usoEstado: calcularUsoEstado(h) }));

  const muyEnUso = herramientasConUso.filter(h => h.usoEstado.key === 'muy_uso');
  const usoModerado = herramientasConUso.filter(h => h.usoEstado.key === 'uso_moderado');
  const infrautilizadas = herramientasConUso.filter(h => h.usoEstado.key === 'infrautilizada');
  const sinUsoH = herramientasConUso.filter(h => h.usoEstado.key === 'sin_uso');
  const duplicadas = herramientasConUso.filter(h => (h.alerta || '').includes('Duplica'));

  const requierenAtencion = [
    ...sinUsoH,
    ...infrautilizadas,
    ...duplicadas.filter(d => !sinUsoH.find(s => s.id === d.id) && !infrautilizadas.find(i => i.id === d.id)),
  ];
  const costeAtencion = requierenAtencion.reduce((acc, h) => acc + (h.costeAnual || 0), 0);

  const categorias = [...new Set([
    ...CATEGORIAS_HERRAMIENTAS_PREDEFINIDAS,
    ...herramientas.flatMap(h => categoriasDe(h)),
  ])].sort();

  const funcionalidadesDisponibles = [...new Set(herramientas.flatMap(h => h.funcionalidades || []))].sort();

  const crearHerramienta = async () => {
    if (!nuevaHerr.nombre.trim() || !nuevaHerr.descripcion.trim()) return;
    if (!nuevaHerr.todosEquipos && nuevaHerr.equipos.length === 0) return;
    const cubreTodas = nuevaHerr.todasDelegaciones || nuevaHerr.todasDelegacionesEspana;
    const delegacionesFinales = cubreTodas ? [] : [...nuevaHerr.delegaciones];
    if (!cubreTodas && nuevaHerr.nuevaDelegacion.trim()) delegacionesFinales.push(nuevaHerr.nuevaDelegacion.trim());
    if (!cubreTodas && delegacionesFinales.length === 0) return;
    if (!nuevaHerr.todaCompaniaUsuarios && (!nuevaHerr.numeroUsuarios || Number(nuevaHerr.numeroUsuarios) <= 0)) return;
    const cats = [...nuevaHerr.categorias];
    if (nuevaHerr.nuevaCategoria.trim()) cats.push(nuevaHerr.nuevaCategoria.trim());
    if (cats.length === 0) return;
    const usuariosNum = nuevaHerr.todaCompaniaUsuarios ? 0 : (Number(nuevaHerr.numeroUsuarios) || 1);
    const licContratadas = nuevaHerr.sinCosteLicencia ? 0 : Math.max(Number(nuevaHerr.licenciasContratadas) || 0, 0);
    const costeAnualCalc = nuevaHerr.sinCosteLicencia
      ? 0
      : (Number(nuevaHerr.costePorLicencia) || 0) * 12 * licContratadas;
    const categoriaFinal = cats.join(', ');
    const item = {
      id: `h-${Date.now()}`,
      nombre: nuevaHerr.nombre.trim(),
      descripcion: nuevaHerr.descripcion.trim(),
      categoria: categoriaFinal,
      origen: nuevaHerr.origen === 'inhouse' ? 'inhouse' : 'externa',
      funcionalidades: (() => {
        const fs = [...(nuevaHerr.funcionalidadesSel || [])];
        if ((nuevaHerr.nuevaFuncionalidad || '').trim()) fs.push(nuevaHerr.nuevaFuncionalidad.trim());
        return fs;
      })(),
      equipos: nuevaHerr.todosEquipos ? [] : nuevaHerr.equipos,
      todosEquipos: !!nuevaHerr.todosEquipos,
      delegaciones: delegacionesFinales,
      todasDelegaciones: !!nuevaHerr.todasDelegaciones,
      todasDelegacionesEspana: !!nuevaHerr.todasDelegacionesEspana && !nuevaHerr.todasDelegaciones,
      todaCompaniaUsuarios: !!nuevaHerr.todaCompaniaUsuarios,
      numeroUsuarios: usuariosNum,
      licenciasContratadas: licContratadas,
      licenciasActivas: nuevaHerr.sinCosteLicencia ? 0 : Math.max(Number(nuevaHerr.licenciasActivas) || 0, 0),
      sinCosteLicencia: !!nuevaHerr.sinCosteLicencia,
      tipoLicencia: nuevaHerr.tipoLicencia.trim(),
      costeAnual: costeAnualCalc,
      alerta: null,
      fechaAlta: new Date().toISOString().slice(0, 10),
      solicitudesLicencia: [],
    };
    await setHerramientas([...herramientas, item]);
    setNuevaHerr(initialNuevaHerr);
    setSugerenciaRazon(null);
    setVistaAlta(false);
  };

  const abrirDetalle = (h) => {
    setEditandoId(h.id);
    const equiposDerivados = Array.isArray(h.equipos) && h.equipos.length
      ? h.equipos
      : (h.areas || []).filter(a => a !== 'Toda la compañía').filter(a => EQUIPOS_NEGOCIO.includes(a));
    const delegacionesDerivadas = Array.isArray(h.delegaciones) && h.delegaciones.length
      ? h.delegaciones
      : (h.delegacion ? [h.delegacion] : []);
    const todaCompaniaDerivada = h.todaCompaniaUsuarios != null
      ? !!h.todaCompaniaUsuarios
      : (h.areas || []).includes('Toda la compañía');
    setEdicion({
      nombre: h.nombre || '',
      descripcion: h.descripcion || '',
      categoriasSel: categoriasDe(h),
      nuevaCategoria: '',
      origen: h.origen === 'inhouse' ? 'inhouse' : 'externa',
      funcionalidadesSel: Array.isArray(h.funcionalidades) ? h.funcionalidades : [],
      nuevaFuncionalidad: '',
      equipos: equiposDerivados,
      todosEquipos: !!h.todosEquipos,
      delegaciones: delegacionesDerivadas,
      nuevaDelegacion: '',
      todasDelegaciones: !!h.todasDelegaciones,
      todasDelegacionesEspana: !!h.todasDelegacionesEspana,
      todaCompaniaUsuarios: todaCompaniaDerivada,
      numeroUsuarios: h.numeroUsuarios != null ? h.numeroUsuarios : (h.licenciasContratadas || 1),
      sinCosteLicencia: !!h.sinCosteLicencia || (h.costeAnual === 0 && h.origen === 'inhouse'),
      tipoLicencia: h.tipoLicencia || '',
      licenciasContratadas: h.licenciasContratadas || 0,
      licenciasActivas: h.licenciasActivas || 0,
      costePorLicencia: Math.round(costePorLicenciaDe(h) / 12),
      alerta: h.alerta || '',
    });
  };

  const cerrarDetalle = () => {
    setEditandoId(null);
    setEdicion(null);
    setSugerenciaRazon(null);
  };

  const guardarEdicion = async () => {
    if (!edicion || !editandoId) return;
    if (!edicion.nombre.trim() || !edicion.descripcion.trim()) return;
    const catsEdit = [...(edicion.categoriasSel || [])];
    if (edicion.nuevaCategoria && edicion.nuevaCategoria.trim()) catsEdit.push(edicion.nuevaCategoria.trim());
    if (catsEdit.length === 0) return;
    const categoriaFinal = catsEdit.join(', ');
    const cubreTodasEdit = edicion.todasDelegaciones || edicion.todasDelegacionesEspana;
    const delegacionesFinales = cubreTodasEdit ? [] : [...(edicion.delegaciones || [])];
    if (!cubreTodasEdit && edicion.nuevaDelegacion && edicion.nuevaDelegacion.trim()) delegacionesFinales.push(edicion.nuevaDelegacion.trim());
    if (!edicion.todosEquipos && (edicion.equipos || []).length === 0) return;
    if (!cubreTodasEdit && delegacionesFinales.length === 0) return;
    const usuariosEdit = edicion.todaCompaniaUsuarios ? 0 : (Number(edicion.numeroUsuarios) || 1);
    const licContratadasEdit = edicion.sinCosteLicencia ? 0 : Math.max(Number(edicion.licenciasContratadas) || 0, 0);
    const costeAnualCalc = edicion.sinCosteLicencia
      ? 0
      : (Number(edicion.costePorLicencia) || 0) * 12 * licContratadasEdit;
    const updates = {
      nombre: edicion.nombre.trim(),
      descripcion: edicion.descripcion.trim(),
      categoria: categoriaFinal,
      origen: edicion.origen === 'inhouse' ? 'inhouse' : 'externa',
      funcionalidades: (() => {
        const fs = [...(edicion.funcionalidadesSel || [])];
        if ((edicion.nuevaFuncionalidad || '').trim()) fs.push(edicion.nuevaFuncionalidad.trim());
        return fs;
      })(),
      equipos: edicion.todosEquipos ? [] : edicion.equipos,
      todosEquipos: !!edicion.todosEquipos,
      delegaciones: delegacionesFinales,
      todasDelegaciones: !!edicion.todasDelegaciones,
      todasDelegacionesEspana: !!edicion.todasDelegacionesEspana && !edicion.todasDelegaciones,
      todaCompaniaUsuarios: !!edicion.todaCompaniaUsuarios,
      numeroUsuarios: usuariosEdit,
      licenciasContratadas: licContratadasEdit,
      licenciasActivas: edicion.sinCosteLicencia ? 0 : Math.max(Number(edicion.licenciasActivas) || 0, 0),
      sinCosteLicencia: !!edicion.sinCosteLicencia,
      tipoLicencia: (edicion.tipoLicencia || '').trim(),
      costeAnual: costeAnualCalc,
      alerta: edicion.alerta || null,
    };
    const nuevas = herramientas.map(h => h.id === editandoId ? { ...h, ...updates } : h);
    await setHerramientas(nuevas);
    cerrarDetalle();
  };

  const eliminarHerramienta = async () => {
    if (!editandoId) return;
    const h = herramientas.find(x => x.id === editandoId);
    if (!confirm(`¿Eliminar "${h?.nombre}" del catálogo? Esta acción no se puede deshacer.`)) return;
    await setHerramientas(herramientas.filter(x => x.id !== editandoId));
    cerrarDetalle();
  };

  const [borrandoCategoria, setBorrandoCategoria] = useState(null);
  const [solicitarDesdePersona, setSolicitarDesdePersona] = useState('');
  const [sugiriendoCategorias, setSugiriendoCategorias] = useState(false);
  const [sugerenciaRazon, setSugerenciaRazon] = useState(null);

  const [mostrandoAnalisis, setMostrandoAnalisis] = useState(false);
  const [analisisHerramientas, setAnalisisHerramientas] = useState(null);
  const [analizandoHerramientas, setAnalizandoHerramientas] = useState(false);

  const analizarHerramientas = async () => {
    setAnalizandoHerramientas(true);
    setMostrandoAnalisis(true);
    setAnalisisHerramientas(null);
    const catalogo = herramientas.map(h => {
      const cats = (Array.isArray(h.categorias) && h.categorias.length) ? h.categorias.join(', ') : (h.categoria || '');
      return `- ID ${h.id} | ${h.nombre} | Categorías: ${cats} | Descripción: ${h.descripcion || ''} | Funcionalidades actuales: ${(h.funcionalidades || []).join(', ') || '(ninguna declarada)'}`;
    }).join('\n');
    const userMessage = `Analiza este catálogo de herramientas de una consultora inmobiliaria. Para cada herramienta, identifica funcionalidades adicionales que típicamente cubre una herramienta de su categoría pero que NO están declaradas en sus funcionalidades actuales.

CATÁLOGO:
${catalogo}

Devuelve SOLO JSON válido, sin markdown:
[
  {"id":"<id-exacto>","faltantes":["funcionalidad sugerida 1","sugerida 2"],"razon":"1 frase explicando por qué"}
]

Reglas:
- Incluye un objeto por cada herramienta del catálogo, usando su ID exacto.
- 3-5 sugerencias por herramienta. Si la herramienta ya cubre todo lo típico, devuelve "faltantes":[] y explica brevemente.
- No repitas funcionalidades ya declaradas.
- Sé concreto, en español, con vocabulario del negocio inmobiliario.`;
    const respuesta = await callClaude(
      'Eres analista de gobierno de herramientas en una consultora inmobiliaria. Conoces qué funcionalidades suele cubrir cada categoría. Respondes solo JSON válido sin markdown.',
      userMessage,
    );
    try {
      const json = respuesta && respuesta.match(/\[[\s\S]*\]/);
      if (json) {
        const data = JSON.parse(json[0]);
        const map = {};
        data.forEach(item => { if (item.id) map[item.id] = item; });
        setAnalisisHerramientas(map);
      } else {
        setAnalisisHerramientas({ __error: 'No se pudo interpretar la respuesta de la IA.' });
      }
    } catch (e) {
      setAnalisisHerramientas({ __error: 'No se pudo interpretar la respuesta de la IA.' });
    }
    setAnalizandoHerramientas(false);
  };

  const sugerirCategorias = async (modo) => {
    const nombre = (modo === 'alta' ? nuevaHerr.nombre : edicion?.nombre || '').trim();
    const descripcion = (modo === 'alta' ? nuevaHerr.descripcion : edicion?.descripcion || '').trim();
    if (!descripcion) return;
    setSugiriendoCategorias(true);
    setSugerenciaRazon(null);
    const lista = categorias.map(c => `- ${c}: ${CATEGORIAS_DESCRIPCIONES[c] || 'Categoría personalizada.'}`).join('\n');
    const userMessage = `Clasifica esta herramienta en una o varias categorías.

Nombre: ${nombre || '(sin nombre)'}
Descripción: ${descripcion}

Categorías disponibles:
${lista}

Devuelve SOLO JSON válido, sin markdown:
{"categorias":["...","..."],"razon":"1-2 frases explicando por qué"}

Reglas: usa nombres exactos de la lista. Elige 1-3 categorías como máximo. Si no encaja en ninguna, devuelve "categorias":[] y explica por qué en "razon".`;
    const respuesta = await callClaude(
      'Eres un experto en clasificación de herramientas digitales para una consultora inmobiliaria. Respondes solo JSON válido, sin texto extra ni markdown.',
      userMessage,
    );
    try {
      const jsonMatch = respuesta && respuesta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const cats = (data.categorias || []).filter(c => categorias.includes(c));
        if (modo === 'alta') setNuevaHerr(prev => ({ ...prev, categorias: cats }));
        else setEdicion(prev => prev ? ({ ...prev, categoriasSel: cats }) : prev);
        setSugerenciaRazon({ modo, razon: data.razon || '', categorias: cats });
      } else {
        setSugerenciaRazon({ modo, razon: 'No se pudo interpretar la respuesta de la IA.', error: true });
      }
    } catch (e) {
      setSugerenciaRazon({ modo, razon: 'No se pudo interpretar la respuesta de la IA.', error: true });
    }
    setSugiriendoCategorias(false);
  };

  const personaById = Object.fromEntries((personas || []).map(p => [p.id, p]));

  const solicitarLicencia = async (herramientaId, { personaId, nombre } = {}) => {
    const nombreLimpio = (nombre || '').trim();
    if (!personaId && !nombreLimpio) return;
    const nuevas = herramientas.map(h => {
      if (h.id !== herramientaId) return h;
      const sols = h.solicitudesLicencia || [];
      if (personaId && sols.some(s => s.personaId === personaId)) return h;
      if (!personaId && nombreLimpio && sols.some(s => (s.nombre || '').toLowerCase() === nombreLimpio.toLowerCase())) return h;
      const nueva = { id: `s-${Date.now()}`, fecha: new Date().toISOString() };
      if (personaId) nueva.personaId = personaId;
      else nueva.nombre = nombreLimpio;
      return { ...h, solicitudesLicencia: [...sols, nueva] };
    });
    await setHerramientas(nuevas);
  };

  const cancelarSolicitud = async (herramientaId, solicitudId) => {
    const nuevas = herramientas.map(h => {
      if (h.id !== herramientaId) return h;
      return { ...h, solicitudesLicencia: (h.solicitudesLicencia || []).filter(s => s.id !== solicitudId) };
    });
    await setHerramientas(nuevas);
  };

  const aplicarBorradoCategoria = async (cat, destino) => {
    const nuevas = herramientas.map(h => {
      const cats = categoriasDe(h);
      if (!cats.includes(cat)) return h;
      let nuevasCats = cats.filter(c => c !== cat);
      if (nuevasCats.length === 0 && destino) nuevasCats = [destino];
      return { ...h, categoria: nuevasCats.join(', '), categorias: nuevasCats };
    });
    await setHerramientas(nuevas);
    setBorrandoCategoria(null);
  };

  const iniciarBorradoCategoria = (cat) => {
    const afectadas = herramientas.filter(h => categoriasDe(h).includes(cat));
    const soloEsta = afectadas.filter(h => categoriasDe(h).length === 1);
    const tienenOtras = afectadas.filter(h => categoriasDe(h).length > 1);
    if (soloEsta.length === 0) {
      const msg = tienenOtras.length === 0
        ? `¿Eliminar la categoría "${cat}"? No hay herramientas asignadas a ella.`
        : `¿Eliminar la categoría "${cat}"? Se quitará de ${tienenOtras.length} ${tienenOtras.length === 1 ? 'herramienta' : 'herramientas'} (las herramientas no se borran).`;
      if (!confirm(msg)) return;
      aplicarBorradoCategoria(cat, null);
      return;
    }
    setBorrandoCategoria({ cat, soloEsta, tienenOtras, destino: '' });
  };

  const origenDe = (h) => h.origen === 'inhouse' ? 'inhouse' : 'externa';

  const herramientasFiltradas = herramientas.filter(h => {
    if (filtroCategoria !== 'todas' && !categoriasDe(h).includes(filtroCategoria)) return false;
    if (filtroEstado === 'alertas' && !h.alerta) return false;
    if (filtroEstado === 'ok' && h.alerta) return false;
    if (filtroOrigen !== 'todos' && origenDe(h) !== filtroOrigen) return false;
    if (busqueda && !h.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !(h.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const herramientasPorCategoria = {};
  herramientasFiltradas.forEach(h => {
    const cats = categoriasDe(h);
    cats.forEach(cat => {
      if (!herramientasPorCategoria[cat]) herramientasPorCategoria[cat] = [];
      herramientasPorCategoria[cat].push(h);
    });
  });

  const categoriaIcon = {
    'CRM': Package,
    'IA': Sparkles,
    'BI': TrendingUp,
    'Firma': FileText,
    'Sales Intelligence': Search,
    'Documental': FileText,
  };

  return (
    <div className="p-8 w-full">
      <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">Catálogo</p>
          <h1 className="display-1 text-navy-900">Herramientas y licencias</h1>
          <p className="text-sm text-stone-600 mt-1">Inventario, uso real y gobierno de las herramientas de la compañía</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={analizarHerramientas}
            disabled={analizandoHerramientas || herramientas.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-300 hover:border-stone-500 disabled:opacity-50 disabled:cursor-not-allowed text-stone-800 rounded-md text-sm font-medium transition-colors"
            title="La IA revisa cada herramienta del catálogo y sugiere funcionalidades que podría cubrir"
          >
            {analizandoHerramientas ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {analizandoHerramientas ? 'Analizando…' : 'Análisis de herramientas'}
          </button>
          <button
            onClick={() => { setVistaSolicitud(!vistaSolicitud); if (vistaAlta) setVistaAlta(false); }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-stone-300 hover:border-stone-500 text-stone-800 rounded-md text-sm font-medium transition-colors"
          >
            {vistaSolicitud ? <X size={14} /> : <Search size={14} />}
            {vistaSolicitud ? 'Cancelar' : 'Buscar alternativas'}
          </button>
          <button
            onClick={() => { setVistaAlta(!vistaAlta); if (vistaSolicitud) setVistaSolicitud(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors"
          >
            {vistaAlta ? <X size={14} /> : <Plus size={14} />}
            {vistaAlta ? 'Cancelar' : 'Añadir herramienta'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric
          label="Inventario"
          value={herramientas.length}
          hint={`${categorias.length} ${categorias.length === 1 ? 'categoría' : 'categorías'}`}
          tooltip="Total de herramientas registradas en el catálogo, agrupadas por categoría funcional (CRM, BI, IA, Firma, etc)."
        />
        <Metric
          label="Coste anual"
          value={`${(totalCoste/1000).toFixed(0)}k€`}
          hint={costeAtencion > 0 ? `${(costeAtencion/1000).toFixed(0)}k€ en riesgo` : 'sin alertas'}
          tooltip="Suma del coste anual de todas las licencias contratadas. Indica también cuánto está concentrado en herramientas con duplicidad o infrautilización."
        />
        <Metric
          label="Uso real"
          value={`${usoMedio}%`}
          accent={usoMedio >= 75 ? 'emerald' : usoMedio >= 50 ? 'amber' : 'red'}
          hint={`${licenciasActivas}/${totalLicencias} activas`}
          tooltip="Porcentaje de licencias activas sobre el total contratado. Un porcentaje bajo indica licencias infrautilizadas que se pueden reasignar o dar de baja."
        />
        <Metric
          label="Avisos"
          value={requierenAtencion.length}
          accent={requierenAtencion.length > 0 ? 'amber' : 'emerald'}
          hint={`${sinUsoH.length} sin uso · ${infrautilizadas.length} infra · ${duplicadas.length} duplica`}
          tooltip="Herramientas sin uso, infrautilizadas (uso < 50%) o con duplicidad funcional. Candidatas a consolidación o baja para reducir coste."
        />
      </div>

      {vistaAlta && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-stone-900 mb-2 flex items-center gap-2">
            <Plus size={14} />
            Añadir herramienta al catálogo
          </h3>
          <p className="text-xs text-stone-600 mb-4">Registra una nueva herramienta o licencia. Asígnale categoría, áreas que la usan y funcionalidades para que aparezca correctamente etiquetada.</p>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Nombre de la herramienta</label>
          <input
            value={nuevaHerr.nombre}
            onChange={e => setNuevaHerr({ ...nuevaHerr, nombre: e.target.value })}
            placeholder="Ej: Salesforce, Notion AI..."
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 mb-3"
          />

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción</label>
          <textarea
            value={nuevaHerr.descripcion}
            onChange={e => setNuevaHerr({ ...nuevaHerr, descripcion: e.target.value })}
            placeholder="¿Qué hace esta herramienta? ¿Para qué sirve?"
            rows={2}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
          />

          <div className="mb-3">
            <button
              type="button"
              onClick={() => sugerirCategorias('alta')}
              disabled={sugiriendoCategorias || !nuevaHerr.descripcion.trim()}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 rounded-md font-semibold transition-colors"
              title={!nuevaHerr.descripcion.trim() ? 'Escribe primero la descripción' : 'La IA leerá la descripción y propondrá categorías que encajen'}
            >
              {sugiriendoCategorias && sugerenciaRazon?.modo !== 'edicion' ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              {sugiriendoCategorias && sugerenciaRazon?.modo !== 'edicion' ? 'Analizando…' : 'Sugerir categorías con IA'}
            </button>
          </div>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Origen</label>
          <div className="flex gap-1 mb-3">
            {[
              { v: 'externa', l: 'Externa', d: 'Software contratado a un tercero' },
              { v: 'inhouse', l: 'In-house', d: 'Desarrollada internamente por la compañía' },
            ].map(opt => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setNuevaHerr({ ...nuevaHerr, origen: opt.v })}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                  nuevaHerr.origen === opt.v ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                }`}
                title={opt.d}
              >{opt.l}</button>
            ))}
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Categorías <span className="normal-case text-stone-400 font-normal">(una herramienta puede pertenecer a varias)</span></label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {categorias.map(c => {
                const sel = nuevaHerr.categorias.includes(c);
                const sugerida = sugerenciaRazon?.modo === 'alta' && sugerenciaRazon.categorias?.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNuevaHerr({ ...nuevaHerr, categorias: sel ? nuevaHerr.categorias.filter(x => x !== c) : [...nuevaHerr.categorias, c] })}
                    className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors border-2 ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : sugerida ? 'bg-gold-50 text-gold-900 border-gold-300' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                  >
                    {sel ? '✓ ' : sugerida ? '✨ ' : ''}{c}
                  </button>
                );
              })}
            </div>
            {sugerenciaRazon?.modo === 'alta' && sugerenciaRazon.razon && (
              <div className={`mb-2 px-3 py-2 rounded-md text-[11px] flex items-start gap-2 ${sugerenciaRazon.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-navy-50 text-navy-900 border border-navy-200'}`}>
                <Sparkles size={12} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold mb-0.5">Sugerencia de la IA</p>
                  <p>{sugerenciaRazon.razon}</p>
                </div>
                <button onClick={() => setSugerenciaRazon(null)} className="text-stone-400 hover:text-stone-700 flex-shrink-0"><X size={12} /></button>
              </div>
            )}
            <input
              value={nuevaHerr.nuevaCategoria}
              onChange={e => setNuevaHerr({ ...nuevaHerr, nuevaCategoria: e.target.value })}
              placeholder="+ Añadir nueva categoría..."
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Equipos que utilizan la herramienta <span className="text-red-600">*</span></label>
            <button
              type="button"
              onClick={() => setNuevaHerr({ ...nuevaHerr, todosEquipos: !nuevaHerr.todosEquipos })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border mb-2 ${
                nuevaHerr.todosEquipos ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                nuevaHerr.todosEquipos ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
              }`}>
                {nuevaHerr.todosEquipos && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
              </span>
              Todos los equipos
            </button>
            {!nuevaHerr.todosEquipos && (
              <>
                <div className="flex items-center gap-1 mb-3 bg-stone-100 rounded-md p-0.5 w-fit">
                  {[
                    { k: 'transaccional', l: 'Transaccional' },
                    { k: 'capital_markets', l: 'Capital Markets' },
                    { k: 'no_transaccional', l: 'No transaccional' },
                  ].map(t => {
                    const count = EQUIPOS_NEGOCIO_GRUPOS[t.k].filter(e => nuevaHerr.equipos.includes(e)).length;
                    const active = subTabEquiposAlta === t.k;
                    return (
                      <button
                        key={t.k}
                        type="button"
                        onClick={() => setSubTabEquiposAlta(t.k)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
                      >
                        {t.l}
                        {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active ? 'bg-navy-900 text-stone-50' : 'bg-stone-200 text-stone-700'}`}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {EQUIPOS_NEGOCIO_GRUPOS[subTabEquiposAlta].map(eq => {
                    const sel = nuevaHerr.equipos.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setNuevaHerr({ ...nuevaHerr, equipos: sel ? nuevaHerr.equipos.filter(x => x !== eq) : [...nuevaHerr.equipos, eq] })}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                      >
                        {sel ? '+ ' : ''}{eq}
                      </button>
                    );
                  })}
                </div>
                {nuevaHerr.equipos.length > 0 && <p className="text-[10px] text-stone-500">{nuevaHerr.equipos.length} {nuevaHerr.equipos.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'} en total</p>}
              </>
            )}
          </div>

          <div className="mb-4">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Delegaciones donde se utiliza <span className="text-red-600">*</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => setNuevaHerr({ ...nuevaHerr, todasDelegaciones: !nuevaHerr.todasDelegaciones, todasDelegacionesEspana: false })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                  nuevaHerr.todasDelegaciones ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
                title="Madrid · Barcelona · Valencia · Málaga · Sevilla · Portugal · Londres"
              >
                <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  nuevaHerr.todasDelegaciones ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                }`}>
                  {nuevaHerr.todasDelegaciones && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
                </span>
                Todas las delegaciones <span className="font-normal text-[10px]">(incluye internacionales)</span>
              </button>
              <button
                type="button"
                onClick={() => setNuevaHerr({ ...nuevaHerr, todasDelegacionesEspana: !nuevaHerr.todasDelegacionesEspana, todasDelegaciones: false })}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                  nuevaHerr.todasDelegacionesEspana ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                }`}
                title="Madrid · Barcelona · Valencia · Málaga · Sevilla"
              >
                <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  nuevaHerr.todasDelegacionesEspana ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                }`}>
                  {nuevaHerr.todasDelegacionesEspana && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
                </span>
                Todas las delegaciones España
              </button>
            </div>
            {!nuevaHerr.todasDelegaciones && !nuevaHerr.todasDelegacionesEspana && (
              <>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[...new Set([...DELEGACIONES, ...nuevaHerr.delegaciones])].map(d => {
                    const sel = nuevaHerr.delegaciones.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setNuevaHerr({ ...nuevaHerr, delegaciones: sel ? nuevaHerr.delegaciones.filter(x => x !== d) : [...nuevaHerr.delegaciones, d] })}
                        className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                      >
                        {sel ? '+ ' : ''}{d}
                      </button>
                    );
                  })}
                </div>
                <input
                  value={nuevaHerr.nuevaDelegacion}
                  onChange={e => setNuevaHerr({ ...nuevaHerr, nuevaDelegacion: e.target.value })}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && nuevaHerr.nuevaDelegacion.trim()) {
                      e.preventDefault();
                      const nd = nuevaHerr.nuevaDelegacion.trim();
                      if (!nuevaHerr.delegaciones.includes(nd)) {
                        setNuevaHerr({ ...nuevaHerr, delegaciones: [...nuevaHerr.delegaciones, nd], nuevaDelegacion: '' });
                      }
                    }
                  }}
                  placeholder="+ Añadir otra provincia (Bilbao, Zaragoza…) y pulsa Enter"
                  className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                />
              </>
            )}
          </div>

          <div className="mb-3">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Funcionalidades <span className="normal-case text-stone-400 font-normal">(etiquetas estructuradas, sin texto libre)</span></label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {funcionalidadesDisponibles.map(f => {
                const sel = nuevaHerr.funcionalidadesSel.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setNuevaHerr({ ...nuevaHerr, funcionalidadesSel: sel ? nuevaHerr.funcionalidadesSel.filter(x => x !== f) : [...nuevaHerr.funcionalidadesSel, f] })}
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                  >{sel ? '+ ' : ''}{f}</button>
                );
              })}
              {funcionalidadesDisponibles.length === 0 && <p className="text-[11px] text-stone-400 italic">Aún no hay etiquetas. Crea la primera con el campo de abajo.</p>}
            </div>
            <input
              value={nuevaHerr.nuevaFuncionalidad}
              onChange={e => setNuevaHerr({ ...nuevaHerr, nuevaFuncionalidad: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter' && nuevaHerr.nuevaFuncionalidad.trim()) {
                  e.preventDefault();
                  const nf = nuevaHerr.nuevaFuncionalidad.trim();
                  if (!nuevaHerr.funcionalidadesSel.includes(nf)) {
                    setNuevaHerr({ ...nuevaHerr, funcionalidadesSel: [...nuevaHerr.funcionalidadesSel, nf], nuevaFuncionalidad: '' });
                  }
                }
              }}
              placeholder="+ Añadir nueva etiqueta y pulsa Enter"
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-md p-3 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Número de usuarios <span className="text-red-600">*</span></p>
            <p className="text-[10px] text-stone-500 mb-2 italic">Personas que potencialmente la usan. Independiente de las licencias.</p>
            <button
              type="button"
              onClick={() => setNuevaHerr({ ...nuevaHerr, todaCompaniaUsuarios: !nuevaHerr.todaCompaniaUsuarios })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all border mb-2 ${
                nuevaHerr.todaCompaniaUsuarios ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                nuevaHerr.todaCompaniaUsuarios ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
              }`}>
                {nuevaHerr.todaCompaniaUsuarios && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
              </span>
              Toda la compañía
            </button>
            {!nuevaHerr.todaCompaniaUsuarios && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Nº aproximado de usuarios</label>
                <input
                  type="number"
                  min="1"
                  value={nuevaHerr.numeroUsuarios}
                  onChange={e => setNuevaHerr({ ...nuevaHerr, numeroUsuarios: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                />
              </div>
            )}
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-md p-3 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Coste de licencias</p>
            <button
              type="button"
              onClick={() => setNuevaHerr({ ...nuevaHerr, sinCosteLicencia: !nuevaHerr.sinCosteLicencia })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all border mb-2 ${
                nuevaHerr.sinCosteLicencia ? 'bg-emerald-700 text-stone-50 border-emerald-700' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
              }`}
            >
              <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                nuevaHerr.sinCosteLicencia ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
              }`}>
                {nuevaHerr.sinCosteLicencia && <span className="text-emerald-700 text-[10px] leading-none">✓</span>}
              </span>
              Sin coste de licencia
            </button>
            {!nuevaHerr.sinCosteLicencia && (() => {
              const cl = Number(nuevaHerr.costePorLicencia) || 0;
              const lc = Number(nuevaHerr.licenciasContratadas) || 0;
              const la = Number(nuevaHerr.licenciasActivas) || 0;
              const mensual = cl * lc;
              const anual = mensual * 12;
              const usoPct = lc > 0 ? Math.round((la / lc) * 100) : 0;
              return (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Coste por licencia (€/mes)</label>
                      <input
                        type="number"
                        min="0"
                        value={nuevaHerr.costePorLicencia}
                        onChange={e => setNuevaHerr({ ...nuevaHerr, costePorLicencia: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Lic. contratadas</label>
                      <input
                        type="number"
                        min="0"
                        value={nuevaHerr.licenciasContratadas}
                        onChange={e => setNuevaHerr({ ...nuevaHerr, licenciasContratadas: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Lic. activas</label>
                      <input
                        type="number"
                        min="0"
                        value={nuevaHerr.licenciasActivas}
                        onChange={e => setNuevaHerr({ ...nuevaHerr, licenciasActivas: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 bg-white border border-stone-200 rounded-md p-2.5">
                    <div className="text-center border-r border-stone-200">
                      <p className="text-[9px] uppercase tracking-wider text-stone-500">Coste mensual</p>
                      <p className="text-base font-bold text-navy-900 tabular-nums">{mensual.toLocaleString()}€</p>
                    </div>
                    <div className="text-center border-r border-stone-200">
                      <p className="text-[9px] uppercase tracking-wider text-stone-500">Coste anual</p>
                      <p className="text-base font-bold text-navy-900 tabular-nums">{anual.toLocaleString()}€</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] uppercase tracking-wider text-stone-500">Uso licencias</p>
                      <p className={`text-base font-bold tabular-nums ${usoPct >= 80 ? 'text-emerald-700' : usoPct >= 50 ? 'text-navy-900' : usoPct >= 20 ? 'text-gold-700' : 'text-red-700'}`}>{usoPct}%</p>
                    </div>
                  </div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Tipo de licencia <span className="normal-case text-stone-400">(opcional)</span></label>
                  <input
                    value={nuevaHerr.tipoLicencia}
                    onChange={e => setNuevaHerr({ ...nuevaHerr, tipoLicencia: e.target.value })}
                    placeholder="Suscripción anual, perpetua, por usuario/mes…"
                    className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </>
              );
            })()}
          </div>

          <button
            onClick={crearHerramienta}
            disabled={
              !nuevaHerr.nombre.trim() ||
              !nuevaHerr.descripcion.trim() ||
              (!nuevaHerr.todosEquipos && nuevaHerr.equipos.length === 0) ||
              (!nuevaHerr.todasDelegaciones && !nuevaHerr.todasDelegacionesEspana && nuevaHerr.delegaciones.length === 0 && !nuevaHerr.nuevaDelegacion.trim()) ||
              (!nuevaHerr.todaCompaniaUsuarios && (!nuevaHerr.numeroUsuarios || Number(nuevaHerr.numeroUsuarios) <= 0)) ||
              (nuevaHerr.categorias.length === 0 && !nuevaHerr.nuevaCategoria.trim())
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Añadir al catálogo
          </button>
          {(() => {
            const faltan = [];
            if (!nuevaHerr.todosEquipos && nuevaHerr.equipos.length === 0) faltan.push('equipos');
            if (!nuevaHerr.todasDelegaciones && !nuevaHerr.todasDelegacionesEspana && nuevaHerr.delegaciones.length === 0 && !nuevaHerr.nuevaDelegacion.trim()) faltan.push('delegaciones');
            if (!nuevaHerr.todaCompaniaUsuarios && (!nuevaHerr.numeroUsuarios || Number(nuevaHerr.numeroUsuarios) <= 0)) faltan.push('nº usuarios');
            if (nuevaHerr.categorias.length === 0 && !nuevaHerr.nuevaCategoria.trim()) faltan.push('categoría');
            if (faltan.length === 0) return null;
            if (!nuevaHerr.nombre.trim() || !nuevaHerr.descripcion.trim()) return null;
            return <p className="text-[11px] text-stone-500 italic mt-2">Faltan: {faltan.join(', ')}.</p>;
          })()}
        </div>
      )}

      {vistaSolicitud && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-stone-900 mb-2 flex items-center gap-2">
            <FileSearch size={14} />
            Solicitar nueva herramienta
          </h3>
          <p className="text-xs text-stone-600 mb-3">Antes de aprobar, Nexo busca alternativas ya contratadas en el catálogo.</p>
          <textarea
            value={solicitud}
            onChange={e => setSolicitud(e.target.value)}
            placeholder="Describe la necesidad. Ej: necesitamos analizar pliegos de concursos y RFPs entrantes..."
            rows={3}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
          />
          <button
            onClick={buscarAlternativas}
            disabled={analizando || !solicitud.trim()}
            className="flex items-center gap-2 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm transition-colors"
          >
            {analizando ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Buscar alternativas
          </button>
          {alternativas && (
            <div className="mt-4 bg-stone-50 border border-stone-200 rounded-md p-3">
              <p className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">{alternativas}</p>
            </div>
          )}
        </div>
      )}

      {/* Salud del catálogo: 4 estados de uso */}
      <div className="border-y border-stone-200 py-5 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <p className="eyebrow text-navy-800">Salud del catálogo · {herramientas.length} herramientas</p>
          {costeAtencion > 0 && (
            <p className="text-sm text-stone-600 font-medium">
              Coste en riesgo: <span className="font-bold text-red-700">{(costeAtencion / 1000).toFixed(1)}k€</span>
              <span className="text-stone-400 mx-1.5">·</span>
              Ahorro estimado consolidando: <span className="font-bold text-emerald-700">{(costeAtencion * 0.5 / 1000).toFixed(1)}k€/año</span>
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'muy_uso', label: 'Muy en uso', count: muyEnUso.length, dot: 'bg-emerald-500', text: 'text-emerald-700', desc: '≥80% activas' },
            { key: 'uso_moderado', label: 'Uso moderado', count: usoModerado.length, dot: 'bg-navy-700', text: 'text-navy-900', desc: '50-79%' },
            { key: 'infrautilizada', label: 'Infrautilizadas', count: infrautilizadas.length, dot: 'bg-gold-500', text: 'text-gold-700', desc: '20-49%' },
            { key: 'sin_uso', label: 'Sin uso', count: sinUsoH.length, dot: 'bg-red-500', text: 'text-red-700', desc: '<20%' },
          ].map((s, idx) => (
            <div key={s.key} className={`flex flex-col ${idx > 0 ? 'border-l border-stone-200 pl-4' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-700">{s.label}</p>
              </div>
              <p className={`kpi-number text-[2.5rem] ${s.text}`}>{s.count}</p>
              <p className="text-xs text-stone-500 mt-1.5 font-medium">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista compacta de las que requieren atención (colapsable) */}
      {requierenAtencion.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setRequierenAtencionAbierto(!requierenAtencionAbierto)}
            className="w-full flex items-center justify-between mb-3 flex-wrap gap-2 text-left hover:bg-stone-50 -mx-2 px-2 py-1 rounded transition-colors"
          >
            <div className="flex items-center gap-2">
              <ChevronRight size={14} className={`text-red-700 transition-transform ${requierenAtencionAbierto ? 'rotate-90' : ''}`} />
              <p className="eyebrow text-red-700">Requieren acción</p>
              <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">{requierenAtencion.length}</span>
            </div>
            <p className="text-xs text-stone-500 font-medium">{requierenAtencionAbierto ? 'Pulsa para ocultar' : 'Pulsa para ver el detalle'}</p>
          </button>
          {requierenAtencionAbierto && (
          <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
            {requierenAtencion.map(h => {
              const u = h.usoEstado;
              const esDup = (h.alerta || '').includes('Duplica');
              const sinUsar = h.licenciasContratadas - h.licenciasActivas;
              const accent =
                u.key === 'sin_uso' ? { dot: 'bg-red-500', badge: 'text-red-800 bg-red-50 border-red-200', text: 'text-red-700', bar: 'bg-red-500' } :
                u.key === 'infrautilizada' ? { dot: 'bg-gold-500', badge: 'text-gold-800 bg-gold-50 border-gold-200', text: 'text-gold-700', bar: 'bg-gold-500' } :
                { dot: 'bg-stone-400', badge: 'text-stone-700 bg-stone-50 border-stone-200', text: 'text-stone-700', bar: 'bg-stone-400' };
              return (
                <button
                  key={h.id}
                  onClick={() => abrirDetalle(h)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className={`w-2 h-12 rounded-full ${accent.bar} flex-shrink-0`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-navy-900 truncate">{h.nombre}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${accent.badge}`}>{u.label}</span>
                      {esDup && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                          <AlertTriangle size={9} /> Duplicidad
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600">
                      <span className="font-semibold text-stone-900">{sinUsar}</span> de <span className="font-semibold text-stone-900">{h.licenciasContratadas}</span> licencias sin asignar{esDup && h.alerta ? ` · ${h.alerta}` : ''}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 w-32 flex-shrink-0">
                    <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${accent.bar}`} style={{ width: `${Math.max(2, u.pct)}%` }}></div>
                    </div>
                    <span className={`text-xs font-bold tabular-nums ${accent.text} w-8 text-right`}>{u.pct}%</span>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className={`text-sm font-bold tabular-nums ${accent.text}`}>{(h.costeAnual || 0).toLocaleString()}€</p>
                    <p className="text-[10px] text-stone-500 font-medium">en juego/año</p>
                  </div>
                  <ChevronRight size={16} className="text-stone-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setVistaCatalogo('catalogo')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
            vistaCatalogo === 'catalogo'
              ? 'bg-navy-900 text-stone-50 border-navy-900 shadow-md'
              : 'bg-white text-stone-700 border-stone-300 hover:border-navy-700 hover:text-navy-900'
          }`}
        >
          <Package size={16} className={vistaCatalogo === 'catalogo' ? 'text-gold-400' : ''} />
          Catálogo
        </button>
        <button
          onClick={() => setVistaCatalogo('por_uso')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
            vistaCatalogo === 'por_uso'
              ? 'bg-navy-900 text-stone-50 border-navy-900 shadow-md'
              : 'bg-white text-stone-700 border-stone-300 hover:border-navy-700 hover:text-navy-900'
          }`}
        >
          <Filter size={16} className={vistaCatalogo === 'por_uso' ? 'text-gold-400' : ''} />
          Herramientas por uso
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={13} className="text-stone-500" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar herramienta..." className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
          <option value="todas">Todos los estados</option>
          <option value="ok">Sin alertas</option>
          <option value="alertas">Con alertas</option>
        </select>
        <select value={filtroOrigen} onChange={e => setFiltroOrigen(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none" title="Creada por">
          <option value="todos">Creada por: todas</option>
          <option value="externa">Externa</option>
          <option value="inhouse">In-house</option>
        </select>
        <span className="ml-auto text-xs text-stone-500">{herramientasFiltradas.length} herramientas</span>
      </div>

      {vistaCatalogo === 'por_uso' && (() => {
        const equiposDeH = (h) => h.todosEquipos
          ? [...EQUIPOS_NEGOCIO]
          : (Array.isArray(h.equipos) && h.equipos.length > 0
            ? (h.todaCompaniaUsuarios ? [...EQUIPOS_NEGOCIO] : h.equipos)
            : (h.todaCompaniaUsuarios ? [...EQUIPOS_NEGOCIO] : []));
        const delegacionesDeH = (h) => h.todasDelegaciones
          ? [...DELEGACIONES]
          : h.todasDelegacionesEspana
            ? [...DELEGACIONES_ESPANA]
            : (Array.isArray(h.delegaciones) && h.delegaciones.length > 0
              ? h.delegaciones
              : (h.delegacion ? [h.delegacion] : []));
        const filtradas = herramientas.filter(h => {
          if (busqueda && !h.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false;
          if (filtroPorUsoEquipos.length > 0) {
            if (!h.todosEquipos) {
              const eq = equiposDeH(h);
              if (!filtroPorUsoEquipos.some(f => eq.includes(f))) return false;
            }
          }
          if (filtroPorUsoDelegaciones.length > 0) {
            const dl = delegacionesDeH(h);
            if (!filtroPorUsoDelegaciones.some(f => dl.includes(f))) return false;
          }
          if (filtroPorUsoCoste === 'con_coste' && (h.sinCosteLicencia || (h.costeAnual || 0) === 0)) return false;
          if (filtroPorUsoCoste === 'sin_coste' && !h.sinCosteLicencia && (h.costeAnual || 0) !== 0) return false;
          if (filtroPorUsoOrigen !== 'todos') {
            const origen = h.origen === 'inhouse' ? 'inhouse' : 'externa';
            if (origen !== filtroPorUsoOrigen) return false;
          }
          if (filtroPorUsoCategorias.length > 0) {
            const cats = categoriasDe(h);
            if (!filtroPorUsoCategorias.some(f => cats.includes(f))) return false;
          }
          return true;
        });
        const todasLasDelegaciones = [...new Set([...DELEGACIONES, ...herramientas.flatMap(h => delegacionesDeH(h))])].sort();
        return (
          <div>
            <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">Categorías <span className="normal-case text-stone-400">{filtroPorUsoCategorias.length > 0 ? `· ${filtroPorUsoCategorias.length} seleccionadas` : '· ninguna (muestra todas)'}</span></p>
                <div className="flex flex-wrap gap-1">
                  {categorias.map(c => {
                    const sel = filtroPorUsoCategorias.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFiltroPorUsoCategorias(sel ? filtroPorUsoCategorias.filter(x => x !== c) : [...filtroPorUsoCategorias, c])}
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                      >{c}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">Equipos <span className="normal-case text-stone-400">{filtroPorUsoEquipos.length > 0 ? `· ${filtroPorUsoEquipos.length} seleccionados` : '· ninguno (muestra todos)'}</span></p>
                <div className="flex items-center gap-1 mb-2 bg-stone-100 rounded-md p-0.5 w-fit">
                  {[
                    { k: 'transaccional', l: 'Transaccional' },
                    { k: 'capital_markets', l: 'Capital Markets' },
                    { k: 'no_transaccional', l: 'No transaccional' },
                  ].map(t => {
                    const count = EQUIPOS_NEGOCIO_GRUPOS[t.k].filter(e => filtroPorUsoEquipos.includes(e)).length;
                    const active = subTabEquiposPorUso === t.k;
                    return (
                      <button
                        key={t.k}
                        type="button"
                        onClick={() => setSubTabEquiposPorUso(t.k)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-colors ${active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
                      >
                        {t.l}
                        {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active ? 'bg-navy-900 text-stone-50' : 'bg-stone-200 text-stone-700'}`}>{count}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-1">
                  {EQUIPOS_NEGOCIO_GRUPOS[subTabEquiposPorUso].map(eq => {
                    const sel = filtroPorUsoEquipos.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setFiltroPorUsoEquipos(sel ? filtroPorUsoEquipos.filter(x => x !== eq) : [...filtroPorUsoEquipos, eq])}
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                      >{eq}</button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">Delegaciones <span className="normal-case text-stone-400">{filtroPorUsoDelegaciones.length > 0 ? `· ${filtroPorUsoDelegaciones.length} seleccionadas` : '· ninguna (muestra todas)'}</span></p>
                <div className="flex flex-wrap gap-1">
                  {todasLasDelegaciones.map(d => {
                    const sel = filtroPorUsoDelegaciones.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFiltroPorUsoDelegaciones(sel ? filtroPorUsoDelegaciones.filter(x => x !== d) : [...filtroPorUsoDelegaciones, d])}
                        className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                      >{d}</button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Coste:</span>
                {[
                  { v: 'todos', l: 'Todos' },
                  { v: 'con_coste', l: 'Con coste' },
                  { v: 'sin_coste', l: 'Sin coste' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setFiltroPorUsoCoste(opt.v)}
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors border ${filtroPorUsoCoste === opt.v ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                  >{opt.l}</button>
                ))}
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold ml-2">Origen:</span>
                {[
                  { v: 'todos', l: 'Todas' },
                  { v: 'externa', l: 'Externa' },
                  { v: 'inhouse', l: 'In-house' },
                ].map(opt => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setFiltroPorUsoOrigen(opt.v)}
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors border ${filtroPorUsoOrigen === opt.v ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                  >{opt.l}</button>
                ))}
                {(filtroPorUsoEquipos.length > 0 || filtroPorUsoDelegaciones.length > 0 || filtroPorUsoCategorias.length > 0 || filtroPorUsoCoste !== 'todos' || filtroPorUsoOrigen !== 'todos') && (
                  <button
                    onClick={() => { setFiltroPorUsoEquipos([]); setFiltroPorUsoDelegaciones([]); setFiltroPorUsoCategorias([]); setFiltroPorUsoCoste('todos'); setFiltroPorUsoOrigen('todos'); }}
                    className="text-[11px] text-stone-600 hover:text-navy-900 underline ml-auto"
                  >Limpiar filtros</button>
                )}
                <span className="ml-auto text-xs text-stone-500">{filtradas.length} de {herramientas.length}</span>
              </div>
            </div>

            {filtradas.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center">
                <Filter size={36} className="text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-600 font-medium mb-1">No hay herramientas que coincidan con los filtros.</p>
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-stone-600 font-bold">Herramienta</th>
                      <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-stone-600 font-bold">Equipos</th>
                      <th className="text-left px-4 py-2 text-[10px] uppercase tracking-wider text-stone-600 font-bold">Delegaciones</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider text-stone-600 font-bold">Usuarios</th>
                      <th className="text-right px-4 py-2 text-[10px] uppercase tracking-wider text-stone-600 font-bold">Coste</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtradas.map(h => {
                      const equipos = equiposDeH(h);
                      const delegaciones = delegacionesDeH(h);
                      const cats = (Array.isArray(h.categorias) && h.categorias.length) ? h.categorias.join(', ') : (h.categoria || '');
                      return (
                        <tr key={h.id} className="border-b border-stone-100 hover:bg-stone-50 cursor-pointer" onClick={() => abrirDetalle(h)}>
                          <td className="px-4 py-3">
                            <p className="font-bold text-navy-900">{h.nombre}</p>
                            <p className="text-[10px] text-stone-500">{cats}{h.origen === 'inhouse' ? ' · In-house' : ''}</p>
                          </td>
                          <td className="px-4 py-3">
                            {h.todosEquipos ? (
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Todos los equipos</span>
                            ) : (
                              <div className="flex flex-wrap gap-0.5">
                                {equipos.slice(0, 3).map(e => <span key={e} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">{e}</span>)}
                                {equipos.length > 3 && <span className="text-[10px] text-stone-500">+{equipos.length - 3}</span>}
                                {equipos.length === 0 && <span className="text-[10px] text-stone-400 italic">Sin equipo</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {h.todasDelegaciones ? (
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Todas (incl. intl.)</span>
                            ) : h.todasDelegacionesEspana ? (
                              <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">Todas España</span>
                            ) : (
                              <div className="flex flex-wrap gap-0.5">
                                {delegaciones.slice(0, 3).map(d => <span key={d} className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">{d}</span>)}
                                {delegaciones.length > 3 && <span className="text-[10px] text-stone-500">+{delegaciones.length - 3}</span>}
                                {delegaciones.length === 0 && <span className="text-[10px] text-stone-400 italic">—</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {h.todaCompaniaUsuarios ? (
                              <span className="text-xs font-bold text-stone-700">Toda la compañía</span>
                            ) : (
                              <span className="text-sm font-bold text-stone-900 tabular-nums">{h.numeroUsuarios || h.licenciasContratadas || 0}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {h.sinCosteLicencia || (h.costeAnual || 0) === 0 ? (
                              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">Sin coste</span>
                            ) : (
                              <span className="text-sm font-bold text-navy-800 tabular-nums">{(h.costeAnual || 0).toLocaleString()}€/año</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {vistaCatalogo === 'catalogo' && Object.keys(herramientasPorCategoria).length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center">
          <Package size={36} className="text-stone-300 mx-auto mb-3" />
          <p className="text-base text-stone-600 font-medium">No hay herramientas que coincidan con los filtros.</p>
        </div>
      ) : vistaCatalogo === 'catalogo' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(herramientasPorCategoria).map(([categoria, items]) => {
            const Icon = categoriaIcon[categoria] || Package;
            const itemsConUso = items.map(h => ({ ...h, usoEstado: calcularUsoEstado(h) }));
            const totalAlertas = itemsConUso.filter(h => h.usoEstado.key === 'sin_uso' || h.usoEstado.key === 'infrautilizada' || (h.alerta || '').includes('Duplica')).length;
            return (
              <div key={categoria} className="bg-stone-50/60 border border-stone-200 rounded-2xl overflow-hidden flex flex-col group">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-stone-200">
                  <Icon size={15} className="text-navy-700" />
                  <h3
                    className="text-sm font-bold text-navy-900 tracking-tight flex-1 cursor-help"
                    title={CATEGORIAS_DESCRIPCIONES[categoria] || 'Categoría personalizada'}
                  >{categoria}</h3>
                  <span className="text-xs font-bold text-navy-900 bg-stone-100 px-2 py-0.5 rounded">{items.length}</span>
                  {totalAlertas > 0 && <span className="text-xs font-bold text-gold-800 bg-gold-100 px-2 py-0.5 rounded" title={`${totalAlertas} con alerta`}>!{totalAlertas}</span>}
                  <button
                    onClick={() => iniciarBorradoCategoria(categoria)}
                    className="text-stone-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Eliminar categoría "${categoria}"`}
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="p-2 space-y-2 flex-1">
                  {itemsConUso.map(h => {
                    const u = h.usoEstado;
                    const esDuplicada = (h.alerta || '').includes('Duplica');
                    const colorBarra = {
                      muy_uso: 'bg-emerald-500',
                      uso_moderado: 'bg-navy-700',
                      infrautilizada: 'bg-gold-500',
                      sin_uso: 'bg-red-500',
                      sin_dato: 'bg-stone-300',
                    }[u.key];
                    const accent = {
                      muy_uso: 'border-l-emerald-500',
                      uso_moderado: 'border-l-navy-700',
                      infrautilizada: 'border-l-gold-500',
                      sin_uso: 'border-l-red-500',
                      sin_dato: 'border-l-stone-300',
                    }[u.key];
                    const badge = {
                      muy_uso: 'bg-emerald-100 text-emerald-800',
                      uso_moderado: 'bg-navy-100 text-navy-800',
                      infrautilizada: 'bg-gold-100 text-gold-800',
                      sin_uso: 'bg-red-100 text-red-800',
                      sin_dato: 'bg-stone-100 text-stone-700',
                    }[u.key];

                    return (
                      <button
                        key={h.id}
                        onClick={() => abrirDetalle(h)}
                        className={`text-left bg-white border border-stone-200 ${accent} border-l-4 rounded-lg p-3 hover:shadow-md hover:border-navy-700 transition-all w-full`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-navy-900 leading-tight line-clamp-2 flex-1">{h.nombre}</p>
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${badge}`}>{u.label}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${origenDe(h) === 'inhouse' ? 'bg-navy-100 text-navy-800' : 'bg-stone-100 text-stone-700'}`}>{origenDe(h) === 'inhouse' ? 'In-house' : 'Externa'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all ${colorBarra}`} style={{ width: `${Math.max(2, u.pct)}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-stone-700 tabular-nums">{u.pct}%</span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-stone-600">
                          <span className="font-medium">{h.licenciasActivas}/{h.licenciasContratadas} lic.</span>
                          <span className="font-bold text-navy-800 tabular-nums" title={`${(h.costeAnual || 0).toLocaleString()}€/año total · ${costePorLicenciaDe(h).toLocaleString()}€/año por licencia`}>{Math.round(costePorLicenciaDe(h) / 12).toLocaleString()}€/mes·lic</span>
                        </div>
                        {esDuplicada && (
                          <p className="text-[10px] text-red-700 font-semibold mt-1.5 flex items-center gap-1">
                            <AlertTriangle size={10} /> Duplicidad
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {editandoId && edicion && (() => {
        const herramientaOriginal = herramientas.find(h => h.id === editandoId);
        const pctUsoEdit = (Number(edicion.licenciasContratadas) || 1) > 0
          ? Math.round(((Number(edicion.licenciasActivas) || 0) / (Number(edicion.licenciasContratadas) || 1)) * 100)
          : 0;
        const colorBarraEdit = pctUsoEdit >= 75 ? 'bg-emerald-500' : pctUsoEdit >= 50 ? 'bg-amber-500' : 'bg-red-500';

        return (
          <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={cerrarDetalle}>
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-stone-200 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-1">Editar herramienta</p>
                  <h2 className="font-serif text-2xl text-stone-900 truncate">{herramientaOriginal?.nombre}</h2>
                  {herramientaOriginal?.fechaAlta && (
                    <p className="text-[11px] text-stone-500 mt-1">Añadida el {formatFecha(herramientaOriginal.fechaAlta)}</p>
                  )}
                </div>
                <button onClick={cerrarDetalle} className="text-stone-400 hover:text-stone-700 flex-shrink-0">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Nombre</label>
                  <input
                    value={edicion.nombre}
                    onChange={e => setEdicion({ ...edicion, nombre: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción</label>
                  <textarea
                    value={edicion.descripcion}
                    onChange={e => setEdicion({ ...edicion, descripcion: e.target.value })}
                    rows={2}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => sugerirCategorias('edicion')}
                    disabled={sugiriendoCategorias || !edicion.descripcion?.trim()}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 rounded-md font-semibold transition-colors"
                    title={!edicion.descripcion?.trim() ? 'Escribe primero la descripción' : 'La IA leerá la descripción y propondrá categorías que encajen'}
                  >
                    {sugiriendoCategorias && sugerenciaRazon?.modo === 'edicion' ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    {sugiriendoCategorias && sugerenciaRazon?.modo === 'edicion' ? 'Analizando…' : 'Sugerir categorías con IA'}
                  </button>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Origen</label>
                  <div className="flex gap-1">
                    {[
                      { v: 'externa', l: 'Externa', d: 'Software contratado a un tercero' },
                      { v: 'inhouse', l: 'In-house', d: 'Desarrollada internamente por la compañía' },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => setEdicion({ ...edicion, origen: opt.v })}
                        className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                          edicion.origen === opt.v ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                        }`}
                        title={opt.d}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Categorías <span className="normal-case text-stone-400 font-normal">(puede pertenecer a varias)</span></label>
                    {sugerenciaRazon?.modo === 'edicion' && sugerenciaRazon.razon && (
                      <div className={`mb-2 px-3 py-2 rounded-md text-[11px] flex items-start gap-2 ${sugerenciaRazon.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-navy-50 text-navy-900 border border-navy-200'}`}>
                        <Sparkles size={12} className="flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold mb-0.5">Sugerencia de la IA</p>
                          <p>{sugerenciaRazon.razon}</p>
                        </div>
                        <button onClick={() => setSugerenciaRazon(null)} className="text-stone-400 hover:text-stone-700 flex-shrink-0"><X size={12} /></button>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {categorias.map(c => {
                        const sel = (edicion.categoriasSel || []).includes(c);
                        const sugerida = sugerenciaRazon?.modo === 'edicion' && sugerenciaRazon.categorias?.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setEdicion({ ...edicion, categoriasSel: sel ? edicion.categoriasSel.filter(x => x !== c) : [...(edicion.categoriasSel || []), c] })}
                            className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors border-2 ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : sugerida ? 'bg-gold-50 text-gold-900 border-gold-300' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                          >
                            {sel ? '✓ ' : sugerida ? '✨ ' : ''}{c}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      value={edicion.nuevaCategoria || ''}
                      onChange={e => setEdicion({ ...edicion, nuevaCategoria: e.target.value })}
                      placeholder="+ Añadir nueva categoría..."
                      className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Equipos que utilizan la herramienta <span className="text-red-600">*</span></label>
                  <button
                    type="button"
                    onClick={() => setEdicion({ ...edicion, todosEquipos: !edicion.todosEquipos })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border mb-2 ${
                      edicion.todosEquipos ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      edicion.todosEquipos ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                    }`}>
                      {edicion.todosEquipos && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
                    </span>
                    Todos los equipos
                  </button>
                  {!edicion.todosEquipos && (
                    <>
                      <div className="flex items-center gap-1 mb-3 bg-stone-100 rounded-md p-0.5 w-fit">
                        {[
                          { k: 'transaccional', l: 'Transaccional' },
                          { k: 'capital_markets', l: 'Capital Markets' },
                          { k: 'no_transaccional', l: 'No transaccional' },
                        ].map(t => {
                          const count = EQUIPOS_NEGOCIO_GRUPOS[t.k].filter(e => (edicion.equipos || []).includes(e)).length;
                          const active = subTabEquiposEdicion === t.k;
                          return (
                            <button
                              key={t.k}
                              type="button"
                              onClick={() => setSubTabEquiposEdicion(t.k)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
                            >
                              {t.l}
                              {count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${active ? 'bg-navy-900 text-stone-50' : 'bg-stone-200 text-stone-700'}`}>{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {EQUIPOS_NEGOCIO_GRUPOS[subTabEquiposEdicion].map(eq => {
                          const sel = (edicion.equipos || []).includes(eq);
                          return (
                            <button
                              key={eq}
                              type="button"
                              onClick={() => setEdicion({ ...edicion, equipos: sel ? edicion.equipos.filter(x => x !== eq) : [...(edicion.equipos || []), eq] })}
                              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                            >
                              {sel ? '+ ' : ''}{eq}
                            </button>
                          );
                        })}
                      </div>
                      {(edicion.equipos || []).length > 0 && <p className="text-[10px] text-stone-500 mt-2">{edicion.equipos.length} {edicion.equipos.length === 1 ? 'equipo seleccionado' : 'equipos seleccionados'} en total</p>}
                    </>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Delegaciones donde se utiliza <span className="text-red-600">*</span></label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setEdicion({ ...edicion, todasDelegaciones: !edicion.todasDelegaciones, todasDelegacionesEspana: false })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                        edicion.todasDelegaciones ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                      title="Madrid · Barcelona · Valencia · Málaga · Sevilla · Portugal · Londres"
                    >
                      <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        edicion.todasDelegaciones ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                      }`}>
                        {edicion.todasDelegaciones && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
                      </span>
                      Todas las delegaciones <span className="font-normal text-[10px]">(incluye internacionales)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEdicion({ ...edicion, todasDelegacionesEspana: !edicion.todasDelegacionesEspana, todasDelegaciones: false })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border ${
                        edicion.todasDelegacionesEspana ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                      }`}
                      title="Madrid · Barcelona · Valencia · Málaga · Sevilla"
                    >
                      <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        edicion.todasDelegacionesEspana ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                      }`}>
                        {edicion.todasDelegacionesEspana && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
                      </span>
                      Todas las delegaciones España
                    </button>
                  </div>
                  {!edicion.todasDelegaciones && !edicion.todasDelegacionesEspana && (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[...new Set([...DELEGACIONES, ...(edicion.delegaciones || [])])].map(d => {
                          const sel = (edicion.delegaciones || []).includes(d);
                          return (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setEdicion({ ...edicion, delegaciones: sel ? edicion.delegaciones.filter(x => x !== d) : [...(edicion.delegaciones || []), d] })}
                              className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                            >
                              {sel ? '+ ' : ''}{d}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        value={edicion.nuevaDelegacion || ''}
                        onChange={e => setEdicion({ ...edicion, nuevaDelegacion: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && (edicion.nuevaDelegacion || '').trim()) {
                            e.preventDefault();
                            const nd = edicion.nuevaDelegacion.trim();
                            if (!(edicion.delegaciones || []).includes(nd)) {
                              setEdicion({ ...edicion, delegaciones: [...(edicion.delegaciones || []), nd], nuevaDelegacion: '' });
                            }
                          }
                        }}
                        placeholder="+ Añadir otra provincia y pulsa Enter"
                        className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                      />
                    </>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">Funcionalidades <span className="normal-case text-stone-400 font-normal">(etiquetas estructuradas)</span></label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {funcionalidadesDisponibles.map(f => {
                      const sel = (edicion.funcionalidadesSel || []).includes(f);
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setEdicion({ ...edicion, funcionalidadesSel: sel ? edicion.funcionalidadesSel.filter(x => x !== f) : [...(edicion.funcionalidadesSel || []), f] })}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                        >{sel ? '+ ' : ''}{f}</button>
                      );
                    })}
                  </div>
                  <input
                    value={edicion.nuevaFuncionalidad || ''}
                    onChange={e => setEdicion({ ...edicion, nuevaFuncionalidad: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (edicion.nuevaFuncionalidad || '').trim()) {
                        e.preventDefault();
                        const nf = edicion.nuevaFuncionalidad.trim();
                        if (!(edicion.funcionalidadesSel || []).includes(nf)) {
                          setEdicion({ ...edicion, funcionalidadesSel: [...(edicion.funcionalidadesSel || []), nf], nuevaFuncionalidad: '' });
                        }
                      }
                    }}
                    placeholder="+ Añadir nueva etiqueta y pulsa Enter"
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                  />
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Número de usuarios</p>
                  <p className="text-[10px] text-stone-500 mb-2 italic">Personas que potencialmente la usan. Independiente de las licencias.</p>
                  <button
                    type="button"
                    onClick={() => setEdicion({ ...edicion, todaCompaniaUsuarios: !edicion.todaCompaniaUsuarios })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all border mb-2 ${
                      edicion.todaCompaniaUsuarios ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      edicion.todaCompaniaUsuarios ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                    }`}>
                      {edicion.todaCompaniaUsuarios && <span className="text-stone-900 text-[10px] leading-none">✓</span>}
                    </span>
                    Toda la compañía
                  </button>
                  {!edicion.todaCompaniaUsuarios && (
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Nº aproximado de usuarios</label>
                      <input
                        type="number"
                        min="1"
                        value={edicion.numeroUsuarios || ''}
                        onChange={e => setEdicion({ ...edicion, numeroUsuarios: e.target.value })}
                        className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Coste de licencias</p>
                  <button
                    type="button"
                    onClick={() => setEdicion({ ...edicion, sinCosteLicencia: !edicion.sinCosteLicencia })}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all border mb-2 ${
                      edicion.sinCosteLicencia ? 'bg-emerald-700 text-stone-50 border-emerald-700' : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      edicion.sinCosteLicencia ? 'bg-stone-50 border-stone-50' : 'border-stone-400'
                    }`}>
                      {edicion.sinCosteLicencia && <span className="text-emerald-700 text-[10px] leading-none">✓</span>}
                    </span>
                    Sin coste de licencia
                  </button>
                  {!edicion.sinCosteLicencia && (() => {
                    const cl = Number(edicion.costePorLicencia) || 0;
                    const lc = Number(edicion.licenciasContratadas) || 0;
                    const la = Number(edicion.licenciasActivas) || 0;
                    const mensual = cl * lc;
                    const anual = mensual * 12;
                    const usoPct = lc > 0 ? Math.round((la / lc) * 100) : 0;
                    return (
                      <>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Coste / lic (€/mes)</label>
                            <input
                              type="number"
                              min="0"
                              value={edicion.costePorLicencia}
                              onChange={e => setEdicion({ ...edicion, costePorLicencia: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Lic. contratadas</label>
                            <input
                              type="number"
                              min="0"
                              value={edicion.licenciasContratadas}
                              onChange={e => setEdicion({ ...edicion, licenciasContratadas: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Lic. activas</label>
                            <input
                              type="number"
                              min="0"
                              value={edicion.licenciasActivas}
                              onChange={e => setEdicion({ ...edicion, licenciasActivas: e.target.value })}
                              className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3 bg-white border border-stone-200 rounded-md p-2.5">
                          <div className="text-center border-r border-stone-200">
                            <p className="text-[9px] uppercase tracking-wider text-stone-500">Mensual</p>
                            <p className="text-base font-bold text-navy-900 tabular-nums">{mensual.toLocaleString()}€</p>
                          </div>
                          <div className="text-center border-r border-stone-200">
                            <p className="text-[9px] uppercase tracking-wider text-stone-500">Anual</p>
                            <p className="text-base font-bold text-navy-900 tabular-nums">{anual.toLocaleString()}€</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] uppercase tracking-wider text-stone-500">Uso lic.</p>
                            <p className={`text-base font-bold tabular-nums ${usoPct >= 80 ? 'text-emerald-700' : usoPct >= 50 ? 'text-navy-900' : usoPct >= 20 ? 'text-gold-700' : 'text-red-700'}`}>{usoPct}%</p>
                          </div>
                        </div>
                        <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-3">
                          <div className={`h-full transition-all ${colorBarraEdit}`} style={{ width: `${Math.max(2, usoPct)}%` }}></div>
                        </div>
                        <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Tipo de licencia <span className="normal-case text-stone-400">(opcional)</span></label>
                        <input
                          value={edicion.tipoLicencia || ''}
                          onChange={e => setEdicion({ ...edicion, tipoLicencia: e.target.value })}
                          placeholder="Suscripción anual, perpetua, por usuario/mes…"
                          className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                        />
                      </>
                    );
                  })()}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Alerta (opcional)</label>
                  <input
                    value={edicion.alerta}
                    onChange={e => setEdicion({ ...edicion, alerta: e.target.value })}
                    placeholder="Ej: Duplica BI Suite B · Infrautilizada · ..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">Si la herramienta tiene un problema (duplicidad, infrautilización...). Déjalo vacío si está OK.</p>
                </div>

                {(() => {
                  const sols = herramientaOriginal?.solicitudesLicencia || [];
                  const yaSolicitada = usuarioActualId && sols.some(s => s.personaId === usuarioActualId);
                  const datalistId = `personas-solicitar-${editandoId}`;
                  const submitOtraPersona = () => {
                    const valor = (solicitarDesdePersona || '').trim();
                    if (!valor) return;
                    const match = (personas || []).find(p => p.nombre.toLowerCase() === valor.toLowerCase());
                    if (match) solicitarLicencia(editandoId, { personaId: match.id });
                    else solicitarLicencia(editandoId, { nombre: valor });
                    setSolicitarDesdePersona('');
                  };
                  return (
                    <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Solicitudes de licencia</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sols.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>{sols.length}</span>
                        </div>
                        {sols.length > 0 && (
                          <span className="text-[10px] text-stone-500 italic">Indicador de demanda</span>
                        )}
                      </div>

                      {sols.length === 0 ? (
                        <p className="text-xs text-stone-500 mb-3">Sin solicitudes pendientes.</p>
                      ) : (
                        <ul className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                          {sols.slice().sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).map(s => {
                            const p = s.personaId ? personaById[s.personaId] : null;
                            const nombreMostrado = p?.nombre || s.nombre || 'Persona desconocida';
                            const equipoMostrado = p ? getEquipo(p) : (s.nombre ? 'No registrado en el sistema' : '');
                            const inic = nombreMostrado !== 'Persona desconocida'
                              ? nombreMostrado.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
                              : '?';
                            const fechaRel = s.fecha ? formatFecha(s.fecha, true) : '';
                            const externa = !p && s.nombre;
                            return (
                              <li key={s.id} className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-2 py-1.5">
                                <div className={`w-5 h-5 rounded-full text-stone-50 flex items-center justify-center font-semibold text-[9px] flex-shrink-0 ${externa ? 'bg-stone-500' : 'bg-navy-900'}`}>{inic}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-stone-800 truncate">{nombreMostrado}</p>
                                  {equipoMostrado && <p className="text-[10px] text-stone-500 truncate italic">{equipoMostrado}</p>}
                                </div>
                                <span className="text-[10px] text-stone-500 flex-shrink-0">{fechaRel}</span>
                                <button
                                  onClick={() => cancelarSolicitud(editandoId, s.id)}
                                  className="text-stone-400 hover:text-red-600 flex-shrink-0"
                                  title="Eliminar solicitud"
                                >
                                  <X size={12} />
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {usuarioActualId && (
                          yaSolicitada ? (
                            <button
                              onClick={() => {
                                const mia = sols.find(s => s.personaId === usuarioActualId);
                                if (mia) cancelarSolicitud(editandoId, mia.id);
                              }}
                              className="text-xs px-3 py-1.5 bg-white border border-stone-300 hover:border-stone-500 text-stone-700 rounded-md font-medium transition-colors"
                            >Cancelar mi solicitud</button>
                          ) : (
                            <button
                              onClick={() => solicitarLicencia(editandoId, { personaId: usuarioActualId })}
                              className="text-xs px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md font-medium transition-colors"
                            >Solicitar licencia para mí</button>
                          )
                        )}
                        <div className="flex items-center gap-1 flex-1 min-w-[240px]">
                          <input
                            list={datalistId}
                            value={solicitarDesdePersona}
                            onChange={e => setSolicitarDesdePersona(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitOtraPersona(); } }}
                            placeholder="Solicitar para otra persona (escribe el nombre)…"
                            className="flex-1 text-xs bg-white border border-stone-200 rounded-md px-2 py-1.5 outline-none focus:border-navy-700"
                          />
                          <datalist id={datalistId}>
                            {(personas || []).filter(p => !sols.some(s => s.personaId === p.id)).map(p => (
                              <option key={p.id} value={p.nombre}>{getEquipo(p)}</option>
                            ))}
                          </datalist>
                          <button
                            onClick={submitOtraPersona}
                            disabled={!solicitarDesdePersona.trim()}
                            className="text-xs px-2 py-1.5 bg-stone-200 hover:bg-stone-300 disabled:opacity-40 text-stone-800 rounded-md font-medium transition-colors"
                          >Añadir</button>
                        </div>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-2 italic">Si la persona no está registrada en el sistema, IT verá la solicitud con el nombre que escribas.</p>
                    </div>
                  );
                })()}
              </div>

              <div className="p-4 border-t border-stone-200 flex items-center justify-between">
                <button
                  onClick={eliminarHerramienta}
                  className="text-xs text-red-700 hover:text-red-800 font-medium transition-colors flex items-center gap-1"
                >
                  <X size={12} /> Eliminar del catálogo
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={cerrarDetalle}
                    className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-sm transition-colors"
                  >Cancelar</button>
                  <button
                    onClick={guardarEdicion}
                    disabled={!edicion.nombre.trim() || !edicion.descripcion.trim() || ((edicion.categoriasSel || []).length === 0 && !(edicion.nuevaCategoria || '').trim()) || (!edicion.todosEquipos && (edicion.equipos || []).length === 0) || (!edicion.todasDelegaciones && !edicion.todasDelegacionesEspana && (edicion.delegaciones || []).length === 0 && !(edicion.nuevaDelegacion || '').trim())}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {mostrandoAnalisis && (
        <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={() => setMostrandoAnalisis(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-stone-200 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-1">Catálogo</p>
                <h2 className="font-serif text-2xl text-stone-900 flex items-center gap-2">
                  <Sparkles size={20} className="text-gold-600" />
                  Análisis de herramientas
                </h2>
                <p className="text-sm text-stone-600 mt-1">Para cada herramienta: las funcionalidades que tiene declaradas y las que la IA propone que podría cubrir según su categoría.</p>
              </div>
              <button onClick={() => setMostrandoAnalisis(false)} className="text-stone-400 hover:text-stone-700 flex-shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {analizandoHerramientas ? (
                <div className="flex items-center justify-center gap-3 py-16 text-stone-600">
                  <Loader2 size={20} className="animate-spin" />
                  <p className="text-sm">Analizando {herramientas.length} {herramientas.length === 1 ? 'herramienta' : 'herramientas'}…</p>
                </div>
              ) : analisisHerramientas?.__error ? (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                  {analisisHerramientas.__error}
                  <button onClick={analizarHerramientas} className="ml-3 text-red-700 hover:text-red-900 underline">Reintentar</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {herramientas.map(h => {
                    const cats = (Array.isArray(h.categorias) && h.categorias.length) ? h.categorias.join(' · ') : (h.categoria || 'Sin categoría');
                    const funcsActuales = h.funcionalidades || [];
                    const a = analisisHerramientas?.[h.id];
                    const faltantes = a?.faltantes || [];
                    return (
                      <div key={h.id} className="bg-white border border-stone-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <h3 className="text-sm font-bold text-navy-900">{h.nombre}</h3>
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">{cats}</span>
                          {h.origen === 'inhouse' && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-navy-100 text-navy-800 font-bold">In-house</span>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1.5">Funcionalidades actuales · {funcsActuales.length}</p>
                            {funcsActuales.length === 0 ? (
                              <p className="text-xs text-stone-400 italic">No hay funcionalidades declaradas.</p>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {funcsActuales.map(f => (
                                  <span key={f} className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">{f}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gold-700 font-semibold mb-1.5 flex items-center gap-1">
                              <Sparkles size={11} /> Le faltaría · {faltantes.length}
                            </p>
                            {faltantes.length === 0 ? (
                              <p className="text-xs text-stone-500 italic">{a?.razon || 'Sin sugerencias.'}</p>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {faltantes.map((f, i) => (
                                  <span key={i} className="text-[11px] bg-gold-50 text-gold-900 border border-gold-200 px-2 py-0.5 rounded font-medium">+ {f}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {faltantes.length > 0 && a?.razon && (
                          <p className="text-[11px] text-stone-500 italic mt-3 bg-stone-50 px-3 py-2 rounded">{a.razon}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 flex items-center justify-between">
              <p className="text-[11px] text-stone-500 italic">Las sugerencias son orientativas. Si una herramienta ya cubre algo de la lista, edítala y añade la funcionalidad.</p>
              <div className="flex items-center gap-2">
                {!analizandoHerramientas && analisisHerramientas && !analisisHerramientas.__error && (
                  <button onClick={analizarHerramientas} className="text-xs text-stone-600 hover:text-navy-900 underline">Volver a analizar</button>
                )}
                <button onClick={() => setMostrandoAnalisis(false)} className="px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {borrandoCategoria && (
        <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={() => setBorrandoCategoria(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Eliminar categoría "{borrandoCategoria.cat}"</h3>
            <p className="text-sm text-stone-700 mb-4">
              <span className="font-semibold">{borrandoCategoria.soloEsta.length}</span> {borrandoCategoria.soloEsta.length === 1 ? 'herramienta tiene' : 'herramientas tienen'} solo esta categoría. Selecciona a dónde reasignarla{borrandoCategoria.soloEsta.length === 1 ? '' : 's'}:
            </p>
            <ul className="text-xs text-stone-600 mb-4 max-h-32 overflow-y-auto bg-stone-50 rounded-md p-2 space-y-1 border border-stone-200">
              {borrandoCategoria.soloEsta.map(h => <li key={h.id}>· {h.nombre}</li>)}
            </ul>
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Categoría destino</label>
            <select
              value={borrandoCategoria.destino}
              onChange={e => setBorrandoCategoria({ ...borrandoCategoria, destino: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-4"
            >
              <option value="">— Selecciona categoría —</option>
              {categorias.filter(c => c !== borrandoCategoria.cat).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {borrandoCategoria.tienenOtras.length > 0 && (
              <p className="text-[11px] text-stone-500 mb-3">Las otras {borrandoCategoria.tienenOtras.length} {borrandoCategoria.tienenOtras.length === 1 ? 'herramienta' : 'herramientas'} con esta categoría conservarán las demás categorías.</p>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setBorrandoCategoria(null)} className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900">Cancelar</button>
              <button
                onClick={() => aplicarBorradoCategoria(borrandoCategoria.cat, borrandoCategoria.destino)}
                disabled={!borrandoCategoria.destino}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
              >
                Eliminar y reasignar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InnovacionView({ iniciativas, setIniciativas, personas, talleres }) {
  const [generando, setGenerando] = useState(null);
  const [pildoras, setPildoras] = useState({});
  const [revistaAbierta, setRevistaAbierta] = useState(null);
  const [errorPildora, setErrorPildora] = useState(null);
  const [nuevaTitulo, setNuevaTitulo] = useState('');
  const [nuevoTallerId, setNuevoTallerId] = useState('t1');
  const [nuevoAutorId, setNuevoAutorId] = useState('');
  const [nuevaDesc, setNuevaDesc] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [edicion, setEdicion] = useState(null);

  const abrirEdicion = (i) => {
    setEditandoId(i.id);
    setEdicion({
      titulo: i.titulo || '',
      descripcion: i.descripcion || '',
      tallerId: i.tallerId || '',
      autorId: i.autorId || '',
      estado: i.estado || 'Nueva',
    });
  };

  const cerrarEdicion = () => {
    setEditandoId(null);
    setEdicion(null);
  };

  const guardarEdicion = async () => {
    if (!edicion || !editandoId) return;
    if (!edicion.titulo.trim()) return;
    const tallerSel = talleres.find(t => t.id === edicion.tallerId);
    const autorSel = personas.find(p => p.id === edicion.autorId);
    const updates = {
      titulo: edicion.titulo.trim(),
      descripcion: edicion.descripcion.trim(),
      tallerId: edicion.tallerId || null,
      autorId: edicion.autorId || null,
      area: tallerSel?.area || 'Transversal',
      autor: autorSel?.nombre || 'Sin asignar',
      estado: edicion.estado || 'Nueva',
    };
    const nuevas = iniciativas.map(i => i.id === editandoId ? { ...i, ...updates } : i);
    await setIniciativas(nuevas);
    cerrarEdicion();
  };

  const eliminarIniciativa = async (id) => {
    if (!confirm('¿Eliminar esta iniciativa? Las píldoras generadas se conservan en memoria local.')) return;
    await setIniciativas(iniciativas.filter(i => i.id !== id));
    if (editandoId === id) cerrarEdicion();
  };

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const personasDelTaller = personas.filter(p => (p.talleres || []).includes(nuevoTallerId));

  const generarPildora = async (i) => {
    setGenerando(i.id);
    setErrorPildora(null);
    const autor = personaById[i.autorId];
    const taller = tallerById[i.tallerId];
    const prompt = `Genera el contenido de un artículo de revista corporativa interna sobre esta iniciativa de innovación de la compañía. Va dirigido a empleados de toda la compañía. Tono profesional, ágil, inspirador, sin marketing vacío. Devuelve SOLO un objeto JSON válido sin markdown.

INICIATIVA:
Título: ${i.titulo}
Autor: ${autor?.nombre || i.autor || 'Sin asignar'}
${autor?.equipo ? 'Equipo del autor: ' + autor.equipo : ''}
Taller: ${taller?.nombre || i.area || 'Transversal'}
Descripción: ${i.descripcion}

Estructura JSON requerida:
{
  "categoria": "una de: Tecnología · Servicios transversales · Clientes · Talento · Cultura · Diversificación",
  "titular": "titular periodístico fuerte (máx 60 caracteres)",
  "subtitular": "una frase que cuelga del titular y dé contexto (máx 140 caracteres)",
  "lead": "primer párrafo del artículo (50-70 palabras), engancha y resume el qué",
  "cuerpo": [
    "párrafo desarrollando el contexto y el por qué (60-90 palabras)",
    "párrafo sobre cómo funciona o cómo se está implantando (60-90 palabras)",
    "párrafo sobre el impacto esperado y los siguientes pasos (60-90 palabras)"
  ],
  "cita": "frase corta y potente del autor o sobre la iniciativa, entre 12 y 25 palabras",
  "citaAutor": "nombre de quien dice la cita",
  "datos": [
    {"valor": "ej: 30%", "etiqueta": "ej: reducción tiempo respuesta"},
    {"valor": "ej: 5", "etiqueta": "ej: equipos involucrados"},
    {"valor": "ej: Q3", "etiqueta": "ej: lanzamiento previsto"}
  ],
  "callout": "un bloque destacado lateral, 1-2 frases con la idea más memorable",
  "etiquetas": ["3-5 etiquetas cortas relacionadas, ej: 'IA generativa', 'Property', 'Eficiencia'"]
}`;

    const respuesta = await callClaude('Eres redactor jefe de comunicación interna de la compañía. Escribes con precisión periodística para una revista corporativa. Devuelves SOLO JSON válido.', prompt);

    if (typeof respuesta === 'string' && (respuesta.startsWith('Error') || respuesta.startsWith('No he podido'))) {
      setErrorPildora(respuesta + ' · Revisa que ANTHROPIC_API_KEY esté configurada en .env.local (local) o en Vercel (producción) y reinicia el servidor.');
      setGenerando(null);
      return;
    }

    try {
      const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setPildoras({ ...pildoras, [i.id]: data });
        setRevistaAbierta(i.id);
      } else {
        setErrorPildora('La IA no devolvió un JSON válido. Respuesta recibida: ' + respuesta.slice(0, 200));
      }
    } catch (e) {
      setErrorPildora('Error al parsear la respuesta: ' + e.message);
    }
    setGenerando(null);
  };

  const abrirRevista = (iniciativaId) => {
    if (pildoras[iniciativaId]) {
      setRevistaAbierta(iniciativaId);
    }
  };

  const imprimirRevista = () => {
    window.print();
  };

  const añadirIniciativa = async () => {
    if (!nuevaTitulo.trim()) return;
    const taller = tallerById[nuevoTallerId];
    const nueva = {
      id: `i-${Date.now()}`,
      titulo: nuevaTitulo,
      autorId: nuevoAutorId || null,
      tallerId: nuevoTallerId || null,
      area: taller?.area || 'Transversal',
      autor: personaById[nuevoAutorId]?.nombre || 'Sin asignar',
      estado: 'Nueva',
      descripcion: nuevaDesc,
    };
    await setIniciativas([...iniciativas, nueva]);
    setNuevaTitulo(''); setNuevoAutorId(''); setNuevaDesc('');
  };

  return (
    <div className="p-8 w-full">
      <header className="mb-8">
        <p className="eyebrow text-navy-800 mb-3">Foro de Innovación</p>
        <h1 className="display-1 text-navy-900 mb-3">Iniciativas y comunicación</h1>
        <hr className="savills-rule w-32 mb-4" />
        <p className="text-base text-stone-600 leading-relaxed">Genera píldoras tipo revista corporativa con IA para comunicar las iniciativas internamente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {iniciativas.map(i => {
          const autor = personaById[i.autorId];
          const taller = tallerById[i.tallerId];
          const yaTienePildora = !!pildoras[i.id];
          const editando = editandoId === i.id;

          if (editando) {
            const personasDelTallerEdit = personas.filter(p => (p.talleres || []).includes(edicion.tallerId));
            return (
              <article key={i.id} className="relative bg-white border-2 border-navy-700 rounded-2xl overflow-hidden shadow-md flex">
                <div className="w-1.5 bg-navy-700 flex-shrink-0"></div>
                <div className="flex-1 p-5">
                  <p className="eyebrow text-navy-800 mb-3">Editando iniciativa</p>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Título</label>
                  <input
                    value={edicion.titulo}
                    onChange={e => setEdicion({ ...edicion, titulo: e.target.value })}
                    placeholder="Título de la iniciativa"
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm font-semibold outline-none focus:border-navy-700 mb-3"
                  />

                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Descripción <span className="normal-case font-normal text-stone-400">(la IA usará este texto para la píldora)</span></label>
                  <textarea
                    value={edicion.descripcion}
                    onChange={e => setEdicion({ ...edicion, descripcion: e.target.value })}
                    placeholder="Descripción detallada. Cuanto más contexto, mejor saldrá la píldora."
                    rows={5}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 resize-none mb-3"
                  />

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Taller</label>
                      <select
                        value={edicion.tallerId}
                        onChange={e => setEdicion({ ...edicion, tallerId: e.target.value, autorId: '' })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                      >
                        <option value="">— Sin taller —</option>
                        {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Autor</label>
                      <select
                        value={edicion.autorId}
                        onChange={e => setEdicion({ ...edicion, autorId: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                      >
                        <option value="">— Sin autor —</option>
                        {personasDelTallerEdit.length > 0 && (
                          <optgroup label={`Miembros del taller`}>
                            {personasDelTallerEdit.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </optgroup>
                        )}
                        <optgroup label="Otras personas">
                          {personas.filter(p => !(p.talleres || []).includes(edicion.tallerId)).map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Estado</label>
                    <div className="flex gap-1.5">
                      {['Nueva', 'En 2 semanas', 'Presentada', 'Oportunidad', 'En curso', 'Aparcada'].map(est => (
                        <button
                          key={est}
                          onClick={() => setEdicion({ ...edicion, estado: est })}
                          className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors border ${edicion.estado === est ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}
                        >{est}</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    <button
                      onClick={guardarEdicion}
                      disabled={!edicion.titulo.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-semibold transition-colors"
                    >
                      <CheckCircle2 size={14} /> Guardar
                    </button>
                    <button
                      onClick={cerrarEdicion}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-stone-500 text-stone-700 rounded-md text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => eliminarIniciativa(i.id)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-2 text-red-700 hover:bg-red-50 rounded-md text-sm font-medium transition-colors"
                    >
                      <X size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </article>
            );
          }

          return (
            <article key={i.id} className="group relative bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:border-navy-700 hover:shadow-md transition-all flex">
              <div className={`w-1.5 ${yaTienePildora ? 'bg-gold-400' : 'bg-navy-700'} flex-shrink-0`}></div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="eyebrow text-navy-800">{taller ? taller.area : (i.area || 'Transversal')}</span>
                      <span className="text-stone-300">·</span>
                      <span className="eyebrow text-stone-500">{i.estado}</span>
                      {yaTienePildora && (
                        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-gold-100 text-gold-800 border border-gold-200">Píldora lista</span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl text-navy-900 leading-tight mb-1">{i.titulo}</h3>
                    <p className="text-sm text-stone-600 font-medium">
                      {autor?.nombre || i.autor || 'Sin asignar'}
                      {taller && <> · <span className="text-navy-700">{taller.nombre}</span></>}
                    </p>
                  </div>
                  <button
                    onClick={() => abrirEdicion(i)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-stone-500 hover:text-navy-900 font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-navy-50 transition-all flex-shrink-0"
                  >
                    <Settings size={12} /> Editar
                  </button>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mb-4 line-clamp-3">{i.descripcion}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                  {yaTienePildora && (
                    <button
                      onClick={() => abrirRevista(i.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-navy-700 text-navy-900 rounded-md text-sm font-semibold transition-colors"
                    >
                      <FileText size={14} /> Ver píldora
                    </button>
                  )}
                  <button
                    onClick={() => generarPildora(i)}
                    disabled={generando === i.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-sm font-semibold transition-colors ml-auto"
                  >
                    {generando === i.id ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-gold-400" />}
                    {yaTienePildora ? 'Regenerar' : 'Generar píldora'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {errorPildora && (
        <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4 flex items-center gap-2">
          <AlertTriangle size={12} className="text-red-600" />
          <p className="text-xs text-red-700">{errorPildora}</p>
          <button onClick={() => setErrorPildora(null)} className="ml-auto text-red-500 hover:text-red-700"><X size={12} /></button>
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-stone-900 mb-3">Añadir iniciativa</h3>
        <input
          value={nuevaTitulo}
          onChange={e => setNuevaTitulo(e.target.value)}
          placeholder="Título de la iniciativa"
          className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 mb-2"
        />
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1 block">Taller</label>
            <select
              value={nuevoTallerId}
              onChange={e => { setNuevoTallerId(e.target.value); setNuevoAutorId(''); }}
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
            >
              {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500 mb-1 block">
              Autor {personasDelTaller.length > 0 && <span className="text-stone-400 normal-case">· {personasDelTaller.length} miembros</span>}
            </label>
            <select
              value={nuevoAutorId}
              onChange={e => setNuevoAutorId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
            >
              <option value="">— Selecciona autor —</option>
              {personasDelTaller.length > 0 && (
                <optgroup label={`Miembros de ${tallerById[nuevoTallerId]?.nombre || 'taller'}`}>
                  {personasDelTaller.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre} · {getEquipo(p)}</option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Otras personas">
                {personas.filter(p => !(p.talleres || []).includes(nuevoTallerId)).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} · {getEquipo(p)}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
        <textarea
          value={nuevaDesc}
          onChange={e => setNuevaDesc(e.target.value)}
          placeholder="Descripción de la iniciativa"
          rows={2}
          className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-2"
        />
        <button
          onClick={añadirIniciativa}
          disabled={!nuevaTitulo.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-sm transition-colors"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      {revistaAbierta && pildoras[revistaAbierta] && (() => {
        const i = iniciativas.find(it => it.id === revistaAbierta);
        const pildora = pildoras[revistaAbierta];
        const autor = personaById[i?.autorId];
        const taller = tallerById[i?.tallerId];
        const fechaHoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        const numero = String(iniciativas.findIndex(it => it.id === revistaAbierta) + 1).padStart(2, '0');

        return (
          <div className="fixed inset-0 bg-navy-950/70 z-50 overflow-y-auto print:bg-white print:p-0 backdrop-blur-sm">
            <style>{`
              @media print {
                .no-print { display: none !important; }
                body { background: white !important; }
              }
              .magazine-serif { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.02em; }
            `}</style>

            <div className="no-print sticky top-0 bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center shadow-sm">
                  <span className="font-display text-stone-50 text-base font-bold">N</span>
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-gold-400 border-2 border-white"></span>
                </div>
                <div>
                  <p className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Comunicación interna</p>
                  <p className="text-sm font-bold text-navy-900">Revista Nexo · Píldora #{numero}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={imprimirRevista}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-navy-700 text-navy-900 rounded-md text-sm font-semibold transition-colors"
                >
                  <FileText size={14} /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setRevistaAbierta(null)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-semibold transition-colors"
                >
                  <X size={14} /> Cerrar
                </button>
              </div>
            </div>

            <div className="max-w-3xl mx-auto bg-white shadow-2xl print:shadow-none my-8 print:my-0 rounded-2xl overflow-hidden print:rounded-none">

              <div className="relative px-10 pt-10 pb-8 bg-sand-50 border-b border-stone-200">
                <div className="flex items-center justify-between mb-8 text-stone-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gold-500"></div>
                    <p className="eyebrow text-navy-800" style={{ fontSize: '10px' }}>Revista Nexo</p>
                  </div>
                  <p className="text-xs font-medium tabular-nums">Nº {numero} · {fechaHoy}</p>
                </div>

                {pildora.categoria && (
                  <p className="inline-block text-xs uppercase tracking-[0.18em] text-navy-700 font-bold mb-5 pb-1.5 border-b-2 border-gold-500">
                    {pildora.categoria}
                  </p>
                )}

                <h1 className="magazine-serif text-5xl leading-[1.05] text-navy-900 mb-4 max-w-3xl" style={{ letterSpacing: '-0.02em' }}>{pildora.titular}</h1>
                {pildora.subtitular && (
                  <p className="text-lg text-stone-700 leading-relaxed max-w-2xl mb-6">{pildora.subtitular}</p>
                )}

                <div className="flex items-center gap-4 text-sm pt-5 border-t border-stone-200/80 flex-wrap">
                  {autor && (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-bold text-xs">
                        {autor.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <p className="text-navy-900 font-bold">{autor.nombre}</p>
                        <p className="text-xs text-stone-500 font-medium">{autor.equipo || ''}</p>
                      </div>
                    </div>
                  )}
                  {taller && (
                    <div className="flex items-center gap-1.5 text-stone-600 font-medium px-3 py-1.5 bg-white border border-stone-200 rounded-md">
                      <Layers size={13} className="text-navy-700" />
                      <span>{taller.nombre}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-10 py-10">
                {pildora.lead && (
                  <p className="magazine-serif text-2xl leading-relaxed text-navy-900 mb-10 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.9] first-letter:text-gold-600">
                    {pildora.lead}
                  </p>
                )}

                {Array.isArray(pildora.datos) && pildora.datos.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 my-10 py-6 border-y border-stone-200">
                    {pildora.datos.map((d, idx) => (
                      <div key={idx} className="text-center">
                        <p className="kpi-number text-4xl text-navy-900 mb-2">{d.valor}</p>
                        <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold">{d.etiqueta}</p>
                      </div>
                    ))}
                  </div>
                )}

                {Array.isArray(pildora.cuerpo) && pildora.cuerpo.length > 0 && (
                  <div className="space-y-5 mb-10 max-w-2xl mx-auto">
                    {pildora.cuerpo.map((p, idx) => (
                      <p key={idx} className="text-base leading-relaxed text-stone-800">{p}</p>
                    ))}
                  </div>
                )}

                {pildora.cita && (
                  <div className="my-10 px-8 py-2 border-l-4 border-gold-500">
                    <p className="magazine-serif text-3xl leading-snug text-navy-900 italic mb-3">"{pildora.cita}"</p>
                    {pildora.citaAutor && (
                      <p className="text-sm text-stone-500 uppercase tracking-widest font-semibold">— {pildora.citaAutor}</p>
                    )}
                  </div>
                )}

                {pildora.callout && (
                  <div className="my-10 p-6 bg-gradient-to-br from-navy-50 to-gold-50/40 border border-stone-200/60 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-gold-500"></div>
                      <p className="eyebrow text-navy-800" style={{ fontSize: '10px' }}>Idea clave</p>
                    </div>
                    <p className="magazine-serif text-2xl text-navy-900 leading-snug">{pildora.callout}</p>
                  </div>
                )}

                {Array.isArray(pildora.etiquetas) && pildora.etiquetas.length > 0 && (
                  <div className="mt-12 pt-6 border-t border-stone-200 flex items-center gap-2 flex-wrap">
                    <span className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Etiquetas</span>
                    {pildora.etiquetas.map(e => (
                      <span key={e} className="text-xs bg-navy-50 text-navy-800 border border-navy-100 px-2.5 py-1 rounded-md font-semibold">{e}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-navy-900 text-stone-400 px-12 py-5 flex items-center justify-between text-[10px]">
                <p className="uppercase tracking-widest">Revista Nexo · Comunicación interna</p>
                <p className="uppercase tracking-widest">la compañía · {new Date().getFullYear()}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const ESTADOS_PETICION = {
  nueva: { label: 'Nueva', color: 'stone', dot: 'bg-stone-400', bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' },
  en_revision: { label: 'En revisión', color: 'blue', dot: 'bg-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  asignada: { label: 'Asignada', color: 'violet', dot: 'bg-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800' },
  aprobada: { label: 'Aprobada', color: 'emerald', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  rechazada: { label: 'Rechazada', color: 'red', dot: 'bg-red-400', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

const TIPOS_PETICION = {
  herramienta_nueva: { label: 'Herramienta nueva', icon: Wrench, color: 'text-navy-700', bg: 'bg-navy-50', border: 'border-navy-200' },
  herramienta_existente: { label: 'Acceso a herramienta existente', icon: User, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  mejora_herramienta: { label: 'Mejora de herramienta existente', icon: Settings, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  mejora_proceso: { label: 'Mejora de proceso', icon: Workflow, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  contratar_perfil: { label: 'Contratar nuevo perfil', icon: User, color: 'text-gold-700', bg: 'bg-gold-50', border: 'border-gold-200' },
  herramienta: { label: 'Herramienta nueva', icon: Wrench, color: 'text-navy-700', bg: 'bg-navy-50', border: 'border-navy-200' },
  proceso: { label: 'Mejora de proceso', icon: Workflow, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  iniciativa: { label: 'Mejora de proceso', icon: Workflow, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
};

function PeticionCard({ peticion, personaById, tallerById, onClick }) {
  const [dragging, setDragging] = useState(false);

  const solicitante = personaById[peticion.solicitanteId];
  const solicitanteNombre = solicitante?.nombre || peticion.solicitanteNombre || null;
  const solicitanteEsExterno = !solicitante && !!peticion.solicitanteNombre;
  const tallerAsignado = tallerById[peticion.tallerAsignadoId];
  const tipo = TIPOS_PETICION[peticion.tipoSolicitud] || TIPOS_PETICION.herramienta;
  const TipoIcon = tipo.icon;

  const prioridadStyle = {
    alta: 'border-l-red-500',
    media: 'border-l-amber-500',
    baja: 'border-l-stone-300',
  }[peticion.prioridad] || 'border-l-stone-300';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', peticion.id);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  const handleDragEnd = () => setDragging(false);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(peticion.id)}
      className={`border-l-4 border-stone-200 bg-white rounded-lg px-3 py-2.5 hover:shadow-md hover:border-navy-700 transition-all cursor-grab active:cursor-grabbing ${prioridadStyle} ${dragging ? 'opacity-40 rotate-1 scale-95' : ''}`}
    >
      <div className="flex items-start gap-2 mb-2">
        <TipoIcon size={14} className="text-navy-700 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm text-navy-900 font-semibold leading-snug line-clamp-2">{peticion.titulo}</p>
      </div>

      <div className="flex items-center gap-2 pl-[22px] mb-2">
        <span className="text-xs text-stone-600 font-medium truncate flex-1 min-w-0" title={`${peticion.equipo}${peticion.delegacion ? ' · ' + peticion.delegacion : ''}`}>
          {peticion.equipo}{peticion.delegacion && <span className="text-stone-400"> · {peticion.delegacion}</span>}
        </span>
        {solicitanteNombre && (
          <div
            className={`w-5 h-5 rounded-full text-stone-50 flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${solicitanteEsExterno ? 'bg-stone-500' : 'bg-navy-900'}`}
            title={solicitanteEsExterno ? `${solicitanteNombre} · canalizada (no usa Nexo)` : solicitanteNombre}
          >{solicitanteNombre.split(' ')[0][0]}</div>
        )}
      </div>

      {tallerAsignado && (
        <div className="flex items-center gap-1.5 pl-[22px] pt-2 border-t border-stone-100">
          <Layers size={11} className="text-violet-600 flex-shrink-0" />
          <span className="text-xs text-violet-700 font-semibold truncate" title={tallerAsignado.nombre}>{tallerAsignado.nombre}</span>
        </div>
      )}

      {peticion.estado === 'rechazada' && peticion.motivoRechazo && (
        <div className="pl-[22px] pt-2 mt-2 border-t border-red-100">
          <p className="text-[10px] uppercase tracking-wider text-red-700 font-bold mb-0.5">Motivo del rechazo</p>
          <p className="text-[11px] text-stone-700 leading-snug line-clamp-3" title={peticion.motivoRechazo}>{peticion.motivoRechazo}</p>
        </div>
      )}
    </div>
  );
}

function PeticionColumn({ estadoKey, estadoInfo, items, personaById, tallerById, onDropPeticion, onClickItem }) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const peticionId = e.dataTransfer.getData('text/plain');
    if (peticionId && onDropPeticion) onDropPeticion(peticionId, estadoKey);
  };

  return (
    <div className="flex flex-col">
      <div className={`rounded-t-md px-2 py-1.5 border ${estadoInfo.bg} ${estadoInfo.border} flex items-center justify-between`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full ${estadoInfo.dot} flex-shrink-0`}></div>
          <span className={`text-[10px] font-medium uppercase tracking-wider truncate ${estadoInfo.text}`}>{estadoInfo.label}</span>
        </div>
        <span className={`text-[10px] font-medium ${estadoInfo.text} opacity-70 flex-shrink-0`}>{items.length}</span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 border-x border-b rounded-b-md p-1.5 space-y-1.5 min-h-[80px] transition-colors ${
          dragOver ? `${estadoInfo.bg} ${estadoInfo.border.replace('border-', 'border-').replace('-200', '-400')}` : 'bg-stone-50/40 border-stone-200'
        }`}
      >
        {items.length === 0 && (
          <p className={`text-[10px] text-center py-4 italic ${dragOver ? 'text-stone-700' : 'text-stone-400'}`}>
            {dragOver ? 'Suelta aquí' : 'Vacío'}
          </p>
        )}
        {items.map(p => (
          <PeticionCard
            key={p.id}
            peticion={p}
            personaById={personaById}
            tallerById={tallerById}
            onClick={onClickItem}
          />
        ))}
      </div>
    </div>
  );
}

function ProcesosView({ peticiones, setPeticiones, talleres, personas, herramientas = [], usuarioActualId, setActive }) {
  const [tabActiva, setTabActiva] = useState('todas');

  const [filtroTipoBuzon, setFiltroTipoBuzon] = useState('todos');
  const [filtroEquipoBuzon, setFiltroEquipoBuzon] = useState('todos');
  const [filtroDelegacionBuzon, setFiltroDelegacionBuzon] = useState('todas');
  const [filtroEstadoBuzon, setFiltroEstadoBuzon] = useState('todos');
  const [ordenBuzon, setOrdenBuzon] = useState('fecha_desc');

  const [matchingResultados, setMatchingResultados] = useState(null);
  const [buscandoMatches, setBuscandoMatches] = useState(false);
  const [creando, setCreando] = useState(false);
  const [evaluando, setEvaluando] = useState(null);
  const [analizandoIA, setAnalizandoIA] = useState(false);

  const [nuevaTitulo, setNuevaTitulo] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevaEquipo, setNuevaEquipo] = useState('');
  const [nuevaDelegacion, setNuevaDelegacion] = useState('');
  const [nuevaSolicitanteNombre, setNuevaSolicitanteNombre] = useState('');
  const [nuevaTipo, setNuevaTipo] = useState('herramienta_nueva');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('media');

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const [sugiriendoPeticion, setSugiriendoPeticion] = useState(false);
  const [sugerenciaPeticion, setSugerenciaPeticion] = useState(null);

  const sugerirPeticionIA = async () => {
    if (!nuevaDescripcion.trim()) return;
    setSugiriendoPeticion(true);
    setSugerenciaPeticion(null);
    const tiposDescritos = `- herramienta_nueva: Solicitar una herramienta o software nuevo que la compañía no tiene aún.
- herramienta_existente: Solicitar acceso o licencia para una herramienta que la compañía ya tiene contratada (no se compra nada nuevo, solo se da acceso a alguien).
- mejora_herramienta: Mejorar una herramienta ya existente (nueva funcionalidad, integración, fix).
- mejora_proceso: Mejorar o automatizar un proceso de trabajo, sin cambiar de herramienta.
- contratar_perfil: Solicitar contratar a una persona con un perfil específico.`;
    const userMessage = `Clasifica esta petición que ha llegado al buzón.

Título: ${nuevaTitulo.trim() || '(sin título)'}
Descripción: ${nuevaDescripcion.trim()}
Equipo solicitante: ${nuevaEquipo.trim() || '(sin especificar)'}

Tipos de petición disponibles:
${tiposDescritos}

Devuelve SOLO JSON válido, sin markdown:
{"tipoSolicitud":"...","prioridad":"alta|media|baja","razon":"1-2 frases explicando la elección"}

Reglas: usa exactamente uno de los 4 tipos listados. La prioridad debe ser alta, media o baja según el impacto y urgencia que se desprenda de la descripción.`;
    const respuesta = await callClaude(
      'Eres analista del Plan Estratégico. Clasificas peticiones que llegan al buzón. Respondes solo JSON válido sin texto extra ni markdown.',
      userMessage,
    );
    try {
      const jsonMatch = respuesta && respuesta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const tiposValidos = ['herramienta_nueva', 'herramienta_existente', 'mejora_herramienta', 'mejora_proceso', 'contratar_perfil'];
        const prioridadesValidas = ['alta', 'media', 'baja'];
        if (tiposValidos.includes(data.tipoSolicitud)) setNuevaTipo(data.tipoSolicitud);
        if (prioridadesValidas.includes(data.prioridad)) setNuevaPrioridad(data.prioridad);
        setSugerenciaPeticion({ tipoSolicitud: data.tipoSolicitud, prioridad: data.prioridad, razon: data.razon || '' });
      } else {
        setSugerenciaPeticion({ razon: 'No se pudo interpretar la respuesta de la IA.', error: true });
      }
    } catch (e) {
      setSugerenciaPeticion({ razon: 'No se pudo interpretar la respuesta de la IA.', error: true });
    }
    setSugiriendoPeticion(false);
  };

  const crearPeticion = async () => {
    const nombreLimpio = nuevaSolicitanteNombre.trim();
    if (!nuevaTitulo.trim() || !nuevaDescripcion.trim() || !nombreLimpio || !nuevaEquipo || !nuevaDelegacion.trim()) return;
    const matchPersona = personas.find(p => p.nombre.toLowerCase() === nombreLimpio.toLowerCase());
    const nueva = {
      id: `pet-${Date.now()}`,
      titulo: nuevaTitulo.trim(),
      descripcion: nuevaDescripcion.trim(),
      equipo: nuevaEquipo,
      delegacion: nuevaDelegacion.trim(),
      solicitanteId: matchPersona ? matchPersona.id : null,
      solicitanteNombre: matchPersona ? null : nombreLimpio,
      canalizadoPorId: usuarioActualId || null,
      tipoSolicitud: nuevaTipo,
      funcionalidades: [],
      estado: 'nueva',
      tallerAsignadoId: null,
      prioridad: nuevaPrioridad,
      fecha: new Date().toISOString().slice(0, 10),
      evaluacion: null,
      impactoEstimado: null,
    };
    await setPeticiones([...peticiones, nueva]);
    setNuevaTitulo(''); setNuevaDescripcion(''); setNuevaEquipo(''); setNuevaDelegacion(''); setNuevaSolicitanteNombre(''); setNuevaTipo('herramienta_nueva'); setNuevaPrioridad('media');
    setSugerenciaPeticion(null);
    setMatchingResultados(null);
    setCreando(false);
  };

  const [rechazando, setRechazando] = useState(null);

  const moverEstado = async (id, nuevoEstado) => {
    if (nuevoEstado === 'rechazada') {
      const peticion = peticiones.find(p => p.id === id);
      setRechazando({ id, motivo: peticion?.motivoRechazo || '' });
      return;
    }
    const nuevas = peticiones.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p);
    await setPeticiones(nuevas);
  };

  const confirmarRechazo = async () => {
    if (!rechazando) return;
    const motivo = (rechazando.motivo || '').trim();
    if (!motivo) return;
    const nuevas = peticiones.map(p => p.id === rechazando.id ? {
      ...p,
      estado: 'rechazada',
      motivoRechazo: motivo,
      fechaRechazo: new Date().toISOString(),
      rechazadoPorId: usuarioActualId || null,
    } : p);
    await setPeticiones(nuevas);
    setRechazando(null);
  };

  const asignarTaller = async (id, tallerId) => {
    const nuevas = peticiones.map(p => p.id === id ? { ...p, tallerAsignadoId: tallerId, estado: tallerId ? 'asignada' : p.estado } : p);
    await setPeticiones(nuevas);
  };

  const guardarEvaluacion = async (id, campo, valor) => {
    const nuevas = peticiones.map(p => p.id === id ? { ...p, [campo]: valor } : p);
    await setPeticiones(nuevas);
  };

  const eliminarPeticion = async (id) => {
    if (!confirm('¿Eliminar esta petición?')) return;
    await setPeticiones(peticiones.filter(p => p.id !== id));
  };

  const analizarConIA = async (peticion) => {
    setAnalizandoIA(true);
    const talleresContexto = talleres.map(t => `- ${t.nombre} (id ${t.id}): ${t.descripcion}`).join('\n');
    const prompt = `Eres analista del Plan Estratégico de la compañía. Una petición ha llegado al buzón. Necesito que la evalúes.

PETICIÓN:
Título: ${peticion.titulo}
Equipo solicitante: ${peticion.equipo}
Tipo: ${peticion.tipoSolicitud}
Descripción: ${peticion.descripcion}

TALLERES DEL PLAN ESTRATÉGICO:
${talleresContexto}

Devuelve SOLO un objeto JSON válido, sin markdown, con estos campos:
- tallerSugeridoId: id del taller que mejor encaja (o null si no hay match claro)
- razonAsignacion: 1-2 frases explicando por qué
- evaluacion: 2-3 frases con tu valoración (encaje, viabilidad, riesgos, conflictos potenciales)
- impactoEstimado: 1-2 frases con el impacto si se implementa
- recomendacion: una de "asignar", "revisar_antes", "rechazar"

Formato:
{"tallerSugeridoId":"t1","razonAsignacion":"...","evaluacion":"...","impactoEstimado":"...","recomendacion":"asignar"}`;

    const respuesta = await callClaude('Eres analista experto en evaluación de peticiones e iniciativas en la compañía. Devuelves solo JSON válido.', prompt);

    try {
      const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analisis = JSON.parse(jsonMatch[0]);
        const updates = {
          evaluacion: analisis.evaluacion,
          impactoEstimado: analisis.impactoEstimado,
        };
        if (analisis.tallerSugeridoId) updates.tallerAsignadoId = analisis.tallerSugeridoId;
        if (analisis.recomendacion === 'asignar' && analisis.tallerSugeridoId) updates.estado = 'asignada';
        else if (analisis.recomendacion === 'revisar_antes') updates.estado = 'en_revision';

        const nuevas = peticiones.map(p => p.id === peticion.id ? { ...p, ...updates } : p);
        await setPeticiones(nuevas);
      }
    } catch (e) { /* ignore */ }
    setAnalizandoIA(false);
  };

  const tipoEsHerramienta = (t) => t === 'herramienta_nueva' || t === 'herramienta_existente' || t === 'mejora_herramienta';

  const buscarMatchesHerramientas = async () => {
    if (!nuevaDescripcion.trim() || !tipoEsHerramienta(nuevaTipo)) return;
    if ((herramientas || []).length === 0) return;
    setBuscandoMatches(true);
    setMatchingResultados(null);
    const catalogo = herramientas.map(h => {
      const cats = (Array.isArray(h.categorias) && h.categorias.length) ? h.categorias.join(', ') : (h.categoria || '');
      const funcs = (h.funcionalidades || []).join(', ');
      const areas = (h.areas || []).join(', ');
      return `- ${h.nombre} [${cats}]: ${h.descripcion || ''} | Funcionalidades: ${funcs} | Equipos que la usan: ${areas} | Licencias libres: ${(h.licenciasContratadas || 0) - (h.licenciasActivas || 0)}`;
    }).join('\n');
    const userMessage = `Una persona quiere registrar una petición tipo "${TIPOS_PETICION[nuevaTipo]?.label || nuevaTipo}".

PETICIÓN:
Título: ${nuevaTitulo.trim() || '(sin título)'}
Descripción: ${nuevaDescripcion.trim()}
Equipo: ${nuevaEquipo || '(sin equipo)'}
Delegación: ${nuevaDelegacion.trim() || '(sin delegación)'}

CATÁLOGO DE HERRAMIENTAS:
${catalogo}

Detecta hasta 4 herramientas del catálogo que podrían cubrir esta necesidad (total o parcialmente). Para cada match indica:
- nombre exacto
- nivelCoincidencia: porcentaje 0-100 según cuánto cubre la necesidad
- motivo: 1 frase explicando por qué encaja

Si no hay match razonable, devuelve "matches": [] y explica brevemente por qué en "razon".

Devuelve SOLO JSON válido, sin markdown:
{"matches":[{"nombre":"...","nivelCoincidencia":85,"motivo":"..."}],"razon":"..."}`;
    const respuesta = await callClaude(
      'Eres analista de gobierno de herramientas. Detectas duplicidades comparando peticiones nuevas contra el catálogo. Respondes solo JSON válido.',
      userMessage,
    );
    try {
      const json = respuesta && respuesta.match(/\{[\s\S]*\}/);
      if (json) {
        const data = JSON.parse(json[0]);
        const matches = (data.matches || [])
          .map(m => {
            const h = herramientas.find(x => x.nombre.toLowerCase() === String(m.nombre || '').toLowerCase());
            if (!h) return null;
            return { ...m, herramienta: h };
          })
          .filter(Boolean);
        setMatchingResultados({ matches, razon: data.razon || '' });
      } else {
        setMatchingResultados({ matches: [], razon: 'No se pudo interpretar la respuesta de la IA.' });
      }
    } catch (e) {
      setMatchingResultados({ matches: [], razon: 'No se pudo interpretar la respuesta de la IA.' });
    }
    setBuscandoMatches(false);
  };

  const peticionesPorEstado = {
    nueva: peticiones.filter(p => p.estado === 'nueva'),
    en_revision: peticiones.filter(p => p.estado === 'en_revision'),
    asignada: peticiones.filter(p => p.estado === 'asignada'),
    aprobada: peticiones.filter(p => p.estado === 'aprobada'),
    rechazada: peticiones.filter(p => p.estado === 'rechazada'),
  };

  const totalPet = peticiones.length;
  const nuevas = peticionesPorEstado.nueva.length;
  const enProceso = peticionesPorEstado.en_revision.length + peticionesPorEstado.asignada.length;
  const aprobadas = peticionesPorEstado.aprobada.length;

  return (
    <div className="p-8 w-full">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">Buzón del comité</p>
          <h1 className="display-1 text-navy-900">Peticiones</h1>
          <p className="text-sm text-stone-600 mt-1">Buzón de peticiones de los equipos. Las rechazadas quedan archivadas con su motivo.</p>
        </div>
        {tabActiva !== 'rechazadas' && (
          <button
            onClick={() => setCreando(!creando)}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors"
          >
            {creando ? <X size={14} /> : <Plus size={14} />}
            {creando ? 'Cancelar' : 'Nueva petición'}
          </button>
        )}
      </header>

      <div className="flex items-center gap-1 mb-6 bg-stone-100 rounded-md p-0.5 flex-wrap">
        <button
          onClick={() => setTabActiva('todas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            tabActiva === 'todas' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileSearch size={12} />
          Todas
          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{peticiones.filter(p => p.estado !== 'rechazada').length}</span>
          {nuevas > 0 && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{nuevas} nuevas</span>}
        </button>
        {['herramienta_nueva', 'herramienta_existente', 'mejora_herramienta', 'mejora_proceso', 'contratar_perfil'].map(k => {
          const tipo = TIPOS_PETICION[k];
          const Icon = tipo.icon;
          const n = peticiones.filter(p => p.tipoSolicitud === k && p.estado !== 'rechazada').length;
          const active = tabActiva === k;
          return (
            <button
              key={k}
              onClick={() => setTabActiva(k)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                active ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Icon size={12} className={active ? tipo.color : ''} />
              {tipo.label}
              {n > 0 && <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{n}</span>}
            </button>
          );
        })}
        <button
          onClick={() => setTabActiva('rechazadas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            tabActiva === 'rechazadas' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <X size={12} />
          Rechazadas
          {(() => {
            const n = peticiones.filter(p => p.estado === 'rechazada').length;
            return n > 0 ? <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">{n}</span> : null;
          })()}
        </button>
      </div>

      {tabActiva !== 'rechazadas' && (
        <>
          {tabActiva === 'todas' && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              <Metric label="Total peticiones" value={totalPet} hint="histórico del buzón" tooltip="Todas las peticiones recibidas, en cualquier estado." />
              <Metric label="Nuevas" value={nuevas} accent={nuevas > 0 ? 'amber' : undefined} hint="sin asignar" tooltip="Peticiones recién llegadas que aún no se han evaluado ni asignado a ningún taller." />
              <Metric label="En curso" value={enProceso} hint="en revisión o asignadas" tooltip="Peticiones que están siendo evaluadas o ya se han asignado a un taller del Plan Estratégico." />
              <Metric label="Aprobadas" value={aprobadas} accent="emerald" hint="impactando" tooltip="Peticiones aprobadas por el comité que están en ejecución o ya implementadas." />
            </div>
          )}

          {creando && (
            <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-2">
                <FileSearch size={14} />
                Nueva petición al buzón
              </h3>

              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Título</label>
              <input
                value={nuevaTitulo}
                onChange={e => setNuevaTitulo(e.target.value)}
                placeholder="Ej: Herramienta para análisis de pliegos"
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 mb-3"
              />

              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción de la necesidad</label>
              <textarea
                value={nuevaDescripcion}
                onChange={e => setNuevaDescripcion(e.target.value)}
                placeholder="¿Qué necesita el equipo? ¿Qué problema resolvería? ¿Qué funcionalidades busca?"
                rows={3}
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-1">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Nombre del solicitante <span className="text-red-600">*</span></label>
                  <input
                    list="peticion-personas"
                    value={nuevaSolicitanteNombre}
                    onChange={e => setNuevaSolicitanteNombre(e.target.value)}
                    placeholder="Quién lo plantea…"
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                  <datalist id="peticion-personas">
                    {personas.map(p => <option key={p.id} value={p.nombre}>{getEquipo(p)}</option>)}
                  </datalist>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Equipo del solicitante <span className="text-red-600">*</span></label>
                  <select
                    value={nuevaEquipo}
                    onChange={e => setNuevaEquipo(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  >
                    <option value="">— Selecciona equipo —</option>
                    {EQUIPOS_NEGOCIO.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Delegación <span className="text-red-600">*</span></label>
                  <input
                    list="peticion-delegaciones"
                    value={nuevaDelegacion}
                    onChange={e => setNuevaDelegacion(e.target.value)}
                    placeholder="Madrid, Barcelona…"
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                  />
                  <datalist id="peticion-delegaciones">
                    {DELEGACIONES.map(d => <option key={d} value={d} />)}
                  </datalist>
                </div>
              </div>
              <p className="text-[10px] text-stone-500 italic mb-3">Si la persona no usa Nexo todavía, escribe su nombre igualmente — la petición queda canalizada por ti. La delegación admite valores libres si no está en la lista.</p>

              <div className="mb-3">
                <button
                  type="button"
                  onClick={sugerirPeticionIA}
                  disabled={sugiriendoPeticion || !nuevaDescripcion.trim()}
                  className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 rounded-md font-semibold transition-colors"
                  title={!nuevaDescripcion.trim() ? 'Escribe primero la descripción' : 'La IA leerá la descripción y propondrá tipo y prioridad'}
                >
                  {sugiriendoPeticion ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                  {sugiriendoPeticion ? 'Analizando…' : 'Sugerir tipo y prioridad con IA'}
                </button>
                {sugerenciaPeticion?.razon && (
                  <div className={`mt-2 px-3 py-2 rounded-md text-[11px] flex items-start gap-2 ${sugerenciaPeticion.error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-navy-50 text-navy-900 border border-navy-200'}`}>
                    <Sparkles size={12} className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold mb-0.5">Sugerencia de la IA</p>
                      <p>{sugerenciaPeticion.razon}</p>
                    </div>
                    <button onClick={() => setSugerenciaPeticion(null)} className="text-stone-400 hover:text-stone-700 flex-shrink-0"><X size={12} /></button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider text-navy-800 font-bold mb-2 block">Tipo de petición</label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {['herramienta_nueva', 'herramienta_existente', 'mejora_herramienta', 'mejora_proceso', 'contratar_perfil'].map(k => {
                    const v = TIPOS_PETICION[k];
                    const I = v.icon;
                    const active = nuevaTipo === k;
                    return (
                      <button
                        key={k}
                        onClick={() => { setNuevaTipo(k); setMatchingResultados(null); }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all text-left ${
                          active ? 'bg-navy-900 text-stone-50 border-navy-900 shadow-md' : `bg-white ${v.border} text-stone-700 hover:border-navy-700`
                        }`}
                      >
                        <I size={15} className={active ? 'text-gold-400' : v.color} />
                        <span className="leading-tight">{v.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {tipoEsHerramienta(nuevaTipo) && (
                <div className="mb-4 bg-gold-50 border border-gold-200 rounded-md p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="flex items-center gap-2">
                      <Search size={14} className="text-gold-700" />
                      <span className="text-xs font-bold text-gold-900">Detección automática de duplicidades</span>
                    </div>
                    <button
                      type="button"
                      onClick={buscarMatchesHerramientas}
                      disabled={buscandoMatches || !nuevaDescripcion.trim()}
                      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-stone-50 rounded-md font-semibold transition-colors"
                      title={!nuevaDescripcion.trim() ? 'Escribe primero la descripción' : 'Comprobar si ya existen herramientas que cubran esta necesidad'}
                    >
                      {buscandoMatches ? <Loader2 size={11} className="animate-spin" /> : <Search size={11} />}
                      {buscandoMatches ? 'Buscando…' : 'Buscar similares'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gold-900">Antes de aprobar una herramienta nueva, comprueba si ya hay alguna en el catálogo que cubra esta necesidad.</p>

                  {matchingResultados && (
                    matchingResultados.matches.length === 0 ? (
                      <div className="mt-3 bg-white border border-stone-200 rounded-md p-3 text-xs text-stone-700">
                        <p className="font-semibold text-emerald-800 mb-1">No se han detectado herramientas similares en el catálogo.</p>
                        {matchingResultados.razon && <p className="text-stone-600 italic">{matchingResultados.razon}</p>}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <p className="text-[11px] font-bold text-amber-900">Existen herramientas similares que podrían cubrir esta necesidad:</p>
                        {matchingResultados.matches.map((m, i) => {
                          const h = m.herramienta;
                          const cats = (Array.isArray(h.categorias) && h.categorias.length) ? h.categorias.join(', ') : (h.categoria || '');
                          const funcs = (h.funcionalidades || []).slice(0, 4).join(', ');
                          const areas = (h.areas || []).join(', ');
                          const libres = (h.licenciasContratadas || 0) - (h.licenciasActivas || 0);
                          const nivel = Math.max(0, Math.min(100, Math.round(m.nivelCoincidencia || 0)));
                          const colorBadge = nivel >= 70 ? 'bg-amber-100 text-amber-800 border-amber-300' : nivel >= 40 ? 'bg-stone-100 text-stone-800 border-stone-300' : 'bg-stone-50 text-stone-600 border-stone-200';
                          return (
                            <div key={i} className="bg-white border border-stone-200 rounded-md p-3">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <p className="text-sm font-bold text-navy-900">{h.nombre}</p>
                                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">{cats}</span>
                                  </div>
                                  <p className="text-xs text-stone-600 leading-relaxed">{h.descripcion}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${colorBadge} flex-shrink-0`}>{nivel}% match</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-[11px] text-stone-600 mt-2">
                                {funcs && <p><span className="font-semibold">Funcionalidades:</span> {funcs}</p>}
                                {areas && <p><span className="font-semibold">Equipos:</span> {areas}</p>}
                                <p><span className="font-semibold">Licencias libres:</span> {libres > 0 ? <span className="text-emerald-700">{libres}</span> : <span className="text-red-700">0</span>}</p>
                              </div>
                              {m.motivo && (
                                <p className="text-[11px] text-amber-900 italic mt-2 bg-amber-50 px-2 py-1 rounded">{m.motivo}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs uppercase tracking-wider text-navy-800 font-bold mb-2 block">Prioridad</label>
                <div className="flex gap-2">
                  {[
                    { v: 'alta', l: 'Alta', c: 'bg-red-100 text-red-800 border-red-300' },
                    { v: 'media', l: 'Media', c: 'bg-gold-100 text-gold-800 border-gold-300' },
                    { v: 'baja', l: 'Baja', c: 'bg-stone-100 text-stone-700 border-stone-300' },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setNuevaPrioridad(opt.v)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                        nuevaPrioridad === opt.v ? opt.c : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                      }`}
                    >{opt.l}</button>
                  ))}
                </div>
              </div>

              <button
                onClick={crearPeticion}
                disabled={!nuevaTitulo.trim() || !nuevaDescripcion.trim() || !nuevaSolicitanteNombre.trim() || !nuevaEquipo || !nuevaDelegacion.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
              >
                <Plus size={14} /> Añadir al buzón
              </button>
              {(!nuevaSolicitanteNombre.trim() || !nuevaEquipo || !nuevaDelegacion.trim()) && nuevaTitulo.trim() && nuevaDescripcion.trim() && (
                <p className="text-[11px] text-stone-500 italic mt-2">Solicitante, equipo y delegación son obligatorios.</p>
              )}
            </div>
          )}

          {tabActiva === 'todas' && (
            <div className="bg-white border border-stone-200 rounded-xl p-3 mb-4 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mr-1">Filtros:</span>
              <select value={filtroTipoBuzon} onChange={e => setFiltroTipoBuzon(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
                <option value="todos">Todos los tipos</option>
                <option value="herramienta_nueva">Herramienta nueva</option>
                <option value="herramienta_existente">Acceso a existente</option>
                <option value="mejora_herramienta">Mejora de herramienta</option>
                <option value="mejora_proceso">Mejora de proceso</option>
                <option value="contratar_perfil">Contratar perfil</option>
              </select>
              <select value={filtroEquipoBuzon} onChange={e => setFiltroEquipoBuzon(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
                <option value="todos">Todos los equipos</option>
                {EQUIPOS_NEGOCIO.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
              <select value={filtroDelegacionBuzon} onChange={e => setFiltroDelegacionBuzon(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
                <option value="todas">Todas las delegaciones</option>
                {[...new Set([...DELEGACIONES, ...peticiones.map(p => p.delegacion).filter(Boolean)])].sort().map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filtroEstadoBuzon} onChange={e => setFiltroEstadoBuzon(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
                <option value="todos">Todos los estados</option>
                <option value="nueva">Nueva</option>
                <option value="en_revision">En revisión</option>
                <option value="asignada">Asignada</option>
                <option value="aprobada">Aprobada</option>
              </select>
              <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold ml-2 mr-1">Orden:</span>
              <select value={ordenBuzon} onChange={e => setOrdenBuzon(e.target.value)} className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 outline-none">
                <option value="fecha_desc">Fecha (más reciente)</option>
                <option value="fecha_asc">Fecha (más antigua)</option>
                <option value="prioridad">Prioridad</option>
                <option value="equipo">Equipo</option>
                <option value="estado">Estado</option>
              </select>
              {(filtroTipoBuzon !== 'todos' || filtroEquipoBuzon !== 'todos' || filtroDelegacionBuzon !== 'todas' || filtroEstadoBuzon !== 'todos') && (
                <button
                  onClick={() => {
                    setFiltroTipoBuzon('todos'); setFiltroEquipoBuzon('todos'); setFiltroDelegacionBuzon('todas'); setFiltroEstadoBuzon('todos');
                  }}
                  className="text-[11px] text-stone-600 hover:text-navy-900 underline ml-1"
                >Limpiar</button>
              )}
            </div>
          )}

          {(() => {
            const tipoActivo = ['herramienta_nueva', 'herramienta_existente', 'mejora_herramienta', 'mejora_proceso', 'contratar_perfil'].includes(tabActiva) ? tabActiva : null;
            const prioridadOrden = { alta: 0, media: 1, baja: 2 };
            const estadoOrden = { nueva: 0, en_revision: 1, asignada: 2, aprobada: 3 };
            const peticionesVisibles = peticiones.filter(p => {
              if (p.estado === 'rechazada') return false;
              if (tipoActivo && p.tipoSolicitud !== tipoActivo) return false;
              if (tabActiva === 'todas') {
                if (filtroTipoBuzon !== 'todos' && p.tipoSolicitud !== filtroTipoBuzon) return false;
                if (filtroEquipoBuzon !== 'todos' && p.equipo !== filtroEquipoBuzon) return false;
                if (filtroDelegacionBuzon !== 'todas' && p.delegacion !== filtroDelegacionBuzon) return false;
                if (filtroEstadoBuzon !== 'todos' && p.estado !== filtroEstadoBuzon) return false;
              }
              return true;
            });
            const ordenarPeticiones = (arr) => {
              if (tabActiva !== 'todas') return arr;
              const c = [...arr];
              if (ordenBuzon === 'fecha_desc') c.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));
              else if (ordenBuzon === 'fecha_asc') c.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''));
              else if (ordenBuzon === 'prioridad') c.sort((a, b) => (prioridadOrden[a.prioridad] ?? 9) - (prioridadOrden[b.prioridad] ?? 9));
              else if (ordenBuzon === 'equipo') c.sort((a, b) => (a.equipo || '').localeCompare(b.equipo || ''));
              else if (ordenBuzon === 'estado') c.sort((a, b) => (estadoOrden[a.estado] ?? 9) - (estadoOrden[b.estado] ?? 9));
              return c;
            };
            const estadosKanban = ['nueva', 'en_revision', 'asignada', 'aprobada'];
            return (
              <>
                {peticionesVisibles.length === 0 ? (
                  <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center">
                    <FileSearch size={36} className="text-stone-300 mx-auto mb-3" />
                    <p className="text-sm text-stone-600 font-medium mb-1">No hay peticiones {tipoActivo ? `de tipo "${TIPOS_PETICION[tipoActivo].label}"` : 'que coincidan con los filtros'}</p>
                    <p className="text-xs text-stone-400">{tipoActivo ? 'Pulsa "Nueva petición" para registrar una.' : 'Ajusta los filtros o limpia para ver todas.'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    {estadosKanban.map(estadoKey => {
                      const estadoInfo = ESTADOS_PETICION[estadoKey];
                      const items = ordenarPeticiones(peticionesVisibles.filter(p => p.estado === estadoKey));
                      return (
                        <PeticionColumn
                          key={estadoKey}
                          estadoKey={estadoKey}
                          estadoInfo={estadoInfo}
                          items={items}
                          personaById={personaById}
                          tallerById={tallerById}
                          onDropPeticion={moverEstado}
                          onClickItem={(id) => setEvaluando(evaluando === id ? null : id)}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            );
          })()}

          {evaluando && (() => {
            const p = peticiones.find(p => p.id === evaluando);
            if (!p) return null;
            const solicitante = personaById[p.solicitanteId];
            const solicitanteLabel = solicitante?.nombre || p.solicitanteNombre || null;
            const solicitanteEsExterno = !solicitante && !!p.solicitanteNombre;
            const canalizadoPor = personaById[p.canalizadoPorId];
            const tipo = TIPOS_PETICION[p.tipoSolicitud] || TIPOS_PETICION.herramienta;
            const TipoIcon = tipo.icon;
            const estadoInfo = ESTADOS_PETICION[p.estado];

            return (
              <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={() => setEvaluando(null)}>
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-stone-200 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${estadoInfo.bg} ${estadoInfo.text}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${estadoInfo.dot}`}></div>
                          {estadoInfo.label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 flex items-center gap-1">
                          <TipoIcon size={10} /> {tipo.label}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          p.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                          p.prioridad === 'media' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                        }`}>{p.prioridad}</span>
                      </div>
                      <h2 className="font-serif text-2xl text-stone-900 mb-1">{p.titulo}</h2>
                      <p className="text-xs text-stone-500">
                        {p.equipo}
                        {p.delegacion && <> · {p.delegacion}</>}
                        {solicitanteLabel && <> · <span className={solicitanteEsExterno ? 'italic' : ''}>{solicitanteLabel}</span>{solicitanteEsExterno ? ' (no usa Nexo)' : ''}</>}
                        {' · '}
                        {formatFecha(p.fecha)}
                        {canalizadoPor && solicitanteEsExterno && <> · canalizada por <span className="font-medium text-stone-700">{canalizadoPor.nombre}</span></>}
                      </p>
                    </div>
                    <button onClick={() => setEvaluando(null)} className="text-stone-400 hover:text-stone-700 flex-shrink-0">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-6 space-y-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Descripción</p>
                      <p className="text-sm text-stone-800 leading-relaxed">{p.descripcion}</p>
                    </div>

                    {(p.funcionalidades || []).length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Funcionalidades buscadas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.funcionalidades.map(f => (
                            <span key={f} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded">{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-stone-900 flex items-center gap-1.5">
                          <Sparkles size={12} className="text-stone-700" />
                          Evaluación
                        </p>
                        <button
                          onClick={() => analizarConIA(p)}
                          disabled={analizandoIA}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded text-[11px] transition-colors"
                        >
                          {analizandoIA ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                          {analizandoIA ? 'Analizando...' : 'Analizar con IA'}
                        </button>
                      </div>
                      <textarea
                        value={p.evaluacion || ''}
                        onChange={e => guardarEvaluacion(p.id, 'evaluacion', e.target.value)}
                        placeholder="Tu valoración: encaje, viabilidad, riesgos, conflictos..."
                        rows={3}
                        className="w-full bg-white border border-stone-200 rounded px-2 py-1.5 text-xs outline-none focus:border-stone-400 resize-none mb-2"
                      />
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">Impacto estimado</p>
                      <textarea
                        value={p.impactoEstimado || ''}
                        onChange={e => guardarEvaluacion(p.id, 'impactoEstimado', e.target.value)}
                        placeholder="¿Qué impacto tendría si se implementa? Tiempo ahorrado, ingresos, etc."
                        rows={2}
                        className="w-full bg-white border border-stone-200 rounded px-2 py-1.5 text-xs outline-none focus:border-stone-400 resize-none"
                      />
                    </div>

                    {p.estado === 'rechazada' && p.motivoRechazo && (() => {
                      const rechazadoPor = personaById[p.rechazadoPorId];
                      return (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-red-800 flex items-center gap-1.5 uppercase tracking-wider">
                              <X size={12} /> Petición rechazada
                            </p>
                            {p.fechaRechazo && (
                              <span className="text-[10px] text-red-700 italic">
                                {formatFecha(p.fechaRechazo, true)}{rechazadoPor ? ` · ${rechazadoPor.nombre}` : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-stone-800 leading-relaxed mb-2">{p.motivoRechazo}</p>
                          <button
                            onClick={() => setRechazando({ id: p.id, motivo: p.motivoRechazo })}
                            className="text-[11px] text-red-700 hover:text-red-900 underline"
                          >Editar motivo</button>
                        </div>
                      );
                    })()}

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Asignar a taller del Plan Estratégico</p>
                      <select
                        value={p.tallerAsignadoId || ''}
                        onChange={e => asignarTaller(p.id, e.target.value || null)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
                      >
                        <option value="">— Sin asignar —</option>
                        {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                      </select>
                      {p.tallerAsignadoId && (
                        <button
                          onClick={() => setActive('talleres')}
                          className="mt-2 text-[10px] text-stone-600 hover:text-stone-900 flex items-center gap-1"
                        >Ver taller asignado <ChevronRight size={10} /></button>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Cambiar estado</p>
                      <div className="grid grid-cols-5 gap-1">
                        {Object.entries(ESTADOS_PETICION).map(([k, v]) => (
                          <button
                            key={k}
                            onClick={() => moverEstado(p.id, k)}
                            className={`text-[11px] py-1.5 rounded font-medium transition-colors ${
                              p.estado === k ? `${v.bg} ${v.text} border ${v.border}` : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-transparent'
                            }`}
                          >{v.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() => { eliminarPeticion(p.id); setEvaluando(null); }}
                      className="text-xs text-stone-400 hover:text-red-700 transition-colors"
                    >Eliminar petición</button>
                    <button
                      onClick={() => setEvaluando(null)}
                      className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-xs font-medium transition-colors"
                    >Cerrar</button>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {tabActiva === 'rechazadas' && (() => {
        const rechazadas = peticiones
          .filter(p => p.estado === 'rechazada')
          .slice()
          .sort((a, b) => (b.fechaRechazo || b.fecha || '').localeCompare(a.fechaRechazo || a.fecha || ''));
        if (rechazadas.length === 0) {
          return (
            <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center">
              <X size={36} className="text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-600 font-medium mb-1">No hay peticiones rechazadas</p>
              <p className="text-xs text-stone-400">Aquí aparecerá el histórico de peticiones que el comité haya rechazado, con el motivo del rechazo.</p>
            </div>
          );
        }
        return (
          <div className="space-y-3">
            <p className="text-xs text-stone-600">{rechazadas.length} {rechazadas.length === 1 ? 'petición rechazada' : 'peticiones rechazadas'}. Pincha en una para ver el motivo y el detalle.</p>
            {rechazadas.map(p => {
              const tipo = TIPOS_PETICION[p.tipoSolicitud] || TIPOS_PETICION.herramienta;
              const TipoIcon = tipo.icon;
              const solicitante = personaById[p.solicitanteId];
              const solicitanteLabel = solicitante?.nombre || p.solicitanteNombre || null;
              const rechazadoPor = personaById[p.rechazadoPorId];
              return (
                <button
                  key={p.id}
                  onClick={() => setEvaluando(p.id)}
                  className="w-full text-left bg-white border border-stone-200 hover:border-red-300 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <TipoIcon size={16} className="text-stone-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-navy-900">{p.titulo}</h3>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold">Rechazada</span>
                        <span className="text-[10px] text-stone-500">{tipo.label}</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-2">
                        {p.equipo}
                        {solicitanteLabel && ` · ${solicitanteLabel}`}
                        {p.fechaRechazo && ` · rechazada ${formatFecha(p.fechaRechazo, true)}`}
                        {rechazadoPor && ` por ${rechazadoPor.nombre}`}
                      </p>
                      {p.motivoRechazo && (
                        <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
                          <p className="text-[10px] uppercase tracking-wider text-red-700 font-bold mb-0.5">Motivo del rechazo</p>
                          <p className="text-sm text-stone-800 leading-relaxed">{p.motivoRechazo}</p>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-stone-400 group-hover:text-stone-700 mt-0.5 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        );
      })()}

      {rechazando && (() => {
        const peticion = peticiones.find(p => p.id === rechazando.id);
        const motivosRapidos = [
          'Ya existe una herramienta con la misma finalidad en el catálogo.',
          'Coste no justificado por el impacto estimado.',
          'Fuera del alcance del Plan Estratégico.',
          'Solapa con un taller en curso.',
          'Faltan detalles para evaluar la petición.',
        ];
        return (
          <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-8" onClick={() => setRechazando(null)}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-navy-900 mb-1">Rechazar petición</h3>
              {peticion && <p className="text-sm text-stone-600 mb-4 italic">"{peticion.titulo}"</p>}
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">¿Por qué se rechaza?</label>
              <textarea
                value={rechazando.motivo}
                onChange={e => setRechazando({ ...rechazando, motivo: e.target.value })}
                placeholder="Explica el motivo. El solicitante necesita entender el porqué…"
                rows={4}
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 resize-none mb-3"
                autoFocus
              />
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Motivos frecuentes</p>
                <div className="flex flex-wrap gap-1.5">
                  {motivosRapidos.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRechazando({ ...rechazando, motivo: m })}
                      className="text-[11px] px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors text-left"
                    >{m}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setRechazando(null)} className="px-3 py-2 text-sm text-stone-600 hover:text-stone-900">Cancelar</button>
                <button
                  onClick={confirmarRechazo}
                  disabled={!rechazando.motivo.trim()}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
                >Rechazar petición</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function TaskCreateForm({ tareas, setTareas, talleres, personas, usuarioActualId, onClose, prefilledTallerDestino }) {
  const [nuevaTarea, setNuevaTarea] = useState('');
  const [nuevaCreadorId, setNuevaCreadorId] = useState(usuarioActualId || 'p16');
  const [nuevaTallerOrigenId, setNuevaTallerOrigenId] = useState('');
  const [nuevaAsignadoId, setNuevaAsignadoId] = useState('');
  const [nuevaTallerDestinoId, setNuevaTallerDestinoId] = useState(prefilledTallerDestino || '');
  const [nuevaDeadline, setNuevaDeadline] = useState('');
  const [nuevaPrioridad, setNuevaPrioridad] = useState('media');

  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));
  const personasDelTallerDestino = nuevaTallerDestinoId
    ? personas.filter(p => (p.talleres || []).includes(nuevaTallerDestinoId))
    : [];

  const crearTarea = async () => {
    if (!nuevaTarea.trim() || !nuevaTallerDestinoId || !nuevaAsignadoId) return;
    const nueva = {
      id: `t-${Date.now()}`,
      tarea: nuevaTarea.trim(),
      creadorId: nuevaCreadorId || null,
      tallerOrigenId: nuevaTallerOrigenId || null,
      personaId: nuevaAsignadoId || null,
      tallerId: nuevaTallerDestinoId || null,
      deadline: nuevaDeadline || 'Sin fecha',
      prioridad: nuevaPrioridad,
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };
    await setTareas([...tareas, nueva]);
    onClose();
  };

  return (
    <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
      <h3 className="text-sm font-medium text-stone-900 mb-4 flex items-center gap-2">
        <CheckSquare size={14} />
        Crear tarea
      </h3>

      <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Descripción de la tarea</label>
      <textarea
        value={nuevaTarea}
        onChange={e => setNuevaTarea(e.target.value)}
        placeholder="¿Qué hay que hacer?"
        rows={2}
        className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-4"
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-stone-50 border border-stone-200 rounded-md p-3">
          <p className="text-[10px] uppercase tracking-wider text-stone-600 font-medium mb-2">Origen</p>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Creada por</label>
          <select
            value={nuevaCreadorId}
            onChange={e => setNuevaCreadorId(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 text-sm outline-none focus:border-stone-400 mb-3"
          >
            <option value="">— Selecciona persona —</option>
            {personas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} · {getEquipo(p)}</option>
            ))}
          </select>

          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Taller de origen</label>
          <select
            value={nuevaTallerOrigenId}
            onChange={e => setNuevaTallerOrigenId(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 text-sm outline-none focus:border-stone-400"
          >
            <option value="">— Sin taller de origen —</option>
            {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>
        </div>

        <div className="bg-navy-900 text-stone-50 rounded-md p-3">
          <p className="text-[10px] uppercase tracking-wider text-stone-300 font-medium mb-2">Destino</p>

          <label className="text-[10px] uppercase tracking-wider text-stone-300 mb-1 block">Taller asignado</label>
          <select
            value={nuevaTallerDestinoId}
            onChange={e => { setNuevaTallerDestinoId(e.target.value); setNuevaAsignadoId(''); }}
            className="w-full bg-stone-800 border border-stone-700 text-stone-50 rounded-md px-2 py-1.5 text-sm outline-none focus:border-stone-500 mb-3"
          >
            <option value="">— Selecciona taller —</option>
            {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </select>

          <label className="text-[10px] uppercase tracking-wider text-stone-300 mb-1 block">
            Asignada a
            {nuevaTallerDestinoId && personasDelTallerDestino.length > 0 && (
              <span className="normal-case text-stone-400"> · {personasDelTallerDestino.length} miembros</span>
            )}
          </label>
          <select
            value={nuevaAsignadoId}
            onChange={e => setNuevaAsignadoId(e.target.value)}
            className="w-full bg-stone-800 border border-stone-700 text-stone-50 rounded-md px-2 py-1.5 text-sm outline-none focus:border-stone-500"
          >
            <option value="">— Selecciona persona —</option>
            {nuevaTallerDestinoId && personasDelTallerDestino.length > 0 && (
              <optgroup label={`Miembros de ${tallerById[nuevaTallerDestinoId]?.nombre}`}>
                {personasDelTallerDestino.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} · {getEquipo(p)}{p.nivel ? ` · N${p.nivel}` : ''}</option>
                ))}
              </optgroup>
            )}
            <optgroup label={nuevaTallerDestinoId ? 'Otras personas' : 'Todas las personas'}>
              {personas.filter(p => !nuevaTallerDestinoId || !(p.talleres || []).includes(nuevaTallerDestinoId)).map(p => (
                <option key={p.id} value={p.id}>{p.nombre} · {getEquipo(p)}{p.nivel ? ` · N${p.nivel}` : ''}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Deadline</label>
          <input
            type="text"
            value={nuevaDeadline}
            onChange={e => setNuevaDeadline(e.target.value)}
            placeholder="Ej: Hoy, 2 días, hito Q2, 1 semana..."
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Prioridad</label>
          <div className="flex gap-1">
            {[
              { v: 'alta', l: 'Alta', c: 'bg-red-100 text-red-800 border-red-200' },
              { v: 'media', l: 'Media', c: 'bg-amber-100 text-amber-800 border-amber-200' },
              { v: 'baja', l: 'Baja', c: 'bg-stone-100 text-stone-700 border-stone-200' },
            ].map(opt => (
              <button
                key={opt.v}
                type="button"
                onClick={() => setNuevaPrioridad(opt.v)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all border ${
                  nuevaPrioridad === opt.v ? opt.c : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-50'
                }`}
              >{opt.l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={crearTarea}
          disabled={!nuevaTarea.trim() || !nuevaTallerDestinoId || !nuevaAsignadoId}
          className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={14} /> Crear tarea
        </button>
        <button
          onClick={onClose}
          className="px-3 py-2 text-stone-600 hover:text-stone-900 text-sm transition-colors"
        >Cancelar</button>
        {(!nuevaTallerDestinoId || !nuevaAsignadoId) && nuevaTarea.trim() && (
          <p className="text-[11px] text-stone-500 italic ml-2">Asigna un taller destino y una persona.</p>
        )}
      </div>
    </div>
  );
}

function TaskCard({ tarea, talleres, personas, setTareas, tareas, compact, draggable }) {
  const [dragging, setDragging] = useState(false);
  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const persona = personaById[tarea.personaId];
  const taller = tallerById[tarea.tallerId];
  const creador = personaById[tarea.creadorId];
  const fechaAsignacionIso = tareaTimestamp(tarea);
  const fechaAsignacion = fechaAsignacionIso && !fechaAsignacionIso.startsWith('1970')
    ? formatFecha(fechaAsignacionIso, true)
    : null;

  const toggleEstado = async () => {
    const nuevas = tareas.map(t => t.id === tarea.id ? { ...t, estado: t.estado === 'pendiente' ? 'completada' : 'pendiente' } : t);
    await setTareas(nuevas);
  };

  const prioridadStyle = {
    alta: 'border-l-red-500',
    media: 'border-l-amber-500',
    baja: 'border-l-stone-300',
  }[tarea.prioridad] || 'border-l-stone-300';

  const inicialesPersona = persona ? persona.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() : '?';
  const nivel = persona ? getNivel(persona) : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', tarea.id);
    e.dataTransfer.effectAllowed = 'move';
    setDragging(true);
  };

  const handleDragEnd = () => setDragging(false);

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
      className={`border-l-4 border-stone-200 bg-white rounded-lg px-3 py-2.5 hover:shadow-md hover:border-navy-700 transition-all ${prioridadStyle} ${tarea.estado === 'completada' ? 'opacity-60' : ''} ${draggable ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging ? 'opacity-40 rotate-1 scale-95' : ''}`}>
      <div className="flex items-start gap-2 mb-2">
        <button
          onClick={toggleEstado}
          className={`w-4 h-4 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            tarea.estado === 'completada' ? 'bg-navy-900 border-navy-900' : 'border-stone-400 hover:border-navy-700'
          }`}
        >
          {tarea.estado === 'completada' && <span className="text-stone-50 text-[10px] leading-none">✓</span>}
        </button>
        <p className={`flex-1 text-sm font-medium text-stone-900 leading-snug line-clamp-3 ${tarea.estado === 'completada' ? 'line-through text-stone-500' : ''}`}>{tarea.tarea}</p>
      </div>

      <div className="pl-[24px] space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          {persona && (
            <div className="flex items-center gap-1.5 min-w-0" title={`${persona.nombre}${nivel ? ' · Nivel ' + nivel : ''}`}>
              <div className="relative flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-semibold text-[9px]">
                  {inicialesPersona}
                </div>
                {nivel && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${NIVELES[nivel].dot}`}></div>
                )}
              </div>
              <span className="text-xs font-semibold text-stone-800 truncate">{persona.nombre}</span>
            </div>
          )}
          {taller && (
            <span className="text-xs text-stone-500 truncate min-w-0 font-medium" title={taller.nombre}>· {taller.nombre}</span>
          )}
          {tarea.deadline && tarea.deadline !== 'Sin fecha' && (
            <span className="ml-auto text-xs text-navy-800 font-semibold bg-navy-50 px-1.5 py-0.5 rounded flex-shrink-0">{tarea.deadline}</span>
          )}
        </div>

        {(creador || fechaAsignacion) && (
          <div className="text-[10px] text-stone-500 flex items-center gap-1 flex-wrap">
            {creador && (
              <>
                <span>Asignada por</span>
                <span className="font-semibold text-stone-700 truncate">{creador.nombre}</span>
              </>
            )}
            {creador && fechaAsignacion && <span>·</span>}
            {fechaAsignacion && <span>{fechaAsignacion}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function TareasView({ tareas, setTareas, talleres, personas, usuarioActualId }) {
  const [creando, setCreando] = useState(false);
  const [vistaTipo, setVistaTipo] = useState('kanban');
  const [filtroTaller, setFiltroTaller] = useState('todos');
  const [filtroPersona, setFiltroPersona] = useState('todas');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const tareasFiltradas = tareas.filter(t => {
    if (filtroTaller !== 'todos' && t.tallerId !== filtroTaller) return false;
    if (filtroPersona !== 'todas' && t.personaId !== filtroPersona) return false;
    if (filtroPrioridad !== 'todas' && t.prioridad !== filtroPrioridad) return false;
    if (busqueda && !(t.tarea || '').toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const totalT = tareas.length;
  const pendientes = tareas.filter(t => t.estado === 'pendiente').length;
  const completadas = tareas.filter(t => t.estado === 'completada').length;
  const altas = tareas.filter(t => t.prioridad === 'alta' && t.estado === 'pendiente').length;
  const porcentajeCompletado = totalT > 0 ? Math.round((completadas / totalT) * 100) : 0;

  const tareasFiltradasOrdenadas = ordenarTareasReciente(tareasFiltradas);
  const tareasPendientes = tareasFiltradasOrdenadas.filter(t => t.estado === 'pendiente');
  const tareasAltas = tareasPendientes.filter(t => t.prioridad === 'alta');
  const tareasMedias = tareasPendientes.filter(t => t.prioridad === 'media');
  const tareasBajas = tareasPendientes.filter(t => (t.prioridad === 'baja' || !t.prioridad));
  const tareasCompletadas = tareasFiltradasOrdenadas.filter(t => t.estado === 'completada');

  const tareasPorTaller = {};
  tareasFiltradas.forEach(t => {
    const key = t.tallerId || 'sin';
    const nombre = tallerById[key]?.nombre || 'Sin taller asignado';
    if (!tareasPorTaller[nombre]) tareasPorTaller[nombre] = [];
    tareasPorTaller[nombre].push(t);
  });

  return (
    <div className="p-8 w-full">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">{pendientes} pendientes · {completadas} completadas</p>
          <h1 className="display-1 text-navy-900">Tareas</h1>
        </div>
        <button
          onClick={() => setCreando(!creando)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors"
        >
          {creando ? <X size={14} /> : <Plus size={14} />}
          {creando ? 'Cancelar' : 'Nueva tarea'}
        </button>
      </header>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <Metric label="Total" value={totalT} />
        <Metric label="Pendientes" value={pendientes} accent={pendientes > 0 ? 'amber' : undefined} />
        <Metric label="Prioridad alta" value={altas} accent={altas > 0 ? 'red' : 'emerald'} />
        <Metric label="Completadas" value={`${porcentajeCompletado}%`} accent="emerald" />
      </div>

      {totalT > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
          <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
            <div>
              <p className="eyebrow text-navy-800 mb-2">Progreso global</p>
              <p className="text-base text-stone-600 font-medium"><span className="text-navy-900 font-bold">{completadas}</span> de <span className="text-navy-900 font-bold">{totalT}</span> tareas completadas</p>
            </div>
            <p className={`kpi-number text-6xl ${porcentajeCompletado === 100 ? 'text-emerald-600' : porcentajeCompletado >= 50 ? 'text-navy-900' : 'text-gold-700'}`}>{porcentajeCompletado}<span className="text-2xl text-stone-400">%</span></p>
          </div>
          <div className="flex h-4 rounded-full overflow-hidden bg-stone-100 shadow-inner">
            <div className="bg-emerald-500 transition-all" style={{ width: `${(completadas / totalT) * 100}%` }}></div>
            <div className="bg-red-500 transition-all" style={{ width: `${(altas / totalT) * 100}%` }}></div>
            <div className="bg-gold-500 transition-all" style={{ width: `${(tareas.filter(t => t.prioridad === 'media' && t.estado === 'pendiente').length / totalT) * 100}%` }}></div>
            <div className="bg-stone-300 transition-all" style={{ width: `${(tareas.filter(t => (t.prioridad === 'baja' || !t.prioridad) && t.estado === 'pendiente').length / totalT) * 100}%` }}></div>
          </div>
          <div className="flex items-center gap-5 mt-3 text-sm text-stone-600 font-medium flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Completadas</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Alta prioridad</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gold-500"></div>Media prioridad</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>Baja prioridad</div>
          </div>
        </div>
      )}

      {creando && (
        <TaskCreateForm
          tareas={tareas}
          setTareas={setTareas}
          talleres={talleres}
          personas={personas}
          usuarioActualId={usuarioActualId}
          onClose={() => setCreando(false)}
        />
      )}

      <div className="bg-white border border-stone-200/80 rounded-2xl p-4 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] bg-stone-50 border border-stone-200 rounded-lg px-3 py-2">
          <Search size={16} className="text-navy-700" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar tarea..."
            className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-stone-400"
          />
        </div>
        <div className="flex gap-1 bg-white border border-stone-200 rounded-lg p-1">
          <button
            onClick={() => setVistaTipo('kanban')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vistaTipo === 'kanban' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}
          >Kanban</button>
          <button
            onClick={() => setVistaTipo('taller')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vistaTipo === 'taller' ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'}`}
          >Por taller</button>
        </div>
        <select value={filtroTaller} onChange={e => setFiltroTaller(e.target.value)} className="text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-navy-700">
          <option value="todos">Todos los talleres</option>
          {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
        <select value={filtroPersona} onChange={e => setFiltroPersona(e.target.value)} className="text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-navy-700">
          <option value="todas">Todas las personas</option>
          {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} className="text-sm font-medium bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-navy-700">
          <option value="todas">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
        <span className="ml-auto text-sm font-semibold text-navy-900">{tareasFiltradas.length} tareas</span>
      </div>

      {vistaTipo === 'kanban' && (() => {
        const moverTarea = async (tareaId, columnaKey) => {
          const nuevas = tareas.map(t => {
            if (t.id !== tareaId) return t;
            if (columnaKey === 'completadas') return { ...t, estado: 'completada' };
            return { ...t, estado: 'pendiente', prioridad: columnaKey };
          });
          await setTareas(nuevas);
        };
        return (
          <div className="grid grid-cols-4 gap-3">
            <KanbanColumn titulo="Alta prioridad" color="red" count={tareasAltas.length} tareas={tareasAltas} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="alta" onDropTarea={moverTarea} />
            <KanbanColumn titulo="Media" color="amber" count={tareasMedias.length} tareas={tareasMedias} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="media" onDropTarea={moverTarea} />
            <KanbanColumn titulo="Baja" color="stone" count={tareasBajas.length} tareas={tareasBajas} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="baja" onDropTarea={moverTarea} />
            <KanbanColumn titulo="Completadas" color="emerald" count={tareasCompletadas.length} tareas={tareasCompletadas} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="completadas" onDropTarea={moverTarea} />
          </div>
        );
      })()}

      {vistaTipo === 'taller' && (
        <div className="space-y-4">
          {Object.entries(tareasPorTaller).map(([nombre, items]) => (
            <div key={nombre} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-stone-500" />
                  <span className="text-sm font-medium text-stone-900">{nombre}</span>
                </div>
                <span className="text-xs text-stone-500">{items.length} {items.length === 1 ? 'tarea' : 'tareas'}</span>
              </div>
              <div className="p-3 space-y-2">
                {items.map(t => (
                  <TaskCard key={t.id} tarea={t} talleres={talleres} personas={personas} setTareas={setTareas} tareas={tareas} />
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">Sin tareas</p>
                )}
              </div>
            </div>
          ))}
          {Object.keys(tareasPorTaller).length === 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <p className="text-sm text-stone-500">No hay tareas que coincidan con los filtros.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({ titulo, color, count, tareas, talleres, personas, setTareas, tareasAll, columnaKey, onDropTarea }) {
  const [dragOver, setDragOver] = useState(false);

  const headerColor = {
    red: 'bg-red-50 text-red-900 border-red-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    stone: 'bg-stone-50 text-stone-900 border-stone-200',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
  }[color];

  const dotColor = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    stone: 'bg-stone-400',
    emerald: 'bg-emerald-500',
  }[color];

  const dropBg = dragOver ? {
    red: 'bg-red-100/60 border-red-400',
    amber: 'bg-amber-100/60 border-amber-400',
    stone: 'bg-stone-100/80 border-stone-400',
    emerald: 'bg-emerald-100/60 border-emerald-400',
  }[color] : 'bg-stone-50/40 border-stone-200';

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOver) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const tareaId = e.dataTransfer.getData('text/plain');
    if (tareaId && onDropTarea) onDropTarea(tareaId, columnaKey);
  };

  return (
    <div className="flex flex-col">
      <div className={`rounded-t-lg px-3 py-2.5 border ${headerColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></div>
          <span className="text-sm font-bold uppercase tracking-wider truncate">{titulo}</span>
        </div>
        <span className="text-base font-bold tabular-nums flex-shrink-0">{count}</span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 border-x border-b rounded-b-lg p-2 space-y-2 min-h-[120px] transition-colors ${dropBg}`}
      >
        {tareas.length === 0 && (
          <p className={`text-xs text-center py-6 italic font-medium ${dragOver ? 'text-stone-700' : 'text-stone-400'}`}>
            {dragOver ? 'Suelta aquí' : 'Vacío'}
          </p>
        )}
        {tareas.map(t => (
          <TaskCard key={t.id} tarea={t} talleres={talleres} personas={personas} setTareas={setTareas} tareas={tareasAll} compact draggable />
        ))}
      </div>
    </div>
  );
}

function MisTareasView({ tareas, setTareas, talleres, personas, usuarioActualId, setActive }) {
  const [creando, setCreando] = useState(false);
  const [tabActiva, setTabActiva] = useState('asignadas');

  const usuario = personas.find(p => p.id === usuarioActualId);
  if (!usuario) return null;

  const inicialesUsuario = usuario.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const tareasAsignadas = tareas.filter(t => t.personaId === usuarioActualId);
  const tareasCreadas = tareas.filter(t => t.creadorId === usuarioActualId && t.personaId !== usuarioActualId);
  const talleresPropios = (usuario.talleres || []);
  const tareasMisTalleres = tareas.filter(t => talleresPropios.includes(t.tallerId) && t.personaId !== usuarioActualId && t.creadorId !== usuarioActualId);

  const tareasMostradas = {
    asignadas: tareasAsignadas,
    creadas: tareasCreadas,
    talleres: tareasMisTalleres,
  }[tabActiva] || [];

  const pendientesAsignadas = tareasAsignadas.filter(t => t.estado === 'pendiente').length;
  const altasAsignadas = tareasAsignadas.filter(t => t.estado === 'pendiente' && t.prioridad === 'alta').length;
  const completadasAsignadas = tareasAsignadas.filter(t => t.estado === 'completada').length;
  const totalAsignadas = tareasAsignadas.length;
  const porcentaje = totalAsignadas > 0 ? Math.round((completadasAsignadas / totalAsignadas) * 100) : 0;

  const tareasMostradasOrdenadas = ordenarTareasReciente(tareasMostradas);
  const tareasPendientesMostradas = tareasMostradasOrdenadas.filter(t => t.estado === 'pendiente');
  const tareasAltasM = tareasPendientesMostradas.filter(t => t.prioridad === 'alta');
  const tareasMediasM = tareasPendientesMostradas.filter(t => t.prioridad === 'media');
  const tareasBajasM = tareasPendientesMostradas.filter(t => (t.prioridad === 'baja' || !t.prioridad));
  const tareasCompletadasM = tareasMostradasOrdenadas.filter(t => t.estado === 'completada');

  return (
    <div className="p-8 w-full">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-medium text-lg">
              {inicialesUsuario}
            </div>
            {getNivel(usuario) && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold ${NIVELES[getNivel(usuario)].color}`}>
                {getNivel(usuario)}
              </div>
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-1">Hola, {usuario.nombre.split(' ')[0]}</p>
            <h1 className="display-1 text-navy-900">Mis Tareas</h1>
            <p className="text-xs text-stone-600 mt-0.5">{getEquipo(usuario)} · {talleresPropios.length} talleres</p>
          </div>
        </div>
        <button
          onClick={() => setCreando(!creando)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors"
        >
          {creando ? <X size={14} /> : <Plus size={14} />}
          {creando ? 'Cancelar' : 'Nueva tarea'}
        </button>
      </header>

      <div className="border-y-2 border-navy-900 py-6 mb-8">
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Asignadas a ti', value: pendientesAsignadas, hint: 'pendientes', dot: 'bg-navy-900', textColor: 'text-navy-900' },
            { label: 'Alta prioridad', value: altasAsignadas, hint: 'requieren foco', dot: altasAsignadas > 0 ? 'bg-red-500' : 'bg-emerald-500', textColor: altasAsignadas > 0 ? 'text-red-700' : 'text-emerald-700' },
            { label: 'Has creado', value: tareasCreadas.length, hint: 'para otros', dot: 'bg-stone-400', textColor: 'text-navy-900' },
            { label: 'Tu progreso', value: `${porcentaje}%`, hint: `${completadasAsignadas} completadas`, dot: 'bg-emerald-500', textColor: 'text-emerald-700' },
          ].map((kpi, idx) => (
            <div key={idx} className={`flex flex-col ${idx > 0 ? 'border-l border-stone-200 pl-6' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-1.5 h-1.5 rounded-full ${kpi.dot}`}></span>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-700">{kpi.label}</p>
              </div>
              <p className={`kpi-number text-[3rem] ${kpi.textColor}`}>{kpi.value}</p>
              <p className="text-xs text-stone-500 mt-2 font-medium">{kpi.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {totalAsignadas > 0 && (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-6 mb-6">
          <div className="flex items-end justify-between mb-4 gap-4 flex-wrap">
            <div>
              <p className="eyebrow text-navy-800 mb-2">Progreso global</p>
              <p className="text-base text-stone-600 font-medium">Has completado <span className="text-navy-900 font-bold">{completadasAsignadas}</span> de <span className="text-navy-900 font-bold">{totalAsignadas}</span> tareas asignadas</p>
            </div>
            <p className={`kpi-number text-6xl ${porcentaje === 100 ? 'text-emerald-600' : porcentaje >= 50 ? 'text-navy-900' : 'text-gold-700'}`}>{porcentaje}<span className="text-2xl text-stone-400">%</span></p>
          </div>
          <div className="h-4 rounded-full overflow-hidden bg-stone-100 shadow-inner">
            <div
              className={`h-full transition-all ${porcentaje === 100 ? 'bg-emerald-500' : porcentaje >= 50 ? 'bg-navy-700' : 'bg-gold-500'}`}
              style={{ width: `${porcentaje}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-stone-500 font-medium">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {creando && (
        <TaskCreateForm
          tareas={tareas}
          setTareas={setTareas}
          talleres={talleres}
          personas={personas}
          usuarioActualId={usuarioActualId}
          onClose={() => setCreando(false)}
        />
      )}

      <div className="flex items-center gap-1 mb-4 bg-stone-100 rounded-md p-0.5 w-fit">
        <button
          onClick={() => setTabActiva('asignadas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            tabActiva === 'asignadas' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CheckSquare size={12} />
          Asignadas a mí
          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{tareasAsignadas.length}</span>
        </button>
        <button
          onClick={() => setTabActiva('creadas')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            tabActiva === 'creadas' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Plus size={12} />
          Creadas por mí
          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{tareasCreadas.length}</span>
        </button>
        <button
          onClick={() => setTabActiva('talleres')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            tabActiva === 'talleres' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers size={12} />
          En mis talleres
          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">{tareasMisTalleres.length}</span>
        </button>
      </div>

      {tareasMostradas.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <CheckSquare size={32} className="text-stone-300 mx-auto mb-3" />
          <p className="text-sm text-stone-600 mb-1">
            {tabActiva === 'asignadas' && 'No tienes tareas asignadas'}
            {tabActiva === 'creadas' && 'No has creado tareas para otros'}
            {tabActiva === 'talleres' && 'No hay tareas pendientes en tus talleres'}
          </p>
          <p className="text-xs text-stone-400">
            {tabActiva === 'asignadas' && 'Buen trabajo. Cuando alguien te asigne algo aparecerá aquí.'}
            {tabActiva === 'creadas' && 'Puedes crear tareas y asignárselas a otras personas desde el botón Nueva tarea.'}
            {tabActiva === 'talleres' && 'Todas las tareas de tus talleres están asignadas a otras personas o ya están completadas.'}
          </p>
        </div>
      ) : (() => {
        const moverTareaMis = async (tareaId, columnaKey) => {
          const nuevas = tareas.map(t => {
            if (t.id !== tareaId) return t;
            if (columnaKey === 'completadas') return { ...t, estado: 'completada' };
            return { ...t, estado: 'pendiente', prioridad: columnaKey };
          });
          await setTareas(nuevas);
        };
        return (
          <div className="grid grid-cols-4 gap-3">
            <KanbanColumn titulo="Alta prioridad" color="red" count={tareasAltasM.length} tareas={tareasAltasM} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="alta" onDropTarea={moverTareaMis} />
            <KanbanColumn titulo="Media" color="amber" count={tareasMediasM.length} tareas={tareasMediasM} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="media" onDropTarea={moverTareaMis} />
            <KanbanColumn titulo="Baja" color="stone" count={tareasBajasM.length} tareas={tareasBajasM} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="baja" onDropTarea={moverTareaMis} />
            <KanbanColumn titulo="Completadas" color="emerald" count={tareasCompletadasM.length} tareas={tareasCompletadasM} talleres={talleres} personas={personas} setTareas={setTareas} tareasAll={tareas} columnaKey="completadas" onDropTarea={moverTareaMis} />
          </div>
        );
      })()}
    </div>
  );
}

function PersonasView({ personas, setPersonas, talleres, tareas, setActive, usuarioActualId }) {
  const [filtroTaller, setFiltroTaller] = useState('todos');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEquipo, setNuevoEquipo] = useState('');
  const [nuevoNivel, setNuevoNivel] = useState(2);
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [añadiendoTallerA, setAñadiendoTallerA] = useState(null);

  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const tareasPorPersona = (personaId) => tareas.filter(t => t.personaId === personaId && t.estado === 'pendiente').length;

  const personasFiltradas = personas.filter(p => {
    if (filtroTaller !== 'todos' && !(p.talleres || []).includes(filtroTaller)) return false;
    if (filtroNivel !== 'todos' && getNivel(p) !== Number(filtroNivel)) return false;
    const equipo = getEquipo(p);
    if (busqueda && !p.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !equipo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const añadirPersona = async () => {
    if (!nuevoNombre.trim()) return;
    const nueva = {
      id: `p-${Date.now()}`,
      nombre: nuevoNombre,
      equipo: nuevoEquipo || 'Sin equipo',
      nivel: Number(nuevoNivel),
      email: nuevoEmail || '',
      talleres: [],
    };
    await setPersonas([...personas, nueva]);
    setNuevoNombre(''); setNuevoEquipo(''); setNuevoNivel(2); setNuevoEmail('');
  };

  const togglePersonaTaller = async (personaId, tallerId) => {
    const nuevas = personas.map(p => {
      if (p.id !== personaId) return p;
      const ts = p.talleres || [];
      return { ...p, talleres: ts.includes(tallerId) ? ts.filter(t => t !== tallerId) : [...ts, tallerId] };
    });
    await setPersonas(nuevas);
  };

  const cambiarNivel = async (personaId, nuevo) => {
    const nuevas = personas.map(p => p.id === personaId ? { ...p, nivel: Number(nuevo) } : p);
    await setPersonas(nuevas);
  };

  return (
    <div className="p-8 w-full">
      <header className="mb-6">
        <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">{personas.length} personas registradas</p>
        <h1 className="display-1 text-navy-900">Personas</h1>
      </header>

      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={13} className="text-stone-500" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o equipo..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <select
          value={filtroNivel}
          onChange={e => setFiltroNivel(e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 outline-none"
        >
          <option value="todos">Todos los niveles</option>
          <option value="1">Nivel 1 · más implicado</option>
          <option value="2">Nivel 2 · implicado</option>
          <option value="3">Nivel 3 · parcial</option>
        </select>
        <select
          value={filtroTaller}
          onChange={e => setFiltroTaller(e.target.value)}
          className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1.5 outline-none"
        >
          <option value="todos">Todos los talleres</option>
          {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
        </select>
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2 mb-4 flex items-center gap-4 text-[11px] text-stone-600 flex-wrap">
        <span className="font-medium text-stone-700">Niveles:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-navy-900"></span>
          <span><strong>1</strong> · más implicado, decisor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-500"></span>
          <span><strong>2</strong> · implicado, operativo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-300"></span>
          <span><strong>3</strong> · parcial, puntual</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        {personasFiltradas.map(p => {
          const tareasAbiertas = tareasPorPersona(p.id);
          const iniciales = p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
          const equipo = getEquipo(p);
          const nivel = getNivel(p);
          const nivelInfo = nivel ? NIVELES[nivel] : null;
          const esYo = p.id === usuarioActualId;
          const misTalleresIds = p.talleres || [];
          const misTalleres = talleres.filter(t => misTalleresIds.includes(t.id));
          const talleresDisponibles = talleres.filter(t => !misTalleresIds.includes(t.id));
          const expandido = añadiendoTallerA === p.id;
          return (
            <div key={p.id} className={`bg-white border rounded-2xl p-4 transition-all ${esYo ? 'border-navy-700 shadow-sm ring-1 ring-navy-700/10' : 'border-stone-200/80 hover:border-stone-300'}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-semibold text-sm">
                    {iniciales}
                  </div>
                  {nivelInfo && (
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold ${nivelInfo.color}`}
                      title={`${nivelInfo.label} · ${nivelInfo.desc}`}
                    >{nivel}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-semibold text-navy-900 leading-tight">{p.nombre}</p>
                    {esYo && <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md bg-gold-400 text-navy-900">Tú</span>}
                  </div>
                  <p className="text-sm text-stone-600 font-medium mt-0.5">{equipo}</p>
                  {p.email && <p className="text-xs text-stone-400 mt-0.5 truncate">{p.email}</p>}
                  {(() => {
                    const ultimoAcceso = p.lastSeenAt;
                    if (!ultimoAcceso) {
                      return <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>Sin conexiones registradas</p>;
                    }
                    const diff = Math.round((Date.now() - new Date(ultimoAcceso).getTime()) / 60000);
                    let texto, color;
                    if (diff < 5) { texto = 'Conectado ahora'; color = 'text-emerald-700'; }
                    else if (diff < 60) { texto = `Hace ${diff} min`; color = 'text-emerald-700'; }
                    else if (diff < 60 * 24) { texto = `Hace ${Math.round(diff/60)}h`; color = 'text-stone-600'; }
                    else if (diff < 60 * 24 * 7) { texto = `Hace ${Math.round(diff/(60*24))}d`; color = 'text-stone-500'; }
                    else { texto = `Hace ${Math.round(diff/(60*24*7))} sem`; color = 'text-stone-400'; }
                    const dot = diff < 60 ? 'bg-emerald-500' : diff < 60*24 ? 'bg-stone-400' : 'bg-stone-300';
                    return <p className={`text-[10px] mt-1 flex items-center gap-1 font-medium ${color}`}><span className={`w-1.5 h-1.5 rounded-full ${dot}${diff < 5 ? ' animate-pulse' : ''}`}></span>Última conexión: {texto}</p>;
                  })()}
                </div>
                {tareasAbiertas > 0 && (
                  <span className="text-xs font-bold text-gold-800 bg-gold-100 border border-gold-200 px-2 py-1 rounded-md flex-shrink-0">{tareasAbiertas} tareas</span>
                )}
              </div>

              {esYo && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Nivel</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(n => (
                      <button
                        key={n}
                        onClick={() => cambiarNivel(p.id, n)}
                        className={`w-7 h-6 rounded text-xs font-bold transition-all ${
                          nivel === n ? NIVELES[n].color : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                        title={NIVELES[n].desc}
                      >{n}</button>
                    ))}
                  </div>
                  {nivelInfo && (
                    <span className="text-xs text-stone-500">· {nivelInfo.desc}</span>
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                    {misTalleres.length === 0 ? 'Sin talleres asignados' : `${misTalleres.length} ${misTalleres.length === 1 ? 'taller' : 'talleres'}`}
                  </p>
                  {esYo && talleresDisponibles.length > 0 && (
                    <button
                      onClick={() => setAñadiendoTallerA(expandido ? null : p.id)}
                      className="text-xs text-navy-700 hover:text-navy-900 font-semibold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-navy-50 transition-colors"
                    >
                      {expandido ? <><X size={11} /> Cerrar</> : <><Plus size={11} /> Unirme a taller</>}
                    </button>
                  )}
                </div>
                {misTalleres.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {misTalleres.map(t => (
                      <span key={t.id} className={`text-xs px-2 py-1 rounded-md font-semibold ${esYo ? 'bg-navy-900 text-stone-50 cursor-pointer hover:bg-navy-800' : 'bg-navy-50 text-navy-800 border border-navy-100'}`}
                        onClick={esYo ? () => { if (confirm(`¿Salir del taller "${t.nombre}"?`)) togglePersonaTaller(p.id, t.id); } : undefined}
                        title={esYo ? 'Click para salir del taller' : undefined}
                      >{t.nombre}{esYo && ' ×'}</span>
                    ))}
                  </div>
                ) : !esYo && (
                  <p className="text-xs text-stone-400 italic">No participa en ningún taller</p>
                )}
                {esYo && expandido && (
                  <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Talleres disponibles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {talleresDisponibles.map(t => (
                        <button
                          key={t.id}
                          onClick={() => { togglePersonaTaller(p.id, t.id); }}
                          className="text-xs px-2 py-1 rounded-md font-semibold bg-white border border-stone-200 text-stone-700 hover:border-navy-700 hover:text-navy-900 hover:bg-white transition-colors"
                        >+ {t.nombre}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="text-sm font-medium text-stone-900 mb-3">Añadir persona</h3>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            value={nuevoNombre}
            onChange={e => setNuevoNombre(e.target.value)}
            placeholder="Nombre"
            className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
          />
          <input
            value={nuevoEmail}
            onChange={e => setNuevoEmail(e.target.value)}
            placeholder="Email"
            className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="col-span-2">
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Equipo al que pertenece</label>
            <input
              value={nuevoEquipo}
              onChange={e => setNuevoEquipo(e.target.value)}
              placeholder="Ej: Procesos, Innovación, Property Residencial..."
              className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block">Nivel</label>
            <div className="flex gap-1">
              {[1, 2, 3].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNuevoNivel(n)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                    nuevoNivel === n ? NIVELES[n].color : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                  title={NIVELES[n].desc}
                >{n}</button>
              ))}
            </div>
            <p className="text-[10px] text-stone-500 mt-1">{NIVELES[nuevoNivel].desc}</p>
          </div>
        </div>
        <button
          onClick={añadirPersona}
          disabled={!nuevoNombre.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-sm transition-colors"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>
    </div>
  );
}

function ReunionesView({ reuniones, setReuniones, talleres, setTalleres, personas, historico, setHistorico, setActive }) {
  const [reunionActiva, setReunionActiva] = useState(null);
  const [añadiendo, setAñadiendo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState(new Date().toISOString().slice(0, 10));
  const [nuevasNotas, setNuevasNotas] = useState('');
  const [nuevaAgenda, setNuevaAgenda] = useState('');
  const [asistentesSel, setAsistentesSel] = useState([]);
  const [extrayendo, setExtrayendo] = useState(false);
  const [tabActiva, setTabActiva] = useState('todas');
  const [sinFecha, setSinFecha] = useState(false);

  const [transcripcion, setTranscripcion] = useState('');
  const [resumenIA, setResumenIA] = useState(null);
  const [resumiendo, setResumiendo] = useState(false);
  const [resumenForm, setResumenForm] = useState({ titulo: '', fecha: '', tallerId: '', objetivoId: '', asistentes: [], guardarComoReunion: true });
  const [resumenGuardado, setResumenGuardado] = useState(null);

  const [nuevoTallerId, setNuevoTallerId] = useState('');
  const [nuevoObjetivoId, setNuevoObjetivoId] = useState('');

  const vincularReunionAObjetivo = async (tallerId, objetivoId, reunionId) => {
    if (!setTalleres || !tallerId || !objetivoId || !reunionId) return;
    const actualizados = talleres.map(t => {
      if (t.id !== tallerId) return t;
      return {
        ...t,
        objetivos: (t.objetivos || []).map(o => {
          if (o.id !== objetivoId) return o;
          const linked = o.reunionIds || [];
          if (linked.includes(reunionId)) return o;
          return { ...o, reunionIds: [...linked, reunionId] };
        }),
      };
    });
    await setTalleres(actualizados);
  };

  const calcularEstadoReunion = (r) => {
    if (!r.fecha) return 'por_programar';
    if (r.estado === 'procesada') return 'finalizada';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaR = new Date(r.fecha);
    fechaR.setHours(0, 0, 0, 0);
    return fechaR < hoy ? 'finalizada' : 'programada';
  };

  const reunionesPorEstado = {
    todas: reuniones,
    programadas: reuniones.filter(r => calcularEstadoReunion(r) === 'programada'),
    por_programar: reuniones.filter(r => calcularEstadoReunion(r) === 'por_programar'),
    finalizadas: reuniones.filter(r => calcularEstadoReunion(r) === 'finalizada'),
  };

  const tabConfig = {
    todas: { label: 'Todas', icon: Layers, color: 'text-stone-700' },
    programadas: { label: 'Programadas', icon: Calendar, color: 'text-navy-700' },
    por_programar: { label: 'Por programar', icon: Clock, color: 'text-gold-700' },
    finalizadas: { label: 'Finalizadas', icon: CheckCircle2, color: 'text-emerald-700' },
    resumen: { label: 'Resumen express', icon: Sparkles, color: 'text-gold-700' },
  };

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const procesarReunion = async (reunionId, notas, asistentes) => {
    setExtrayendo(true);
    const talleresContexto = talleres.map(t => `${t.nombre} (id ${t.id}): ${t.descripcion}`).join('\n');
    const tiposContexto = Object.entries(TIPOS_EVENTO).map(([k, v]) => `${k} = ${v.label}`).join(', ');

    const prompt = `Analiza estas notas de reunión del comité del Plan Estratégico de la compañía y descompónlas en ideas individuales. Para cada idea relevante, extrae:

- texto: descripción clara y autocontenida de la idea (1-2 frases)
- tipo: uno de [${tiposContexto}]. Reglas de clasificación:
  · hito = momento fundacional, decisión estructural de gran calado
  · decision = acuerdo formal que cambia el rumbo
  · avance = progreso medible, entregable, paso adelante
  · iniciativa = nueva propuesta o idea por explorar
  · riesgo = alerta detectada que requiere atención
  · bloqueo = obstáculo activo
- tallerId: id del taller al que pertenece la idea (busca el match más cercano de la lista). Si no encaja en ninguno, usa null.

TALLERES DISPONIBLES:
${talleresContexto}

NOTAS:
${notas}

Devuelve SOLO un array JSON, sin explicación ni markdown. Formato:
[{"texto":"...","tipo":"avance","tallerId":"t1"}]`;

    const respuesta = await callClaude('Eres analista de reuniones del comité de la compañía. Descompones notas en ideas atómicas, las clasificas por tipo y las asignas al taller correcto. Devuelves SOLO JSON válido.', prompt);

    try {
      const jsonMatch = respuesta.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const ideasExtraidas = JSON.parse(jsonMatch[0]);
        const ideasConId = ideasExtraidas.map((i, idx) => ({
          id: `idea-${reunionId}-${Date.now()}-${idx}`,
          ...i,
          publicada: false,
          eventoId: null,
        }));
        const reunionesActualizadas = reuniones.map(r =>
          r.id === reunionId ? { ...r, ideas: [...(r.ideas || []), ...ideasConId], estado: 'procesada' } : r
        );
        await setReuniones(reunionesActualizadas);
      }
    } catch (e) {
      alert('No he podido procesar la reunión. Inténtalo de nuevo.');
    }
    setExtrayendo(false);
  };

  const crearReunion = async () => {
    if (!nuevoTitulo.trim()) return;
    const agendaItems = nuevaAgenda
      .split('\n')
      .map(l => l.replace(/^[\s•\-*·]+/, '').trim())
      .filter(Boolean);
    const nueva = {
      id: `r-${Date.now()}`,
      titulo: nuevoTitulo,
      fecha: sinFecha ? null : nuevaFecha,
      asistentes: asistentesSel,
      estado: 'borrador',
      notas: nuevasNotas,
      agenda: agendaItems,
      ideas: [],
      tallerIds: nuevoTallerId ? [nuevoTallerId] : [],
    };
    await setReuniones([...reuniones, nueva]);

    if (nuevoTallerId && nuevoObjetivoId) {
      await vincularReunionAObjetivo(nuevoTallerId, nuevoObjetivoId, nueva.id);
    }

    setReunionActiva(nueva);
    setNuevoTitulo(''); setNuevasNotas(''); setNuevaAgenda(''); setAsistentesSel([]); setSinFecha(false); setAñadiendo(false);
    setNuevoTallerId(''); setNuevoObjetivoId('');

    if (nuevasNotas.trim()) {
      await procesarReunion(nueva.id, nuevasNotas, asistentesSel);
    }
  };

  const toggleAsistente = (id) => {
    setAsistentesSel(asistentesSel.includes(id) ? asistentesSel.filter(a => a !== id) : [...asistentesSel, id]);
  };

  const resumirTranscripcion = async () => {
    if (!transcripcion.trim()) return;
    setResumiendo(true);
    setResumenIA(null);
    setResumenGuardado(null);
    const personasContexto = personas.map(p => p.nombre).join(', ');
    const talleresContexto = talleres.map(t => `${t.nombre} (id ${t.id}): ${t.descripcion || ''}`).join('\n');
    const prompt = `Resume esta transcripción de reunión y devuelve los datos estructurados.

PERSONAS DEL EQUIPO (busca matches por nombre):
${personasContexto}

TALLERES DEL PLAN ESTRATÉGICO (sugiere uno si encaja):
${talleresContexto}

TRANSCRIPCIÓN:
${transcripcion}

Devuelve SOLO JSON válido, sin markdown:
{
  "titulo": "título corto y descriptivo de la reunión",
  "asistentes": ["Nombre exacto si está en la lista"],
  "fecha": "YYYY-MM-DD si se menciona, sino null",
  "tallerSugeridoId": "id del taller que mejor encaja, o null",
  "temas": ["tema tratado 1", "tema 2"],
  "decisiones": ["decisión tomada"],
  "acciones": ["acción acordada (con responsable si se menciona)"],
  "resumen": "2-3 frases ejecutivas con lo más importante"
}`;
    const respuesta = await callClaude('Eres asistente del comité del Plan Estratégico. Resumes y estructuras transcripciones de reuniones. Devuelves SOLO JSON válido.', prompt);
    try {
      const json = respuesta && respuesta.match(/\{[\s\S]*\}/);
      if (json) {
        const data = JSON.parse(json[0]);
        const asistentesIds = (data.asistentes || [])
          .map(n => personas.find(p => p.nombre.toLowerCase() === String(n).toLowerCase())?.id)
          .filter(Boolean);
        setResumenIA(data);
        setResumenForm({
          titulo: data.titulo || '',
          fecha: data.fecha || new Date().toISOString().slice(0, 10),
          tallerId: talleres.find(t => t.id === data.tallerSugeridoId) ? data.tallerSugeridoId : '',
          asistentes: asistentesIds,
          guardarComoReunion: true,
        });
      } else {
        setResumenIA({ error: 'No se pudo interpretar la respuesta de la IA.' });
      }
    } catch (e) {
      setResumenIA({ error: 'No se pudo interpretar la respuesta de la IA.' });
    }
    setResumiendo(false);
  };

  const guardarResumen = async () => {
    if (!resumenIA || resumenIA.error) return;
    if (!resumenForm.guardarComoReunion && !resumenForm.tallerId) return;
    if (!resumenForm.titulo.trim()) return;
    const notasResumen = [
      resumenIA.resumen ? `RESUMEN:\n${resumenIA.resumen}` : '',
      resumenIA.temas?.length ? `TEMAS:\n${resumenIA.temas.map(t => `• ${t}`).join('\n')}` : '',
      resumenIA.decisiones?.length ? `DECISIONES:\n${resumenIA.decisiones.map(d => `• ${d}`).join('\n')}` : '',
      resumenIA.acciones?.length ? `ACCIONES:\n${resumenIA.acciones.map(a => `• ${a}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n');
    const reunionId = `r-${Date.now()}`;
    let creoReunion = false;
    let creoEvento = false;

    if (resumenForm.guardarComoReunion) {
      const nueva = {
        id: reunionId,
        titulo: resumenForm.titulo.trim(),
        fecha: resumenForm.fecha || null,
        asistentes: resumenForm.asistentes,
        estado: 'procesada',
        notas: notasResumen,
        agenda: resumenIA.temas || [],
        ideas: [],
        tallerIds: resumenForm.tallerId ? [resumenForm.tallerId] : [],
        fuente: 'resumen_express',
      };
      await setReuniones([...reuniones, nueva]);
      creoReunion = true;
      if (resumenForm.tallerId && resumenForm.objetivoId) {
        await vincularReunionAObjetivo(resumenForm.tallerId, resumenForm.objetivoId, reunionId);
      }
    }

    if (resumenForm.tallerId && setHistorico && historico) {
      const nuevoEvento = {
        id: `e-${Date.now()}`,
        tallerId: resumenForm.tallerId,
        fecha: resumenForm.fecha || new Date().toISOString().slice(0, 10),
        tipo: 'reunion',
        titulo: resumenForm.titulo.trim(),
        descripcion: resumenIA.resumen || notasResumen,
        autorId: null,
        reunionId: resumenForm.guardarComoReunion ? reunionId : null,
      };
      await setHistorico([...historico, nuevoEvento]);
      creoEvento = true;
    }

    setResumenGuardado({
      reunion: creoReunion,
      taller: creoEvento ? talleres.find(t => t.id === resumenForm.tallerId)?.nombre : null,
    });
    setTranscripcion('');
    setResumenIA(null);
  };

  if (reunionActiva) {
    return <ReunionDetalle
      reunion={reuniones.find(r => r.id === reunionActiva.id) || reunionActiva}
      reuniones={reuniones}
      setReuniones={setReuniones}
      talleres={talleres}
      personas={personas}
      historico={historico}
      setHistorico={setHistorico}
      onBack={() => setReunionActiva(null)}
      onProcesar={procesarReunion}
      extrayendo={extrayendo}
    />;
  }

  return (
    <div className="p-8 w-full">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">{reuniones.length} sesiones registradas</p>
          <h1 className="display-1 text-navy-900">Reuniones</h1>
          <p className="text-sm text-stone-600 mt-1">Captura, clasifica y publica ideas en la evolución de cada taller.</p>
        </div>
        <button
          onClick={() => setAñadiendo(!añadiendo)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-medium transition-colors"
        >
          <Plus size={14} /> Nueva reunión
        </button>
      </header>

      {añadiendo && (
        <div className="bg-white border border-stone-300 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-stone-900 mb-3">Registrar reunión</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input
              value={nuevoTitulo}
              onChange={e => setNuevoTitulo(e.target.value)}
              placeholder="Título (ej: Comité hito Q2)"
              className="col-span-2 bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
            <input
              type="date"
              value={nuevaFecha}
              onChange={e => setNuevaFecha(e.target.value)}
              disabled={sinFecha}
              className="bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 disabled:opacity-50"
            />
          </div>
          <label className="flex items-center gap-2 mb-3 cursor-pointer text-sm text-stone-700 font-medium">
            <input type="checkbox" checked={sinFecha} onChange={e => setSinFecha(e.target.checked)} className="w-4 h-4 accent-navy-900" />
            Sin fecha — guardar como "Por programar"
          </label>

          {(() => {
            const tallerSel = nuevoTallerId ? talleres.find(t => t.id === nuevoTallerId) : null;
            const objetivosTaller = tallerSel ? (tallerSel.objetivos || []) : [];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Vincular a taller <span className="normal-case text-stone-400">(opcional)</span></p>
                  <select
                    value={nuevoTallerId}
                    onChange={e => { setNuevoTallerId(e.target.value); setNuevoObjetivoId(''); }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                  >
                    <option value="">— Sin vincular —</option>
                    {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Objetivo concreto <span className="normal-case text-stone-400">{tallerSel ? `· ${objetivosTaller.length} disponibles` : '· elige taller primero'}</span></p>
                  <select
                    value={nuevoObjetivoId}
                    onChange={e => setNuevoObjetivoId(e.target.value)}
                    disabled={!nuevoTallerId || objetivosTaller.length === 0}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 disabled:opacity-50"
                  >
                    <option value="">— Sin objetivo —</option>
                    {objetivosTaller.map(o => (
                      <option key={o.id} value={o.id}>{o.estado === 'completado' ? '✓ ' : ''}{o.titulo}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })()}

          <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Asistentes</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => toggleAsistente(p.id)}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  asistentesSel.includes(p.id) ? 'bg-navy-900 text-stone-50' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >{p.nombre}</button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Temas a tratar</p>
            <span className="text-[10px] text-stone-400 italic">opcional</span>
          </div>
          <textarea
            value={nuevaAgenda}
            onChange={e => setNuevaAgenda(e.target.value)}
            placeholder={`• Revisión de avances de los talleres\n• Decisiones pendientes del comité\n• Solapamientos detectados`}
            rows={4}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-1 font-mono"
            style={{ fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif' }}
          />
          <p className="text-[10px] text-stone-500 mb-3">Un tema por línea. Las viñetas se añaden automáticamente.</p>

          <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-1.5">Notas, transcripción o minuta</p>
          <textarea
            value={nuevasNotas}
            onChange={e => setNuevasNotas(e.target.value)}
            placeholder="Pega aquí las notas de la reunión. Nexo extraerá ideas automáticamente y las clasificará por taller y tipo (hito, decisión, avance, iniciativa, riesgo, bloqueo)."
            rows={6}
            className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={crearReunion}
              disabled={!nuevoTitulo.trim() || extrayendo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-sm transition-colors"
            >
              {extrayendo ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Crear y extraer ideas
            </button>
            <button
              onClick={() => setAñadiendo(false)}
              className="px-3 py-1.5 text-stone-600 hover:text-stone-900 text-sm"
            >Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mb-6 bg-white border border-stone-200 rounded-xl p-1 w-fit">
        {Object.entries(tabConfig).map(([k, cfg]) => {
          const Icon = cfg.icon;
          const count = reunionesPorEstado[k]?.length || 0;
          const active = tabActiva === k;
          return (
            <button
              key={k}
              onClick={() => setTabActiva(k)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                active ? 'bg-navy-900 text-stone-50' : 'text-stone-600 hover:text-navy-900'
              }`}
            >
              <Icon size={14} className={active ? 'text-gold-400' : cfg.color} />
              {cfg.label}
              {k !== 'resumen' && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${active ? 'bg-gold-400 text-navy-900' : 'bg-stone-100 text-stone-700'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {tabActiva === 'resumen' ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-serif text-2xl text-navy-900 mb-2 flex items-center gap-2">
            <Sparkles size={20} className="text-gold-600" />
            Resumen express con IA
          </h2>
          <p className="text-sm text-stone-600 mb-5">Pega la transcripción de una reunión y la IA generará un resumen estructurado. Después podrás guardarla como reunión y/o vincularla a un taller para que aparezca en su evolución.</p>

          {resumenGuardado && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 mb-4 flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-emerald-900">
                <p className="font-semibold">Guardado correctamente</p>
                <p className="text-xs mt-0.5">
                  {resumenGuardado.reunion && 'Aparece en el listado de reuniones.'}
                  {resumenGuardado.reunion && resumenGuardado.taller && ' '}
                  {resumenGuardado.taller && `Vinculada al taller "${resumenGuardado.taller}".`}
                </p>
              </div>
              <button onClick={() => setResumenGuardado(null)} className="text-emerald-700 hover:text-emerald-900 flex-shrink-0"><X size={14} /></button>
            </div>
          )}

          {!resumenIA ? (
            <>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Transcripción de la reunión</label>
              <textarea
                value={transcripcion}
                onChange={e => setTranscripcion(e.target.value)}
                placeholder="Pega aquí la transcripción, las notas o el audio transcrito de la reunión…"
                rows={10}
                className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none mb-3"
              />
              <button
                onClick={resumirTranscripcion}
                disabled={resumiendo || !transcripcion.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
              >
                {resumiendo ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {resumiendo ? 'Resumiendo…' : 'Resumir con IA'}
              </button>
            </>
          ) : resumenIA.error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800 mb-2">{resumenIA.error}</p>
              <button onClick={() => setResumenIA(null)} className="text-xs text-red-700 hover:text-red-900 underline">Volver a intentar</button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-2">Resumen generado</p>
                {resumenIA.resumen && <p className="text-sm text-stone-800 leading-relaxed mb-3">{resumenIA.resumen}</p>}
                {resumenIA.temas?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Temas tratados</p>
                    <ul className="text-sm text-stone-700 space-y-0.5">{resumenIA.temas.map((t, i) => <li key={i}>• {t}</li>)}</ul>
                  </div>
                )}
                {resumenIA.decisiones?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Decisiones</p>
                    <ul className="text-sm text-stone-700 space-y-0.5">{resumenIA.decisiones.map((d, i) => <li key={i}>• {d}</li>)}</ul>
                  </div>
                )}
                {resumenIA.acciones?.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Acciones acordadas</p>
                    <ul className="text-sm text-stone-700 space-y-0.5">{resumenIA.acciones.map((a, i) => <li key={i}>• {a}</li>)}</ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Título</label>
                  <input
                    value={resumenForm.titulo}
                    onChange={e => setResumenForm({ ...resumenForm, titulo: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Fecha</label>
                  <input
                    type="date"
                    value={resumenForm.fecha}
                    onChange={e => setResumenForm({ ...resumenForm, fecha: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 block font-semibold">Asistentes detectados <span className="normal-case text-stone-400 font-normal">(toca para ajustar)</span></label>
                <div className="flex flex-wrap gap-1">
                  {personas.map(p => {
                    const sel = resumenForm.asistentes.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => setResumenForm({
                          ...resumenForm,
                          asistentes: sel ? resumenForm.asistentes.filter(id => id !== p.id) : [...resumenForm.asistentes, p.id],
                        })}
                        className={`text-[11px] px-2 py-0.5 rounded transition-colors ${sel ? 'bg-navy-900 text-stone-50' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                      >{p.nombre}</button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${resumenForm.guardarComoReunion ? 'border-navy-700 bg-navy-50' : 'border-stone-200 bg-white hover:border-stone-400'}`}
                  onClick={() => setResumenForm({ ...resumenForm, guardarComoReunion: !resumenForm.guardarComoReunion })}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${resumenForm.guardarComoReunion ? 'bg-navy-900 border-navy-900' : 'border-stone-400'}`}>
                      {resumenForm.guardarComoReunion && <span className="text-stone-50 text-[10px] leading-none">✓</span>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900 mb-0.5">Guardar como reunión</p>
                      <p className="text-[11px] text-stone-600">Aparece en el listado de reuniones para revisar más tarde.</p>
                    </div>
                  </div>
                </div>

                <div className={`border-2 rounded-xl p-4 transition-all ${resumenForm.tallerId ? 'border-navy-700 bg-navy-50' : 'border-stone-200 bg-white'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${resumenForm.tallerId ? 'bg-navy-900 border-navy-900' : 'border-stone-400'}`}>
                      {resumenForm.tallerId && <span className="text-stone-50 text-[10px] leading-none">✓</span>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900 mb-0.5">Vincular a un taller</p>
                      <p className="text-[11px] text-stone-600">Se añade como evento en la evolución del taller. Opcionalmente puedes vincularla a un objetivo concreto.</p>
                    </div>
                  </div>
                  <select
                    value={resumenForm.tallerId}
                    onChange={e => setResumenForm({ ...resumenForm, tallerId: e.target.value, objetivoId: '' })}
                    className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-navy-700 mb-2"
                  >
                    <option value="">— No vincular —</option>
                    {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                  {resumenForm.tallerId && (() => {
                    const tallerSel = talleres.find(t => t.id === resumenForm.tallerId);
                    const objetivosTaller = tallerSel ? (tallerSel.objetivos || []) : [];
                    return (
                      <select
                        value={resumenForm.objetivoId}
                        onChange={e => setResumenForm({ ...resumenForm, objetivoId: e.target.value })}
                        disabled={objetivosTaller.length === 0}
                        className="w-full bg-white border border-stone-200 rounded-md px-2 py-1.5 text-xs outline-none focus:border-navy-700 disabled:opacity-50"
                      >
                        <option value="">{objetivosTaller.length === 0 ? 'Este taller no tiene objetivos' : '— Sin objetivo concreto —'}</option>
                        {objetivosTaller.map(o => (
                          <option key={o.id} value={o.id}>{o.estado === 'completado' ? '✓ ' : ''}{o.titulo}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={guardarResumen}
                  disabled={!resumenForm.titulo.trim() || (!resumenForm.guardarComoReunion && !resumenForm.tallerId)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded-md text-sm font-medium transition-colors"
                >
                  <Plus size={14} /> Guardar
                </button>
                <button
                  onClick={() => { setResumenIA(null); setTranscripcion(''); }}
                  className="px-3 py-2 text-stone-600 hover:text-stone-900 text-sm"
                >Empezar de nuevo</button>
                {(!resumenForm.guardarComoReunion && !resumenForm.tallerId) && (
                  <p className="text-[11px] text-stone-500 italic">Selecciona al menos una opción.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(reunionesPorEstado[tabActiva] || []).length === 0 && (
          <div className="lg:col-span-2 bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center">
            <Mic size={40} className="text-stone-300 mx-auto mb-3" />
            <p className="text-base text-stone-600 font-medium">
              {tabActiva === 'todas' && 'No hay reuniones registradas'}
              {tabActiva === 'programadas' && 'No hay reuniones programadas'}
              {tabActiva === 'por_programar' && 'No hay reuniones por programar'}
              {tabActiva === 'finalizadas' && 'No hay reuniones finalizadas'}
            </p>
            <p className="text-sm text-stone-500 mt-2">
              {tabActiva === 'por_programar' && 'Crea una reunión sin fecha para añadirla aquí.'}
              {tabActiva !== 'por_programar' && 'Pulsa "Nueva reunión" para crearla.'}
            </p>
          </div>
        )}
        {[...(reunionesPorEstado[tabActiva] || [])].sort((a, b) => {
          if (!a.fecha) return 1;
          if (!b.fecha) return -1;
          return tabActiva === 'programadas' ? a.fecha.localeCompare(b.fecha) : b.fecha.localeCompare(a.fecha);
        }).map(r => {
          const ideas = r.ideas || [];
          const publicadas = ideas.filter(i => i.publicada).length;
          const sinPublicar = ideas.length - publicadas;
          const asistentesObj = (r.asistentes || []).map(id => personaById[id]).filter(Boolean);
          const estado = calcularEstadoReunion(r);
          const accent = estado === 'finalizada' ? 'bg-emerald-500' : estado === 'por_programar' ? 'bg-gold-500' : 'bg-navy-700';

          return (
            <button
              key={r.id}
              onClick={() => setReunionActiva(r)}
              className="text-left bg-white border border-stone-200/80 rounded-2xl overflow-hidden hover:border-navy-700 hover:shadow-md transition-all flex"
            >
              <div className={`w-1.5 ${accent} flex-shrink-0`}></div>
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl text-navy-900 leading-tight mb-1">{r.titulo}</h3>
                    <p className="text-sm text-stone-600 font-medium">
                      {r.fecha ? formatFecha(r.fecha) : 'Sin fecha asignada'}
                    </p>
                  </div>
                  {estado === 'finalizada' && r.estado === 'procesada' && (
                    <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 flex-shrink-0">Procesada</span>
                  )}
                </div>

                {asistentesObj.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-1.5">
                      {asistentesObj.slice(0, 6).map(p => (
                        <div
                          key={p.id}
                          className="w-7 h-7 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-semibold text-[10px] border-2 border-white"
                          title={p.nombre}
                        >
                          {p.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()}
                        </div>
                      ))}
                      {asistentesObj.length > 6 && (
                        <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-semibold text-[10px] border-2 border-white">
                          +{asistentesObj.length - 6}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-stone-600 font-medium">
                      {asistentesObj.length} {asistentesObj.length === 1 ? 'asistente' : 'asistentes'}
                    </span>
                  </div>
                )}

                {(r.agenda || []).length > 0 && (
                  <div className="bg-sand-50 rounded-lg p-3 mb-3 border border-stone-200/60">
                    <p className="eyebrow text-stone-500 mb-2" style={{ fontSize: '10px' }}>Temas a tratar</p>
                    <ul className="space-y-1">
                      {(r.agenda || []).slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-stone-700">
                          <span className="text-navy-700 flex-shrink-0 font-bold">·</span>
                          <span className="leading-snug line-clamp-1">{item}</span>
                        </li>
                      ))}
                      {(r.agenda || []).length > 3 && (
                        <li className="text-xs text-stone-500 italic pl-3.5 font-medium">+ {(r.agenda || []).length - 3} más</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-stone-100 text-sm font-medium flex-wrap">
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Lightbulb size={13} /> {ideas.length} ideas
                  </div>
                  {publicadas > 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 size={13} /> {publicadas} publicadas
                    </div>
                  )}
                  {sinPublicar > 0 && (
                    <div className="flex items-center gap-1.5 text-gold-700">
                      <AlertOctagon size={13} /> {sinPublicar} pendientes
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}

function ReunionDetalle({ reunion, reuniones, setReuniones, talleres, personas, historico, setHistorico, onBack, onProcesar, extrayendo }) {
  const [editandoIdea, setEditandoIdea] = useState(null);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({
    titulo: reunion.titulo,
    fecha: reunion.fecha || '',
    asistentes: reunion.asistentes || [],
    agenda: (reunion.agenda || []).join('\n'),
    notas: reunion.notas || '',
  });

  useEffect(() => {
    setEditForm({
      titulo: reunion.titulo,
      fecha: reunion.fecha || '',
      asistentes: reunion.asistentes || [],
      agenda: (reunion.agenda || []).join('\n'),
      notas: reunion.notas || '',
    });
  }, [reunion.id]);

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const tallerById = Object.fromEntries(talleres.map(t => [t.id, t]));

  const guardarEdicion = async () => {
    const agendaItems = editForm.agenda
      .split('\n')
      .map(l => l.replace(/^[\s•\-*·]+/, '').trim())
      .filter(Boolean);
    const actualizadas = reuniones.map(r => r.id === reunion.id ? {
      ...r,
      titulo: editForm.titulo.trim() || r.titulo,
      fecha: editForm.fecha || null,
      asistentes: editForm.asistentes,
      agenda: agendaItems,
      notas: editForm.notas,
    } : r);
    await setReuniones(actualizadas);
    setEditando(false);
  };

  const toggleEditAsistente = (id) => {
    setEditForm(f => ({
      ...f,
      asistentes: f.asistentes.includes(id) ? f.asistentes.filter(x => x !== id) : [...f.asistentes, id],
    }));
  };

  const eliminarReunion = async () => {
    if (!confirm(`¿Eliminar la reunión "${reunion.titulo}"? Esta acción no se puede deshacer.`)) return;
    await setReuniones(reuniones.filter(r => r.id !== reunion.id));
    onBack && onBack();
  };

  const ideas = reunion.ideas || [];

  const actualizarIdea = async (ideaId, cambios) => {
    const reunionesActualizadas = reuniones.map(r =>
      r.id === reunion.id
        ? { ...r, ideas: r.ideas.map(i => i.id === ideaId ? { ...i, ...cambios } : i) }
        : r
    );
    await setReuniones(reunionesActualizadas);
  };

  const eliminarIdea = async (ideaId) => {
    const reunionesActualizadas = reuniones.map(r =>
      r.id === reunion.id ? { ...r, ideas: r.ideas.filter(i => i.id !== ideaId) } : r
    );
    await setReuniones(reunionesActualizadas);
  };

  const publicarIdea = async (idea) => {
    if (!idea.tallerId) {
      alert('Asigna un taller antes de publicar.');
      return;
    }
    const taller = tallerById[idea.tallerId];
    const titulo = idea.texto.length > 80 ? idea.texto.slice(0, 77) + '...' : idea.texto;
    const nuevoEvento = {
      id: `e-${Date.now()}`,
      tallerId: idea.tallerId,
      fecha: reunion.fecha,
      tipo: idea.tipo || 'avance',
      titulo: titulo,
      descripcion: idea.texto + ` · Procedente de: ${reunion.titulo}`,
      autorId: (reunion.asistentes && reunion.asistentes[0]) || 'p6',
    };
    await setHistorico([...historico, nuevoEvento]);
    await actualizarIdea(idea.id, { publicada: true, eventoId: nuevoEvento.id });
  };

  const publicarTodasNoPublicadas = async () => {
    const noPublicadas = ideas.filter(i => !i.publicada && i.tallerId && i.tipo);
    if (noPublicadas.length === 0) return;
    const nuevosEventos = noPublicadas.map((idea, idx) => {
      const titulo = idea.texto.length > 80 ? idea.texto.slice(0, 77) + '...' : idea.texto;
      return {
        id: `e-${Date.now()}-${idx}`,
        tallerId: idea.tallerId,
        fecha: reunion.fecha,
        tipo: idea.tipo,
        titulo,
        descripcion: idea.texto + ` · Procedente de: ${reunion.titulo}`,
        autorId: (reunion.asistentes && reunion.asistentes[0]) || 'p6',
        ideaId: idea.id,
      };
    });
    await setHistorico([...historico, ...nuevosEventos]);
    const reunionesActualizadas = reuniones.map(r => {
      if (r.id !== reunion.id) return r;
      return {
        ...r,
        ideas: r.ideas.map(i => {
          const ev = nuevosEventos.find(e => e.ideaId === i.id);
          return ev ? { ...i, publicada: true, eventoId: ev.id } : i;
        }),
      };
    });
    await setReuniones(reunionesActualizadas);
  };

  const reextraerIdeas = async () => {
    if (reunion.notas) {
      await onProcesar(reunion.id, reunion.notas, reunion.asistentes);
    }
  };

  const ideasPorTaller = {};
  ideas.forEach(i => {
    const key = i.tallerId || 'sin-asignar';
    if (!ideasPorTaller[key]) ideasPorTaller[key] = [];
    ideasPorTaller[key].push(i);
  });

  const sinPublicar = ideas.filter(i => !i.publicada).length;

  return (
    <div className="p-8 w-full">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-4 transition-colors">
        <ArrowLeft size={14} /> Volver a reuniones
      </button>

      <header className="mb-6 pb-6 border-b border-stone-200">
        <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            {editando ? (
              <>
                <p className="eyebrow text-navy-800 mb-2">Editando reunión</p>
                <input
                  value={editForm.titulo}
                  onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="w-full font-display text-3xl text-navy-900 bg-stone-50 border-2 border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-navy-700 mb-2"
                />
                <input
                  type="date"
                  value={editForm.fecha}
                  onChange={e => setEditForm({ ...editForm, fecha: e.target.value })}
                  className="text-sm bg-stone-50 border border-stone-200 rounded-md px-3 py-2 outline-none focus:border-navy-700 font-medium"
                />
              </>
            ) : (
              <>
                <p className="eyebrow text-navy-800 mb-3">{reunion.fecha ? formatFecha(reunion.fecha) : 'Sin fecha'}</p>
                <h1 className="display-1 text-navy-900">{reunion.titulo}</h1>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!editando ? (
              <>
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-navy-700 text-navy-900 rounded-md text-sm font-semibold transition-colors"
                >
                  <Settings size={14} /> Editar
                </button>
                {reunion.notas && (
                  <button
                    onClick={reextraerIdeas}
                    disabled={extrayendo}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-navy-700 disabled:opacity-50 text-stone-700 rounded-md text-sm font-medium transition-colors"
                  >
                    {extrayendo ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                    Re-extraer ideas
                  </button>
                )}
                {sinPublicar > 0 && (
                  <button
                    onClick={publicarTodasNoPublicadas}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-emerald-50 rounded-md text-sm font-semibold transition-colors"
                  >
                    <RadioTower size={13} /> Publicar todas
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={guardarEdicion}
                  className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-semibold transition-colors"
                >
                  <CheckCircle2 size={14} /> Guardar
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-300 hover:border-stone-500 text-stone-700 rounded-md text-sm font-medium transition-colors"
                >
                  <X size={14} /> Cancelar
                </button>
                <button
                  onClick={eliminarReunion}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 hover:bg-red-50 hover:border-red-500 text-red-700 rounded-md text-sm font-semibold transition-colors"
                  title="Eliminar reunión"
                >
                  <X size={14} /> Eliminar
                </button>
              </>
            )}
          </div>
        </div>

        {!editando && (reunion.asistentes || []).length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="eyebrow text-stone-500" style={{ fontSize: '10px' }}>Asistentes</span>
            {(reunion.asistentes || []).map(id => {
              const p = personaById[id];
              if (!p) return null;
              return (
                <span key={id} className="text-sm bg-navy-50 text-navy-800 border border-navy-100 px-2.5 py-1 rounded-md font-medium">{p.nombre}</span>
              );
            })}
          </div>
        )}

        {editando && (
          <div className="space-y-3 mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div>
              <label className="eyebrow text-navy-800 mb-2 block" style={{ fontSize: '10px' }}>Asistentes</label>
              <div className="flex flex-wrap gap-1.5">
                {personas.map(p => {
                  const sel = editForm.asistentes.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleEditAsistente(p.id)}
                      className={`text-sm px-2.5 py-1 rounded-md font-medium transition-colors ${sel ? 'bg-navy-900 text-stone-50' : 'bg-white border border-stone-200 text-stone-700 hover:border-navy-700'}`}
                    >{p.nombre}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="eyebrow text-navy-800 mb-2 block" style={{ fontSize: '10px' }}>Agenda · un tema por línea</label>
              <textarea
                value={editForm.agenda}
                onChange={e => setEditForm({ ...editForm, agenda: e.target.value })}
                rows={4}
                className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 resize-none"
              />
            </div>
            <div>
              <label className="eyebrow text-navy-800 mb-2 block" style={{ fontSize: '10px' }}>Notas / minuta</label>
              <textarea
                value={editForm.notas}
                onChange={e => setEditForm({ ...editForm, notas: e.target.value })}
                rows={6}
                className="w-full bg-white border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 resize-none"
              />
              <p className="text-xs text-stone-500 mt-1.5 font-medium">Tras guardar, pulsa "Re-extraer ideas" para reprocesar las notas con la IA.</p>
            </div>
          </div>
        )}
      </header>

      {(reunion.agenda || []).length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Temas a tratar</p>
          <ul className="space-y-1.5">
            {(reunion.agenda || []).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-stone-800">
                <span className="text-stone-400 mt-0.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {reunion.notas && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
          <p className="text-[11px] uppercase tracking-wider text-stone-500 mb-2">Notas originales</p>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{reunion.notas}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-stone-900">Ideas extraídas</h2>
        <span className="text-xs text-stone-500">{ideas.length} ideas · agrupadas por taller</span>
      </div>

      {ideas.length === 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
          <Lightbulb size={32} className="text-stone-300 mx-auto mb-2" />
          <p className="text-sm text-stone-600 mb-3">No hay ideas extraídas todavía.</p>
          {reunion.notas && (
            <button
              onClick={reextraerIdeas}
              disabled={extrayendo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-400 text-stone-50 rounded-md text-xs transition-colors"
            >
              {extrayendo ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
              Extraer ahora
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(ideasPorTaller).map(([tallerId, items]) => {
          const taller = tallerById[tallerId];
          const nombreGrupo = taller?.nombre || 'Sin taller asignado';
          return (
            <div key={tallerId} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers size={13} className="text-stone-500" />
                  <span className="text-sm font-medium text-stone-900">{nombreGrupo}</span>
                </div>
                <span className="text-xs text-stone-500">{items.length} {items.length === 1 ? 'idea' : 'ideas'}</span>
              </div>
              <div>
                {items.map(idea => {
                  const tipo = TIPOS_EVENTO[idea.tipo] || TIPOS_EVENTO.avance;
                  const Icon = tipo.icon;
                  const colorMap = {
                    stone: 'bg-stone-200 text-stone-700',
                    blue: 'bg-blue-100 text-blue-800',
                    emerald: 'bg-emerald-100 text-emerald-800',
                    violet: 'bg-violet-100 text-violet-800',
                    amber: 'bg-amber-100 text-amber-800',
                    red: 'bg-red-100 text-red-800',
                  };
                  return (
                    <div key={idea.id} className={`px-5 py-3 border-b border-stone-100 last:border-0 ${idea.publicada ? 'bg-emerald-50/30' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[tipo.color]}`}>
                          <Icon size={12} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {editandoIdea === idea.id ? (
                            <textarea
                              defaultValue={idea.texto}
                              onBlur={e => { actualizarIdea(idea.id, { texto: e.target.value }); setEditandoIdea(null); }}
                              autoFocus
                              rows={2}
                              className="w-full bg-stone-50 border border-stone-300 rounded-md px-2 py-1 text-sm outline-none focus:border-stone-500 resize-none"
                            />
                          ) : (
                            <p
                              className="text-sm text-stone-800 leading-relaxed cursor-pointer hover:text-stone-950"
                              onClick={() => !idea.publicada && setEditandoIdea(idea.id)}
                            >{idea.texto}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <select
                              value={idea.tipo || ''}
                              onChange={e => actualizarIdea(idea.id, { tipo: e.target.value })}
                              disabled={idea.publicada}
                              className="text-[11px] bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 outline-none disabled:opacity-60"
                            >
                              <option value="">— Tipo —</option>
                              {Object.entries(TIPOS_EVENTO).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                            <select
                              value={idea.tallerId || ''}
                              onChange={e => actualizarIdea(idea.id, { tallerId: e.target.value })}
                              disabled={idea.publicada}
                              className="text-[11px] bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 outline-none disabled:opacity-60"
                            >
                              <option value="">— Sin taller —</option>
                              {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                            </select>
                            {idea.publicada ? (
                              <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                                <CheckCircle2 size={11} /> Publicada en evolución
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => publicarIdea(idea)}
                                  disabled={!idea.tallerId || !idea.tipo}
                                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 text-stone-50 rounded transition-colors"
                                >
                                  <RadioTower size={10} /> Publicar
                                </button>
                                <button
                                  onClick={() => eliminarIdea(idea.id)}
                                  className="text-[11px] text-stone-500 hover:text-red-700 transition-colors"
                                >Descartar</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatView({ personas, talleres, usuarioActualId, demoMode, mensajesLocal, setMensajesLocal, tareas, setTareas, peticiones, setPeticiones, reuniones, setReuniones, historico, setHistorico, setActive, irATaller }) {
  const [mensajesReal, setMensajesReal] = useState([]);
  const [loadedReal, setLoadedReal] = useState(false);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [conversion, setConversion] = useState(null); // { tipo, mensaje }
  const containerRef = useRef(null);

  const personaById = Object.fromEntries(personas.map(p => [p.id, p]));
  const usuario = personaById[usuarioActualId];

  // Real mode: fetch + realtime
  useEffect(() => {
    if (demoMode) return;
    let mounted = true;
    (async () => {
      const { data } = await supabase.from('mensajes').select('*').order('created_at', { ascending: true });
      if (mounted) {
        setMensajesReal((data || []).map(rowToCamel));
        setLoadedReal(true);
      }
    })();
    const channel = supabase.channel('mensajes-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes' }, payload => {
        const nuevo = rowToCamel(payload.new);
        setMensajesReal(prev => prev.find(m => m.id === nuevo.id) ? prev : [...prev, nuevo]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'mensajes' }, payload => {
        setMensajesReal(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, [demoMode]);

  const mensajes = demoMode ? mensajesLocal : mensajesReal;

  // Auto-scroll al fondo al recibir mensajes (solo el contenedor, no la página)
  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [mensajes.length]);

  const enviar = async () => {
    if (!input.trim() || enviando) return;
    setEnviando(true);
    const id = `m-${Date.now()}`;
    const ahora = new Date().toISOString();
    const nuevo = { id, autorId: usuarioActualId, texto: input.trim(), createdAt: ahora };
    setInput('');
    if (demoMode) {
      setMensajesLocal([...mensajesLocal, nuevo]);
    } else {
      setMensajesReal(prev => [...prev, nuevo]);
      try {
        await supabase.from('mensajes').insert({ id, autor_id: usuarioActualId, texto: nuevo.texto, created_at: ahora });
      } catch (e) {
        console.warn('Error enviando mensaje:', e);
      }
    }
    setEnviando(false);
  };

  const eliminar = async (m) => {
    if (m.autorId !== usuarioActualId) return;
    if (!confirm('¿Eliminar este mensaje?')) return;
    if (demoMode) {
      setMensajesLocal(mensajesLocal.filter(x => x.id !== m.id));
    } else {
      setMensajesReal(prev => prev.filter(x => x.id !== m.id));
      await supabase.from('mensajes').delete().eq('id', m.id);
    }
  };

  const formatHora = (iso) => {
    const d = new Date(iso);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    const ayer = new Date(hoy.getTime() - 86400000);
    const esAyer = d.toDateString() === ayer.toDateString();
    const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (esHoy) return `Hoy · ${hora}`;
    if (esAyer) return `Ayer · ${hora}`;
    return `${d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · ${hora}`;
  };

  // ---- Conversiones ----
  const ConversionModal = () => {
    if (!conversion) return null;
    const { tipo, mensaje } = conversion;
    const autor = personaById[mensaje.autorId];
    return (
      <ConversionForm
        tipo={tipo}
        mensaje={mensaje}
        autor={autor}
        personas={personas}
        talleres={talleres}
        usuarioActualId={usuarioActualId}
        onCancel={() => setConversion(null)}
        onCreate={async (datos) => {
          if (tipo === 'tarea') {
            const nueva = {
              id: `ta-chat-${Date.now()}`,
              tarea: datos.tarea,
              personaId: datos.personaId,
              tallerId: datos.tallerId || null,
              creadorId: usuarioActualId,
              deadline: datos.deadline || 'Sin fecha',
              estado: 'pendiente',
              prioridad: datos.prioridad || 'media',
              fechaCreacion: new Date().toISOString(),
              origenMensajeId: mensaje.id,
            };
            await setTareas([...tareas, nueva]);
            setConversion(null);
            setActive('mis-tareas');
          } else if (tipo === 'peticion') {
            const nueva = {
              id: `pet-chat-${Date.now()}`,
              titulo: datos.titulo,
              descripcion: datos.descripcion,
              equipo: datos.equipo || (autor?.equipo || 'Sin especificar'),
              solicitanteId: datos.solicitanteId || mensaje.autorId,
              tipoSolicitud: datos.tipoSolicitud || 'herramienta_nueva',
              prioridad: datos.prioridad || 'media',
              estado: 'nueva',
              tallerAsignadoId: null,
              fecha: new Date().toISOString().slice(0, 10),
              evaluacion: null,
              impactoEstimado: null,
              funcionalidades: [],
              origenMensajeId: mensaje.id,
            };
            await setPeticiones([...(peticiones || []), nueva]);
            setConversion(null);
            setActive('peticiones');
          } else if (tipo === 'reunion') {
            const nueva = {
              id: `r-chat-${Date.now()}`,
              titulo: datos.titulo,
              fecha: datos.fecha || null,
              hora: datos.hora || null,
              asistentes: datos.asistentes || [],
              estado: 'borrador',
              notas: datos.notas || mensaje.texto,
              agenda: [],
              ideas: [],
            };
            await setReuniones([...(reuniones || []), nueva]);
            setConversion(null);
            setActive('reuniones');
          } else if (tipo === 'evento_taller') {
            const evento = {
              id: `e-chat-${Date.now()}`,
              tallerId: datos.tallerId,
              fecha: datos.fecha || new Date().toISOString().slice(0, 10),
              tipo: datos.tipoEvento || 'avance',
              titulo: datos.titulo,
              descripcion: datos.descripcion || mensaje.texto,
              autorId: mensaje.autorId,
              origenMensajeId: mensaje.id,
            };
            await setHistorico([...historico, evento]);
            setConversion(null);
            if (irATaller) irATaller(datos.tallerId); else setActive('talleres');
          }
        }}
      />
    );
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 pt-8 pb-4 flex items-end justify-between gap-6 flex-wrap border-b border-stone-200 bg-white">
        <div>
          <p className="eyebrow text-navy-800 mb-3">Equipo</p>
          <h1 className="display-1 text-navy-900 mb-3">Chat</h1>
          <hr className="savills-rule w-32 mb-4" />
          <p className="text-base text-stone-600 leading-relaxed">Mensajería compartida del equipo. Convierte cualquier mensaje en tarea, petición o reunión con un click.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {demoMode ? 'Modo demo (local)' : 'Tiempo real'}
          </span>
          <span className="text-stone-300">·</span>
          <span>{mensajes.length} {mensajes.length === 1 ? 'mensaje' : 'mensajes'}</span>
        </div>
      </header>

      <div ref={containerRef} className="flex-1 overflow-y-auto bg-sand-50 px-8 py-6">
        {mensajes.length === 0 && loadedReal !== false && (
          <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center max-w-xl mx-auto">
            <MessageSquare size={36} className="text-stone-300 mx-auto mb-3" />
            <p className="text-base text-stone-600 font-medium">No hay mensajes todavía</p>
            <p className="text-sm text-stone-500 mt-1">Sé el primero en escribir algo en el chat del equipo.</p>
          </div>
        )}
        <div className="max-w-3xl mx-auto space-y-3">
          {mensajes.map((m, idx) => {
            const autor = personaById[m.autorId];
            const esYo = m.autorId === usuarioActualId;
            const inicial = autor?.nombre?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '?';
            const anterior = idx > 0 ? mensajes[idx - 1] : null;
            const mismoAutorAnterior = anterior && anterior.autorId === m.autorId && (new Date(m.createdAt) - new Date(anterior.createdAt)) < 5 * 60 * 1000;

            return (
              <div key={m.id} className={`group flex gap-3 ${esYo ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0 w-9">
                  {!mismoAutorAnterior && (
                    <div className="w-9 h-9 rounded-full bg-navy-900 text-stone-50 flex items-center justify-center font-bold text-xs">
                      {inicial}
                    </div>
                  )}
                </div>
                <div className={`max-w-[70%] ${esYo ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!mismoAutorAnterior && (
                    <div className={`flex items-center gap-2 mb-1 px-1 ${esYo ? 'flex-row-reverse' : ''}`}>
                      <p className="text-sm font-bold text-navy-900">{autor?.nombre || 'Usuario'}</p>
                      <span className="text-xs text-stone-500 font-medium">{formatHora(m.createdAt)}</span>
                    </div>
                  )}
                  <div className={`relative px-4 py-2.5 rounded-2xl ${esYo ? 'bg-navy-900 text-stone-50 rounded-tr-sm' : 'bg-white border border-stone-200 text-stone-800 rounded-tl-sm'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.texto}</p>
                    {mismoAutorAnterior && (
                      <p className={`text-[10px] font-medium mt-1 ${esYo ? 'text-stone-300' : 'text-stone-400'}`}>{formatHora(m.createdAt)}</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${esYo ? 'flex-row-reverse' : ''}`}>
                    <button onClick={() => setConversion({ tipo: 'tarea', mensaje: m })} className="text-[10px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <CheckSquare size={11} /> Tarea
                    </button>
                    <button onClick={() => setConversion({ tipo: 'peticion', mensaje: m })} className="text-[10px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <Workflow size={11} /> Petición
                    </button>
                    <button onClick={() => setConversion({ tipo: 'reunion', mensaje: m })} className="text-[10px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <Calendar size={11} /> Reunión
                    </button>
                    <button onClick={() => setConversion({ tipo: 'evento_taller', mensaje: m })} className="text-[10px] font-bold text-navy-700 hover:text-navy-900 hover:bg-navy-50 px-2 py-1 rounded transition-colors flex items-center gap-1">
                      <Layers size={11} /> Taller
                    </button>
                    {esYo && (
                      <button onClick={() => eliminar(m)} className="text-[10px] font-bold text-stone-400 hover:text-red-700 px-2 py-1 rounded transition-colors flex items-center gap-1">
                        <X size={11} /> Borrar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-8 py-4 border-t border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto flex items-end gap-2 bg-stone-50 border-2 border-stone-200 rounded-2xl p-2 focus-within:border-navy-700 focus-within:bg-white transition-all">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviar();
              }
            }}
            placeholder="Escribe un mensaje al equipo..."
            rows={1}
            className="flex-1 bg-transparent text-base text-navy-900 placeholder:text-stone-400 outline-none px-3 py-2 resize-none"
            style={{ minHeight: '40px', maxHeight: '160px' }}
          />
          <button
            onClick={enviar}
            disabled={!input.trim() || enviando}
            className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:bg-stone-300 disabled:text-stone-500 text-stone-50 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Enviar
          </button>
        </div>
      </div>

      <ConversionModal />
    </div>
  );
}

function ConversionForm({ tipo, mensaje, autor, personas, talleres, usuarioActualId, onCancel, onCreate }) {
  const tituloModal = { tarea: 'Convertir en tarea', peticion: 'Convertir en petición', reunion: 'Convertir en reunión', evento_taller: 'Integrar en taller' }[tipo];
  const icono = { tarea: <CheckSquare size={16} />, peticion: <Workflow size={16} />, reunion: <Calendar size={16} />, evento_taller: <Layers size={16} /> }[tipo];

  // Estado por tipo
  const [tarea, setTarea] = useState(mensaje.texto);
  const [personaId, setPersonaId] = useState(autor?.id || usuarioActualId);
  const [tallerId, setTallerId] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [deadline, setDeadline] = useState('');

  const [titulo, setTitulo] = useState(mensaje.texto.split('\n')[0].slice(0, 80));
  const [descripcion, setDescripcion] = useState(mensaje.texto);
  const [equipo, setEquipo] = useState(autor?.equipo || '');
  const [tipoSolicitud, setTipoSolicitud] = useState('herramienta_nueva');

  const [fecha, setFecha] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [hora, setHora] = useState('10:00');
  const [asistentes, setAsistentes] = useState([usuarioActualId, autor?.id].filter((v, i, a) => v && a.indexOf(v) === i));

  // Taller event
  const [tipoEvento, setTipoEvento] = useState('avance');
  const [tallerEventoId, setTallerEventoId] = useState('');
  const [eventoTitulo, setEventoTitulo] = useState(mensaje.texto.split('\n')[0].slice(0, 80));
  const [eventoFecha, setEventoFecha] = useState(new Date().toISOString().slice(0, 10));

  const tiposEventoMeta = [
    { v: 'avance', l: 'Avance', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Progreso medible' },
    { v: 'hito', l: 'Hito', icon: Flag, color: 'bg-stone-100 text-stone-900 border-stone-400', desc: 'Momento estructural' },
    { v: 'decision', l: 'Decisión', icon: GitBranch, color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'Acuerdo formal' },
    { v: 'iniciativa', l: 'Iniciativa', icon: Lightbulb, color: 'bg-violet-100 text-violet-800 border-violet-300', desc: 'Propuesta nueva' },
    { v: 'riesgo', l: 'Riesgo', icon: AlertOctagon, color: 'bg-gold-100 text-gold-800 border-gold-300', desc: 'Alerta detectada' },
    { v: 'bloqueo', l: 'Bloqueo', icon: AlertTriangle, color: 'bg-red-100 text-red-800 border-red-300', desc: 'Obstáculo activo' },
  ];

  const submit = () => {
    if (tipo === 'tarea') {
      if (!tarea.trim() || !tallerId) return;
      onCreate({ tarea: tarea.trim(), personaId, tallerId, prioridad, deadline });
    } else if (tipo === 'peticion') {
      if (!titulo.trim() || !descripcion.trim()) return;
      onCreate({ titulo: titulo.trim(), descripcion: descripcion.trim(), equipo, solicitanteId: autor?.id || usuarioActualId, tipoSolicitud, prioridad });
    } else if (tipo === 'reunion') {
      if (!titulo.trim() || !fecha) return;
      onCreate({ titulo: titulo.trim(), fecha, hora, asistentes, notas: mensaje.texto });
    } else if (tipo === 'evento_taller') {
      if (!tallerEventoId || !eventoTitulo.trim()) return;
      onCreate({ tallerId: tallerEventoId, tipoEvento, titulo: eventoTitulo.trim(), descripcion: mensaje.texto, fecha: eventoFecha });
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-900/40 z-50 flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-gold-400">{icono}</div>
            <div>
              <p className="eyebrow text-navy-800" style={{ fontSize: '10px' }}>Desde el chat</p>
              <h2 className="text-lg font-bold text-navy-900">{tituloModal}</h2>
            </div>
          </div>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
        </div>

        <div className="p-5">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-5">
            <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">Mensaje original · {autor?.nombre || 'Usuario'}</p>
            <p className="text-sm text-stone-700 leading-relaxed">{mensaje.texto}</p>
          </div>

          {tipo === 'tarea' && (
            <>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Descripción de la tarea</label>
              <textarea value={tarea} onChange={e => setTarea(e.target.value)} rows={2} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Asignar a</label>
                  <select value={personaId} onChange={e => setPersonaId(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700">
                    {personas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Taller <span className="text-red-600">*</span></label>
                  <select value={tallerId} onChange={e => setTallerId(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700">
                    <option value="">— Selecciona taller —</option>
                    {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Prioridad</label>
                  <div className="flex gap-1">
                    {[{v:'alta',c:'bg-red-100 text-red-800 border-red-300'},{v:'media',c:'bg-gold-100 text-gold-800 border-gold-300'},{v:'baja',c:'bg-stone-100 text-stone-700 border-stone-300'}].map(o => (
                      <button key={o.v} onClick={() => setPrioridad(o.v)} className={`flex-1 py-1.5 rounded text-xs font-bold transition-all border ${prioridad === o.v ? o.c : 'bg-white text-stone-500 border-stone-200'}`}>{o.v.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Deadline</label>
                  <input value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="ej: 3 días, mañana, 1 sem" className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700" />
                </div>
              </div>
            </>
          )}

          {tipo === 'peticion' && (
            <>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Título</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-3" />
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Descripción</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Equipo</label>
                  <input value={equipo} onChange={e => setEquipo(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Tipo</label>
                  <select value={tipoSolicitud} onChange={e => setTipoSolicitud(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700">
                    <option value="herramienta_nueva">Herramienta nueva</option>
                    <option value="mejora_herramienta">Mejora de herramienta</option>
                    <option value="mejora_proceso">Mejora de proceso</option>
                    <option value="contratar_perfil">Contratar perfil</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {tipo === 'evento_taller' && (
            <>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">¿A qué taller pertenece? <span className="text-red-600">*</span></label>
              <select value={tallerEventoId} onChange={e => setTallerEventoId(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-4">
                <option value="">— Selecciona taller —</option>
                {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>

              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-2 block font-semibold">¿Qué tipo de evento es? <span className="text-red-600">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {tiposEventoMeta.map(o => {
                  const Icon = o.icon;
                  const sel = tipoEvento === o.v;
                  return (
                    <button key={o.v} onClick={() => setTipoEvento(o.v)}
                      className={`text-left px-3 py-2.5 rounded-lg border-2 transition-all flex items-start gap-2 ${sel ? o.color + ' shadow-sm' : 'bg-white border-stone-200 hover:border-navy-700'}`}>
                      <Icon size={15} className="flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-tight">{o.l}</p>
                        <p className="text-[10px] leading-tight mt-0.5 opacity-80">{o.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Titular del evento</label>
              <input value={eventoTitulo} onChange={e => setEventoTitulo(e.target.value)} placeholder="Ej: Chatbot lanzado a piloto" className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-3" />

              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Fecha del evento</label>
              <input type="date" value={eventoFecha} onChange={e => setEventoFecha(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-4" />

              <p className="text-xs text-stone-500 mb-4 italic">El texto completo del mensaje se guardará como descripción del evento. El autor del evento será {autor?.nombre || 'el autor del mensaje'}.</p>
            </>
          )}

          {tipo === 'reunion' && (
            <>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Título</label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700 mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Fecha</label>
                  <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Hora</label>
                  <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm outline-none focus:border-navy-700" />
                </div>
              </div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1 block font-semibold">Asistentes</label>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {personas.map(p => {
                  const sel = asistentes.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => setAsistentes(sel ? asistentes.filter(x => x !== p.id) : [...asistentes, p.id])}
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors border ${sel ? 'bg-navy-900 text-stone-50 border-navy-900' : 'bg-white text-stone-700 border-stone-200 hover:border-navy-700'}`}>
                      {sel ? '✓ ' : ''}{p.nombre}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
            <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-navy-900">Cancelar</button>
            <button onClick={submit} className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-navy-800 text-stone-50 rounded-md text-sm font-semibold transition-colors">
              <Plus size={14} /> Crear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onEnterDemo }) {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const emailValido = email.includes('@') && email.includes('.');

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailValido) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      setStep('sent');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sand-50 via-white to-navy-50 flex items-center justify-center p-6 overflow-y-auto" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <style>{`
        .font-serif, .font-display { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.015em; }
        .eyebrow { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy-900 mb-5 shadow-2xl shadow-navy-900/20">
            <span className="font-display text-4xl text-stone-50" style={{ fontWeight: 600 }}>N</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-400 border-4 border-white"></span>
          </div>
          <h1 className="font-display text-6xl text-navy-900 leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>Nexo</h1>
          <p className="text-sm text-stone-500 font-medium">Plan Estratégico · Coordinación de talleres</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-navy-900/10 border border-stone-200/60 overflow-hidden">
          <div className="flex">
            <div className={`flex-1 h-1 transition-colors ${step === 'email' ? 'bg-navy-900' : 'bg-gold-400'}`} />
            <div className={`flex-1 h-1 transition-colors ${step === 'sent' ? 'bg-navy-900' : 'bg-stone-100'}`} />
          </div>

          <div className="p-7">
            {step === 'email' && (
              <form onSubmit={handleSendEmail}>
                <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">Paso 1 de 2</p>
                <h2 className="font-serif text-2xl text-stone-900 mb-2">Identifícate</h2>
                <p className="text-sm text-stone-600 mb-6">Te enviaremos un email con un enlace seguro para entrar.</p>
                <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 block">Email corporativo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="tu.email@compania.es"
                  className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-colors"
                />
                {error && (
                  <p className="text-xs text-red-700 mt-2 font-medium">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !emailValido}
                  className="w-full mt-5 py-3 bg-navy-900 text-stone-50 rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : <>Enviar enlace <ArrowRight size={16} /></>}
                </button>
              </form>
            )}

            {step === 'sent' && (
              <div>
                <p className="text-[11px] uppercase tracking-widest text-stone-500 mb-2">Paso 2 de 2</p>
                <h2 className="font-serif text-2xl text-stone-900 mb-2">Revisa tu email</h2>
                <p className="text-sm text-stone-600 mb-5">Hemos enviado un enlace de acceso a:</p>
                <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg mb-5">
                  <Mail size={16} className="text-stone-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-stone-900 truncate">{email}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-5">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900 mb-1">Email enviado</p>
                      <p className="text-xs text-emerald-800 leading-relaxed">Abre el correo y haz click en el enlace. Volverás aquí con la sesión iniciada automáticamente.</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-3">¿No te ha llegado? Revisa spam, o vuelve atrás y prueba con otro email.</p>
                <button
                  onClick={() => { setStep('email'); setError(null); }}
                  className="w-full py-2 text-xs text-stone-500 hover:text-stone-900 transition-colors"
                >
                  Usar otro email
                </button>
              </div>
            )}
          </div>
        </div>

        {onEnterDemo && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-stone-200"></div>
              <span className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">o</span>
              <div className="flex-1 h-px bg-stone-200"></div>
            </div>
            <div className="bg-white rounded-2xl shadow-md shadow-navy-900/5 border-2 border-gold-300 overflow-hidden">
              <div className="h-1 bg-gold-400"></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={15} className="text-gold-600" />
                  <p className="text-[11px] uppercase tracking-widest text-gold-700 font-bold">Modo demo</p>
                </div>
                <h3 className="font-display text-xl text-navy-900 mb-1.5" style={{ fontWeight: 600 }}>Ver la herramienta sin registrarte</h3>
                <p className="text-sm text-stone-600 mb-5 leading-relaxed">Entra con datos de ejemplo (talleres, tareas, peticiones, conflictos…). Ideal para enseñarla.</p>
                <button
                  onClick={onEnterDemo}
                  className="w-full py-3 bg-gold-400 hover:bg-gold-500 text-navy-900 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Entrar al demo <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}

        <p className="text-[10px] text-stone-400 text-center mt-6">© Nexo · Plan Estratégico</p>
      </div>
    </div>
  );
}

function OnboardingScreen({ talleres, profile, onComplete, onLogout }) {
  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [apellidos, setApellidos] = useState(profile?.apellidos || '');
  const [equipo, setEquipo] = useState(profile?.equipo || '');
  const [seleccionados, setSeleccionados] = useState(profile?.talleres || []);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!nombre.trim() || !apellidos.trim()) return;
    setSubmitting(true);
    await onComplete({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      equipo: equipo.trim() || 'Sin equipo',
      talleres: seleccionados,
    });
    setSubmitting(false);
  };

  const areas = [...new Set(talleres.map(t => t.area))];
  const datosCompletos = nombre.trim() && apellidos.trim();

  return (
    <div className="fixed inset-0 bg-sand-50 overflow-y-auto" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <style>{`
        .font-serif, .font-display { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.015em; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .eyebrow { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div className="max-w-5xl mx-auto px-6 py-8 pb-28">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-lg bg-navy-900 flex items-center justify-center shadow-sm">
              <span className="font-display text-xl text-stone-50" style={{ fontWeight: 600 }}>N</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gold-400 border-2 border-white"></span>
            </div>
            <div>
              <p className="font-display text-2xl text-navy-900 leading-none" style={{ fontWeight: 600 }}>Nexo</p>
              <p className="eyebrow text-stone-500 mt-1" style={{ fontSize: '10px' }}>Bienvenido, {profile?.email || ''}</p>
            </div>
          </div>
          <button onClick={onLogout} className="text-sm text-stone-500 hover:text-navy-900 font-medium transition-colors flex items-center gap-1.5">
            <LogOut size={13} /> Salir
          </button>
        </div>

        <header className="mb-8 text-center">
          <p className="eyebrow text-navy-800 mb-4">Configura tu acceso</p>
          <h1 className="display-1 text-navy-900 mb-4" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)' }}>Bienvenido a Nexo</h1>
          <hr className="savills-rule w-32 mx-auto mb-5" />
          <p className="text-base text-stone-600 max-w-xl mx-auto leading-relaxed">Cuéntanos quién eres y elige los talleres en los que vas a participar.</p>
        </header>

        <div className="max-w-2xl mx-auto bg-white border border-stone-200/80 rounded-2xl p-6 mb-8">
          <p className="eyebrow text-navy-800 mb-4">Tus datos</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 block font-semibold">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required autoFocus
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-colors" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 block font-semibold">Apellidos</label>
              <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required
                className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-colors" />
            </div>
          </div>
          <label className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5 block font-semibold">Equipo / área <span className="normal-case text-stone-400">(opcional)</span></label>
          <input type="text" value={equipo} onChange={(e) => setEquipo(e.target.value)}
            placeholder="Ej: Innovación, Property Residencial, IT..."
            className="w-full px-4 py-3 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-navy-900 focus:ring-1 focus:ring-navy-900 transition-colors" />
        </div>

        <header className="mb-6 text-center">
          <h2 className="display-2 text-navy-900 mb-2">¿En qué talleres quieres participar?</h2>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">Podrás cambiarlo más tarde desde tu perfil.</p>
        </header>

        {areas.map(area => (
          <div key={area} className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-stone-500 mb-3 px-1">{area}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {talleres.filter(t => t.area === area).map(t => {
                const checked = seleccionados.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${checked ? 'border-navy-900 bg-navy-900 shadow-md' : 'border-stone-200 bg-white hover:border-navy-700'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className={`text-sm font-semibold leading-tight ${checked ? 'text-stone-50' : 'text-navy-900'}`}>{t.nombre}</p>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${checked ? 'bg-gold-400' : 'border-2 border-stone-300'}`}>
                        {checked && <CheckCircle2 size={14} className="text-navy-900" />}
                      </div>
                    </div>
                    <p className={`text-xs line-clamp-2 ${checked ? 'text-stone-300' : 'text-stone-500'}`}>{t.descripcion}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-sand-50/95 backdrop-blur border-t border-stone-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-stone-600">
            {!datosCompletos && <span className="text-amber-700 font-semibold">Completa nombre y apellidos · </span>}
            <span className="font-semibold text-navy-900 text-base">{seleccionados.length}</span> {seleccionados.length === 1 ? 'taller seleccionado' : 'talleres seleccionados'}
          </p>
          <button
            onClick={handleSubmit}
            disabled={!datosCompletos || submitting}
            className="px-6 py-3 bg-navy-900 text-stone-50 rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {submitting ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <>Entrar a Nexo <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Nexo() {
  const [active, setActive] = useState('dashboard');
  const [chatAbierto, setChatAbierto] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
  }, [active]);
  const [demoMode, setDemoMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (new URLSearchParams(window.location.search).has('demo')) return true;
    return localStorage.getItem('nexo:demoMode') === 'true';
  });

  const { session, profile, loading: authLoading, signOut, updateProfile, refreshProfile } = useAuth();
  const isAuth = !!session?.user;
  // Supabase activo cuando el usuario haya entrado, sea autenticado o como demo.
  // En modo demo se usa con el cliente anónimo (RLS abierta, datos compartidos).
  const supabaseEnabled = isAuth || demoMode;

  // Datos en Supabase (modo real)
  const [talleresSb, setTalleresSb] = useSupabaseTable('talleres', { enabled: supabaseEnabled });
  const [herramientasSb, setHerramientasSb] = useSupabaseTable('herramientas', { enabled: supabaseEnabled });
  const [iniciativasSb, setIniciativasSb] = useSupabaseTable('iniciativas', { enabled: supabaseEnabled });
  const [tareasSb, setTareasSb] = useSupabaseTable('tareas', { enabled: supabaseEnabled });
  const [profilesRaw, setProfilesRaw] = useSupabaseTable('profiles', { enabled: supabaseEnabled });
  const [historicoSb, setHistoricoSb] = useSupabaseTable('historico', { enabled: supabaseEnabled });
  const [reunionesSb, setReunionesSb] = useSupabaseTable('reuniones', { enabled: supabaseEnabled });
  const [convocatoriasSb, setConvocatoriasSb] = useSupabaseTable('convocatorias', { enabled: supabaseEnabled });
  const [solapamientosSb, setSolapamientosSb] = useSupabaseTable('solapamientos', { enabled: supabaseEnabled });
  const [peticionesSb, setPeticionesSb] = useSupabaseTable('peticiones', { enabled: supabaseEnabled });

  // Datos en localStorage con SEED (modo demo)
  const [talleresLs, setTalleresLs] = useStored(STORAGE_KEYS.talleres, SEED_TALLERES);
  const [herramientasLs, setHerramientasLs] = useStored(STORAGE_KEYS.herramientas, SEED_HERRAMIENTAS);
  const [iniciativasLs, setIniciativasLs] = useStored(STORAGE_KEYS.iniciativas, SEED_INICIATIVAS);
  const [tareasLs, setTareasLs] = useStored(STORAGE_KEYS.tareas, SEED_TAREAS);
  const [personasLs, setPersonasLs] = useStored(STORAGE_KEYS.personas, SEED_PERSONAS);
  const [historicoLs, setHistoricoLs] = useStored(STORAGE_KEYS.historico, SEED_HISTORICO);
  const [reunionesLs, setReunionesLs] = useStored(STORAGE_KEYS.reuniones, SEED_REUNIONES);
  const [convocatoriasLs, setConvocatoriasLs] = useStored(STORAGE_KEYS.convocatorias, SEED_CONVOCATORIAS);
  const [solapamientosLs, setSolapamientosLs] = useStored(STORAGE_KEYS.solapamientos, SEED_SOLAPAMIENTOS);
  const [peticionesLs, setPeticionesLs] = useStored(STORAGE_KEYS.peticiones, SEED_PETICIONES);
  const [mensajesLs, setMensajesLs] = useStored(STORAGE_KEYS.mensajes, []);

  const [tallerSeleccionadoId, setTallerSeleccionadoId] = useState(null);

  const entrarDemo = () => {
    localStorage.setItem('nexo:demoMode', 'true');
    setDemoMode(true);
  };

  const salirDemo = async () => {
    localStorage.removeItem('nexo:demoMode');
    setDemoMode(false);
    if (isAuth) await signOut();
  };

  // Selección de fuente de datos: ahora siempre Supabase si hay sesión o demo
  const useSb = supabaseEnabled;
  const talleres = useSb ? talleresSb : talleresLs;
  const setTalleres = useSb ? setTalleresSb : setTalleresLs;
  const herramientas = useSb ? herramientasSb : herramientasLs;
  const setHerramientas = useSb ? setHerramientasSb : setHerramientasLs;
  const iniciativas = useSb ? iniciativasSb : iniciativasLs;
  const setIniciativas = useSb ? setIniciativasSb : setIniciativasLs;
  const tareas = useSb ? tareasSb : tareasLs;
  const setTareas = useSb ? setTareasSb : setTareasLs;
  const historico = useSb ? historicoSb : historicoLs;
  const setHistorico = useSb ? setHistoricoSb : setHistoricoLs;
  const reuniones = useSb ? reunionesSb : reunionesLs;
  const setReuniones = useSb ? setReunionesSb : setReunionesLs;
  const convocatorias = useSb ? convocatoriasSb : convocatoriasLs;
  const setConvocatorias = useSb ? setConvocatoriasSb : setConvocatoriasLs;
  const solapamientos = useSb ? solapamientosSb : solapamientosLs;
  const setSolapamientos = useSb ? setSolapamientosSb : setSolapamientosLs;
  const peticiones = useSb ? peticionesSb : peticionesLs;
  const setPeticiones = useSb ? setPeticionesSb : setPeticionesLs;

  // Personas: si hay perfiles en Supabase, los usa. Si no (Supabase vacío),
  // cae al SEED de personas para que la app no se quede sin gente.
  const personas = useSb && profilesRaw.length > 0
    ? profilesRaw.map(p => ({
        ...p,
        nombre: [p.nombre, p.apellidos].filter(Boolean).join(' ') || p.email || 'Sin nombre',
        equipo: p.equipo || 'Sin equipo',
        nivel: p.nivel || 2,
        talleres: p.talleres || [],
      }))
    : personasLs;

  const setPersonas = useSb && profilesRaw.length > 0
    ? async (next) => {
        const newList = typeof next === 'function' ? next(personas) : next;
        const oldById = Object.fromEntries(profilesRaw.map(p => [p.id, p]));
        const updates = [];
        newList.forEach(updated => {
          const original = oldById[updated.id];
          if (!original) return;
          const merged = {
            ...original,
            equipo: updated.equipo,
            nivel: updated.nivel,
            talleres: updated.talleres,
          };
          if (JSON.stringify(merged) !== JSON.stringify(original)) updates.push(merged);
        });
        if (updates.length === 0) return;
        setProfilesRaw(profilesRaw.map(p => {
          const u = updates.find(x => x.id === p.id);
          return u || p;
        }));
      }
    : setPersonasLs;

  const usuarioActualId = demoMode ? 'p16' : (session?.user?.id || null);

  const irATaller = (tallerId) => {
    setTallerSeleccionadoId(tallerId);
    setActive('talleres');
  };

  if (!demoMode && authLoading) return null;

  if (!demoMode && !isAuth) {
    return <LoginScreen onEnterDemo={entrarDemo} />;
  }

  if (!demoMode && !profile?.onboarded) {
    return (
      <OnboardingScreen
        talleres={talleres}
        profile={profile}
        onLogout={signOut}
        onComplete={async ({ nombre, apellidos, equipo, talleres: tallerIds }) => {
          await updateProfile({ nombre, apellidos, equipo, talleres: tallerIds, onboarded: true });
          await refreshProfile();
        }}
      />
    );
  }

  // Sesión para UI (varía según modo)
  const sessionForUI = demoMode
    ? {
        nombre: 'Demo',
        apellidos: '',
        email: 'demo@nexo.app',
        loginAt: new Date().toISOString(),
      }
    : {
        nombre: profile.nombre,
        apellidos: profile.apellidos,
        email: profile.email,
        loginAt: session?.user?.last_sign_in_at || new Date().toISOString(),
      };

  return (
    <div className="flex h-screen bg-sand-50 relative overflow-hidden font-sans text-stone-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <style>{`
        html, body { font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .font-serif, .font-display { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.015em; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .eyebrow { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; color: #1d3d6e; }
        .display-1 { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; font-size: clamp(1.9rem, 3vw, 2.6rem); line-height: 1.1; letter-spacing: -0.02em; }
        .display-2 { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; font-size: clamp(1.4rem, 2.2vw, 1.8rem); line-height: 1.15; letter-spacing: -0.015em; }
        .kpi-number { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-feature-settings: 'tnum' 1, 'lnum' 1, 'cv11' 1; font-variant-numeric: tabular-nums lining-nums; font-weight: 600; letter-spacing: -0.03em; line-height: 0.95; }
        .magazine-serif { font-family: Inter, "Segoe UI", system-ui, sans-serif; font-weight: 600; letter-spacing: -0.02em; }
        .savills-rule { background: linear-gradient(90deg, #142d56 0%, #142d56 30%, #ffcc1a 30%, #ffcc1a 38%, transparent 38%); height: 2px; border: 0; }
      `}</style>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Sidebar
        active={active}
        setActive={setActive}
        usuarioActualId={usuarioActualId}
        setUsuarioActualId={() => {}}
        personas={personas}
        tareas={tareas}
        onAbrirChat={() => setChatAbierto(true)}
        onLogout={demoMode ? salirDemo : signOut}
        sessionUser={sessionForUI}
        demoMode={demoMode}
      />
      <main ref={mainRef} className="flex-1 overflow-y-auto bg-stone-50">
        {active === 'dashboard' && <Dashboard talleres={talleres} herramientas={herramientas} setHerramientas={setHerramientas} tareas={tareas} setTareas={setTareas} iniciativas={iniciativas} setIniciativas={setIniciativas} personas={personas} historico={historico} setHistorico={setHistorico} solapamientos={solapamientos} convocatorias={convocatorias} setConvocatorias={setConvocatorias} peticiones={peticiones} setPeticiones={setPeticiones} reuniones={reuniones} usuarioActualId={usuarioActualId} setActive={setActive} irATaller={irATaller} session={sessionForUI} active={active} />}
        {active === 'mis-tareas' && <MisTareasView tareas={tareas} setTareas={setTareas} talleres={talleres} personas={personas} usuarioActualId={usuarioActualId} setActive={setActive} />}
        {active === 'reuniones' && <ReunionesView reuniones={reuniones} setReuniones={setReuniones} talleres={talleres} setTalleres={setTalleres} personas={personas} historico={historico} setHistorico={setHistorico} setActive={setActive} />}
        {active === 'talleres' && <TalleresView talleres={talleres} setTalleres={setTalleres} historico={historico} setHistorico={setHistorico} personas={personas} setPersonas={setPersonas} tareas={tareas} reuniones={reuniones} setReuniones={setReuniones} tallerInicialId={tallerSeleccionadoId} onCerrarTaller={() => setTallerSeleccionadoId(null)} usuarioActualId={usuarioActualId} demoMode={demoMode} />}
        {active === 'personas' && <PersonasView personas={personas} setPersonas={setPersonas} talleres={talleres} tareas={tareas} setActive={setActive} usuarioActualId={usuarioActualId} />}
        {active === 'innovacion' && <InnovacionView iniciativas={iniciativas} setIniciativas={setIniciativas} personas={personas} talleres={talleres} />}
        {active === 'peticiones' && <ProcesosView peticiones={peticiones} setPeticiones={setPeticiones} talleres={talleres} personas={personas} herramientas={herramientas} usuarioActualId={usuarioActualId} setActive={setActive} />}
        {active === 'solapamientos' && <SolapamientosView talleres={talleres} herramientas={herramientas} iniciativas={iniciativas} personas={personas} solapamientos={solapamientos} setSolapamientos={setSolapamientos} peticiones={peticiones} setPeticiones={setPeticiones} usuarioActualId={usuarioActualId} setActive={setActive} />}
        {active === 'herramientas' && <HerramientasView herramientas={herramientas} setHerramientas={setHerramientas} personas={personas} usuarioActualId={usuarioActualId} />}
        {active === 'tareas' && <TareasView tareas={tareas} setTareas={setTareas} talleres={talleres} personas={personas} usuarioActualId={usuarioActualId} />}
        {active === 'chat' && <ChatView personas={personas} talleres={talleres} usuarioActualId={usuarioActualId} demoMode={demoMode} mensajesLocal={mensajesLs} setMensajesLocal={setMensajesLs} tareas={tareas} setTareas={setTareas} peticiones={peticiones} setPeticiones={setPeticiones} reuniones={reuniones} setReuniones={setReuniones} historico={historico} setHistorico={setHistorico} setActive={setActive} irATaller={irATaller} />}
      </main>

      {chatAbierto && (
        <div className="fixed bottom-5 right-5 z-50 w-[440px] h-[640px] max-h-[calc(100vh-40px)] bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <Asistente
            talleres={talleres}
            herramientas={herramientas}
            iniciativas={iniciativas}
            tareas={tareas}
            personas={personas}
            solapamientos={solapamientos}
            setSolapamientos={setSolapamientos}
            peticiones={peticiones}
            setPeticiones={setPeticiones}
            usuarioActualId={usuarioActualId}
            setTareas={setTareas}
            setIniciativas={setIniciativas}
            onClose={() => setChatAbierto(false)}
            modoFlotante
          />
        </div>
      )}
    </div>
  );
}
