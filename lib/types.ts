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
  { num: 1, name: 'Fundamentos de IA', duration: 'Semanas 1-2', desc: 'Entender que es la IA, como funciona y por que importa en el entorno industrial. Base conceptual para todo el equipo.' },
  { num: 2, name: 'Productividad con IA', duration: 'Semanas 3-6', desc: 'Usar herramientas de IA en el trabajo diario: Copilot en Office y automatizacion de procesos con Power Automate.' },
]
