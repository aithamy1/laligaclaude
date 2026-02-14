'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, TrendingUp, Target, Clock, MapPin, Calendar, ArrowRight, 
  ChevronDown, ChevronUp, Zap, Award, CheckCircle, XCircle, 
  BarChart3, Activity, Info, Shield
} from 'lucide-react'
 
 interface PicksData {
   fecha_generacion: string
   modelo_version: string
   jornada: {
     primera_division: {
       nombre: string
       partidos: Partido[]
       total_partidos: number
     }
     segunda_division: {
       nombre: string
       partidos: Partido[]
       total_partidos: number
     }
   }
   copa_del_rey?: {
     nombre: string
     partidos: Partido[]
     total_partidos: number
   }
  combinadas?: {
    nombre: string
    fuente_cuotas: string
    jornada: string
    apuestas: {
      id: string
      nombre: string
      cuota_total: number
      probabilidad_estimada: number
      estado: string
      picks: {
        partido: string
        seleccion: string
        cuota: number
        casa: string
      }[]
    }[]
  }
  historial?: {
    nombre: string
    combinadas: {
      id: string
      fecha: string
      descripcion: string
      cuota_total: number
      probabilidad_estimada: number
      resultado: string
    }[]
  }
   metricas_validacion: {
     brier_score: number
     log_loss: number
     total_edge_bets: number
     total_picks_generados: number
     avg_confidence: number
     roi_esperado_percent: number
   }
 }
 
 export default function Home() {
   const [selectedCompetition, setSelectedCompetition] = useState<'primera' | 'segunda' | 'copa'>('primera')
   const [expandedMatch, setExpandedMatch] = useState<number | null>(null)
   const [showOnlyEdge, setShowOnlyEdge] = useState(false)
   const [picksData, setPicksData] = useState<PicksData | null>(null)
   const [loading, setLoading] = useState(true)
 
   useEffect(() => {
     fetch('/data/picks_complete.json')
       .then(res => res.json())
       .then(data => {
         setPicksData(data)
         setLoading(false)
       })
       .catch(err => {
@@ -516,50 +545,131 @@ export default function Home() {
                               <span>Apostar con Edge</span>
                               <ArrowRight className="w-4 h-4" />
                             </button>
                           ) : (
                             <button className="w-full bg-slate-700/50 text-slate-400 font-semibold py-3 rounded-lg cursor-not-allowed">
                               {pick.cuota_mercado ? 'Edge Insuficiente' : 'Sin Cuotas Disponibles'}
                             </button>
                           )}
                         </div>
                       )
                     })}
                   </div>
                 </div>
               )}
             </div>
           ))}
         </div>
 
         {filteredPartidos.length === 0 && (
           <div className="text-center py-16">
             <Info className="w-16 h-16 text-slate-600 mx-auto mb-4" />
             <p className="text-slate-400 text-lg">No hay partidos disponibles en esta categoría</p>
             <p className="text-slate-500 text-sm mt-2">Prueba cambiando el filtro o la competición</p>
           </div>
         )}
