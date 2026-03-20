import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import './globals.css'

const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['400','600','700','800','900'], variable: '--font-sans' })

export const metadata: Metadata = { title: 'Toyota IA Training Hub', description: 'Capacitacion en IA - Control de Produccion' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={nunito.variable}>
      <body className="bg-toyota-surface text-toyota-black font-sans antialiased">{children}</body>
    </html>
  )
}
