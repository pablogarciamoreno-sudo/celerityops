# Proyecto: Celerity Operations Dashboard

## Contexto del Negocio

**Celerity Clinical Research Group** es un site network especializado en investigación clínica que opera en Latinoamérica. A diferencia de una CRO (que gestiona estudios para sponsors), Celerity es donde los pacientes participan directamente en ensayos clínicos.

### Operación actual:
- **Sitios propios:** Santiago (HQ), Iquique (Chile), Concepción (Chile), Chiloé (Chile) Lima (Perú), Ciudad de México (México)
- **Red de partners:** ~40 sitios asociados en Colombia, España y El Salvador (2026-2027)
- **Estudios:** Principalmente oncología, y otras áreas terapéuticas, fases I-III
- **Equipo:** Study Coordinator Lead, Quality Assurance Specialist I, CTMS & Data Governance Manager, Vendor Manager, reportando al COO

### Problema a resolver:
El COO actualmente "navega a ciegas" - no tiene visibilidad en tiempo real del desempeño operativo de sus equipos. Los reportes se hacen manualmente en Excel, son inconsistentes y consumen tiempo. Necesita un dashboard web donde cada líder de área reporte sus KPIs semanalmente y él pueda ver el consolidado.

## Objetivo de la App

Construir un **Dashboard de Operaciones** web donde:
1. Cada rol (Study Coordinator Lead, Quality Assurance Specialist I, CTMS & Data Governance Manager, Vendor Manager, etc.) tenga su módulo de reporte
2. Los líderes ingresen datos semanalmente (máximo 15 min)
3. Los KPIs se calculen automáticamente
4. El COO vea un scorecard consolidado de toda la operación
5. Se mantenga histórico para análisis de tendencias en base de datos

## Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL + Auth + Realtime)
- **Hosting:** Vercel o similar
- **Charts:** Recharts o Tremor

## Arquitectura de la App