+
+        {picksData.combinadas && (
+          <section className="mt-12">
+            <div className="flex items-center justify-between mb-5">
+              <div>
+                <h2 className="text-2xl font-bold text-white">COMBINADAS</h2>
+                <p className="text-sm text-slate-400">
+                  Jornada {picksData.combinadas.jornada} · {picksData.combinadas.fuente_cuotas}
+                </p>
+              </div>
+            </div>
+
+            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
+              {picksData.combinadas.apuestas.map((combinada) => (
+                <div key={combinada.id} className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
+                  <div className="flex items-center justify-between mb-3">
+                    <h3 className="text-lg font-bold text-white">{combinada.nombre}</h3>
+                    <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-1 rounded-full">
+                      {combinada.id}
+                    </span>
+                  </div>
+                  <div className="grid grid-cols-2 gap-3 mb-4">
+                    <div className="bg-slate-700/30 rounded-lg p-3">
+                      <p className="text-xs text-slate-400">Cuota total</p>
+                      <p className="text-2xl font-black text-emerald-400">{combinada.cuota_total}</p>
+                    </div>
+                    <div className="bg-slate-700/30 rounded-lg p-3">
+                      <p className="text-xs text-slate-400">Probabilidad estimada</p>
+                      <p className="text-2xl font-black text-amber-400">{combinada.probabilidad_estimada}%</p>
+                    </div>
+                  </div>
+                  <div className="space-y-2">
+                    {combinada.picks.map((pick, idx) => (
+                      <div key={`${combinada.id}-${idx}`} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-sm">
+                        <p className="text-slate-300 font-semibold">{pick.partido}</p>
+                        <p className="text-slate-400">{pick.seleccion}</p>
+                        <p className="text-xs text-slate-500 mt-1">Cuota {pick.cuota} · {pick.casa}</p>
+                      </div>
+                    ))}
+                  </div>
+                </div>
+              ))}
+            </div>
+          </section>
+        )}
+
+        {picksData.historial && (
+          <section className="mt-12">
+            <h2 className="text-2xl font-bold text-white mb-5">HISTORIAL</h2>
+            <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/50">
+              <table className="w-full text-sm">
+                <thead>
+                  <tr className="bg-slate-900/70 text-slate-300 text-left">
+                    <th className="px-4 py-3">ID</th>
+                    <th className="px-4 py-3">Fecha</th>
+                    <th className="px-4 py-3">Descripción</th>
+                    <th className="px-4 py-3">Cuota</th>
+                    <th className="px-4 py-3">Probabilidad</th>
+                    <th className="px-4 py-3">Estado</th>
+                  </tr>
+                </thead>
+                <tbody>
+                  {picksData.historial.combinadas.map((item) => (
+                    <tr key={item.id} className="border-t border-slate-700/50 text-slate-300">
+                      <td className="px-4 py-3 font-semibold">{item.id}</td>
+                      <td className="px-4 py-3">{item.fecha}</td>
+                      <td className="px-4 py-3">{item.descripcion}</td>
+                      <td className="px-4 py-3">{item.cuota_total}</td>
+                      <td className="px-4 py-3">{item.probabilidad_estimada}%</td>
+                      <td className="px-4 py-3">
+                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.resultado === 'cumplida' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
+                          {item.resultado === 'cumplida' ? 'Cumplida' : 'No cumplida'}
+                        </span>
+                      </td>
+                    </tr>
+                  ))}
+                </tbody>
+              </table>
+            </div>
+          </section>
+        )}
       </div>
 
       {/* Footer */}
       <footer className="bg-slate-900/80 border-t border-slate-800 mt-16 py-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
             <div>
               <h3 className="text-white font-bold mb-2">Modelo Avanzado</h3>
               <p className="text-slate-400 text-sm">Poisson-Dixon-Coles (50%) + ELO (30%) + Forma (20%)</p>
               <p className="text-slate-500 text-xs mt-1">Calibración: Platt Scaling</p>
             </div>
             <div>
               <h3 className="text-white font-bold mb-2">Validación</h3>
               <p className="text-slate-400 text-sm">Brier Score: {picksData.metricas_validacion.brier_score}</p>
               <p className="text-slate-400 text-sm">Log Loss: {picksData.metricas_validacion.log_loss}</p>
             </div>
             <div>
               <h3 className="text-white font-bold mb-2">Metodología Kelly</h3>
               <p className="text-slate-400 text-sm">Gestión conservadora de bankroll</p>
               <p className="text-slate-500 text-xs mt-1">Solo apuestas con edge positivo</p>
             </div>
           </div>
           <div className="text-center pt-6 border-t border-slate-800">
             <p className="text-slate-400 text-sm">
               © 2026 ProBets AI. Predicciones con Machine Learning Avanzado

import { useState, useEffect } from 'react'
import { 
  Trophy, TrendingUp, Target, Clock, MapPin, Calendar, ArrowRight, 
  ChevronDown, ChevronUp, Zap, Award, CheckCircle, XCircle, 
  BarChart3, Activity, Info, Shield
} from 'lucide-react'

interface Pick {
  tipo: string
  prediccion: string
  confianza: number
  cuota_mercado: number | null
  edge_percent: number
  apostar: boolean
  kelly_stake_percent: number
  razon: string
  modelo: string
  descripcion?: string
  probabilidades?: {
    local: number
    empate: number
    visitante: number
  }
}

