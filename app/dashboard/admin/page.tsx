import { createClient } from '@/lib/supabase/server'
import { pct } from '@/lib/utils'
import RealtimeTeamTable from '@/components/admin/RealtimeTeamTable'
import CourseSuggestions from '@/components/admin/CourseSuggestions'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = createClient()
  const [{ data: profiles }, { data: allProgress }, { data: courses }, { data: suggestions }] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('user_progress').select('*'),
    supabase.from('courses').select('id').eq('is_active', true),
    supabase.from('course_suggestions').select('*, profiles(full_name)').order('created_at', { ascending: false }),
  ])

  const nonAdmins = (profiles ?? []).filter(p => p.role !== 'admin')
  const total = courses?.length ?? 0
  const team = nonAdmins.map(profile => {
    const prog = (allProgress ?? []).filter(p => p.user_id === profile.id)
    const completed = prog.filter(p => p.status === 'completed').length
    return { ...profile, completed, pct: pct(completed, total) }
  })
  const avgPct = team.length ? Math.round(team.reduce((s, u) => s + u.pct, 0) / team.length) : 0
  const totalCompleted = team.reduce((s, u) => s + u.completed, 0)
  const fullDone = team.filter(u => u.pct === 100).length
  const pendingSuggestions = (suggestions ?? []).filter(s => s.status === 'pending').length

  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Panel de <span>administracion</span></h1>
        <p className="text-toyota-muted text-sm font-semibold mt-1.5">Progreso del equipo · Actualizacion en tiempo real</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { val: nonAdmins.length, label: 'Integrantes' },
          { val: `${avgPct}%`, label: 'Promedio del equipo' },
          { val: totalCompleted, label: 'Cursos completados' },
          { val: fullDone, label: 'Plan completo' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="text-3xl font-black text-toyota-red">{s.val}</div>
            <div className="text-[11px] text-toyota-muted font-bold uppercase tracking-widest mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Progreso por integrante</div>
      <RealtimeTeamTable initialTeam={team} totalCourses={total}/>

      <div className="mt-10">
        <div className="section-label">
          Sugerencias de cursos
          {pendingSuggestions > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-toyota-red text-white text-[10px] font-black rounded-full">
              {pendingSuggestions} pendientes
            </span>
          )}
        </div>
        <CourseSuggestions initialSuggestions={suggestions ?? []}/>
      </div>
    </div>
  )
}
