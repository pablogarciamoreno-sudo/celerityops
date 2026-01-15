# CelerityOps - Clinical Research Operations Platform

> Sistema de gestion operativa para CRO (Contract Research Organization)

---

## ALERTA: Inconsistencias entre CLAUDE.md y Estructura Real

### Rutas documentadas en CLAUDE.md (lineas 60-68) que NO EXISTEN:

| Ruta Documentada | Estado | Persona Asignada |
|------------------|--------|------------------|
| `/dashboard/sc-lead-santiago/` | NO IMPLEMENTADA | Lissette Escobar |
| `/dashboard/sc-lead-iquique/` | NO IMPLEMENTADA | Ana Martinez |
| `/dashboard/qa-specialist/` | NO IMPLEMENTADA | Armando Vergada |
| `/dashboard/ctms-data-governance/` | NO IMPLEMENTADA | Matias Munoz |
| `/dashboard/vendor-manager/` | NO IMPLEMENTADA | Por definir |

### Rutas que SI EXISTEN (implementadas):

| Ruta Real | En CLAUDE.md | Componente Dashboard |
|-----------|--------------|----------------------|
| `/dashboard/coo/` | Si | `components/dashboard/coo/coo-dashboard.tsx` |
| `/dashboard/sc-lead/` | No | `components/dashboard/sc-lead/sc-lead-dashboard.tsx` |
| `/dashboard/site-lead/` | No | `components/dashboard/site-lead/site-lead-dashboard.tsx` |
| `/dashboard/coordinator/` | Parcial | Inline en page.tsx |
| `/dashboard/data-entry/` | Parcial | Inline en page.tsx |
| `/dashboard/qa/` | Parcial | `components/dashboard/qa/qa-dashboard.tsx` |
| `/dashboard/regulatory/` | Parcial | Inline en page.tsx |

**Para corregir:** Editar `CLAUDE.md` lineas 60-68

---

## ALERTA: Discrepancias entre database.ts y Supabase Real

**Fecha de analisis:** 2026-01-15

### Tablas con discrepancias de columnas:

| Tabla | En database.ts | En Supabase | Accion Requerida |
|-------|----------------|-------------|------------------|
| **roles** | `permissions_json` | `permissions` | Renombrar en database.ts |
| **sites** | - | `code` | Agregar `code` a database.ts |
| **studies** | `title` | `name` | Cambiar `title` por `name` |
| **studies** | `site_id` | - | Eliminar de database.ts |
| **studies** | `updated_at` | - | Eliminar de database.ts |
| **kpi_targets** | - | `period` | Agregar `period` a database.ts |
| **activity_logs** | Definido | NO EXISTE | Crear tabla en Supabase o eliminar tipo |

### Estadisticas de datos actuales:

| Tabla | Registros | Estado |
|-------|-----------|--------|
| roles | 7 | Con datos |
| sites | 5 | Con datos |
| studies | 4 | Con datos |
| kpi_targets | 16 | Con datos |
| users | 0 | Vacia (RLS) |
| screenings | 0 | Vacia |
| enrollments | 0 | Vacia |
| visits | 0 | Vacia |
| adverse_events | 0 | Vacia |
| queries | 0 | Vacia |
| sc_lead_* (5 tablas) | 0 | Vacias |

### Roles existentes en Supabase (7):

1. COO
2. Site Lead
3. SC Lead
4. Study Coordinator
5. Regulatory Specialist
6. Data Entry Specialist
7. QA Manager

**Para corregir:** Editar `lib/types/database.ts` segun tabla de discrepancias

---

## Mapa de Correcciones

### Si quieres editar... -> Edita este archivo:

#### Autenticacion y Acceso

| Funcionalidad | Archivo |
|---------------|---------|
| Formulario de login | `app/login/page.tsx` |
| Formulario de registro | `app/register/page.tsx` |
| Hook de autenticacion (estado de usuario, roles) | `lib/hooks/use-auth.ts` |
| Cliente Supabase (servidor) | `lib/supabase/server.ts` |
| Cliente Supabase (navegador) | `lib/supabase/client.ts` |

#### Navegacion y Layout

| Funcionalidad | Archivo | Lineas |
|---------------|---------|--------|
| Menu del sidebar por rol | `components/layout/app-sidebar.tsx` | 50-207 |
| Header del dashboard | `components/layout/dashboard-header.tsx` | - |
| Layout principal | `components/layout/dashboard-layout.tsx` | - |

#### Dashboards por Rol

