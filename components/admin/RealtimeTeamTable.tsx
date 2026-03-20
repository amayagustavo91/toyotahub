'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { initials, pct } from '@/lib/utils'

interface TeamMember { id: string; full_name: string; role: string; area: string | null; completed: number; pct: number }

export default function RealtimeTeamTable({ initialTeam, totalCourses }:
  { initialTeam: TeamMember[]; totalCourses: number }) {
  const [team, setTeam] = useState(initialTeam)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase.channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_progress' }, async () => {
        const { data: allProgress } = await supabase.from('user_progress').select('*')
        setTeam(prev => prev.map(member => {
          const prog = (allProgress ?? []).filter(p => p.user_id === member.id)
          const completed = prog.filter(p => p.status === 'completed').length
          return { ...member, completed, pct: pct(completed, totalCourses) }
        }))
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, totalCourses])

  const roleChip: Record<string, string> = {
    admin: 'bg-red-50 text-toyota-red',
    ingeniero: 'bg-blue-50 text-blue-700',
    staff: 'bg-purple-50 text-purple-700',
    user: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="bg-white border border-black/8 rounded-toyota-lg shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border-b border-green-100">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
        <span className="text-xs font-bold text-green-700">Actualizacion en tiempo real activa</span>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-toyota-surface">
            {['Integrante', 'Rol', 'Area', 'Completados', 'Progreso'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-toyota-muted border-b border-black/8">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...team].sort((a, b) => b.pct - a.pct).map(member => (
            <tr key={member.id} className="border-b border-black/6 hover:bg-toyota-surface transition-colors">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-toyota-red flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">{initials(member.full_name)}</div>
                  <span className="text-sm font-black">{member.full_name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${roleChip[member.role] ?? roleChip.user}`}>{member.role}</span>
              </td>
              <td className="px-4 py-3.5 text-xs text-toyota-muted font-semibold">{member.area ?? '-'}</td>
              <td className="px-4 py-3.5 font-mono text-sm font-bold">{member.completed} / {totalCourses}</td>
              <td className="px-4 py-3.5 min-w-[180px]">
                <div className="flex items-center gap-2">
                  <div className="progress-bar-track flex-1 h-1.5"><div className="progress-bar-fill" style={{ width: `${member.pct}%`, background: '#16a34a' }}/></div>
                  <span className="font-mono text-xs text-toyota-muted font-bold w-8 text-right">{member.pct}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
