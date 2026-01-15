# Reglas del Proyecto CelerityOps

## Stack Tecnológico (NO MODIFICAR)

### Frameworks y Librerías Core
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript
- **Base de datos**: Supabase (PostgreSQL) - **OBLIGATORIO, NO CAMBIAR**
- **Autenticación**: Supabase Auth
- **Componentes UI**: shadcn/ui + Radix UI
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Formularios**: React Hook Form + Zod
- **Deploy**: Vercel

### Restricciones Absolutas
- NO cambiar Next.js por otro framework
- NO cambiar React por otra librería
- NO cambiar Supabase por otra base de datos
- NO cambiar Tailwind CSS por otro sistema de estilos
- NO agregar ORMs adicionales (usar cliente Supabase directamente)

## Flujo de Trabajo

### Commits y Control de Versiones
- Hacer commits frecuentes con mensajes descriptivos en español
- Usar convención: `tipo: descripción breve`
  - `fix:` corrección de errores
  - `feat:` nueva funcionalidad
  - `refactor:` mejoras de código sin cambiar funcionalidad
  - `style:` cambios de estilos/UI
  - `db:` cambios en base de datos
- Push a GitHub periódicamente (cada funcionalidad completada o grupo de fixes)

### Resolución de Problemas
- Abordar un problema a la vez
- Probar cada cambio antes de pasar al siguiente
- No hacer refactorizaciones masivas sin aprobación
- Mantener retrocompatibilidad cuando sea posible

## Base de Datos (Supabase)

### REGLA FUNDAMENTAL: Supabase es la Fuente de Verdad
- **Supabase ES la fuente de verdad** para toda la estructura de datos
- `lib/types/database.ts` debe REFLEJAR lo que existe en Supabase, no al revés
- Toda modificación en el frontend que involucre datos DEBE ir acompañada de cambios en Supabase
- NO crear tipos en TypeScript sin que la tabla/columna exista primero en Supabase

### Sincronización Frontend ↔ Supabase (OBLIGATORIO)
Cuando se modifique cualquier funcionalidad que involucre datos:
1. **PRIMERO** hacer el cambio en Supabase (crear tabla, agregar columna, etc.)
2. **SEGUNDO** actualizar `lib/types/database.ts` para reflejar el cambio
3. **TERCERO** implementar el cambio en el frontend
4. **CUARTO** documentar el cambio en el commit con prefijo `db:`

### Modificaciones de Schema
- Usar el MCP de Supabase para consultas y cambios cuando esté disponible
- Si el MCP no está disponible, usar scripts SQL en `.testing/` o Supabase Dashboard
- Variables de entorno disponibles:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Documentar cada cambio de schema en los commits
- Preferir migraciones incrementales sobre cambios destructivos

### Consultas
- Usar el cliente de Supabase (`@supabase/supabase-js`)
- Server Components: usar `lib/supabase/server.ts`
- Client Components: usar `lib/supabase/client.ts`
- Tipar todas las consultas con los tipos de `lib/types/database.ts`

## Estructura del Proyecto

```
app/
├── dashboard/
│   ├── coo/                    # COO - vista ejecutiva consolidada
│   ├── sc-lead/                # SC Lead - scorecard 28 KPIs
│   │   ├── weekly-report/      # Registro semanal
│   │   ├── action-items/       # Action items monitoreo
│   │   ├── startup/            # Start-up tracker
│   │   ├── audit-readiness/    # Audit readiness
│   │   ├── team/               # Roster equipo
│   │   └── sponsor-evals/      # Evaluaciones sponsor
│   ├── site-lead/              # Site Lead - gestión de sitio
│   ├── coordinator/            # Study Coordinator - enrolamiento
│   │   ├── enrollments/
│   │   └── screenings/
│   ├── data-entry/             # Data Entry - queries
│   │   └── queries/
│   ├── qa/                     # QA Manager - calidad
│   └── regulatory/             # Regulatory - sometimientos
├── login/
└── register/

components/
├── dashboard/         # Componentes de dashboard por rol
│   ├── coo/
│   ├── sc-lead/
│   ├── site-lead/
│   └── qa/
├── forms/            # Formularios (enrollments, screenings, queries)
├── layout/           # Layout components (sidebar, header)
└── ui/               # shadcn/ui components (22 archivos)

lib/
├── supabase/         # Cliente Supabase (server.ts, client.ts)
├── hooks/            # Custom hooks (use-auth.ts)
├── types/            # TypeScript types (database.ts - refleja Supabase)
└── utils.ts          # Utilidades (cn)
```

## Convenciones de Código

### Componentes
- Server Components por defecto
- "use client" solo cuando sea necesario (interactividad, hooks de browser)
- Nombres en PascalCase para componentes
- Un componente por archivo

### TypeScript
- Tipar todo explícitamente
- Evitar `any` - usar `unknown` si es necesario
- Interfaces para objetos, types para uniones/primitivos

### Estilos
- Usar clases de Tailwind
- Componentes de shadcn/ui para UI consistente
- Evitar CSS custom salvo casos excepcionales

## Roles de Usuario (7 roles en Supabase)

| Rol | Ruta | Permisos |
|-----|------|----------|
| COO | `/dashboard/coo` | Vista ejecutiva, todos los sitios |
| SC Lead | `/dashboard/sc-lead` | Scorecard KPIs, gestión equipo, startup tracker |
| Site Lead | `/dashboard/site-lead` | Gestión de un sitio específico |
| Study Coordinator | `/dashboard/coordinator` | Enrolamiento, screenings |
| Data Entry Specialist | `/dashboard/data-entry` | Entrada de datos, queries |
| QA Manager | `/dashboard/qa` | Control de calidad |
| Regulatory Specialist | `/dashboard/regulatory` | Cumplimiento regulatorio |

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=<url-del-proyecto>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## Checklist Antes de Cada Push

- [ ] Código compila sin errores (`pnpm build`)
- [ ] No hay errores de TypeScript
- [ ] Cambios de DB documentados
- [ ] Commit message descriptivo