| Rol | Pagina | Componente Dashboard | Config Sidebar |
|-----|--------|----------------------|----------------|
| COO | `app/dashboard/coo/page.tsx` | `components/dashboard/coo/coo-dashboard.tsx` | lineas 54-82 |
| SC Lead | `app/dashboard/sc-lead/page.tsx` | `components/dashboard/sc-lead/sc-lead-dashboard.tsx` | lineas 103-126 |
| Site Lead | `app/dashboard/site-lead/page.tsx` | `components/dashboard/site-lead/site-lead-dashboard.tsx` | lineas 83-102 |
| QA Manager | `app/dashboard/qa/page.tsx` | `components/dashboard/qa/qa-dashboard.tsx` | lineas 186-206 |
| Study Coordinator | `app/dashboard/coordinator/page.tsx` | N/A (inline) | lineas 127-148 |
| Regulatory Specialist | `app/dashboard/regulatory/page.tsx` | N/A (inline) | lineas 149-168 |
| Data Entry Specialist | `app/dashboard/data-entry/page.tsx` | N/A (inline) | lineas 169-185 |

#### Modulo SC Lead (Sub-paginas)

| Funcionalidad | Pagina | Componente |
|---------------|--------|------------|
| Scorecard 28 KPIs | `app/dashboard/sc-lead/page.tsx` | `components/dashboard/sc-lead/sc-lead-dashboard.tsx` |
| Registro semanal | `app/dashboard/sc-lead/weekly-report/page.tsx` | `components/dashboard/sc-lead/weekly-report-form.tsx` |
| Action items monitoreo | `app/dashboard/sc-lead/action-items/page.tsx` | `components/dashboard/sc-lead/action-items-manager.tsx` |
| Start-up tracker | `app/dashboard/sc-lead/startup/page.tsx` | `components/dashboard/sc-lead/startup-tracker.tsx` |
| Audit readiness | `app/dashboard/sc-lead/audit-readiness/page.tsx` | `components/dashboard/sc-lead/audit-readiness-checker.tsx` |
| Roster equipo | `app/dashboard/sc-lead/team/page.tsx` | `components/dashboard/sc-lead/team-roster-manager.tsx` |
| Evaluaciones sponsor | `app/dashboard/sc-lead/sponsor-evals/page.tsx` | `components/dashboard/sc-lead/sponsor-evaluations.tsx` |

#### Formularios

| Funcionalidad | Archivo |
|---------------|---------|
| Registro de enrollments | `components/forms/enrollments-page.tsx` |
| Registro de screenings | `components/forms/screenings-page.tsx` |
| Resolucion de queries | `components/forms/queries-page.tsx` |

#### Componentes UI Reutilizables

| Componente | Archivo | Uso |
|------------|---------|-----|
| Tarjeta KPI | `components/dashboard/kpi-card.tsx` | Mostrar metricas |
| Tarjeta de grafico | `components/dashboard/chart-card.tsx` | Wrapper para charts |
| Badge de estado | `components/dashboard/status-badge.tsx` | Indicadores de estado |
| Tabla de datos | `components/dashboard/data-table.tsx` | Listados tabulares |
| Componentes shadcn/ui | `components/ui/*.tsx` | UI base (22 archivos) |

---

## Tipos de Base de Datos

Archivo: `lib/types/database.ts` (377 lineas)

### Entidades Core

| Tipo | Lineas | Descripcion |
|------|--------|-------------|
| Role | 1-7 | Roles de usuario (COO, Site Lead, SC Lead, etc.) |
| Site | 9-17 | Sitios clinicos |
| User | 19-31 | Perfil de usuario con rol y sitio |
| Study | 33-48 | Estudios/protocolos clinicos |
| Screening | 50-62 | Registros de tamizaje |
| Enrollment | 64-75 | Registros de enrolamiento |
| Visit | 77-89 | Visitas de pacientes |
| AdverseEvent | 91-106 | Eventos adversos (AE/SAE) |
| Query | 108-122 | Queries de datos |
| RegulatorySubmission | 124-138 | Sometimientos regulatorios |
| EssentialDocument | 140-153 | Documentos esenciales TMF |
| MonitoringActionItem | 155-172 | Action items de monitoreo |
| Deviation | 174-190 | Desviaciones de protocolo |
| Alert | 192-202 | Alertas del sistema |
| KPITarget | 204-213 | Metas de KPIs |
| ActivityLog | 215-224 | Log de actividad (audit trail) |

### Modulo SC Lead

