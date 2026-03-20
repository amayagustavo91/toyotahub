import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toyota IA Training Hub',
  description: 'Capacitacion en IA - Control de Produccion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
