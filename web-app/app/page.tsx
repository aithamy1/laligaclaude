'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, TrendingUp, Target, Clock, Calendar, ArrowRight, 
  ChevronDown, ChevronUp, Zap, Award, CheckCircle, XCircle, 
  BarChart3, Activity, Info, Shield, Layers, History, Star
} from 'lucide-react'

/* ─────────────── TIPOS ─────────────── */
interface Pick {
  tipo: string
  prediccion: string
  confianza: number
  cuota: number | null
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
    local_posicion: number; visitante_posicion: number
    local_gf: number; local_gc: number
    visitante_gf: number; visitante_gc: number
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
  num_picks: number
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
    brier_score: number; log_loss: number
    total_edge_bets: number; avg_confidence: number; roi_esperado_percent: number
  }
}

/* ─────────────── HELPERS ─────────────── */
const getConfColor = (c: number) =>
  c >= 75 ? 'from-emerald-400 to-green-500' : c >= 60 ? 'from-amber-400 to-yellow-500' : 'from-rose-400 to-red-500'

const getEdgeBadge = (edge: number, apostar: boolean) => {
  if (!apostar) return { text: 'Sin Edge', color: 'bg-slate-600', icon: XCircle }
  if (edge >= 20) return { text: 'Edge Alto', color: 'bg-emerald-500', icon: Zap }
  if (edge >= 10) return { text: 'Edge Medio', color: 'bg-amber-500', icon: Award }
  return { text: 'Edge Bajo', color: 'bg-blue-500', icon: CheckCircle }
}

