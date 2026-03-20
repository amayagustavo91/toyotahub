// Toyota IA Training Hub
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toyota IA Training Hub',
  description: 'Capacitacion en IA',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
