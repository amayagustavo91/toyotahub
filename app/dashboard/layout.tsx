import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  console.log('USER ID:', user.id)
  console.log('PROFILE:', JSON.stringify(profile))

  return (
    <div className="flex min-h-screen">
      <Sidebar profile={profile}/>
      <div className="ml-[232px] flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-9 py-4 flex items-center justify-between sticky top-0 z-40">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Toyota IA Training Hub</span>
          <span className="text-sm text-gray-400 font-semibold">Bienvenido, <strong className="text-black font-black">{profile?.full_name ?? '-'}</strong></span>
        </header>
        <main className="flex-1 p-9 pb-16">{children}</main>
      </div>
    </div>
  )
}
