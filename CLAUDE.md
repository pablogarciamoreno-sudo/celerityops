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

### Modificaciones de Schema
- Usar el MCP de Supabase para consultas y cambios
- Si el MCP no está disponible, usar las variables de entorno:
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
│   ├── coo/                    # Tú (Pablo) - vista consolidada de todo
│   ├── sc-lead-santiago/       # Lissette Escobar
│   ├── sc-lead-iquique/        # Ana Martínez
│   ├── qa-specialist/          # Armando Vergada
│   ├── ctms-data-governance/   # Matías Muñoz
│   └── vendor-manager/         # (Por definir)
├── login/
└── register/


components/
├── dashboard/         # Componentes de dashboard
├── forms/            # Formularios
├── layout/           # Layout components
└── ui/               # shadcn/ui components

lib/
├── supabase/         # Configuración Supabase
├── hooks/            # Custom hooks
├── types/            # TypeScript types
└── utils.ts          # Utilidades
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

## Roles de Usuario

| Rol | Ruta | Permisos |
|-----|------|----------|
| COO | `/dashboard/coo` | Vista ejecutiva, todos los sitios |
| Site Lead | `/dashboard/site-lead` | Gestión de un sitio específico |
| Study Coordinator | `/dashboard/coordinator` | Enrolamiento, screenings |
| Data Entry | `/dashboard/data-entry` | Entrada de datos, queries |
| QA Manager | `/dashboard/qa` | Control de calidad |
| Regulatory | `/dashboard/regulatory` | Cumplimiento regulatorio |

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

