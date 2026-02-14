'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock3,
  History,
  Layers,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react'

type Tab = 'picks' | 'combinadas' | 'historial'
type Competition = 'primera' | 'segunda' | 'copa'

type NormalizedCombinada = {
  id: string
  nombre: string
  cuota_total: number
  probabilidad: number
  picks: Array<{ partido: string; pick: string; cuota: number; confianza: number }>
}

type NormalizedHistorial = {
  id: string
  fecha: string
  descripcion: string
  cuota_total: number
  probabilidad: number
  estado: 'acertada' | 'fallada' | 'pendiente'
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function fixText(value: unknown): string {
  const text = String(value ?? '')
  if (!text) return ''
  try {
    const encoded = text
      .split('')
      .map((ch) => `%${ch.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
    return decodeURIComponent(encoded)
  } catch {
    return text
  }
}

function normalizeCombinadas(picksRoot: any, extraCombinadas: any): NormalizedCombinada[] {
  if (extraCombinadas?.combinadas && Array.isArray(extraCombinadas.combinadas)) {
    return extraCombinadas.combinadas.map((c: any, idx: number) => ({
      id: String(c.id ?? `comb-${idx + 1}`),
      nombre: String(c.nombre ?? `Combinada ${idx + 1}`),
      cuota_total: asNumber(c.cuota_total),
      probabilidad: asNumber(c.probabilidad ?? c.probabilidad_estimada),
      picks: Array.isArray(c.picks)
        ? c.picks.map((p: any) => ({
            partido: String(p.partido ?? 'Partido'),
            pick: String(p.pick ?? p.seleccion ?? '-'),
            cuota: asNumber(p.cuota),
            confianza: asNumber(p.confianza),
          }))
        : [],
    }))
  }

  const raw = picksRoot?.combinadas?.apuestas
  if (!Array.isArray(raw)) return []

  return raw.map((c: any, idx: number) => ({
    id: String(c.id ?? `comb-${idx + 1}`),
    nombre: String(c.nombre ?? `Combinada ${idx + 1}`),
    cuota_total: asNumber(c.cuota_total),
    probabilidad: asNumber(c.probabilidad ?? c.probabilidad_estimada),
    picks: Array.isArray(c.picks)
      ? c.picks.map((p: any) => ({
          partido: String(p.partido ?? 'Partido'),
          pick: String(p.pick ?? p.seleccion ?? '-'),
          cuota: asNumber(p.cuota),
          confianza: asNumber(p.confianza),
        }))
      : [],
  }))
}

function normalizeHistorial(picksRoot: any, extraHistorial: any): NormalizedHistorial[] {
  if (extraHistorial?.jornadas && Array.isArray(extraHistorial.jornadas)) {
    return extraHistorial.jornadas.flatMap((j: any) =>
      Array.isArray(j.combinadas)
        ? j.combinadas.map((c: any, idx: number) => ({
            id: String(c.id ?? `${j.jornada}-${idx + 1}`),
            fecha: String(j.fecha_fin ?? j.fecha_inicio ?? ''),
            descripcion: String(c.nombre ?? 'Combinada'),
            cuota_total: asNumber(c.cuota_total ?? c.cuota),
            probabilidad: asNumber(c.probabilidad ?? c.probabilidad_estimada),
            estado:
              c.estado === 'acertada' || c.estado === 'fallada' || c.estado === 'pendiente'
                ? c.estado
                : 'pendiente',
          }))
        : []
    )
  }

  const raw = picksRoot?.historial?.combinadas
  if (!Array.isArray(raw)) return []

  return raw.map((h: any, idx: number) => ({
    id: String(h.id ?? `hist-${idx + 1}`),
    fecha: String(h.fecha ?? ''),
    descripcion: String(h.descripcion ?? `Combinada ${idx + 1}`),
    cuota_total: asNumber(h.cuota_total),
    probabilidad: asNumber(h.probabilidad ?? h.probabilidad_estimada),
    estado:
      h.resultado === 'cumplida'
        ? 'acertada'
        : h.resultado === 'no_cumplida'
          ? 'fallada'
          : 'pendiente',
  }))
}

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<Tab>('picks')
  const [selectedCompetition, setSelectedCompetition] = useState<Competition>('primera')
  const [showOnlyEdge, setShowOnlyEdge] = useState(false)
  const [picksData, setPicksData] = useState<any>(null)
  const [combinadasData, setCombinadasData] = useState<NormalizedCombinada[]>([])
  const [historialData, setHistorialData] = useState<NormalizedHistorial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const picksRes = await fetch('/data/picks_complete.json')
        const picks = await picksRes.json()

        const combinadas = await fetch('/data/combinadas.json')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
        const historial = await fetch('/data/historial.json')
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)

        setPicksData(picks)
        setCombinadasData(normalizeCombinadas(picks, combinadas))
        setHistorialData(normalizeHistorial(picks, historial))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const partidos = useMemo(() => {
    if (!picksData) return []
    if (selectedCompetition === 'primera') return picksData?.jornada?.primera_division?.partidos ?? []
    if (selectedCompetition === 'segunda') return picksData?.jornada?.segunda_division?.partidos ?? []
    return picksData?.copa_del_rey?.partidos ?? picksData?.jornada?.copa_del_rey?.partidos ?? []
  }, [picksData, selectedCompetition])

  const resumenHistorial = useMemo(() => {
    const acertadas = historialData.filter((h) => h.estado === 'acertada').length
    const falladas = historialData.filter((h) => h.estado === 'fallada').length
    const total = historialData.length
    const tasa = total > 0 ? ((acertadas / total) * 100).toFixed(1) : '0.0'
    return { acertadas, falladas, total, tasa }
  }, [historialData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Cargando predicciones...</p>
      </div>
    )
  }

  if (!picksData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>No se pudieron cargar los datos.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 border-b border-emerald-500/20 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-600 p-2">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ProBets AI</h1>
              <p className="text-xs text-slate-400">Modelo {fixText(picksData.modelo_version)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('picks')}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                selectedTab === 'picks' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Target className="h-4 w-4" />
                Predicciones
              </span>
            </button>
            <button
              onClick={() => setSelectedTab('combinadas')}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                selectedTab === 'combinadas' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Combinadas ({combinadasData.length})
              </span>
            </button>
            <button
              onClick={() => setSelectedTab('historial')}
              className={`rounded-md px-4 py-2 text-sm font-semibold ${
                selectedTab === 'historial' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <History className="h-4 w-4" />
                Historial ({historialData.length})
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {selectedTab === 'picks' && (
          <section>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCompetition('primera')}
                className={`rounded-md px-3 py-2 text-sm ${
                  selectedCompetition === 'primera'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Primera
              </button>
              <button
                onClick={() => setSelectedCompetition('segunda')}
                className={`rounded-md px-3 py-2 text-sm ${
                  selectedCompetition === 'segunda'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Segunda
              </button>
              <button
                onClick={() => setSelectedCompetition('copa')}
                className={`rounded-md px-3 py-2 text-sm ${
                  selectedCompetition === 'copa'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                Copa
              </button>

              <button
                onClick={() => setShowOnlyEdge((v) => !v)}
                className={`rounded-md px-3 py-2 text-sm ${
                  showOnlyEdge ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                Solo picks recomendados
              </button>
            </div>

            <div className="space-y-4">
              {partidos.map((partido: any, idx: number) => {
                const picks = Array.isArray(partido.picks) ? partido.picks : []
                const visiblePicks = showOnlyEdge
                  ? picks.filter((p: any) => p.apostar === true || asNumber(p.edge_percent) > 0)
                  : picks

                return (
                  <article key={partido.id ?? idx} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white">
                        {fixText(partido.local)} vs {fixText(partido.visitante)}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {partido.fecha}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-4 w-4" />
                          {partido.hora}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {visiblePicks.length === 0 && (
                        <p className="text-sm text-slate-400">Sin picks para este filtro.</p>
                      )}

                      {visiblePicks.map((pick: any, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="grid grid-cols-1 gap-2 rounded-lg border border-slate-700 bg-slate-800/40 p-3 md:grid-cols-6"
                        >
                          <p className="md:col-span-2 text-sm text-slate-300">{fixText(pick.tipo)}</p>
                          <p className="md:col-span-2 text-sm font-semibold text-white">{fixText(pick.prediccion)}</p>
                          <p className="text-sm text-emerald-400">{asNumber(pick.confianza).toFixed(1)}%</p>
                          <div className="text-right text-xs text-slate-300">
                            <div>Cuota {pick.cuota_mercado ?? '-'}</div>
                            <div>Edge {asNumber(pick.edge_percent).toFixed(1)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}

        {selectedTab === 'combinadas' && (
          <section className="space-y-4">
            {combinadasData.length === 0 && <p className="text-slate-400">No hay combinadas disponibles.</p>}
            {combinadasData.map((combo) => (
              <article key={combo.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">{fixText(combo.nombre)}</h3>
                  <div className="text-right text-sm">
                    <p className="text-amber-400">Cuota {combo.cuota_total.toFixed(2)}</p>
                    <p className="text-emerald-400">Prob. {combo.probabilidad.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {combo.picks.map((pick, idx) => (
                    <div key={idx} className="rounded-md border border-slate-700 bg-slate-800/40 p-3">
                      <p className="text-sm font-semibold text-white">{fixText(pick.partido)}</p>
                      <p className="text-sm text-slate-300">{fixText(pick.pick)}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {selectedTab === 'historial' && (
          <section>
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-xl font-bold text-white">{resumenHistorial.total}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-400">Acertadas</p>
                <p className="text-xl font-bold text-emerald-400">{resumenHistorial.acertadas}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-400">Falladas</p>
                <p className="text-xl font-bold text-rose-400">{resumenHistorial.falladas}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-400">Tasa</p>
                <p className="text-xl font-bold text-blue-400">{resumenHistorial.tasa}%</p>
              </div>
            </div>

            <div className="space-y-3">
              {historialData.length === 0 && <p className="text-slate-400">No hay historial disponible.</p>}
              {historialData.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-semibold">{fixText(item.descripcion)}</p>
                      <p className="text-xs text-slate-400">{item.fecha}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-amber-400">Cuota {item.cuota_total.toFixed(2)}</p>
                      {item.estado === 'acertada' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                      {item.estado === 'fallada' && <XCircle className="h-5 w-5 text-rose-400" />}
                      {item.estado === 'pendiente' && <Clock3 className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