| Tipo | Lineas | Descripcion |
|------|--------|-------------|
| KPIStatus | 230 | Estados de KPI (on_target, warning, critical) |
| KPICategory | 232-240 | Categorias de KPI (8 categorias) |
| KPIOperator | 242 | Operadores de comparacion |
| SCLeadWeeklyReport | 244-286 | Reporte semanal operativo |
| SCLeadActionItem | 288-307 | Items de accion de monitoreo |
| SCLeadStartupTracker | 309-326 | Pipeline de startup de estudios |
| SCLeadTeamMember | 328-344 | Roster de equipo |
| SCLeadAuditReadiness | 346-364 | Checklist de auditoria |
| SCLeadKPIValue | 367-377 | Valor calculado de KPI |

---

## Estructura Completa de Archivos

### /app/ - Rutas y Paginas (Next.js App Router)

```
app/
├── layout.tsx                    # Layout raiz (providers, fonts)
├── page.tsx                      # Pagina principal (/)
├── globals.css                   # Estilos globales + Tailwind
├── login/
│   └── page.tsx                  # Pagina de login
├── register/
│   └── page.tsx                  # Pagina de registro
└── dashboard/
    ├── layout.tsx                # Layout wrapper del dashboard
    ├── page.tsx                  # Redirect segun rol
    ├── coo/
    │   └── page.tsx              # Dashboard COO
    ├── sc-lead/
    │   ├── page.tsx              # Scorecard KPIs (28 KPIs)
    │   ├── weekly-report/
    │   │   └── page.tsx          # Registro semanal
    │   ├── action-items/
    │   │   └── page.tsx          # Action items
    │   ├── startup/
    │   │   └── page.tsx          # Start-up tracker
    │   ├── audit-readiness/
    │   │   └── page.tsx          # Audit readiness
    │   ├── team/
    │   │   └── page.tsx          # Roster equipo
    │   └── sponsor-evals/
    │       └── page.tsx          # Evaluaciones sponsor
    ├── site-lead/
    │   └── page.tsx              # Dashboard Site Lead
    ├── coordinator/
    │   ├── page.tsx              # Dashboard Coordinador
    │   ├── enrollments/
    │   │   └── page.tsx          # Registro enrollments
    │   └── screenings/
    │       └── page.tsx          # Registro screenings
    ├── data-entry/
    │   ├── page.tsx              # Dashboard Data Entry
    │   └── queries/
    │       └── page.tsx          # Resolucion queries
    ├── qa/
    │   └── page.tsx              # Dashboard QA Manager
    └── regulatory/
        └── page.tsx              # Dashboard Regulatory
```

### /components/ - Componentes React

```
components/
├── theme-provider.tsx            # Provider de tema (dark/light)
├── dashboard/
│   ├── kpi-card.tsx              # Tarjeta de KPI reutilizable
│   ├── chart-card.tsx            # Wrapper para graficos
│   ├── status-badge.tsx          # Badge de estado (40+ estados)
│   ├── data-table.tsx            # Tabla de datos generica
│   ├── coo/
│   │   ├── coo-dashboard.tsx     # Dashboard COO principal
│   │   ├── enrollment-chart.tsx  # Grafico de enrollments
│   │   ├── screening-chart.tsx   # Grafico de screenings
│   │   └── site-comparison-chart.tsx  # Comparacion sitios
│   ├── qa/
│   │   └── qa-dashboard.tsx      # Dashboard QA
│   ├── sc-lead/
│   │   ├── sc-lead-dashboard.tsx # Scorecard 28 KPIs
│   │   ├── weekly-report-form.tsx
│   │   ├── action-items-manager.tsx
│   │   ├── startup-tracker.tsx
│   │   ├── audit-readiness-checker.tsx
│   │   ├── team-roster-manager.tsx
│   │   └── sponsor-evaluations.tsx
│   ├── site-lead/
│   │   └── site-lead-dashboard.tsx
│   └── staff/
│       └── staff-dashboard.tsx   # Dashboard generico staff
├── forms/
│   ├── enrollments-page.tsx
│   ├── screenings-page.tsx
│   └── queries-page.tsx
├── layout/
│   ├── app-sidebar.tsx           # Sidebar con navegacion por rol (307 lineas)
│   ├── dashboard-header.tsx
│   └── dashboard-layout.tsx
└── ui/                           # shadcn/ui (22 archivos)
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── chart.tsx
    ├── checkbox.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── progress.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── sheet.tsx
    ├── sidebar.tsx
    ├── skeleton.tsx
    ├── sonner.tsx
    ├── switch.tsx
    ├── table.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    └── tooltip.tsx
```

