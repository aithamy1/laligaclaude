import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProBets AI - Predicciones de Fútbol Español',
  description: 'Sistema avanzado de análisis y predicción de apuestas deportivas usando IA. LaLiga, Segunda División y Copa del Rey.',
  keywords: 'apuestas, fútbol, LaLiga, Segunda División, Copa del Rey, predicciones, IA, machine learning',
  authors: [{ name: 'ProBets AI' }],
  openGraph: {
    title: 'ProBets AI - Predicciones de Fútbol Español',
    description: 'Predicciones profesionales con modelos avanzados: Poisson-Dixon-Coles + ELO + Forma',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
