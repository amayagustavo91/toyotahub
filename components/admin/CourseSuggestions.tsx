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
  const [suggestions, setSuggestions] = useState(initialSuggestions.filter(s => s.status === 'pending'))
  const supabase = createClient()
  const router = useRouter()

  async function addToCourses(suggestion: Suggestion) {
    const validCategories = ['fundamentos', 'prompting', 'productividad', 'vibecoding', 'agentes']
    const category = validCategories.includes(suggestion.category ?? '')
      ? suggestion.category
      : 'fundamentos'

    const { error } = await supabase.from('courses').insert({
      title: suggestion.title,
      organization: 'Sugerido por el equipo',
      description: suggestion.description,
      url: suggestion.url,
      category: category,
      is_active: true,
    })

    if (!error) {
      await supabase.from('course_suggestions').update({ status: 'approved' }).eq('id', suggestion.id)
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
      router.refresh()
    } else {
      alert('Error al agregar el curso: ' + error.message)
    }
  }

  async function updateStatus(id: string, status: 'rejected') {
    await supabase.from('course_suggestions').update({ status }).eq('id', id)
    setSuggestions(prev => prev.filter(s => s.id !== id))
    router.refresh()
  }

  return (
    <div>
      {suggestions.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm font-semibold">No hay sugerencias pendientes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map(s => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-black">{s.title}</h3>
                    {s.category && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        {s.category}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{s.description}</p>
                  )}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