interface Estadisticas {
  local_posicion: number
  visitante_posicion: number
  local_forma: string
  visitante_forma: string
  local_gf: number
  local_gc: number
  visitante_gf: number
  visitante_gc: number
  elo_local: number
  elo_visitante: number
}

interface Partido {
  id: number
  local: string
  visitante: string
  fecha: string
  hora: string
  estadio: string
  liga: string
  picks: Pick[]
  estadisticas: Estadisticas
  torneo?: string
}

interface PicksData {
  fecha_generacion: string
  modelo_version: string
  jornada: {
    primera_division: {
      nombre: string
      partidos: Partido[]
      total_partidos: number
    }
    segunda_division: {
      nombre: string
      partidos: Partido[]
      total_partidos: number
    }
  }
  copa_del_rey?: {
    nombre: string
    partidos: Partido[]
    total_partidos: number
  }
  combinadas?: {
    nombre: string
    fuente_cuotas: string
    jornada: string
    apuestas: {
      id: string
      nombre: string
      cuota_total: number
      probabilidad_estimada: number
      estado: string
      picks: {
        partido: string
        seleccion: string
        cuota: number
        casa: string
      }[]
    }[]
  }
  historial?: {
    nombre: string
    combinadas: {
      id: string
      fecha: string
      descripcion: string
      cuota_total: number
      probabilidad_estimada: number
      resultado: string
    }[]
  }
  metricas_validacion: {
    brier_score: number
    log_loss: number
    total_edge_bets: number
    total_picks_generados: number
    avg_confidence: number
    roi_esperado_percent: number
  }
}

