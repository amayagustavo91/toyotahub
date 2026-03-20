'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function ToyotaOval({ color, size }: { color: string; size: number }) {
  return (
    <svg viewBox="0 0 100 65" width={size} height={Math.round(size * 0.65)}>
      <ellipse cx="50" cy="33" rx="48" ry="30" fill="none" stroke={color} strokeWidth="3.5"/>
      <ellipse cx="50" cy="33" rx="20" ry="28" fill="none" stroke={color} strokeWidth="3.5"/>
      <ellipse cx="50" cy="14" rx="38" ry="12" fill="none" stroke={color} strokeWidth="3.5"/>
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contrasena incorrectos.'); setLoading(false) }
    else { router.push('/dashboard/cursos'); router.refresh() }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-toyota-black flex flex-col justify-between p-14 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-toyota-red opacity-10 pointer-events-none"/>
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-toyota-red opacity-10 pointer-events-none"/>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-14">
            <ToyotaOval color="white" size={52}/>
            <div>
              <div className="text-xl font-black text-white tracking-widest">TOYOTA</div>
              <div className="text-xs text-white/40 tracking-widest uppercase mt-0.5">Argentina - Control de Produccion</div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight">
            Plataforma de capacitacion en <span className="text-toyota-red">IA</span>
          </h1>
          <p className="text-white/40 text-sm mt-4 leading-relaxed max-w-xs">
            Desarrolla las habilidades del futuro sin necesidad de programar.
          </p>
          <div className="flex gap-2 mt-7 flex-wrap">
            {['Sin programacion','100% gratuito','12 semanas'].map(t => (
              <span key={t} className="px-3 py-1 border border-white/20 rounded text-white/40 text-xs font-bold uppercase tracking-widest">{t}</span>
            ))}
          </div>
        </div>
        <div className="text-white/20 text-xs relative z-10">Toyota Argentina S.A. - Uso interno</div>
      </div>
      <div className="w-96 bg-white flex items-center justify-center p-12">
        <div className="w-full">
          <div className="mb-8"><ToyotaOval color="#EB0A1E" size={48}/></div>
          <h2 className="text-2xl font-black mb-1">Bienvenido</h2>
          <p className="text-toyota-muted text-sm font-semibold mb-8">Ingresa con tus credenciales asignadas</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-toyota-muted-2 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="usuario@toyota.com.ar" className="input-field"/>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-toyota-muted-2 mb-1.5">Contrasena</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="password" className="input-field"/>
            </div>
            {error && <p className="text-toyota-red text-xs font-bold">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
