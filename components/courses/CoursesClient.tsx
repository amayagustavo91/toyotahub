'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Course, CourseCategory, ProgressStatus, CATEGORY_META } from '@/lib/types'
import { STATUS_COLOR } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const ALL_CATS = ['all', 'recomendados', ...Object.keys(CATEGORY_META)] as const

export default function CoursesClient({ courses, progressMap, userId, myRecs, recsByCourse }:
  { courses: Course[]; progressMap: Record<string, ProgressStatus>; userId: string; myRecs: string[]; recsByCourse: Record<string, string[]> }) {
  const [filter, setFilter] = useState('all')
  const [localProg, setLocalProg] = useState(progressMap)
  const [localRecs, setLocalRecs] = useState<Set<string>>(new Set(myRecs))
  const [localRecsByCourse, setLocalRecsByCourse] = useState(recsByCourse)
  const [showSuggest, setShowSuggest] = useState(false)
  const [suggest, setSuggest] = useState({ title: '', url: '', description: '', category: 'fundamentos', customCategory: '' })
  const [suggestSent, setSuggestSent] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const filtered = filter === 'all' ? courses
    : filter === 'recomendados' ? courses.filter(c => (localRecsByCourse[c.id]?.length ?? 0) > 0)
    : courses.filter(c => c.category === filter)

  async function updateStatus(courseId: string, status: ProgressStatus) {
    setLocalProg(prev => ({ ...prev, [courseId]: status }))
    const now = new Date().toISOString()
    await supabase.from('user_progress').upsert({
      user_id: userId, course_id: courseId, status,
      started_at: status !== 'not_started' ? now : null,
      completed_at: status === 'completed' ? now : null,
      updated_at: now,
    }, { onConflict: 'user_id,course_id' })
    startTransition(() => router.refresh())
  }

  async function toggleRecommend(courseId: string) {
    const isRec = localRecs.has(courseId)
    const newRecs = new Set(localRecs)
    if (isRec) {
      newRecs.delete(courseId)
      setLocalRecs(newRecs)
      setLocalRecsByCourse(prev => ({
        ...prev,
        [courseId]: (prev[courseId] ?? []).filter(n => n !== 'Vos')
      }))
      await supabase.from('course_recommendations').delete()
        .eq('user_id', userId).eq('course_id', courseId)
    } else {
      newRecs.add(courseId)
      setLocalRecs(newRecs)
      setLocalRecsByCourse(prev => ({
        ...prev,
        [courseId]: [...(prev[courseId] ?? []), 'Vos']
      }))
      await supabase.from('course_recommendations').insert({ user_id: userId, course_id: courseId })
    }
    startTransition(() => router.refresh())
  }

  async function submitSuggestion() {
    if (!suggest.title || !suggest.url) return
    await supabase.from('course_suggestions').insert({
      user_id: userId,
      title: suggest.title,
      url: suggest.url,
      description: suggest.description,
      category: suggest.category === 'otros' ? (suggest.customCategory || 'otros') : suggest.category,
    })
    setSuggestSent(true)
    setSuggest({ title: '', url: '', description: '', category: 'fundamentos', customCategory: '' })
    setTimeout(() => { setSuggestSent(false); setShowSuggest(false) }, 3000)
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {ALL_CATS.map(cat => {
          const isAll = cat === 'all'
          const isRec = cat === 'recomendados'
          const meta = (!isAll && !isRec) ? CATEGORY_META[cat as CourseCategory] : null
          const active = filter === cat
          const recCount = isRec ? courses.filter(c => (localRecsByCourse[c.id]?.length ?? 0) > 0).length : 0
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest border-[1.5px] transition-all
                ${active ? 'bg-toyota-red text-white border-toyota-red' : 'bg-white text-gray-600 border-gray-200 hover:border-toyota-red hover:text-toyota-red'}`}>
              {isAll ? 'Todos' : isRec ? `⭐ Recomendados ${recCount > 0 ? `(${recCount})` : ''}` : `${meta!.icon} ${meta!.label}`}
            </button>
          )
        })}
      </div>

      {/* Recomendados destacados */}
      {filter === 'all' && Object.keys(localRecsByCourse).filter(id => (localRecsByCourse[id]?.length ?? 0) > 0).length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3 text-xs font-black uppercase tracking-widest text-gray-400">
            <span>⭐ Recomendados por el equipo</span>
            <div className="flex-1 h-px bg-gray-100"/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.filter(c => (localRecsByCourse[c.id]?.length ?? 0) > 0).map(course => {
              const meta = CATEGORY_META[course.category]
              const recommenders = localRecsByCourse[course.id] ?? []
              return (
                <div key={course.id} className="bg-white border-2 border-yellow-300 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-400"/>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">
                      Recomendado por {recommenders.slice(0, 2).join(', ')}{recommenders.length > 2 ? ` y ${recommenders.length - 2} mas` : ''}
                    </span>
                  </div>
                  <h3 className="text-sm font-black leading-snug mb-1">{course.title}</h3>
                  <p className="text-xs text-gray-400 font-bold">{course.organization}</p>
                  <a href={course.url} target="_blank" rel="noopener noreferrer"
                    className="mt-3 block py-2 text-center text-xs font-black uppercase tracking-wide bg-gray-50 border border-gray-200 rounded text-gray-500 hover:border-toyota-red hover:text-toyota-red transition-all">
                    Ver curso ↗
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grid principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(course => {
          const status = localProg[course.id] ?? 'not_started'
          const meta = CATEGORY_META[course.category]
          const isRec = localRecs.has(course.id)
          const recommenders = localRecsByCourse[course.id] ?? []
          return (
            <div key={course.id}
              className={`bg-white border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden
                ${status === 'completed' ? 'border-green-200' : status === 'in_progress' ? 'border-amber-200' : 'border-gray-100'}`}>

              {status === 'completed' && <div className="absolute top-0 right-0 w-7 h-7 bg-green-600 text-white flex items-center justify-center text-xs font-black rounded-bl-lg">✓</div>}
              {status === 'in_progress' && <div className="absolute top-0 right-0 w-7 h-7 bg-amber-500 text-white flex items-center justify-center text-xs font-black rounded-bl-lg">→</div>}

              <div className="flex items-start justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit"
                  style={{ background: meta.dim, color: meta.color }}>{meta.icon} {meta.label}</span>
                {recommenders.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                    ⭐ {recommenders.length} rec.
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-black leading-snug">{course.title}</h3>
                <p className="text-xs text-gray-400 font-bold mt-0.5">{course.organization}</p>
              </div>

              {course.description && <p className="text-xs text-gray-500 leading-relaxed flex-1">{course.description}</p>}

              {recommenders.length > 0 && (
                <p className="text-[11px] text-yellow-700 font-semibold">
                  ⭐ Recomendado por: {recommenders.slice(0, 3).join(', ')}{recommenders.length > 3 ? ` y ${recommenders.length - 3} mas` : ''}
                </p>
              )}

              <div className="flex gap-3 text-[11px] text-gray-400 font-bold flex-wrap">
                {course.duration_label && <span>⏱ {course.duration_label}</span>}
                {course.language && <span>🌐 {course.language}</span>}
                {course.has_certificate && <span>🎓 Certificado</span>}
              </div>

              <div className="flex gap-2 mt-1">
                <a href={course.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 text-center text-xs font-black uppercase tracking-wide bg-gray-50 border border-gray-200 rounded text-gray-500 hover:border-toyota-red hover:text-toyota-red transition-all">
                  Ver curso ↗
                </a>
                <select value={status} onChange={e => updateStatus(course.id, e.target.value as ProgressStatus)}
                  className={`px-2.5 py-2 rounded border-[1.5px] text-[11px] font-black uppercase tracking-wide cursor-pointer outline-none transition-all ${STATUS_COLOR[status]}`}>
                  <option value="not_started">Sin iniciar</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                </select>
                <button onClick={() => toggleRecommend(course.id)}
                  className={`px-3 py-2 rounded border-[1.5px] text-[11px] font-black transition-all
                    ${isRec ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-yellow-300 hover:text-yellow-600'}`}>
                  {isRec ? '⭐' : '☆'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sugerir curso */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-black">Encontraste un curso util?</div>
            <div className="text-xs text-gray-400 font-semibold">Sugerilo al equipo y el admin lo puede agregar a la biblioteca</div>
          </div>
          <button onClick={() => setShowSuggest(!showSuggest)}
            className="px-4 py-2 bg-toyota-red text-white text-xs font-black uppercase tracking-widest rounded transition-all hover:bg-red-700">
            + Sugerir curso
          </button>
        </div>

        {showSuggest && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
            {suggestSent ? (
              <div className="text-center py-4">
                <div className="text-green-600 font-black text-lg mb-1">Sugerencia enviada</div>
                <div className="text-xs text-gray-400">El admin va a revisar tu sugerencia</div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Nombre del curso *</label>
                  <input type="text" value={suggest.title} onChange={e => setSuggest(p => ({...p, title: e.target.value}))}
                    placeholder="Ej: Automatizacion con Zapier" className="input-field"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Link del curso *</label>
                  <input type="url" value={suggest.url} onChange={e => setSuggest(p => ({...p, url: e.target.value}))}
                    placeholder="https://..." className="input-field"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Descripcion breve</label>
                  <input type="text" value={suggest.description} onChange={e => setSuggest(p => ({...p, description: e.target.value}))}
                    placeholder="De que trata el curso" className="input-field"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Categoria</label>
                  <select value={suggest.category} onChange={e => setSuggest(p => ({...p, category: e.target.value}))}
                    className="input-field">
                    <option value="fundamentos">Fundamentos de IA</option>
                    <option value="productividad">Productividad</option>
                    <option value="prompting">Prompting avanzado</option>
                    <option value="vibecoding">Vibe Coding</option>
                    <option value="agentes">Agentes de IA</option>
                    <option value="otros">Otros / Nueva categoria</option>
                  </select>
                  {suggest.category === 'otros' && (
                    <input type="text" value={suggest.customCategory}
                      onChange={e => setSuggest(p => ({...p, customCategory: e.target.value}))}
                      placeholder="Escribi el nombre de la nueva categoria"
                      className="input-field mt-2"/>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowSuggest(false)}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-400 border border-gray-200 rounded hover:border-gray-300 transition-all">
                    Cancelar
                  </button>
                  <button onClick={submitSuggestion} disabled={!suggest.title || !suggest.url}
                    className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-toyota-red text-white rounded hover:bg-red-700 disabled:opacity-50 transition-all">
                    Enviar sugerencia
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
