'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, TrendingUp, Target, Clock, Calendar, ArrowRight, 
  ChevronDown, ChevronUp, Zap, Award, CheckCircle, XCircle, 
  BarChart3, Activity, Info, Shield, Layers, History, Star
} from 'lucide-react'

/* ─── TIPOS ─── */
interface Pick {
  tipo: string
  prediccion: string
  confianza: number
  cuota?: number | null
  cuota_mercado?: number | null
  apostar: boolean
  edge_percent: number
  kelly_stake_percent?: number
  razon?: string
  modelo?: string
  descripcion?: string
  probabilidades?: { local: number; empate: number; visitante: number }
}

interface Partido {
  id: number
  local: string
  visitante: string
  fecha: string
  hora: string
  estadio: string
  liga?: string
  elo_local: number
  elo_visitante: number
  local_forma: string
  visitante_forma: string
  picks: Pick[]
  estadisticas?: {
    local_posicion: number
    visitante_posicion: number
    local_gf: number
    local_gc: number
    visitante_gf: number
    visitante_gc: number
  }
}

interface CombPick {
  partido: string
  pick: string
  cuota: number
  confianza: number
  fecha?: string
}

interface Combinada {
  id: string
  nombre: string
  cuota_total: number
  probabilidad: number
  num_picks?: number
  kelly_sugerido: number
  roi_esperado: number
  categoria: string
  estado: 'pendiente' | 'acertada' | 'fallada'
  picks: CombPick[]
  ganancia?: number
  picks_acertados?: number
}

interface CombinadasData {
  fecha_generacion: string
  competicion?: string
  nota?: string
  combinadas: Combinada[]
  estadisticas: {
    total_combinadas: number
    cuota_minima: number
    cuota_maxima: number
    probabilidad_promedio: number
  }
}

interface JornadaHistorial {
  jornada: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'pendiente' | 'en_curso' | 'finalizada'
  combinadas: Combinada[]
  resumen?: { tasa_acierto: string; roi_jornada: number }
}

interface HistorialData {
  ultima_actualizacion: string
  jornadas: JornadaHistorial[]
  estadisticas_globales: {
    combinadas_totales: number
    combinadas_acertadas: number
    combinadas_falladas: number
    tasa_acierto_global: string
    roi_global: number
  }
}

interface ChampionsData {
  fecha_generacion: string
  competicion: string
  partidos: Partido[]
  metricas: {
    total_partidos: number
    picks_con_edge: number
    confianza_promedio: number
    roi_esperado: number
  }
}

interface PicksData {
  fecha_generacion: string
  modelo_version: string
  jornada: {
    primera_division: { nombre: string; partidos: Partido[]; total_partidos: number }
    segunda_division: { nombre: string; partidos: Partido[]; total_partidos: number }
  }
  copa_del_rey?: { nombre: string; partidos: Partido[]; total_partidos: number }
  metricas_validacion: {
    brier_score: number
    log_loss: number
    total_edge_bets: number
    avg_confidence: number
    roi_esperado_percent: number
  }
}

/* ─── HELPERS ─── */
const getConfColor = (c: number) =>
  c >= 75 ? 'from-emerald-400 to-green-500' : c >= 60 ? 'from-amber-400 to-yellow-500' : 'from-rose-400 to-red-500'

const getEdgeBadge = (apostar: boolean, edge: number) => {
  if (!apostar) return { text: 'Sin Edge', cls: 'bg-slate-600', Icon: XCircle }
  if (edge >= 20) return { text: 'Edge Alto', cls: 'bg-emerald-500', Icon: Zap }
  if (edge >= 10) return { text: 'Edge Medio', cls: 'bg-amber-500', Icon: Award }
  return { text: 'Edge Bajo', cls: 'bg-blue-500', Icon: CheckCircle }
}

