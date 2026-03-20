import { ProgressStatus } from './types'
export const initials = (name: string) => name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
export const formatDate = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'}) : '-'
export const pct = (done: number, total: number) => total ? Math.round((done/total)*100) : 0
export const STATUS_COLOR: Record<ProgressStatus, string> = {
  not_started: 'text-gray-400 border-gray-200 bg-white',
  in_progress: 'text-amber-700 border-amber-300 bg-amber-50',
  completed:   'text-green-700 border-green-300 bg-green-50',
}
