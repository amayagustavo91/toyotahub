import { createClient } from '@/lib/supabase/server'
import CoursesClient from '@/components/courses/CoursesClient'

export const dynamic = 'force-dynamic'

export default async function CursosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: courses }, { data: progress }, { data: recommendations }] = await Promise.all([
    supabase.from('courses').select('*').eq('is_active', true).order('phase').order('order_in_phase'),
    supabase.from('user_progress').select('*').eq('user_id', user!.id),
    supabase.from('course_recommendations').select('user_id, course_id, profiles(full_name)'),
  ])

  const progressMap = Object.fromEntries((progress ?? []).map(p => [p.course_id, p.status]))
  const myRecs = new Set((recommendations ?? []).filter(r => r.user_id === user!.id).map(r => r.course_id))
  const recsByCourse = (recommendations ?? []).reduce((acc: Record<string, string[]>, r: any) => {
    if (!acc[r.course_id]) acc[r.course_id] = []
    acc[r.course_id].push(r.profiles?.full_name ?? 'Usuario')
    return acc
  }, {})

  return (
    <div>
      <div className="mb-7">
        <h1 className="page-title">Biblioteca de <span>cursos</span></h1>
        <p className="text-toyota-muted text-sm font-semibold mt-1.5">
          {courses?.length ?? 0} cursos gratuitos · Sin programacion · Filtra por tematica
        </p>
      </div>
      <CoursesClient
        courses={courses ?? []}
        progressMap={progressMap}
        userId={user!.id}
        myRecs={Array.from(myRecs)}
        recsByCourse={recsByCourse}
      />
    </div>
  )
}
