import { createClient } from '@/lib/supabase/server'
import { pct, initials } from '@/lib/utils'

export default async function RankingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profiles }, { data: allProgress }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('*').neq('role', 'admin'),
    supabase.from('user_progress').select('*'),
    supabase.from('courses').select('id').eq('is_active', true),
  ])
  const total = courses?.length ?? 0
  const ranked = (profiles ?? []).map(profile => {
    const prog = (allProgress ?? []).filter(p => p.user_id === profile.id)
    const completed = prog.filter(p => p.status === 'completed').length
    return { ...profile, completed, pct: pct(completed, total) }
  }).sort((a, b) => b.pct - a.pct || b.completed - a.completed)

  const medals = ['🥇', '🥈', '🥉']
  const isMe = (id: string) => id === user?.id

  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Ranking del <span>equipo</span></h1>
        <p className="text-toyota-muted text-sm font-semibold mt-1.5">Clasificacion por avance en el plan de capacitacion</p>
      </div>
      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {ranked.slice(0, 3).map((p, i) => (
            <div key={p.id} className={`bg-white border rounded-toyota-lg p-5 text-center shadow-sm ${isMe(p.id) ? 'border-toyota-red' : 'border-black/8'} ${i === 0 ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
              <div className="text-3xl mb-2">{medals[i]}</div>
              <div className="w-12 h-12 rounded-full bg-toyota-red flex items-center justify-center text-sm font-black text-white mx-auto mb-2">{initials(p.full_name)}</div>
              <div className="text-sm font-black">{p.full_name}{isMe(p.id) && <span className="text-toyota-red"> (vos)</span>}</div>
              <div className="text-2xl font-black text-toyota-red mt-3">{p.pct}%</div>
              <div className="progress-bar-track h-1.5 mt-3"><div className="progress-bar-fill" style={{ width: `${p.pct}%` }}/></div>
            </div>
          ))}
        </div>
      )}
      <div className="section-label">Clasificacion completa</div>
      <div className="bg-white border border-black/8 rounded-toyota-lg shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-toyota-surface">
              {['#', 'Integrante', 'Area', 'Completados', 'Progreso'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-toyota-muted border-b border-black/8">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr key={p.id} className={`border-b border-black/6 hover:bg-toyota-surface transition-colors ${isMe(p.id) ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-3.5 font-mono text-sm font-bold text-toyota-muted">{i < 3 ? medals[i] : `#${i + 1}`}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-toyota-red flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">{initials(p.full_name)}</div>
                    <span className="text-sm font-black">{p.full_name}{isMe(p.id) && <span className="text-toyota-red text-xs"> (vos)</span>}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-toyota-muted font-semibold">{p.area ?? '-'}</td>
                <td className="px-4 py-3.5 font-mono text-sm font-bold">{p.completed} / {total}</td>
                <td className="px-4 py-3.5 min-w-[160px]">
                  <div className="flex items-center gap-2">
                    <div className="progress-bar-track flex-1 h-1.5"><div className="progress-bar-fill" style={{ width: `${p.pct}%`, background: '#16a34a' }}/></div>
                    <span className="font-mono text-xs text-toyota-muted font-bold w-8 text-right">{p.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
