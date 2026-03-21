'use client'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { initials } from '@/lib/utils'

const NAV = [
  { href: '/dashboard/cursos',   icon: '📚', label: 'Cursos' },
  { href: '/dashboard/plan',     icon: '🗺️',  label: 'Plan recomendado' },
  { href: '/dashboard/progreso', icon: '📈', label: 'Mi progreso' },
]

function ToyotaOval() {
  return (
    <svg viewBox="0 0 100 65" width="38" height="25">
      <ellipse cx="50" cy="33" rx="48" ry="30" fill="none" stroke="white" strokeWidth="4"/>
      <ellipse cx="50" cy="33" rx="20" ry="28" fill="none" stroke="white" strokeWidth="4"/>
      <ellipse cx="50" cy="14" rx="38" ry="12" fill="none" stroke="white" strokeWidth="4"/>
    </svg>
  )
}

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItem = (href: string, icon: string, label: string) => (
    <button key={href} onClick={() => router.push(href)}
      className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold border-l-[3px] transition-all text-left
        ${pathname === href ? 'text-white border-toyota-red bg-white/[0.06]' : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/[0.04]'}`}>
      <span className="text-base w-5 text-center">{icon}</span>{label}
    </button>
  )

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[232px] bg-toyota-black flex flex-col z-50">
      <div className="border-b border-white/[0.07]">
        <div className="flex items-center gap-3 px-5 py-5">
          <ToyotaOval/>
          <div>
            <div className="text-sm font-black text-white tracking-[0.12em]">TOYOTA</div>
            <div className="text-[10px] text-white/30 tracking-widest">Argentina</div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-5 pb-3 border-t border-white/[0.06]">
          <div className="w-1.5 h-1.5 rounded-full bg-toyota-red flex-shrink-0"/>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">IA Training Hub</span>
        </div>
      </div>
      <nav className="flex-1 pt-2">
        <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/20">Aprendizaje</div>
        {NAV.map(({ href, icon, label }) => navItem(href, icon, label))}
        {profile?.role === 'admin' && (
          <>
            <div className="px-5 pt-4 pb-3 text-[10px] font-black uppercase tracking-widest text-white/20">Gestion</div>
            {navItem('/dashboard/admin', '⚙️', 'Panel admin')}
          </>
        )}
      </nav>
      <div className="border-t border-white/[0.07] p-3.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.05] rounded-toyota">
          <div className="w-8 h-8 rounded-full bg-toyota-red flex items-center justify-center text-xs font-black text-white flex-shrink-0">
            {initials(profile?.full_name ?? 'U')}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-white truncate">{profile?.full_name ?? '-'}</div>
            <div className="text-[10px] text-white/30 capitalize">{profile?.role ?? 'usuario'}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full mt-2 py-2 text-[11px] font-bold uppercase tracking-widest text-white/30 border border-white/10 rounded-toyota hover:border-toyota-red/50 hover:text-toyota-red/70 transition-all">
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
