# Prompt para crear módulo SC Lead en VS Code

## Contexto
Estoy construyendo un dashboard web de operaciones para **Celerity Clinical Research Group**, un **site network** especializado en investigación clínica en Latinoamérica. Celerity opera sitios propios en Chile, Perú y México, además de una red de sitios asociados en la región.

Necesito crear el módulo para el rol de **Study Coordinator Lead**, quien es responsable de:
- Liderar los equipos de Study Coordinators y Regulatory Specialists
- Asegurar la ejecución óptima de estudios clínicos en los sitios
- Garantizar cumplimiento de ICH-GCP, normativas regulatorias y compromisos con sponsors
- Gestionar el proceso de start-up y activación de estudios
- Supervisar métricas de reclutamiento, seguridad y calidad operativa

## Stack Tecnológico
- Frontend: React + TypeScript + Tailwind CSS
- Backend/DB: Supabase
- Componentes UI: shadcn/ui

## Requerimientos del Módulo

### 1. Estructura de Base de Datos (Supabase)

Crear las siguientes tablas:

\`\`\`sql
-- Definiciones de KPIs (estática)
CREATE TABLE sc_lead_kpi_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_key VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  data_type VARCHAR(20) NOT NULL, -- percentage, count, number, decimal
  target_value DECIMAL,
  target_operator VARCHAR(10), -- <=, >=, =, range, info
  unit VARCHAR(20),
  input_frequency VARCHAR(20),
  sort_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Valores de KPIs por período
CREATE TABLE sc_lead_kpi_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES sc_lead_kpi_definitions(id),
  site_id UUID REFERENCES sites(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value DECIMAL,
  status VARCHAR(10), -- on_target, warning, critical
  notes TEXT,
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Registro semanal (input principal)
CREATE TABLE sc_lead_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  week_number INTEGER NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  -- Reclutamiento
  patients_screened INTEGER DEFAULT 0,
  patients_randomized INTEGER DEFAULT 0,
  screen_failures INTEGER DEFAULT 0,
  monthly_target INTEGER DEFAULT 0,
  monthly_accumulated INTEGER DEFAULT 0,
  weekly_projection INTEGER DEFAULT 0,
  weekly_actual INTEGER DEFAULT 0,
  -- Visitas
  visits_planned INTEGER DEFAULT 0,
  visits_completed INTEGER DEFAULT 0,
  visits_in_window INTEGER DEFAULT 0,
  visits_procedures_complete INTEGER DEFAULT 0,
  patients_ongoing_start INTEGER DEFAULT 0,
  patients_lost INTEGER DEFAULT 0,
  -- Seguridad
  saes_identified INTEGER DEFAULT 0,
  saes_reported_24h INTEGER DEFAULT 0,
  major_deviations INTEGER DEFAULT 0,
  total_deviations_month INTEGER DEFAULT 0,
  total_procedures_month INTEGER DEFAULT 0,
  major_deviations_month INTEGER DEFAULT 0,
  open_capas INTEGER DEFAULT 0,
  -- Eficiencia
  total_coordinators INTEGER DEFAULT 0,
  total_studies INTEGER DEFAULT 0,
  total_patients_ongoing INTEGER DEFAULT 0,
  mv_siv_planned INTEGER DEFAULT 0,
  mv_siv_participated INTEGER DEFAULT 0,
  -- Meta
  reported_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, week_number, period_start)
);

-- Action Items de Monitoring Visits
CREATE TABLE sc_lead_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  study_id UUID REFERENCES studies(id),
  mv_date DATE,
  description TEXT NOT NULL,
  category VARCHAR(30), -- Documentación, eCRF/EDC, Training, Consentimientos, Regulatorio, Farmacia, Lab, Proceso, Otro
  severity VARCHAR(20), -- Major, Minor, Observación
  responsible VARCHAR(100),
  due_date DATE,
  closed_date DATE,
  status VARCHAR(20) DEFAULT 'Abierto', -- Abierto, En Progreso, Cerrado
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacto de pacientes (tiempo de respuesta)
CREATE TABLE sc_lead_patient_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  study_id UUID REFERENCES studies(id),
  referral_date DATE NOT NULL,
  contact_date DATE,
  referral_source VARCHAR(50), -- Derivación médica, Base de datos, Publicidad, Referido, Otro
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Start-up tracker (estudios en activación)
CREATE TABLE sc_lead_startup_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  study_name VARCHAR(100) NOT NULL,
  sponsor VARCHAR(100),
  ec_submission_date DATE,
  ec_approval_date DATE,
  last_approval_date DATE,
  fpfv_date DATE,
  required_resubmission BOOLEAN DEFAULT false,
  status VARCHAR(30), -- En Sometimiento, Aprobación Pendiente, Aprobado, En Activación, FPFV Logrado, Suspendido
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Consultas CRA/Sponsor (responsiveness)
CREATE TABLE sc_lead_sponsor_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  study_id UUID REFERENCES studies(id),
  received_date TIMESTAMPTZ NOT NULL,
  response_date TIMESTAMPTZ,
  origin VARCHAR(30), -- CRA, Sponsor, CRO, Comité Ética, Autoridad Regulatoria
  description TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Roster del equipo
CREATE TABLE sc_lead_team_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50), -- SC Senior, SC II, SC I, CTA, Regulatory Specialist II, Regulatory Specialist I
  hire_date DATE,
  gcp_current BOOLEAN DEFAULT false,
  gcp_expiry_date DATE,
  performance_rating VARCHAR(30), -- Excepcional, Satisfactorio, Necesita Mejora, No Evaluado
  workload_score DECIMAL(2,1), -- 1.0 a 5.0
  studies_assigned INTEGER DEFAULT 0,
  patients_assigned INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Movimientos de personal
CREATE TABLE sc_lead_team_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  year INTEGER NOT NULL,
  headcount_start INTEGER DEFAULT 0,
  hires INTEGER DEFAULT 0,
  departures INTEGER DEFAULT 0,
  headcount_current INTEGER DEFAULT 0,
  trainings_planned INTEGER DEFAULT 0,
  trainings_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, year)
);

-- Evaluaciones de sponsors (trimestral)
CREATE TABLE sc_lead_sponsor_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  quarter VARCHAR(10), -- Q1 2025, Q2 2025, etc.
  sponsor VARCHAR(100),
  study_name VARCHAR(100),
  performance_score DECIMAL(2,1), -- 1.0 a 5.0
  nps_score INTEGER, -- 0 a 10
  comments TEXT,
  evaluation_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contingencias operativas
CREATE TABLE sc_lead_contingencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  study_id UUID REFERENCES studies(id),
  report_date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20), -- Crítica, Alta, Media, Baja
  resolution_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Readiness checklist
CREATE TABLE sc_lead_audit_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  period VARCHAR(20), -- Ene 2025, Feb 2025, etc.
  isf_complete BOOLEAN,
  regulatory_current BOOLEAN,
  delegation_logs_current BOOLEAN,
  consents_verified BOOLEAN,
  source_docs_complete BOOLEAN,
  saes_documented BOOLEAN,
  deviations_documented BOOLEAN,
  etmf_current BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, period)
);

-- Índices para performance
CREATE INDEX idx_weekly_reports_site_period ON sc_lead_weekly_reports(site_id, period_start);
CREATE INDEX idx_action_items_status ON sc_lead_action_items(status, site_id);
CREATE INDEX idx_startup_tracker_status ON sc_lead_startup_tracker(status, site_id);
CREATE INDEX idx_patient_contacts_dates ON sc_lead_patient_contacts(referral_date, contact_date);
\`\`\`

### 2. Componentes React Requeridos

\`\`\`
src/
├── modules/
│   └── sc-lead/
│       ├── components/
│       │   ├── SCLeadDashboard.tsx      # Vista principal con scorecard
│       │   ├── WeeklyReportForm.tsx     # Formulario de registro semanal
│       │   ├── ActionItemsTable.tsx     # Tabla de action items con filtros
│       │   ├── StartupTracker.tsx       # Vista de estudios en start-up
│       │   ├── TeamRoster.tsx           # Gestión del equipo
│       │   ├── KPICard.tsx              # Card individual de KPI
│       │   ├── CategorySection.tsx      # Sección colapsable por categoría
│       │   ├── TrendChart.tsx           # Gráfico de tendencia histórica
│       │   └── StatusBadge.tsx          # Badge de estado (✅⚠️❌)
│       ├── hooks/
│       │   ├── useKPIs.ts               # Hook para cargar/calcular KPIs
│       │   ├── useWeeklyReport.ts       # Hook para registro semanal
│       │   └── useActionItems.ts        # Hook para action items
│       ├── types/
│       │   └── sc-lead.types.ts         # Tipos TypeScript
│       ├── utils/
│       │   └── kpi-calculations.ts      # Funciones de cálculo
│       └── constants/
│           └── kpi-definitions.ts       # Definiciones de KPIs
\`\`\`

### 3. Tipos TypeScript

\`\`\`typescript
// types/sc-lead.types.ts

export type KPIStatus = 'on_target' | 'warning' | 'critical' | 'info' | 'pending';

export type KPICategory = 
  | 'recruitment' 
  | 'execution' 
  | 'safety' 
  | 'monitoring' 
  | 'startup' 
  | 'sponsor' 
  | 'team' 
  | 'efficiency';

export type KPIOperator = '<=' | '>=' | '=' | 'range' | 'info';

export interface KPIDefinition {
  id: string;
  kpi_key: string;
  label: string;
  category: KPICategory;
  data_type: 'percentage' | 'count' | 'number' | 'decimal';
  target_value: number | string | null;
  target_operator: KPIOperator;
  unit: string;
  input_frequency: string;
  sort_order: number;
}

export interface KPIValue {
  id: string;
  kpi_id: string;
  site_id: string;
  period_start: string;
  period_end: string;
  value: number | null;
  status: KPIStatus;
  notes?: string;
}

export interface WeeklyReport {
  id: string;
  site_id: string;
  week_number: number;
  period_start: string;
  period_end: string;
  // ... campos de datos
}

export interface ActionItem {
  id: string;
  site_id: string;
  study_id?: string;
  mv_date?: string;
  description: string;
  category: string;
  severity: 'Major' | 'Minor' | 'Observación';
  responsible: string;
  due_date: string;
  closed_date?: string;
  status: 'Abierto' | 'En Progreso' | 'Cerrado';
  days_open?: number;
}

export interface CategoryConfig {
  key: KPICategory;
  label: string;
  icon: string;
  color: string;
}
\`\`\`

### 4. Lógica de Cálculo de Estados

\`\`\`typescript
// utils/kpi-calculations.ts

export function calculateKPIStatus(
  value: number | null, 
  target: number | string | null, 
  operator: KPIOperator
): KPIStatus {
  if (value === null || value === undefined) return 'pending';
  if (operator === 'info' || target === null) return 'info';
  
  const numTarget = typeof target === 'number' ? target : parseFloat(target);
  
  switch (operator) {
    case '<=':
      return value <= numTarget ? 'on_target' : 'critical';
    case '>=':
      return value >= numTarget ? 'on_target' : 'critical';
    case '=':
      return value === numTarget ? 'on_target' : 'critical';
    case 'range':
      if (typeof target === 'string' && target.includes('-')) {
        const [min, max] = target.split('-').map(Number);
        if (value >= min && value <= max) return 'on_target';
        if (value < min * 0.8 || value > max * 1.2) return 'critical';
        return 'warning';
      }
      return 'warning';
    default:
      return 'pending';
  }
}

export function getStatusColor(status: KPIStatus): string {
  const colors = {
    on_target: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-gray-100 text-gray-500 border-gray-200'
  };
  return colors[status];
}

export function getStatusIcon(status: KPIStatus): string {
  const icons = {
    on_target: '✅',
    warning: '⚠️',
    critical: '❌',
    info: 'ℹ️',
    pending: '⚪'
  };
  return icons[status];
}

// Cálculos específicos de KPIs
export function calculateScreenFailureRate(screened: number, failures: number): number | null {
  if (screened === 0) return null;
  return (failures / screened) * 100;
}

export function calculateConversionRate(screened: number, randomized: number): number | null {
  if (screened === 0) return null;
  return (randomized / screened) * 100;
}

export function calculateRetentionRate(startCount: number, lost: number): number | null {
  if (startCount === 0) return null;
  return ((startCount - lost) / startCount) * 100;
}

export function calculateDaysOpen(startDate: string, endDate?: string): number {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
\`\`\`

### 5. Configuración de Categorías

\`\`\`typescript
// constants/categories.ts

export const CATEGORIES: CategoryConfig[] = [
  { key: 'recruitment', label: 'Reclutamiento', icon: '🎯', color: 'indigo' },
  { key: 'execution', label: 'Ejecución de Visitas', icon: '📋', color: 'blue' },
  { key: 'safety', label: 'Seguridad y Compliance', icon: '⚠️', color: 'amber' },
  { key: 'monitoring', label: 'Monitoring Action Items', icon: '📝', color: 'purple' },
  { key: 'startup', label: 'Start-up y Regulatorio', icon: '🚀', color: 'cyan' },
  { key: 'sponsor', label: 'Satisfacción Patrocinadores', icon: '⭐', color: 'yellow' },
  { key: 'team', label: 'Gestión de Equipo', icon: '👥', color: 'emerald' },
  { key: 'efficiency', label: 'Eficiencia Operativa', icon: '⚙️', color: 'slate' }
];
\`\`\`

### 6. Componente Principal (Ejemplo)

\`\`\`tsx
// components/SCLeadDashboard.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useKPIs } from '../hooks/useKPIs';
import { KPICard } from './KPICard';
import { CategorySection } from './CategorySection';
import { CATEGORIES } from '../constants/categories';

export function SCLeadDashboard() {
  const { kpis, summary, isLoading } = useKPIs();
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard SC Lead
          </h1>
          <p className="text-gray-500">
            Study Coordinator Lead - Celerity Clinical Research
          </p>
        </div>
        <PeriodSelector value={selectedPeriod} onChange={setSelectedPeriod} />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard 
          title="KPIs en Meta" 
          value={summary.onTarget} 
          icon="✅" 
          color="green" 
        />
        <SummaryCard 
          title="KPIs en Alerta" 
          value={summary.warning} 
          icon="⚠️" 
          color="yellow" 
        />
        <SummaryCard 
          title="KPIs Críticos" 
          value={summary.critical} 
          icon="❌" 
          color="red" 
        />
        <SummaryCard 
          title="Total KPIs" 
          value={summary.total} 
          icon="📊" 
          color="blue" 
        />
      </div>

      {/* KPIs by Category */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key}>
              {cat.icon} {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-4">
          {CATEGORIES.map(category => (
            <CategorySection
              key={category.key}
              category={category}
              kpis={kpis.filter(k => k.category === category.key)}
            />
          ))}
        </TabsContent>

        {CATEGORIES.map(cat => (
          <TabsContent key={cat.key} value={cat.key}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {kpis
                .filter(k => k.category === cat.key)
                .map(kpi => (
                  <KPICard key={kpi.id} kpi={kpi} />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
\`\`\`

## Archivos Adjuntos

Ver archivo \`sc_lead_module_specs.json\` con los **39 KPIs** organizados en 8 categorías, incluyendo:
- ID técnico
- Key para base de datos
- Label para display
- Tipo de dato
- Meta/Target
- Operador de comparación
- Unidad
- Frecuencia de input
- Categoría

## Flujo de Usuario

1. **SC Lead** abre el módulo → Ve scorecard consolidado con todos los KPIs
2. **Semanalmente** completa el "Registro Semanal" (10-15 min máximo)
3. **Continuamente** actualiza Action Items según monitoring visits
4. **Mensualmente** revisa Audit Readiness y métricas de equipo
5. **Trimestralmente** registra evaluaciones de sponsors
6. Los KPIs se calculan automáticamente y se muestran en el scorecard
7. **COO** puede ver el scorecard consolidado en su dashboard ejecutivo

## Diseño Visual

- Colores para estados:
  - ✅ Verde (#C6EFCE / green-100): En meta
  - ⚠️ Amarillo (#FFEB9C / yellow-100): Alerta
  - ❌ Rojo (#FFC7CE / red-100): Crítico
  - ℹ️ Azul (#DDEBF7 / blue-100): Informativo
  - ⚪ Gris (#F3F4F6 / gray-100): Pendiente
- Cards con shadow-sm y rounded-lg
- Iconos emoji para categorías (consistente con Excel)
- Responsive: desktop, tablet y mobile
- Dark mode support opcional

## Consideraciones Adicionales

1. **Multi-sitio**: El sistema debe soportar múltiples sitios de Celerity (Santiago, Concepción, Lima, CDMX)
2. **Histórico**: Guardar histórico de KPIs para análisis de tendencias
3. **Permisos**: SC Lead solo ve sus sitios asignados; COO ve todos
4. **Exportación**: Permitir exportar scorecard a PDF/Excel
5. **Notificaciones**: Alertas cuando KPIs caen a estado crítico
