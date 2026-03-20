import { createClient } from '@/lib/supabase/server'
import CoursesClient from '@/components/courses/CoursesClient'

export default async function CursosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: courses }, { data: progress }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true).order('phase').order('order_in_phase'),
    supabase.from('user_progress').select('*').eq('user_id', user!.id),
  ])
  const progressMap = Object.fromEntries((progress ?? []).map(p => [p.course_id, p.status]))
  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Biblioteca de <span>cursos</span></h1>
        <p className="text-toyota-muted text-sm font-semibold mt-1.5">{courses?.length ?? 0} cursos gratuitos · Sin programacion · Filtra por tematica</p>
      </div>
      <CoursesClient courses={courses ?? []} progressMap={progressMap} userId={user!.id}/>
    </div>
  )
}