export default function Home() {
  const [selectedCompetition, setSelectedCompetition] = useState<'primera' | 'segunda' | 'copa'>('primera')
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null)
  const [showOnlyEdge, setShowOnlyEdge] = useState(false)
  const [picksData, setPicksData] = useState<PicksData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/picks_complete.json')
      .then(res => res.json())
      .then(data => {
        setPicksData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading picks:', err)
        setLoading(false)
      })
  }, [])

  if (loading || !picksData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando predicciones...</p>
        </div>
      </div>
    )
  }

  const getCurrentData = () => {
    if (selectedCompetition === 'primera') return picksData.jornada.primera_division
    if (selectedCompetition === 'segunda') return picksData.jornada.segunda_division
    return picksData.copa_del_rey || { nombre: 'Copa del Rey', partidos: [], total_partidos: 0 }
  }

  const currentData = getCurrentData()
  const filteredPartidos = showOnlyEdge 
    ? currentData.partidos.filter(p => p.picks.some(pick => pick.apostar))
    : currentData.partidos

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'from-emerald-400 to-green-500'
    if (confidence >= 60) return 'from-amber-400 to-yellow-500'
    return 'from-rose-400 to-red-500'
  }

  const getEdgeBadge = (edge: number, apostar: boolean) => {
    if (!apostar) return { text: 'Sin Edge', color: 'bg-slate-600', icon: XCircle }
    if (edge >= 20) return { text: 'Edge Alto', color: 'bg-emerald-500', icon: Zap }
    if (edge >= 10) return { text: 'Edge Medio', color: 'bg-amber-500', icon: Award }
    return { text: 'Edge Bajo', color: 'bg-blue-500', icon: CheckCircle }
  }

  const formatForma = (forma: string) => {
    return forma.split('').map((resultado, idx) => {
      const color = resultado === 'V' ? 'bg-emerald-500' : resultado === 'E' ? 'bg-amber-500' : 'bg-rose-500'
      return (
        <span key={idx} className={`${color} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>
          {resultado}
        </span>
      )
    })
  }

  const getCompetitionColor = (competition: string) => {
    if (competition === 'primera') return 'from-emerald-500 to-green-600'
    if (competition === 'segunda') return 'from-amber-500 to-orange-600'
    return 'from-purple-500 to-pink-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg shadow-emerald-500/40 animate-pulse-slow">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  ProBets <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">AI</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Modelo {picksData.modelo_version}
                </p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-slate-800/50 rounded-xl px-4 py-3 border border-emerald-500/20">
                <p className="text-xs text-slate-400">Validación</p>
                <div className="flex items-center gap-4 mt-1">
                  <div>
                    <span className="text-emerald-400 font-bold text-sm">BS: {picksData.metricas_validacion.brier_score}</span>
                    <span className="text-slate-500 text-xs ml-1">&lt;0.1 ✓</span>
                  </div>
                  <div>
                    <span className="text-emerald-400 font-bold text-sm">LL: {picksData.metricas_validacion.log_loss}</span>
                    <span className="text-slate-500 text-xs ml-1">&lt;0.5 ✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Competition Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setSelectedCompetition('primera')}
            className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              selectedCompetition === 'primera'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-2xl shadow-emerald-500/40 scale-105'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy className="w-5 h-5" />
              <span>LaLiga EA Sports</span>
            </div>
            <p className="text-xs mt-1 opacity-80">{picksData.jornada.primera_division.total_partidos} partidos</p>
          </button>
          
          <button
            onClick={() => setSelectedCompetition('segunda')}
            className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              selectedCompetition === 'segunda'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-2xl shadow-amber-500/40 scale-105'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>LaLiga Hypermotion</span>
            </div>
            <p className="text-xs mt-1 opacity-80">{picksData.jornada.segunda_division.total_partidos} partidos</p>
          </button>

          <button
            onClick={() => setSelectedCompetition('copa')}
            className={`py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              selectedCompetition === 'copa'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-2xl shadow-purple-500/40 scale-105'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Copa del Rey</span>
            </div>
            <p className="text-xs mt-1 opacity-80">{picksData.copa_del_rey?.total_partidos || 0} partidos</p>
          </button>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-6 h-6 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-bold">EDGE</span>
            </div>
            <p className="text-3xl font-black text-white">{picksData.metricas_validacion.total_edge_bets}</p>
            <p className="text-xs text-slate-400 mt-1">Picks con Ventaja</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 backdrop-blur-sm border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-amber-400" />
              <span className="text-xs text-amber-400 font-bold">CONF</span>
            </div>
            <p className="text-3xl font-black text-white">{picksData.metricas_validacion.avg_confidence}%</p>
            <p className="text-xs text-slate-400 mt-1">Confianza Media</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-blue-400 font-bold">ROI</span>
            </div>
            <p className="text-3xl font-black text-white">+{picksData.metricas_validacion.roi_esperado_percent}%</p>
            <p className="text-xs text-slate-400 mt-1">Retorno Esperado</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400 font-bold">MODEL</span>
            </div>
            <p className="text-lg font-black text-white">Ensemble</p>
            <p className="text-xs text-slate-400 mt-1">Poisson-DC + ELO</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{currentData.nombre}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {filteredPartidos.length} partidos {showOnlyEdge && '(Solo con EDGE)'}
            </p>
          </div>
          <button
            onClick={() => setShowOnlyEdge(!showOnlyEdge)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              showOnlyEdge
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {showOnlyEdge ? '✓ Solo EDGE' : 'Todos los Partidos'}
          </button>
        </div>

        {/* Matches Grid */}
        <div className="space-y-6">
          {filteredPartidos.map((partido) => (
            <div
              key={partido.id}
              className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 shadow-xl"
            >
              {/* Match Header */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(partido.fecha).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{partido.hora}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs">
                      <span className="text-slate-500">ELO: </span>
                      <span className="text-emerald-400 font-bold">{partido.estadisticas.elo_local}</span>
                      <span className="text-slate-500 mx-1">vs</span>
                      <span className="text-amber-400 font-bold">{partido.estadisticas.elo_visitante}</span>
                    </div>
                  </div>
                </div>

                {/* Teams */}
                <div className="grid grid-cols-3 gap-4 items-center mb-4">
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-white mb-2">{partido.local}</h3>
                    <div className="flex justify-end gap-1 mb-2">
                      {formatForma(partido.estadisticas.local_forma)}
                    </div>
                    <div className="flex justify-end gap-3 text-xs text-slate-400">
                      <span>Pos: {partido.estadisticas.local_posicion}°</span>
                      <span className="text-emerald-400">{partido.estadisticas.local_gf} GF</span>
                      <span className="text-rose-400">{partido.estadisticas.local_gc} GC</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`bg-gradient-to-r ${getCompetitionColor(selectedCompetition)}/20 border ${getCompetitionColor(selectedCompetition).replace('from-', 'border-').replace(' to-green-600', '')}/40 rounded-full py-3 px-6`}>
                      <span className={`bg-gradient-to-r ${getCompetitionColor(selectedCompetition)} bg-clip-text text-transparent font-black text-lg`}>VS</span>
                    </div>
                  </div>

                  <div className="text-left">
                    <h3 className="text-xl font-bold text-white mb-2">{partido.visitante}</h3>
                    <div className="flex gap-1 mb-2">
                      {formatForma(partido.estadisticas.visitante_forma)}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400">
                      <span>Pos: {partido.estadisticas.visitante_posicion}°</span>
                      <span className="text-emerald-400">{partido.estadisticas.visitante_gf} GF</span>
                      <span className="text-rose-400">{partido.estadisticas.visitante_gc} GC</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/30">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Picks con EDGE</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {partido.picks.filter(p => p.apostar).length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Mejor Edge</p>
                    <p className="text-lg font-bold text-amber-400">
                      +{Math.max(...partido.picks.map(p => p.edge_percent)).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Estadio</p>
                    <p className="text-xs font-bold text-purple-400 truncate">{partido.estadio}</p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedMatch(expandedMatch === partido.id ? null : partido.id)}
                  className={`w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${getCompetitionColor(selectedCompetition)}/20 hover:${getCompetitionColor(selectedCompetition).replace('from-', 'hover:from-')}/30 border ${getCompetitionColor(selectedCompetition).replace('from-', 'border-').replace(' to-green-600', '')}/30 rounded-lg transition-all duration-200 font-semibold`}
                  style={{ 
                    background: selectedCompetition === 'primera' 
                      ? 'linear-gradient(to right, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                      : selectedCompetition === 'segunda'
                      ? 'linear-gradient(to right, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))'
                      : 'linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))',
                    borderColor: selectedCompetition === 'primera' 
                      ? 'rgba(16, 185, 129, 0.3)'
                      : selectedCompetition === 'segunda'
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(168, 85, 247, 0.3)'
                  }}
                >
                  <span className={selectedCompetition === 'primera' ? 'text-emerald-400' : selectedCompetition === 'segunda' ? 'text-amber-400' : 'text-purple-400'}>
                    Ver {partido.picks.length} Picks Avanzados
                  </span>
                  {expandedMatch === partido.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Picks Grid - Expanded */}
              {expandedMatch === partido.id && (
                <div className="p-6 bg-slate-900/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partido.picks.map((pick, idx) => {
                      const edgeBadge = getEdgeBadge(pick.edge_percent, pick.apostar)
                      const EdgeIcon = edgeBadge.icon
                      
                      return (
                        <div
                          key={idx}
                          className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 border ${
                            pick.apostar ? 'border-emerald-500/40' : 'border-slate-700/50'
                          } rounded-xl p-5 hover:shadow-xl transition-all duration-300 ${
                            pick.apostar ? 'hover:border-emerald-500/60 hover:shadow-emerald-500/20' : ''
                          }`}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <p className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1">
                                {pick.tipo}
                                {pick.apostar && <Zap className="w-3 h-3 text-emerald-400" />}
                              </p>
                              <h4 className="text-lg font-bold text-white">
                                {pick.prediccion}
                              </h4>
                              <p className="text-xs text-slate-500 mt-1">{pick.modelo}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`${edgeBadge.color} text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
                                <EdgeIcon className="w-3 h-3" />
                                {edgeBadge.text}
                              </span>
                              {pick.apostar && (
                                <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded border border-blue-500/40">
                                  Kelly: {pick.kelly_stake_percent}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Confidence Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-slate-400">Confianza</span>
                              <span className="text-sm font-bold text-white">{pick.confianza}%</span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${getConfidenceColor(pick.confianza)} rounded-full transition-all duration-500`}
                                style={{ width: `${pick.confianza}%` }}
                              />
                            </div>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-slate-700/30 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Cuota</p>
                              <p className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                                {pick.cuota_mercado || 'N/A'}
                              </p>
                            </div>
                            <div className="bg-slate-700/30 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Edge</p>
                              <p className={`text-2xl font-black ${pick.edge_percent > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {pick.edge_percent > 0 ? '+' : ''}{pick.edge_percent}%
                              </p>
                            </div>
                          </div>

                          {/* Probabilidades */}
                          {pick.probabilidades && (
                            <div className="mb-4 p-3 bg-slate-700/20 rounded-lg border border-slate-600/30">
                              <p className="text-xs text-slate-400 mb-2">Probabilidades del Modelo</p>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                  <p className="text-slate-500">Local</p>
                                  <p className="font-bold text-white">{pick.probabilidades.local}%</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-500">Empate</p>
                                  <p className="font-bold text-white">{pick.probabilidades.empate}%</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-500">Visitante</p>
                                  <p className="font-bold text-white">{pick.probabilidades.visitante}%</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Reason */}
                          <p className="text-xs text-slate-400 italic mb-4 pt-3 border-t border-slate-700/30">
                            {pick.razon}
                          </p>

                          {pick.descripcion && (
                            <p className="text-xs text-slate-500 mb-4">
                              {pick.descripcion}
                            </p>
                          )}

                          {/* Action Button */}
                          {pick.apostar ? (
                            <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-500/30">
                              <span>Apostar con Edge</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button className="w-full bg-slate-700/50 text-slate-400 font-semibold py-3 rounded-lg cursor-not-allowed">
                              {pick.cuota_mercado ? 'Edge Insuficiente' : 'Sin Cuotas Disponibles'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredPartidos.length === 0 && (
          <div className="text-center py-16">
            <Info className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No hay partidos disponibles en esta categoría</p>
            <p className="text-slate-500 text-sm mt-2">Prueba cambiando el filtro o la competición</p>
          </div>
        )}

        {picksData.combinadas && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">COMBINADAS</h2>
                <p className="text-sm text-slate-400">
                  Jornada {picksData.combinadas.jornada} · {picksData.combinadas.fuente_cuotas}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {picksData.combinadas.apuestas.map((combinada) => (
                <div key={combinada.id} className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{combinada.nombre}</h3>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-1 rounded-full">
                      {combinada.id}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400">Cuota total</p>
                      <p className="text-2xl font-black text-emerald-400">{combinada.cuota_total}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400">Probabilidad estimada</p>
                      <p className="text-2xl font-black text-amber-400">{combinada.probabilidad_estimada}%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {combinada.picks.map((pick, idx) => (
                      <div key={`${combinada.id}-${idx}`} className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3 text-sm">
                        <p className="text-slate-300 font-semibold">{pick.partido}</p>
                        <p className="text-slate-400">{pick.seleccion}</p>
                        <p className="text-xs text-slate-500 mt-1">Cuota {pick.cuota} · {pick.casa}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {picksData.historial && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-5">HISTORIAL</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/70 text-slate-300 text-left">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3">Cuota</th>
                    <th className="px-4 py-3">Probabilidad</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {picksData.historial.combinadas.map((item) => (
                    <tr key={item.id} className="border-t border-slate-700/50 text-slate-300">
                      <td className="px-4 py-3 font-semibold">{item.id}</td>
                      <td className="px-4 py-3">{item.fecha}</td>
                      <td className="px-4 py-3">{item.descripcion}</td>
                      <td className="px-4 py-3">{item.cuota_total}</td>
                      <td className="px-4 py-3">{item.probabilidad_estimada}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.resultado === 'cumplida' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {item.resultado === 'cumplida' ? 'Cumplida' : 'No cumplida'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="text-white font-bold mb-2">Modelo Avanzado</h3>
              <p className="text-slate-400 text-sm">Poisson-Dixon-Coles (50%) + ELO (30%) + Forma (20%)</p>
              <p className="text-slate-500 text-xs mt-1">Calibración: Platt Scaling</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">Validación</h3>
              <p className="text-slate-400 text-sm">Brier Score: {picksData.metricas_validacion.brier_score}</p>
              <p className="text-slate-400 text-sm">Log Loss: {picksData.metricas_validacion.log_loss}</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">Metodología Kelly</h3>
              <p className="text-slate-400 text-sm">Gestión conservadora de bankroll</p>
              <p className="text-slate-500 text-xs mt-1">Solo apuestas con edge positivo</p>
            </div>
          </div>
          <div className="text-center pt-6 border-t border-slate-800">
            <p className="text-slate-400 text-sm">
              © 2026 ProBets AI. Predicciones con Machine Learning Avanzado
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Juega con responsabilidad. Las apuestas pueden generar adicción.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
