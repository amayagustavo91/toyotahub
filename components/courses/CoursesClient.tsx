'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Course, CourseCategory, ProgressStatus, CATEGORY_META } from '@/lib/types'
import { STATUS_COLOR } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const ALL_CATS = ['all', ...Object.keys(CATEGORY_META)] as const

export default function CoursesClient({ courses, progressMap, userId }:
  { courses: Course[]; progressMap: Record<string, ProgressStatus>; userId: string }) {
  const [filter, setFilter] = useState('all')
  const [localProg, setLocalProg] = useState(progressMap)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const filtered = filter === 'all' ? courses : courses.filter(c => c.category === filter)

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

  return (
    <>
      <div className="flex gap-2 flex-wrap mb-6">
        {ALL_CATS.map(cat => {
          const meta = cat === 'all' ? null : CATEGORY_META[cat as CourseCategory]
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-widest border-[1.5px] transition-all
                ${filter === cat ? 'bg-toyota-red text-white border-toyota-red' : 'bg-white text-toyota-muted-2 border-black/15 hover:border-toyota-red hover:text-toyota-red'}`}>
              {cat === 'all' ? 'Todos' : `${meta!.icon} ${meta!.label}`}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(course => {
          const status = localProg[course.id] ?? 'not_started'
          const meta = CATEGORY_META[course.category]
          return (
            <div key={course.id}
              className={`bg-white border rounded-toyota-lg p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden
                ${status === 'completed' ? 'border-green-200' : status === 'in_progress' ? 'border-amber-200' : 'border-black/8'}`}>
              {status === 'completed' && <div className="absolute top-0 right-0 w-7 h-7 bg-green-600 text-white flex items-center justify-center text-xs font-black rounded-bl-lg">✓</div>}
              {status === 'in_progress' && <div className="absolute top-0 right-0 w-7 h-7 bg-amber-500 text-white flex items-center justify-center text-xs font-black rounded-bl-lg">→</div>}
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded w-fit"
                style={{ background: meta.dim, color: meta.color }}>
                {meta.icon} {meta.label}
              </span>
              <div>
                <h3 className="text-sm font-black leading-snug">{course.title}</h3>
                <p className="text-xs text-toyota-muted font-bold mt-0.5">{course.organization}</p>
              </div>
              {course.description && <p className="text-xs text-toyota-muted-2 leading-relaxed flex-1">{course.description}</p>}
              <div className="flex gap-3 text-[11px] text-toyota-muted font-bold flex-wrap">
                {course.duration_label && <span>⏱ {course.duration_label}</span>}
                {course.language && <span>🌐 {course.language}</span>}
                {course.has_certificate && <span>🎓 Certificado</span>}
              </div>
              <div className="flex gap-2 mt-1">
                <a href={course.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-2 text-center text-xs font-black uppercase tracking-wide bg-toyota-surface border border-black/15 rounded-toyota text-toyota-muted-2 hover:border-toyota-red hover:text-toyota-red transition-all">
                  Ver curso ↗
                </a>
                <select value={status} onChange={e => updateStatus(course.id, e.target.value as ProgressStatus)}
                  className={`px-2.5 py-2 rounded-toyota border-[1.5px] text-[11px] font-black uppercase tracking-wide cursor-pointer outline-none transition-all ${STATUS_COLOR[status]}`}>
                  <option value="not_started">Sin iniciar</option>
                  <option value="in_progress">En progreso</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