const formatForma = (forma: string) =>
  (forma || '').split('').map((r, i) => {
    const bg = r === 'V' ? 'bg-emerald-500' : r === 'E' ? 'bg-amber-500' : 'bg-rose-500'
    return <span key={i} className={`${bg} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>{r}</span>
  })

const getCuota = (p: Pick): number | null => p.cuota ?? p.cuota_mercado ?? null

const catGrad: Record<string, string> = {
  value: 'from-emerald-500 to-green-600',
  medium: 'from-amber-500 to-orange-500',
  'medium-high': 'from-orange-500 to-red-500',
  high: 'from-red-500 to-rose-600',
  'ultra-high': 'from-purple-500 to-pink-600',
}
const catLabel: Record<string, string> = {
  value: 'Value', medium: 'Medio', 'medium-high': 'Medio-Alto', high: 'Alto', 'ultra-high': 'Ultra',
}

async function safeFetch(url: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/* ─── CARD PARTIDO ─── */
function PartidoCard({ p, isExpanded, onToggle, isChampions }: {
  p: Partido; isExpanded: boolean; onToggle: () => void; isChampions?: boolean
}) {
  const accent = isChampions ? {
    border: 'hover:border-yellow-500/40',
    grad: 'from-yellow-500/20 to-amber-600/20',
    text: 'text-yellow-400',
    borderBtn: 'border-yellow-500/30',
  } : {
    border: 'hover:border-emerald-500/40',
    grad: 'from-emerald-500/20 to-green-600/20',
    text: 'text-emerald-400',
    borderBtn: 'border-emerald-500/30',
  }

  const edgePicks = (p.picks || []).filter(pk => pk.apostar && getCuota(pk) !== null)

  return (
    <div className={`bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden ${accent.border} transition-all duration-300 shadow-xl`}>
      <div className="p-6 border-b border-slate-700/50">
        {/* fecha / hora */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{p.fecha ? new Date(p.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}</span>
            <Clock className="w-4 h-4 ml-1" />
            <span>{p.hora}</span>
          </div>
          <div className="text-xs text-slate-500">
            ELO <span className={accent.text}>{p.elo_local}</span> vs <span className="text-amber-400">{p.elo_visitante}</span>
          </div>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-3 gap-4 items-center mb-4">
          <div className="text-right">
            <h3 className="text-lg font-bold text-white">{p.local}</h3>
            <div className="flex justify-end gap-1 mt-1">{formatForma(p.local_forma)}</div>
            {p.estadisticas && (
              <div className="flex justify-end gap-2 text-xs text-slate-400 mt-1">
                <span>#{p.estadisticas.local_posicion}</span>
                <span className="text-emerald-400">{p.estadisticas.local_gf}GF</span>
                <span className="text-rose-400">{p.estadisticas.local_gc}GC</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className={`bg-gradient-to-r ${accent.grad} border ${accent.borderBtn} rounded-full py-2 px-4 inline-block`}>
              <span className={`font-black ${accent.text}`}>VS</span>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white">{p.visitante}</h3>
            <div className="flex gap-1 mt-1">{formatForma(p.visitante_forma)}</div>
            {p.estadisticas && (
              <div className="flex gap-2 text-xs text-slate-400 mt-1">
                <span>#{p.estadisticas.visitante_posicion}</span>
                <span className="text-emerald-400">{p.estadisticas.visitante_gf}GF</span>
                <span className="text-rose-400">{p.estadisticas.visitante_gc}GC</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/30 text-center">
          <div>
            <p className="text-xs text-slate-500">Picks con EDGE</p>
            <p className={`text-lg font-bold ${accent.text}`}>{edgePicks.length}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Mejor Edge</p>
            <p className="text-lg font-bold text-amber-400">
              +{Math.max(...(p.picks || []).map(pk => pk.edge_percent || 0)).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 truncate">{(p.estadio || '').split(',')[0]}</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r ${accent.grad} border ${accent.borderBtn} rounded-lg font-semibold ${accent.text} transition-all`}
        >
          <span>Ver {(p.picks || []).length} Pronosticos</span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Picks expandidos */}
      {isExpanded && (
        <div className="p-6 bg-slate-900/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(p.picks || []).map((pick, idx) => {
              const cuota = getCuota(pick)
              const apostar = pick.apostar && cuota !== null
              const badge = getEdgeBadge(apostar, pick.edge_percent || 0)
              return (
                <div key={idx} className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border ${apostar ? 'border-emerald-500/40' : 'border-slate-700/50'} rounded-xl p-5`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <p className="text-xs text-slate-400 mb-1">{pick.tipo}</p>
                      <h4 className="text-base font-bold text-white">{pick.prediccion}</h4>
                      {pick.modelo && <p className="text-xs text-slate-500 mt-0.5">{pick.modelo}</p>}
                    </div>
                    <span className={`${badge.cls} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shrink-0`}>
                      <badge.Icon className="w-3 h-3" />{badge.text}
                    </span>
                  </div>

                  {/* Barra confianza */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Confianza</span>
                      <span className="text-white font-bold">{pick.confianza}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getConfColor(pick.confianza)} rounded-full`} style={{ width: `${Math.min(pick.confianza, 100)}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-400">Cuota</p>
                      <p className="text-xl font-black text-emerald-400">{cuota ?? 'N/A'}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-400">Edge</p>
                      <p className={`text-xl font-black ${(pick.edge_percent || 0) > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(pick.edge_percent || 0) > 0 ? '+' : ''}{pick.edge_percent || 0}%
                      </p>
                    </div>
                  </div>

                  {pick.probabilidades && (
                    <div className="mb-3 p-2 bg-slate-700/20 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Probabilidades modelo</p>
                      <div className="grid grid-cols-3 gap-1 text-xs text-center">
                        <div><p className="text-slate-500">Local</p><p className="font-bold text-white">{pick.probabilidades.local}%</p></div>
                        <div><p className="text-slate-500">Empate</p><p className="font-bold text-white">{pick.probabilidades.empate}%</p></div>
                        <div><p className="text-slate-500">Visit.</p><p className="font-bold text-white">{pick.probabilidades.visitante}%</p></div>
                      </div>
                    </div>
                  )}

                  {(pick.descripcion || pick.razon) && (
                    <p className="text-xs text-slate-400 italic mb-3 border-t border-slate-700/30 pt-2">{pick.descripcion ?? pick.razon}</p>
                  )}

                  {apostar ? (
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                      <span>Apostar</span><ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button disabled className="w-full bg-slate-700/50 text-slate-400 font-semibold py-2.5 rounded-lg cursor-not-allowed">
                      {cuota ? 'Edge Insuficiente' : 'Sin Cuotas'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── SECCIÓN COMBINADAS ─── */
function CombinadasSection({ data, isChampions }: { data: CombinadasData; isChampions?: boolean }) {
  const accent = isChampions ? 'text-yellow-400' : 'text-amber-400'
  const borderAccent = isChampions ? 'border-yellow-500/30' : 'border-amber-500/30'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          {isChampions ? 'Combinadas Champions League' : 'Combinadas — LaLiga y Segunda'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {data.estadisticas.total_combinadas} combinadas &middot; Cuotas {data.estadisticas.cuota_minima.toFixed(1)}–{data.estadisticas.cuota_maxima.toFixed(1)} &middot; Solo picks 70%+
        </p>
        {data.nota && <p className="text-slate-500 text-xs mt-1 italic">{data.nota}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Cuota Min.', val: data.estadisticas.cuota_minima.toFixed(2) },
          { label: 'Cuota Max.', val: data.estadisticas.cuota_maxima.toFixed(2) },
          { label: 'Prob. Media', val: data.estadisticas.probabilidad_promedio + '%' },
        ].map(({ label, val }) => (
          <div key={label} className={`bg-slate-800/50 border ${borderAccent} rounded-xl p-4 text-center`}>
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold ${accent}`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {data.combinadas.map(c => (
          <div key={c.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/40 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${catGrad[c.categoria] ?? 'from-slate-500 to-slate-600'} text-white`}>
                    {catLabel[c.categoria] ?? c.categoria}
                  </span>
                  <span className="text-xs text-slate-500">{c.picks.length} picks</span>
                </div>
                <h3 className="text-lg font-bold text-white">{c.nombre}</h3>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-black ${accent}`}>{c.cuota_total.toFixed(2)}</p>
                <p className="text-xs text-slate-500">cuota total</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Probabilidad</p>
                <p className="text-lg font-bold text-emerald-400">{c.probabilidad}%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">Kelly</p>
                <p className="text-lg font-bold text-blue-400">{c.kelly_sugerido}%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400">ROI Esp.</p>
                <p className="text-lg font-bold text-purple-400">+{c.roi_esperado}%</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {c.picks.map((pk, i) => (
                <div key={i} className="bg-slate-700/20 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{pk.partido}</p>
                    <p className="text-xs text-slate-400">{pk.pick}</p>
                    {pk.fecha && <p className="text-xs text-slate-600">{pk.fecha}</p>}
                  </div>
                  <div className="flex items-center gap-4 ml-3 shrink-0">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Cuota</p>
                      <p className="text-sm font-bold text-emerald-400">{pk.cuota}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Conf.</p>
                      <p className="text-sm font-bold text-amber-400">{pk.confianza}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={`w-full bg-gradient-to-r ${catGrad[c.categoria] ?? 'from-amber-500 to-orange-600'} hover:opacity-90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all`}>
              <Zap className="w-5 h-5" />
              <span>Apostar Combinada &middot; {c.cuota_total.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SECCIÓN HISTORIAL ─── */
function HistorialSection({ data }: { data: HistorialData }) {
  const g = data.estadisticas_globales
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Historial de Combinadas</h2>
        <p className="text-slate-400 text-sm mt-1">
          Tasa global: {g.tasa_acierto_global} &middot; ROI: {g.roi_global >= 0 ? '+' : ''}{g.roi_global}%
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Acertadas', val: String(g.combinadas_acertadas), color: 'emerald' },
          { label: 'Falladas', val: String(g.combinadas_falladas), color: 'rose' },
          { label: 'Tasa Acierto', val: g.tasa_acierto_global, color: 'blue' },
          { label: 'ROI Global', val: (g.roi_global >= 0 ? '+' : '') + g.roi_global + '%', color: g.roi_global >= 0 ? 'emerald' : 'rose' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`bg-slate-800/50 border border-${color}-500/30 rounded-xl p-4 text-center`}>
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className={`text-2xl font-bold text-${color}-400`}>{val}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {data.jornadas.map((j, ji) => (
          <div key={ji} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{j.jornada}</h3>
                <p className="text-sm text-slate-400">{j.fecha_inicio} &rarr; {j.fecha_fin}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                j.estado === 'finalizada' ? 'bg-blue-500/20 text-blue-400' :
                j.estado === 'en_curso' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-600/40 text-slate-400'
              }`}>
                {j.estado === 'finalizada' ? 'Finalizada' : j.estado === 'en_curso' ? 'En Curso' : 'Pendiente'}
              </span>
            </div>

            {j.resumen && (
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-700/20 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Tasa Acierto</p>
                  <p className="text-lg font-bold text-emerald-400">{j.resumen.tasa_acierto}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">ROI Jornada</p>
                  <p className={`text-lg font-bold ${j.resumen.roi_jornada >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {j.resumen.roi_jornada >= 0 ? '+' : ''}{j.resumen.roi_jornada}%
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {j.combinadas.map((c, ci) => (
                <div key={ci} className={`border rounded-lg p-4 ${
                  c.estado === 'acertada' ? 'bg-emerald-500/10 border-emerald-500/40' :
                  c.estado === 'fallada' ? 'bg-rose-500/10 border-rose-500/40' :
                  'bg-slate-700/10 border-slate-600/40'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        c.estado === 'acertada' ? 'bg-emerald-500' :
                        c.estado === 'fallada' ? 'bg-rose-500' : 'bg-slate-500'
                      }`} />
                      <div>
                        <p className="font-semibold text-white text-sm">{c.nombre}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{c.picks.length} picks</span>
                          <span>&middot;</span>
                          <span>Prob: {c.probabilidad}%</span>
                          {c.estado !== 'pendiente' && (
                            <>
                              <span>&middot;</span>
                              <span className={c.estado === 'acertada' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {c.estado === 'acertada' ? '✓ Acertada' : `✗ Fallada (${c.picks_acertados ?? 0}/${c.picks.length})`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{c.cuota_total.toFixed(2)}</p>
                      {c.estado === 'acertada' && c.ganancia && (
                        <p className="text-xs font-bold text-emerald-400">+{c.ganancia}&euro;</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── COMPONENTE PRINCIPAL ─────────────── */
export default function Home() {
  const [tab, setTab] = useState<'picks' | 'champions' | 'combinadas' | 'combinadas-cl' | 'historial'>('picks')
  const [competition, setCompetition] = useState<'primera' | 'segunda' | 'copa'>('primera')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showEdge, setShowEdge] = useState(false)

  const [picksData, setPicksData] = useState<PicksData | null>(null)
  const [combinadasData, setCombinadasData] = useState<CombinadasData | null>(null)
  const [combinadasCL, setCombinadasCL] = useState<CombinadasData | null>(null)
  const [championsData, setChampionsData] = useState<ChampionsData | null>(null)
  const [historialData, setHistorialData] = useState<HistorialData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      safeFetch('/data/picks_complete.json'),
      safeFetch('/data/combinadas.json'),
      safeFetch('/data/combinadas_champions.json'),
      safeFetch('/data/champions_data.json'),
      safeFetch('/data/historial.json'),
    ]).then(([picks, comb, combCL, champ, hist]) => {
      if (!picks) {
        setError('No se pudo cargar picks_complete.json')
        setLoading(false)
        return
      }
      setPicksData(picks)
      setCombinadasData(comb)
      setCombinadasCL(combCL)
      setChampionsData(champ)
      setHistorialData(hist)
      setLoading(false)
    }).catch(err => {
      setError('Error al cargar datos: ' + String(err))
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-emerald-500 mx-auto mb-4" />
        <p className="text-white text-xl">Cargando predicciones...</p>
      </div>
    </div>
  )

  if (error || !picksData) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center max-w-md">
        <XCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
        <h2 className="text-white text-2xl font-bold mb-2">Error al cargar datos</h2>
        <p className="text-slate-400 text-sm mb-4">{error ?? 'Archivo picks_complete.json no disponible'}</p>
        <div className="bg-slate-800 rounded-xl p-4 text-left text-xs text-slate-300">
          <p className="font-bold mb-2">Verifica que estos archivos existen en public/data/:</p>
          <ul className="space-y-1">
            <li>✅ picks_complete.json (requerido)</li>
            <li>⚪ combinadas.json (opcional)</li>
            <li>⚪ combinadas_champions.json (opcional)</li>
            <li>⚪ champions_data.json (opcional)</li>
            <li>⚪ historial.json (opcional)</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const getCurrentPartidos = () => {
    const src = competition === 'primera' ? picksData.jornada.primera_division
              : competition === 'segunda' ? picksData.jornada.segunda_division
              : picksData.copa_del_rey
    if (!src) return []
    return showEdge ? (src.partidos || []).filter(p => (p.picks || []).some(pk => pk.apostar)) : (src.partidos || [])
  }

  const getNombre = () =>
    competition === 'primera' ? picksData.jornada.primera_division.nombre
    : competition === 'segunda' ? picksData.jornada.segunda_division.nombre
    : picksData.copa_del_rey?.nombre ?? 'Copa del Rey'

  const countP = (k: 'primera' | 'segunda' | 'copa') =>
    k === 'primera' ? picksData.jornada.primera_division.total_partidos
    : k === 'segunda' ? picksData.jornada.segunda_division.total_partidos
    : picksData.copa_del_rey?.total_partidos ?? 0

  const tabs = [
    { key: 'picks' as const, label: 'Predicciones', Icon: Target, active: 'bg-emerald-500 shadow-emerald-500/30' },
    { key: 'champions' as const, label: 'Champions', Icon: Star, active: 'bg-yellow-500 shadow-yellow-500/30' },
    { key: 'combinadas' as const, label: 'Combinadas', Icon: Layers, active: 'bg-amber-500 shadow-amber-500/30', badge: combinadasData?.estadisticas.total_combinadas },
    { key: 'combinadas-cl' as const, label: 'Comb. CL', Icon: Layers, active: 'bg-yellow-600 shadow-yellow-600/30', badge: combinadasCL?.estadisticas.total_combinadas },
    { key: 'historial' as const, label: 'Historial', Icon: History, active: 'bg-purple-500 shadow-purple-500/30' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/40">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                ProBets <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-slate-400 text-xs">Modelo {picksData.modelo_version}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ key, label, Icon, active, badge }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg ${
                  tab === key ? `${active} text-white` : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge !== undefined && (
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── PREDICCIONES ── */}
        {tab === 'picks' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { Icon: Zap, label: 'Picks EDGE', val: String(picksData.metricas_validacion.total_edge_bets), c: 'emerald' },
                { Icon: Target, label: 'Confianza', val: picksData.metricas_validacion.avg_confidence + '%', c: 'amber' },
                { Icon: BarChart3, label: 'ROI Esp.', val: '+' + picksData.metricas_validacion.roi_esperado_percent + '%', c: 'blue' },
                { Icon: Activity, label: 'Modelo', val: 'Ensemble', c: 'purple' },
              ].map(({ Icon, label, val, c }) => (
                <div key={label} className={`bg-${c}-500/10 border border-${c}-500/30 rounded-xl p-4`}>
                  <Icon className={`w-5 h-5 text-${c}-400 mb-2`} />
                  <p className="text-2xl font-black text-white">{val}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {([
                { k: 'primera' as const, label: 'LaLiga EA Sports', Icon: Trophy, grad: 'from-emerald-500 to-green-600' },
                { k: 'segunda' as const, label: 'LaLiga Hypermotion', Icon: TrendingUp, grad: 'from-amber-500 to-orange-600' },
                { k: 'copa' as const, label: 'Copa del Rey', Icon: Shield, grad: 'from-purple-500 to-pink-600' },
              ]).map(({ k, label, Icon, grad }) => (
                <button
                  key={k}
                  onClick={() => setCompetition(k)}
                  className={`py-3 px-3 rounded-xl font-bold text-sm transition-all ${
                    competition === k ? `bg-gradient-to-r ${grad} text-white shadow-xl scale-105` : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <Icon className="w-4 h-4" /><span>{label}</span>
                  </div>
                  <p className="text-xs opacity-70">{countP(k)} partidos</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{getNombre()}</h2>
              <button
                onClick={() => setShowEdge(!showEdge)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${showEdge ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                {showEdge ? '✓ Solo EDGE' : 'Todos'}
              </button>
            </div>

            <div className="space-y-6">
              {getCurrentPartidos().map(p => (
                <PartidoCard key={p.id} p={p} isExpanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
              ))}
            </div>
            {getCurrentPartidos().length === 0 && (
              <div className="text-center py-16">
                <Info className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No hay partidos disponibles</p>
              </div>
            )}
          </div>
        )}

        {/* ── CHAMPIONS ── */}
        {tab === 'champions' && (
          <div>
            <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border border-yellow-500/40 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <div>
                  <h2 className="text-2xl font-black text-white">UEFA Champions League</h2>
                  <p className="text-yellow-400 text-sm font-semibold">Play-offs — Ida &middot; Jornada 9</p>
                </div>
              </div>
              {championsData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Partidos', val: championsData.metricas.total_partidos },
                    { label: 'Picks con Edge', val: championsData.metricas.picks_con_edge },
                    { label: 'Confianza Media', val: championsData.metricas.confianza_promedio + '%' },
                    { label: 'ROI Esperado', val: '+' + championsData.metricas.roi_esperado + '%' },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-slate-800/60 rounded-lg p-3 text-center">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-xl font-bold text-yellow-400">{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {championsData ? (
              <div className="space-y-8">
                {(['2026-02-17', '2026-02-18'] as const).map(fecha => {
                  const ps = championsData.partidos.filter(p => p.fecha === fecha)
                  if (!ps.length) return null
                  return (
                    <div key={fecha}>
                      <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {fecha === '2026-02-17' ? 'Martes 17 de Febrero' : 'Miercoles 18 de Febrero'}
                      </h3>
                      <div className="space-y-4">
                        {ps.map(p => (
                          <PartidoCard key={p.id} p={p} isExpanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} isChampions />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-lg">Datos de Champions no cargados</p>
                <p className="text-slate-500 text-sm mt-1">Sube <code className="text-yellow-400">champions_data.json</code> a public/data/</p>
              </div>
            )}
          </div>
        )}

        {/* ── COMBINADAS LIGA ── */}
        {tab === 'combinadas' && (
          combinadasData ? <CombinadasSection data={combinadasData} /> : (
            <div className="text-center py-16">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">Combinadas no disponibles</p>
              <p className="text-slate-500 text-sm mt-1">Sube <code className="text-amber-400">combinadas.json</code> a public/data/</p>
            </div>
          )
        )}

        {/* ── COMBINADAS CHAMPIONS ── */}
        {tab === 'combinadas-cl' && (
          combinadasCL ? <CombinadasSection data={combinadasCL} isChampions /> : (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">Combinadas Champions no disponibles</p>
              <p className="text-slate-500 text-sm mt-1">Sube <code className="text-yellow-400">combinadas_champions.json</code> a public/data/</p>
            </div>
          )
        )}

        {/* ── HISTORIAL ── */}
        {tab === 'historial' && (
          historialData ? <HistorialSection data={historialData} /> : (
            <div className="text-center py-16">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-lg">Historial no disponible</p>
              <p className="text-slate-500 text-sm mt-1">Sube <code className="text-purple-400">historial.json</code> a public/data/</p>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-white font-bold mb-1">Modelo</h3>
            <p className="text-slate-400 text-sm">Poisson-Dixon-Coles + ELO + Forma</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Competiciones</h3>
            <p className="text-slate-400 text-sm">LaLiga &middot; Segunda &middot; Copa del Rey &middot; Champions League</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-1">Bankroll</h3>
            <p className="text-slate-400 text-sm">Kelly Criterion &middot; Solo picks con edge real</p>
          </div>
        </div>
        <div className="text-center border-t border-slate-800 pt-6">
          <p className="text-slate-400 text-sm">&#169; 2026 ProBets AI</p>
          <p className="text-slate-500 text-xs mt-1">Juega con responsabilidad. +18</p>
        </div>
      </footer>
    </div>
  )
}