### /lib/ - Utilidades y Configuracion

```
lib/
├── utils.ts                      # Funciones utilitarias (cn, etc.)
├── hooks/
│   └── use-auth.ts               # Hook de autenticacion
├── supabase/
│   ├── client.ts                 # Cliente Supabase (navegador)
│   ├── server.ts                 # Cliente Supabase (servidor)
│   └── proxy.ts                  # Utilidades proxy
└── types/
    └── database.ts               # Tipos TypeScript (377 lineas)
```

### /supabase/ - Base de Datos

```
supabase/
└── migrations/
    ├── 001-create-tables.sql     # Tablas principales
    ├── 002-create-rls-policies.sql  # Politicas RLS
    ├── 003-seed-data.sql         # Datos iniciales
    └── 004-seed-transactional-data.sql  # Datos transaccionales
```

### Archivos de Configuracion (raiz)

| Archivo | Proposito |
|---------|-----------|
| `CLAUDE.md` | Reglas del proyecto para Claude Code |
| `package.json` | Dependencias y scripts |
| `tsconfig.json` | Configuracion TypeScript |
| `next.config.mjs` | Configuracion Next.js |
| `tailwind.config.ts` | Configuracion Tailwind CSS |
| `postcss.config.mjs` | Configuracion PostCSS |
| `components.json` | Configuracion shadcn/ui |

---

## Escenarios Comunes de Edicion

### Agregar un nuevo rol

1. Agregar rol al tipo: `lib/types/database.ts` linea 3 (union type Role.name)
2. Agregar navegacion: `components/layout/app-sidebar.tsx` (agregar entrada en navigationByRole)
3. Crear pagina: `app/dashboard/[nuevo-rol]/page.tsx`
4. Crear componente: `components/dashboard/[nuevo-rol]/[nuevo-rol]-dashboard.tsx`

### Agregar un nuevo KPI al modulo SC Lead

1. Agregar definicion: `components/dashboard/sc-lead/sc-lead-dashboard.tsx` (array KPI_DEFINITIONS)
2. Agregar calculo: mismo archivo, funcion `calculateKPIValue`
3. Si requiere nuevos campos: actualizar `lib/types/database.ts` (SCLeadWeeklyReport)

### Modificar navegacion del sidebar

1. Editar: `components/layout/app-sidebar.tsx`
2. Buscar rol en objeto `navigationByRole` (lineas 50-207)
3. Modificar array `items` del grupo correspondiente

### Agregar nueva tabla en base de datos

1. Crear tipo: `lib/types/database.ts`
2. Crear migracion: `supabase/migrations/[numero]-[nombre].sql`
3. Actualizar componentes que la usen

### Corregir inconsistencia en CLAUDE.md

1. Editar: `CLAUDE.md` lineas 60-68
2. Reemplazar estructura documentada con la real (ver seccion de alerta arriba)

---

## Stack Tecnologico

| Capa | Tecnologia | Version |
|------|------------|---------|
| Framework | Next.js (App Router) | 16.0.10 |
| UI Library | React | 19.2.0 |
| Lenguaje | TypeScript | 5.x |
| Base de datos | Supabase (PostgreSQL) | Latest |
| Autenticacion | Supabase Auth | @supabase/ssr 0.8.0 |
| Componentes | shadcn/ui + Radix UI | - |
| Estilos | Tailwind CSS | 4.1.9 |
| Graficos | Recharts | 2.15.4 |
| Formularios | React Hook Form + Zod | 7.60.0 / 3.25.76 |

---

## Notas para Claude Code

### Convenciones de Path

- Usar alias `@/` para imports desde raiz
- Importar shadcn: `@/components/ui/[componente]`
- Importar utilidades: `@/lib/[modulo]`

### Patron de Componentes

- Server Components por defecto
- Agregar `"use client"` solo para interactividad
- Data fetching en page.tsx, pasar datos como props

### Patron de Base de Datos

- Servidor: `import { createClient } from "@/lib/supabase/server"`
- Cliente: `import { createClient } from "@/lib/supabase/client"`
- Siempre tipar con tipos de `lib/types/database.ts`

### Convencion de Commits (espanol)

- `fix:` correccion de errores
- `feat:` nueva funcionalidad
- `refactor:` mejoras de codigo
- `style:` cambios de UI
- `db:` cambios de base de datos