const formatForma = (forma: string) =>
  forma.split('').map((r, i) => {
    const bg = r === 'V' ? 'bg-emerald-500' : r === 'E' ? 'bg-amber-500' : 'bg-rose-500'
    return <span key={i} className={`${bg} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>{r}</span>
  })

const catColor: Record<string, string> = {
  value: 'from-emerald-500 to-green-600',
  medium: 'from-amber-500 to-orange-500',
  'medium-high': 'from-orange-500 to-red-500',
  high: 'from-red-500 to-rose-600',
  'ultra-high': 'from-purple-500 to-pink-600',
}
const catLabel: Record<string, string> = {
  value: 'Value', medium: 'Medio', 'medium-high': 'Medio-Alto', high: 'Alto', 'ultra-high': 'Ultra',
}

/* ─────────────── COMPONENTE PARTIDO ─────────────── */
function PartidoCard({ partido, expanded, onToggle, competitionKey }: {
  partido: Partido; expanded: boolean; onToggle: () => void; competitionKey: string
}) {
  const borderColor = competitionKey === 'champions' ? 'border-yellow-500/40' : 'border-emerald-500/40'
  const accentGrad = competitionKey === 'champions' ? 'from-yellow-500/20 to-amber-600/20' : 'from-emerald-500/20 to-green-600/20'
  const accentText = competitionKey === 'champions' ? 'text-yellow-400' : 'text-emerald-400'
  const accentBorder = competitionKey === 'champions' ? 'border-yellow-500/30' : 'border-emerald-500/30'

  const getCuota = (p: Pick) => p.cuota ?? p.cuota_mercado ?? null
  const apostarFn = (p: Pick) => p.apostar && getCuota(p) !== null

  return (
    <div className={`bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:${borderColor} transition-all duration-300 shadow-xl`}>
      {/* Cabecera */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{partido.hora}</span>
          </div>
          <div className="text-xs text-slate-500">
            ELO: <span className={accentText}>{partido.elo_local}</span>
            <span className="mx-1">vs</span>
            <span className="text-amber-400">{partido.elo_visitante}</span>
          </div>
        </div>

        {/* Equipos */}
        <div className="grid grid-cols-3 gap-4 items-center mb-4">
          <div className="text-right">
            <h3 className="text-xl font-bold text-white mb-2">{partido.local}</h3>
            <div className="flex justify-end gap-1 mb-1">{formatForma(partido.local_forma)}</div>
            {partido.estadisticas && (
              <div className="flex justify-end gap-2 text-xs text-slate-400">
                <span>#{partido.estadisticas.local_posicion}</span>
                <span className="text-emerald-400">{partido.estadisticas.local_gf}GF</span>
                <span className="text-rose-400">{partido.estadisticas.local_gc}GC</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <div className={`bg-gradient-to-r ${accentGrad} border ${accentBorder} rounded-full py-3 px-6`}>
              <span className={`font-black text-lg ${accentText}`}>VS</span>
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-2">{partido.visitante}</h3>
            <div className="flex gap-1 mb-1">{formatForma(partido.visitante_forma)}</div>
            {partido.estadisticas && (
              <div className="flex gap-2 text-xs text-slate-400">
                <span>#{partido.estadisticas.visitante_posicion}</span>
                <span className="text-emerald-400">{partido.estadisticas.visitante_gf}GF</span>
                <span className="text-rose-400">{partido.estadisticas.visitante_gc}GC</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700/30">
          <div className="text-center">
            <p className="text-xs text-slate-500">Picks con EDGE</p>
            <p className={`text-lg font-bold ${accentText}`}>{partido.picks.filter(p => apostarFn(p)).length}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500">Mejor Edge</p>
            <p className="text-lg font-bold text-amber-400">+{Math.max(...partido.picks.map(p => p.edge_percent)).toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 truncate">{partido.estadio.split(',')[0]}</p>
          </div>
        </div>

        <button
          onClick={onToggle}
          className={`w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${accentGrad} border ${accentBorder} rounded-lg transition-all font-semibold ${accentText}`}
        >
          <span>Ver {partido.picks.length} Pronósticos</span>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Picks expandidos */}
      {expanded && (
        <div className="p-6 bg-slate-900/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partido.picks.map((pick, idx) => {
              const badge = getEdgeBadge(pick.edge_percent, apostarFn(pick))
              const BadgeIcon = badge.icon
              const cuota = getCuota(pick)
              return (
                <div key={idx} className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border ${apostarFn(pick) ? 'border-emerald-500/40' : 'border-slate-700/50'} rounded-xl p-5`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400 font-semibold mb-1">{pick.tipo}</p>
                      <h4 className="text-base font-bold text-white">{pick.prediccion}</h4>
                      {pick.modelo && <p className="text-xs text-slate-500 mt-1">{pick.modelo}</p>}
                    </div>
                    <span className={`${badge.color} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ml-2`}>
                      <BadgeIcon className="w-3 h-3" />{badge.text}
                    </span>
                  </div>

                  {/* Barra confianza */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Confianza</span>
                      <span className="text-white font-bold">{pick.confianza}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${getConfColor(pick.confianza)} rounded-full`} style={{ width: `${pick.confianza}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Cuota</p>
                      <p className="text-xl font-black text-emerald-400">{cuota ?? 'N/A'}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-2">
                      <p className="text-xs text-slate-400">Edge</p>
                      <p className={`text-xl font-black ${pick.edge_percent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pick.edge_percent > 0 ? '+' : ''}{pick.edge_percent}%
                      </p>
                    </div>
                  </div>

                  {pick.probabilidades && (
                    <div className="mb-3 p-2 bg-slate-700/20 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Probabilidades</p>
                      <div className="grid grid-cols-3 gap-1 text-xs text-center">
                        <div><p className="text-slate-500">Local</p><p className="font-bold text-white">{pick.probabilidades.local}%</p></div>
                        <div><p className="text-slate-500">Empate</p><p className="font-bold text-white">{pick.probabilidades.empate}%</p></div>
                        <div><p className="text-slate-500">Visit.</p><p className="font-bold text-white">{pick.probabilidades.visitante}%</p></div>
                      </div>
                    </div>
                  )}

                  {(pick.descripcion || pick.razon) && (
                    <p className="text-xs text-slate-400 italic mb-3">{pick.descripcion ?? pick.razon}</p>
                  )}

                  {apostarFn(pick) ? (
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all">
                      <span>Apostar</span><ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="w-full bg-slate-700/50 text-slate-400 font-semibold py-2.5 rounded-lg cursor-not-allowed">
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

/* ─────────────── COMPONENTE COMBINADAS ─────────────── */
function CombinadasSection({ data, title, accentColor }: { data: CombinadasData; title: string; accentColor: string }) {
  if (!data?.combinadas?.length) return (
    <div className="text-center py-16">
      <Info className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <p className="text-slate-400">No hay combinadas disponibles</p>
    </div>
  )

  const borderCls = accentColor === 'yellow' ? 'border-yellow-500/30' : 'border-amber-500/30'
  const textCls = accentColor === 'yellow' ? 'text-yellow-400' : 'text-amber-400'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-slate-400 text-sm mt-1">
          {data.estadisticas.total_combinadas} combinadas · Cuotas {data.estadisticas.cuota_minima.toFixed(1)}–{data.estadisticas.cuota_maxima.toFixed(1)} · Solo picks 70%+
        </p>
        {data.nota && <p className="text-slate-500 text-xs mt-1 italic">{data.nota}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`bg-slate-800/50 border ${borderCls} rounded-xl p-4`}>
          <p className="text-slate-400 text-xs mb-1">Cuota Mínima</p>
          <p className={`text-2xl font-bold ${textCls}`}>{data.estadisticas.cuota_minima.toFixed(2)}</p>
        </div>
        <div className={`bg-slate-800/50 border ${borderCls} rounded-xl p-4`}>
          <p className="text-slate-400 text-xs mb-1">Cuota Máxima</p>
          <p className={`text-2xl font-bold ${textCls}`}>{data.estadisticas.cuota_maxima.toFixed(2)}</p>
        </div>
        <div className={`bg-slate-800/50 border ${borderCls} rounded-xl p-4`}>
          <p className="text-slate-400 text-xs mb-1">Prob. Promedio</p>
          <p className={`text-2xl font-bold ${textCls}`}>{data.estadisticas.probabilidad_promedio}%</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.combinadas.map(combo => (
          <div key={combo.id} className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/40 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${catColor[combo.categoria] ?? 'from-slate-500 to-slate-600'} text-white`}>
                    {catLabel[combo.categoria] ?? combo.categoria}
                  </span>
                  <span className="text-xs text-slate-500">{combo.num_picks} picks</span>
                </div>
                <h3 className="text-lg font-bold text-white">{combo.nombre}</h3>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-black ${textCls}`}>{combo.cuota_total.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Cuota total</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Probabilidad</p>
                <p className="text-lg font-bold text-emerald-400">{combo.probabilidad}%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Kelly</p>
                <p className="text-lg font-bold text-blue-400">{combo.kelly_sugerido}%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">ROI Esp.</p>
                <p className="text-lg font-bold text-purple-400">+{combo.roi_esperado}%</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {combo.picks.map((pick, i) => (
                <div key={i} className="bg-slate-700/20 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{pick.partido}</p>
                    <p className="text-xs text-slate-400">{pick.pick}</p>
                    {pick.fecha && <p className="text-xs text-slate-600">{pick.fecha}</p>}
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Cuota</p>
                      <p className="text-sm font-bold text-emerald-400">{pick.cuota}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Conf.</p>
                      <p className="text-sm font-bold text-amber-400">{pick.confianza}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={`w-full bg-gradient-to-r ${catColor[combo.categoria] ?? 'from-amber-500 to-orange-600'} text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:opacity-90`}>
              <Zap className="w-5 h-5" />
              <span>Apostar Combinada · {combo.cuota_total.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────── COMPONENTE HISTORIAL ─────────────── */
function HistorialSection({ data }: { data: HistorialData }) {
  const g = data.estadisticas_globales
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Historial de Combinadas</h2>
        <p className="text-slate-400 text-sm mt-1">
          Seguimiento completo · Tasa: {g.tasa_acierto_global} · ROI: {g.roi_global > 0 ? '+' : ''}{g.roi_global}%
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Acertadas', val: g.combinadas_acertadas, color: 'emerald' },
          { label: 'Falladas', val: g.combinadas_falladas, color: 'rose' },
          { label: 'Tasa Acierto', val: g.tasa_acierto_global, color: 'blue' },
          { label: 'ROI Global', val: (g.roi_global > 0 ? '+' : '') + g.roi_global + '%', color: g.roi_global >= 0 ? 'emerald' : 'rose' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`bg-slate-800/50 border border-${color}-500/30 rounded-xl p-4`}>
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
                <p className="text-sm text-slate-400">{j.fecha_inicio} → {j.fecha_fin}</p>
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
                <div><p className="text-xs text-slate-400">Tasa Acierto</p><p className="text-lg font-bold text-emerald-400">{j.resumen.tasa_acierto}</p></div>
                <div><p className="text-xs text-slate-400">ROI Jornada</p><p className={`text-lg font-bold ${j.resumen.roi_jornada >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{j.resumen.roi_jornada > 0 ? '+' : ''}{j.resumen.roi_jornada}%</p></div>
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
                      <div className={`w-2.5 h-2.5 rounded-full ${c.estado === 'acertada' ? 'bg-emerald-500' : c.estado === 'fallada' ? 'bg-rose-500' : 'bg-slate-500'}`} />
                      <div>
                        <span className="font-semibold text-white text-sm">{c.nombre}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>{c.picks.length} picks</span>
                          <span>·</span>
                          <span>Prob: {c.probabilidad}%</span>
                          {c.estado !== 'pendiente' && (<><span>·</span><span className={c.estado === 'acertada' ? 'text-emerald-400' : 'text-rose-400'}>{c.estado === 'acertada' ? '✓ Acertada' : `✗ Fallada (${c.picks_acertados ?? 0}/${c.picks.length})`}</span></>)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-400">{c.cuota_total.toFixed(2)}</p>
                      {c.estado === 'acertada' && c.ganancia && <p className="text-xs font-bold text-emerald-400">+{c.ganancia}€</p>}
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

  useEffect(() => {
    Promise.all([
      fetch('/data/picks_complete.json').then(r => r.json()).catch(() => null),
      fetch('/data/combinadas.json').then(r => r.json()).catch(() => null),
      fetch('/data/combinadas_champions.json').then(r => r.json()).catch(() => null),
      fetch('/data/champions_data.json').then(r => r.json()).catch(() => null),
      fetch('/data/historial.json').then(r => r.json()).catch(() => null),
    ]).then(([picks, comb, combCL, champ, hist]) => {
      setPicksData(picks)
      setCombinadasData(comb)
      setCombinadasCL(combCL)
      setChampionsData(champ)
      setHistorialData(hist)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-white text-xl">Cargando predicciones...</p>
      </div>
    </div>
  )

  const getCurrentPartidos = () => {
    if (!picksData) return []
    const d = competition === 'primera' ? picksData.jornada.primera_division
              : competition === 'segunda' ? picksData.jornada.segunda_division
              : picksData.copa_del_rey
    if (!d) return []
    return showEdge ? d.partidos.filter(p => p.picks.some(pk => pk.apostar)) : d.partidos
  }
  const getCurrentNombre = () => {
    if (!picksData) return ''
    return competition === 'primera' ? picksData.jornada.primera_division.nombre
         : competition === 'segunda' ? picksData.jornada.segunda_division.nombre
         : picksData.copa_del_rey?.nombre ?? 'Copa del Rey'
  }
  const countPartidos = (k: 'primera' | 'segunda' | 'copa') => {
    if (!picksData) return 0
    if (k === 'primera') return picksData.jornada.primera_division.total_partidos
    if (k === 'segunda') return picksData.jornada.segunda_division.total_partidos
    return picksData.copa_del_rey?.total_partidos ?? 0
  }

  const tabs = [
    { key: 'picks', label: 'Predicciones', icon: Target, color: 'emerald' },
    { key: 'champions', label: 'Champions', icon: Star, color: 'yellow' },
    { key: 'combinadas', label: 'Combinadas', icon: Layers, color: 'amber', badge: combinadasData?.estadisticas.total_combinadas },
    { key: 'combinadas-cl', label: 'Comb. Champions', icon: Layers, color: 'yellow', badge: combinadasCL?.estadisticas.total_combinadas },
    { key: 'historial', label: 'Historial', icon: History, color: 'purple' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg shadow-emerald-500/40">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                ProBets <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">AI</span>
              </h1>
              {picksData && <p className="text-slate-400 text-xs">Modelo {picksData.modelo_version}</p>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map(({ key, label, icon: Icon, color, badge }) => (
              <button
                key={key}
                onClick={() => setTab(key as typeof tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  tab === key
                    ? color === 'yellow' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                    : color === 'amber' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : color === 'purple' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── TAB: PREDICCIONES ── */}
        {tab === 'picks' && picksData && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { icon: Zap, color: 'emerald', label: 'Picks con EDGE', val: picksData.metricas_validacion.total_edge_bets },
                { icon: Target, color: 'amber', label: 'Confianza Media', val: picksData.metricas_validacion.avg_confidence + '%' },
                { icon: BarChart3, color: 'blue', label: 'ROI Esperado', val: '+' + picksData.metricas_validacion.roi_esperado_percent + '%' },
                { icon: Activity, color: 'purple', label: 'Modelo', val: 'Ensemble' },
              ].map(({ icon: Icon, color, label, val }) => (
                <div key={label} className={`bg-gradient-to-br from-${color}-500/10 to-${color}-500/5 border border-${color}-500/30 rounded-xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                    <span className={`text-xs text-${color}-400 font-bold`}>{label.toUpperCase().substring(0,4)}</span>
                  </div>
                  <p className="text-2xl font-black text-white">{val}</p>
                  <p className="text-xs text-slate-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Competition selector */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {([
                { k: 'primera', label: 'LaLiga EA Sports', icon: Trophy, activeGrad: 'from-emerald-500 to-green-600' },
                { k: 'segunda', label: 'LaLiga Hypermotion', icon: TrendingUp, activeGrad: 'from-amber-500 to-orange-600' },
                { k: 'copa', label: 'Copa del Rey', icon: Shield, activeGrad: 'from-purple-500 to-pink-600' },
              ] as const).map(({ k, label, icon: Icon, activeGrad }) => (
                <button
                  key={k}
                  onClick={() => setCompetition(k)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    competition === k
                      ? `bg-gradient-to-r ${activeGrad} text-white shadow-2xl scale-105`
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" /><span>{label}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-70">{countPartidos(k)} partidos</p>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{getCurrentNombre()}</h2>
              <button
                onClick={() => setShowEdge(!showEdge)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${showEdge ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                {showEdge ? '✓ Solo EDGE' : 'Todos'}
              </button>
            </div>

            <div className="space-y-6">
              {getCurrentPartidos().map(p => (
                <PartidoCard
                  key={p.id}
                  partido={p}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                  competitionKey={competition}
                />
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

        {/* ── TAB: CHAMPIONS ── */}
        {tab === 'champions' && (
          <div>
            {/* Banner Champions */}
            <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/10 to-yellow-500/20 border border-yellow-500/40 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                <div>
                  <h2 className="text-2xl font-black text-white">UEFA Champions League</h2>
                  <p className="text-yellow-400 text-sm font-semibold">Play-offs — Ida · Jornada 9</p>
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
              <div className="space-y-6">
                {/* Partidos del 17 Feb */}
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Martes 17 de Febrero · 18:45 y 21:00
                  </h3>
                  <div className="space-y-4">
                    {championsData.partidos.filter(p => p.fecha === '2026-02-17').map(p => (
                      <PartidoCard
                        key={p.id}
                        partido={p}
                        expanded={expanded === p.id}
                        onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                        competitionKey="champions"
                      />
                    ))}
                  </div>
                </div>
                {/* Partidos del 18 Feb */}
                <div>
                  <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Miércoles 18 de Febrero · 18:45 y 21:00
                  </h3>
                  <div className="space-y-4">
                    {championsData.partidos.filter(p => p.fecha === '2026-02-18').map(p => (
                      <PartidoCard
                        key={p.id}
                        partido={p}
                        expanded={expanded === p.id}
                        onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                        competitionKey="champions"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Datos de Champions no disponibles</p>
                <p className="text-slate-500 text-sm mt-1">Sube champions_data.json a public/data/</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: COMBINADAS LIGA ── */}
        {tab === 'combinadas' && (
          combinadasData
            ? <CombinadasSection data={combinadasData} title="Combinadas — LaLiga y Segunda" accentColor="amber" />
            : <div className="text-center py-16"><Info className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Sube combinadas.json a public/data/</p></div>
        )}

        {/* ── TAB: COMBINADAS CHAMPIONS ── */}
        {tab === 'combinadas-cl' && (
          combinadasCL
            ? <CombinadasSection data={combinadasCL} title="Combinadas — Champions League" accentColor="yellow" />
            : <div className="text-center py-16"><Star className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Sube combinadas_champions.json a public/data/</p></div>
        )}

        {/* ── TAB: HISTORIAL ── */}
        {tab === 'historial' && (
          historialData
            ? <HistorialSection data={historialData} />
            : <div className="text-center py-16"><History className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">Sube historial.json a public/data/</p></div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-white font-bold mb-2">Modelo Avanzado</h3>
            <p className="text-slate-400 text-sm">Poisson-Dixon-Coles (50%) + ELO (30%) + Forma (20%)</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Competiciones</h3>
            <p className="text-slate-400 text-sm">LaLiga · Segunda División · Copa del Rey · Champions League</p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-2">Gestión de Bankroll</h3>
            <p className="text-slate-400 text-sm">Kelly Criterion conservador · Solo picks con edge real</p>
          </div>
        </div>
        <div className="text-center border-t border-slate-800 pt-6">
          <p className="text-slate-400 text-sm">© 2026 ProBets AI — Machine Learning para predicciones deportivas</p>
          <p className="text-slate-500 text-xs mt-2">Juega con responsabilidad. Las apuestas pueden generar adicción. +18</p>
        </div>
      </footer>
    </div>
  )
}
