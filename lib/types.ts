export type Role = 'user' | 'admin'
export type CourseCategory = 'fundamentos' | 'prompting' | 'productividad' | 'vibecoding' | 'agentes'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface Profile {
  id: string; full_name: string; role: Role; area: string | null; created_at: string
}
export interface Course {
  id: string; title: string; organization: string; description: string | null
  url: string; category: CourseCategory; duration_label: string | null
  language: string | null; has_certificate: boolean
  phase: number | null; order_in_phase: number | null; is_active: boolean
}
export interface UserProgress {
  id: string; user_id: string; course_id: string; status: ProgressStatus
  started_at: string | null; completed_at: string | null; updated_at: string
}

export const CATEGORY_META: Record<CourseCategory, { label: string; icon: string; color: string; dim: string }> = {
  fundamentos:   { label: 'Fundamentos de IA',  icon: '🧠', color: '#1d4ed8', dim: 'rgba(29,78,216,0.10)'  },
  productividad: { label: 'Productividad',       icon: '⚡', color: '#16a34a', dim: 'rgba(22,163,74,0.10)'  },
  vibecoding:    { label: 'Vibe Coding',         icon: '💻', color: '#c2410c', dim: 'rgba(194,65,12,0.10)'  },
  agentes:       { label: 'Agentes de IA',       icon: '🤖', color: '#6d28d9', dim: 'rgba(109,40,217,0.10)' },
  prompting:     { label: 'Prompting avanzado',  icon: '✍️', color: '#EB0A1E', dim: 'rgba(235,10,30,0.08)'  },
}
export const PLAN_PHASES = [
  { num: 1, name: 'Fundamentos de IA',            duration: 'Semanas 1-4',   desc: 'Entender que es la IA y por que importa en el entorno industrial.' },
  { num: 2, name: 'Herramientas de IA generativa', duration: 'Semanas 5-8',   desc: 'Usar asistentes de IA para tareas cotidianas sin codigo.' },
  { num: 3, name: 'Prompting y Vibe Coding',       duration: 'Semanas 9-10',  desc: 'Instrucciones precisas y primeras herramientas propias sin codigo.' },
  { num: 4, name: 'Agentes y automatizacion',      duration: 'Semanas 11-12', desc: 'Flujos automatizados y agentes autonomos.' },
]
