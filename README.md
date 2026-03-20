# Toyota IA Training Hub

Plataforma de capacitacion en IA para el equipo de Control de Produccion de Toyota Argentina.

## Stack
- Next.js 14
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Realtime)
- TypeScript

## Setup en Vercel

1. Subir este repositorio a GitHub
2. Importar en vercel.com
3. Agregar variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Variables de entorno

Crear `.env.local` con:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Base de datos

Ejecutar en Supabase SQL Editor en este orden:
1. schema.sql
2. rls.sql  
3. seed.sql