\`\`\`
celerity-ops-dashboard/
├── src/
│   ├── app/                    # Next.js App Router (si usamos Next)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Sidebar, etc.
│   │   └── shared/             # KPICard, StatusBadge, TrendChart
│   ├── modules/
│   │   ├── sc-lead/            # Módulo Study Coordinator Lead
│   │   ├── qa-specialist/      # Módulo QA (futuro)
│   │   ├── ctms-manager/       # Módulo CTMS (futuro)
│   │   └── coo-dashboard/      # Dashboard ejecutivo COO
│   ├── lib/
│   │   ├── supabase/           # Cliente y tipos de Supabase
│   │   ├── utils/              # Helpers y funciones
│   │   └── constants/          # Configuraciones
│   ├── hooks/                  # Custom hooks globales
│   └── types/                  # Tipos TypeScript globales
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── seed.sql                # Datos iniciales
└── public/
\`\`\`

## Modelo de Datos Base

### Tablas Core (compartidas)

\`\`\`sql
-- Sitios de Celerity
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL, -- SCL, CCP, LIM, CDMX
  city VARCHAR(100),
  country VARCHAR(50),
  type VARCHAR(20) DEFAULT 'owned', -- owned, partner
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Estudios clínicos
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200),
  sponsor VARCHAR(100),
  therapeutic_area VARCHAR(50),
  phase VARCHAR(10), -- I, II, III, IV
  status VARCHAR(20), -- startup, active, closing, closed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Relación sitio-estudio
CREATE TABLE site_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  study_id UUID REFERENCES studies(id),
  status VARCHAR(20), -- screening, enrolling, follow-up, closed
  target_enrollment INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  fpfv_date DATE,
  lpfv_date DATE,
  UNIQUE(site_id, study_id)
);

-- Usuarios del sistema
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(50), -- coo, sc_lead, qa_specialist, ctms_manager
  site_id UUID REFERENCES sites(id), -- NULL para COO (ve todos)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Períodos de reporte (semanas)
CREATE TABLE reporting_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  UNIQUE(year, week_number)
);
\`\`\`

## Módulos Planificados

### Fase 1 (MVP):
1. **SC Lead Module** - 39 KPIs de coordinación clínica y regulatoria
   - Registro semanal
   - Tracking de Action Items
   - Start-up tracker
   - Gestión de equipo

### Fase 2:
2. **QA Specialist I Module** - KPIs de calidad y compliance
3. **CTMS Manager Module** - KPIs de datos y sistemas

### Fase 3:
4. **Vendor Manager** - KPIs de Vendor Managment


### Fase 4:
5. **COO Dashboard** - Scorecard consolidado de todos los módulos


## Flujo de Usuario

\`\`\`
Login → Seleccionar Sitio (si aplica) → Ver Dashboard del Rol
                                              ↓
                                    [Registro Semanal]
                                              ↓
                                    [KPIs se calculan]
                                              ↓
                                    [Scorecard actualizado]
                                              ↓
                            [COO ve consolidado de todos los sitios]
\`\`\`

## Convenciones de Código

- **Naming:** camelCase para variables/funciones, PascalCase para componentes
- **Tipos:** Definir interfaces para todo, evitar `any`
- **Componentes:** Funcionales con hooks, no clases
- **Estado:** Zustand para estado global, React Query para server state
- **Estilos:** Tailwind utilities, evitar CSS custom
- **Imports:** Usar alias `@/` para src/

## KPIs del Módulo SC Lead

El primer módulo a desarrollar tiene **39 KPIs** en 8 categorías:

| Categoría | KPIs | Descripción |
|-----------|------|-------------|
| 🎯 Reclutamiento | 5 | Screen failure, conversión, targets |
| 📋 Ejecución Visitas | 4 | Completitud, adherencia, retención |
| ⚠️ Seguridad | 5 | SAEs, desviaciones, CAPAs |
| 📝 Monitoring | 6 | Action items, findings, audit readiness |
| 🚀 Start-up | 6 | FPFV, ciclos EC, enmiendas |
| ⭐ Sponsors | 3 | Satisfaction score, NPS, responsiveness |
| 👥 Equipo | 6 | Turnover, GCP, training, workload |
| ⚙️ Eficiencia | 4 | Ratios coordinador, contingencias |

## Archivos de Referencia

Tengo disponibles:
- `sc_lead_module_specs.json` - Especificaciones técnicas de los 39 KPIs
- `sc_lead_module_prompt.md` - Prompt detallado para el módulo SC Lead
- `Dashboard_SC_Lead_Completo_Final.xlsx` - Excel con todas las hojas y fórmulas

## Instrucciones para Desarrollo

### Para comenzar:

1. **Setup inicial:**
   - Crear proyecto con Vite + React + TypeScript
   - Instalar Tailwind CSS y shadcn/ui
   - Configurar Supabase client

2. **Base de datos:**
   - Crear tablas core (sites, studies, users)
   - Crear tablas del módulo SC Lead
   - Seed con datos de prueba

3. **Componentes base:**
   - Layout (Sidebar, Header)
   - KPICard, StatusBadge, TrendChart
   - Formularios con validación

4. **Módulo SC Lead:**
   - Implementar registro semanal
   - Implementar tracking de action items
   - Implementar scorecard

### Prioridades:
- Funcionalidad sobre diseño perfecto (iterar después)
- Fórmulas de KPIs correctas (son críticas)
- UX simple para input rápido (máximo 15 min semanal)
- Mobile-friendly para tablets en sitio

## Preguntas para Clarificar

Antes de comenzar el código, confirmar:
1. ¿Usamos Next.js o Vite + React puro?
2. ¿Auth con Supabase Auth o externo?
3. ¿Empezamos con un sitio o multi-sitio desde el inicio?
4. ¿Datos de prueba realistas o mínimos?

---

**Responde "Entendido" y hazme las preguntas de clarificación, o "Comenzar" para iniciar con el setup del proyecto.**

