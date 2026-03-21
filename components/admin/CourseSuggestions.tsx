'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Suggestion {
  id: string
  title: string
  url: string
  description: string | null
  category: string | null
  status: string
  created_at: string
  profiles: { full_name: string } | null
}

export default function CourseSuggestions({ initialSuggestions }: { initialSuggestions: Suggestion[] }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const supabase = createClient()
  const router = useRouter()

  const filtered = filter === 'all' ? suggestions : suggestions.filter(s => s.status === filter)

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    await supabase.from('course_suggestions').update({ status }).eq('id', id)
    router.refresh()
  }

  async function addToCourses(suggestion: Suggestion) {
    await supabase.from('courses').insert({
      title: suggestion.title,
      organization: 'Sugerido por el equipo',
      description: suggestion.description,
      url: suggestion.url,
      category: ['fundamentos','prompting','productividad','vibecoding','agentes'].includes(suggestion.category ?? '')
        ? suggestion.category
        : 'fundamentos',
      is_active: true,
    })
    await updateStatus(suggestion.id, 'approved')
  }

  const statusBadge: Record<string, string> = {
    pending:  'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-600 border-red-200',
  }
  const statusLabel: Record<string, string> = {
    pending:  'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => {
          const count = f === 'all' ? suggestions.length : suggestions.filter(s => s.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-xs font-black uppercase tracking-widest border-[1.5px] transition-all
                ${filter === f ? 'bg-toyota-red text-white border-toyota-red' : 'bg-white text-gray-500 border-gray-200 hover:border-toyota-red hover:text-toyota-red'}`}>
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'approved' ? 'Aprobadas' : 'Rechazadas'}
              {' '}({count})
            </button>
          )
        })}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm font-semibold">No hay sugerencias {filter !== 'all' ? `con estado "${statusLabel[filter]}"` : ''}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-black">{s.title}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusBadge[s.status]}`}>
                      {statusLabel[s.status]}
                    </span>
                    {s.category && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        {s.category}
                      </span>
                    )}
                  </div>
                  {s.description && <p className="text-xs text-gray-400 leading-relaxed mb-2">{s.description}</p>}
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={s.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-toyota-red font-bold hover:underline truncate max-w-xs">
                      {s.url} ↗
                    </a>
                    <span className="text-xs text-gray-400">
                      por <strong className="text-gray-600">{s.profiles?.full_name ?? 'Usuario'}</strong>
                      {' · '}{new Date(s.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>

                {s.status === 'pending' && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => addToCourses(s)}
                      className="px-3 py-2 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded hover:bg-green-700 transition-all whitespace-nowrap">
                      ✓ Aprobar y agregar
                    </button>
                    <button onClick={() => updateStatus(s.id, 'rejected')}
                      className="px-3 py-2 bg-white text-red-500 border border-red-200 text-xs font-black uppercase tracking-widest rounded hover:bg-red-50 transition-all whitespace-nowrap">
                      ✕ Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
