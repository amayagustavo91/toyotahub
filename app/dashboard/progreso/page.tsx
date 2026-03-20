import { createClient } from '@/lib/supabase/server'
import { CATEGORY_META, CourseCategory } from '@/lib/types'
import { pct, formatDate } from '@/lib/utils'

export default async function ProgresoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: courses }, { data: progress }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true),
    supabase.from('user_progress').select('*, courses(*)').eq('user_id', user!.id),
  ])
  const total = courses?.length ?? 0
  const completed = progress?.filter(p => p.status === 'completed').length ?? 0
  const inProgress = progress?.filter(p => p.status === 'in_progress').length ?? 0
  const globalPct = pct(completed, total)

  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Mi <span>progreso</span></h1>
        <p className="text-toyota-muted text-sm font-semibold mt-1.5">Tu avance en el plan de capacitacion</p>
      </div>
      <div className="bg-toyota-black rounded-toyota-lg p-8 mb-6 flex items-center gap-10 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-52 h-52 rounded-full bg-toyota-red opacity-10 pointer-events-none"/>
        <div className="text-6xl font-black text-toyota-red leading-none flex-shrink-0">{globalPct}%</div>
        <div className="flex-1 relative z-10">
          <p className="text-white/45 text-sm font-bold mb-2.5">Progreso general del plan</p>
          <div className="h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-toyota-red rounded-full transition-all duration-700" style={{ width: `${globalPct}%` }}/>
          </div>
          <div className="flex flex-col gap-2">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const catCourses = courses?.filter(c => c.category === cat) ?? []
              const catDone = progress?.filter(p => p.status === 'completed' && catCourses.some(c => c.id === p.course_id)).length ?? 0
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-white/45 font-bold w-40">{meta.icon} {meta.label}</span>
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct(catDone, catCourses.length)}%`, background: meta.color }}/>
                  </div>
                  <span className="font-mono text-[11px] text-white/30 w-8 text-right">{catDone}/{catCourses.length}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { val: completed, label: 'Completados', color: 'text-green-600' },
          { val: inProgress, label: 'En progreso', color: 'text-amber-600' },
          { val: total - completed - inProgress, label: 'Sin iniciar', color: 'text-toyota-muted' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
            <div className="text-[11px] text-toyota-muted font-bold uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="section-label">Cursos completados</div>
      {completed === 0
        ? <p className="text-toyota-muted text-sm font-semibold py-4">Todavia no completaste ningun curso. Empeza por la Fase 1!</p>
        : (
          <div className="flex flex-col gap-2">
            {progress?.filter(p => p.status === 'completed').map(p => {
              const course = (p as any).courses
              const meta = CATEGORY_META[course?.category as CourseCategory]
              return (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-white border border-green-200 rounded-toyota shadow-sm">
                  <span className="text-green-600 font-black text-base">✓</span>
                  <div className="flex-1">
                    <div className="text-sm font-black">{course?.title}</div>
                    <div className="text-xs text-toyota-muted font-semibold">{course?.organization}</div>
                  </div>
                  {meta && <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: meta.dim, color: meta.color }}>{meta.icon} {meta.label}</span>}
                  <span className="font-mono text-[11px] text-toyota-muted">{formatDate(p.completed_at)}</span>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
