import { createClient } from '@/lib/supabase/server'
import { PLAN_PHASES, CATEGORY_META, ProgressStatus } from '@/lib/types'
import { pct } from '@/lib/utils'

export default async function PlanPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: courses }, { data: progress }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true).order('order_in_phase'),
    supabase.from('user_progress').select('*').eq('user_id', user!.id),
  ])
  const progressMap: Record<string, ProgressStatus> = Object.fromEntries((progress ?? []).map(p => [p.course_id, p.status]))

  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Plan <span>recomendado</span></h1>
        <p className="text-toyota-muted text-sm font-semibold mt-1.5">4 fases · De cero a herramientas avanzadas de IA</p>
      </div>
      <div className="flex flex-col gap-3">
        {PLAN_PHASES.map((phase, idx) => {
          const phaseCourses = (courses ?? []).filter(c => c.phase === phase.num)
          const done = phaseCourses.filter(c => progressMap[c.id] === 'completed').length
          const percentage = pct(done, phaseCourses.length)
          const allDone = done === phaseCourses.length && phaseCourses.length > 0
          return (
            <details key={phase.num} open={idx === 0} className="bg-white border border-black/8 rounded-toyota-lg shadow-sm overflow-hidden">
              <summary className="flex items-center gap-4 px-6 py-5 cursor-pointer hover:bg-toyota-surface list-none">
                <div className={`w-9 h-9 rounded-toyota flex items-center justify-center text-base font-black text-white flex-shrink-0 ${allDone ? 'bg-green-600' : 'bg-toyota-red'}`}>
                  {allDone ? '✓' : phase.num}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-black">{phase.name}</div>
                  <div className="text-xs text-toyota-muted font-bold mt-0.5">{phase.duration}</div>
                </div>
                <div className="w-32">
                  <div className="text-right font-mono text-xs text-toyota-red mb-1">{percentage}%</div>
                  <div className="progress-bar-track h-1.5"><div className="progress-bar-fill" style={{ width: `${percentage}%` }}/></div>
                </div>
                <span className="text-toyota-muted text-xs">▼</span>
              </summary>
              <div className="border-t border-black/8 px-6 py-5">
                <p className="text-xs text-toyota-muted-2 font-semibold mb-4 leading-relaxed">{phase.desc}</p>
                <div className="flex flex-col gap-2">
                  {phaseCourses.map(course => {
                    const status = progressMap[course.id] ?? 'not_started'
                    const meta = CATEGORY_META[course.category as keyof typeof CATEGORY_META]
                    return (
                      <div key={course.id} className="flex items-center gap-3 px-3.5 py-3 bg-toyota-surface rounded-toyota border border-black/6">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all
                          ${status === 'completed' ? 'border-green-500 bg-green-50 text-green-600' : status === 'in_progress' ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-gray-200'}`}>
                          {status === 'completed' ? '✓' : status === 'in_progress' ? '→' : ''}
                        </div>
                        <span className="text-sm font-black flex-1">{course.title}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: meta?.dim, color: meta?.color }}>
                          {meta?.icon} {meta?.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}
