'use client'

import { useState, useEffect } from 'react'
import { 
  Trophy, TrendingUp, Target, Clock, Calendar, ArrowRight, 
  ChevronDown, ChevronUp, Zap, Award, CheckCircle, XCircle, 
  BarChart3, Activity, Info, Shield, Layers, History, TrendingDown
} from 'lucide-react'

// ... [Todas las interfaces existentes] ...

interface Combinada {
  id: string
  nombre: string
  cuota_total: number
  probabilidad: number
  picks: {
    partido: string
    pick: string
    cuota: number
    confianza: number
  }[]
  kelly_sugerido: number
  roi_esperado: number
  categoria: string
}

interface CombinadasData {
  fecha_generacion: string
  jornada_actual: string
  combinadas: Combinada[]
  estadisticas: {
    total_combinadas: number
    cuota_minima: number
    cuota_maxima: number
    probabilidad_promedio: number
  }
}

interface HistorialCombinada extends Combinada {
  estado: 'pendiente' | 'acertada' | 'fallada'
  picks_acertados?: number
  picks_totales?: number
  ganancia?: number
}

interface HistorialData {
  ultima_actualizacion: string
  jornadas: {
    jornada: string
    fecha_inicio: string
    fecha_fin: string
    estado: 'pendiente' | 'en_curso' | 'finalizada'
    combinadas: HistorialCombinada[]
    resumen?: {
      tasa_acierto: string
      roi_jornada: number
    }
  }[]
  estadisticas_globales: {
    combinadas_totales: number
    combinadas_acertadas: number
    combinadas_falladas: number
    tasa_acierto_global: string
    roi_global: number
  }
}

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<'picks' | 'combinadas' | 'historial'>('picks')
  const [selectedCompetition, setSelectedCompetition] = useState<'primera' | 'segunda' | 'copa'>('primera')
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null)
  const [showOnlyEdge, setShowOnlyEdge] = useState(false)
  
  const [picksData, setPicksData] = useState<any>(null)
  const [combinadasData, setCombinadasData] = useState<CombinadasData | null>(null)
  const [historialData, setHistorialData] = useState<HistorialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/data/picks_complete.json').then(res => res.json()),
      fetch('/data/combinadas.json').then(res => res.json()).catch(() => null),
      fetch('/data/historial.json').then(res => res.json()).catch(() => null)
    ]).then(([picks, combinadas, historial]) => {
      setPicksData(picks)
      setCombinadasData(combinadas)
      setHistorialData(historial)
      setLoading(false)
    }).catch(err => {
      console.error('Error:', err)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header con tabs */}
      <header className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg shadow-emerald-500/40">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">ProBets AI</h1>
                <p className="text-slate-400 text-sm">Modelo {picksData.modelo_version}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('picks')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'picks'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Target className="w-5 h-5" />
              <span>Predicciones</span>
            </button>
            
            <button
              onClick={() => setSelectedTab('combinadas')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'combinadas'
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>Combinadas</span>
              {combinadasData && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {combinadasData.estadisticas.total_combinadas}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setSelectedTab('historial')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'historial'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              <History className="w-5 h-5" />
              <span>Historial</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB: PREDICCIONES */}
        {selectedTab === 'picks' && (
          <div>
            {/* Competition selector y resto del código existente */}
            <div className="text-center py-16">
              <Info className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Sección de Predicciones</p>
              <p className="text-slate-500 text-sm mt-2">(Código completo del archivo anterior)</p>
            </div>
          </div>
        )}

        {/* TAB: COMBINADAS */}
        {selectedTab === 'combinadas' && combinadasData && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Combinadas Inteligentes</h2>
              <p className="text-slate-400">
                {combinadasData.estadisticas.total_combinadas} combinadas generadas • 
                Sin repeticiones • Solo picks 70%+
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 border border-amber-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Cuota Mínima</p>
                <p className="text-2xl font-bold text-amber-400">
                  {combinadasData.estadisticas.cuota_minima.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Cuota Máxima</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {combinadasData.estadisticas.cuota_maxima.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Prob. Promedio</p>
                <p className="text-2xl font-bold text-purple-400">
                  {combinadasData.estadisticas.probabilidad_promedio}%
                </p>
              </div>
            </div>

            {/* Combinadas Grid */}
            <div className="space-y-4">
              {combinadasData.combinadas.map((combo) => (
                <div
                  key={combo.id}
                  className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{combo.nombre}</h3>
                      <p className="text-sm text-slate-400">{combo.picks.length} picks seleccionados</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-amber-400">{combo.cuota_total.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Cuota total</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400">Probabilidad</p>
                      <p className="text-lg font-bold text-emerald-400">{combo.probabilidad}%</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400">Kelly Sugerido</p>
                      <p className="text-lg font-bold text-blue-400">{combo.kelly_sugerido}%</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-xs text-slate-400">ROI Esperado</p>
                      <p className="text-lg font-bold text-purple-400">+{combo.roi_esperado}%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {combo.picks.map((pick, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-700/20 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{pick.partido}</p>
                          <p className="text-xs text-slate-400">{pick.pick}</p>
                        </div>
                        <div className="flex items-center gap-4">
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

                  <button className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg">
                    <Zap className="w-5 h-5" />
                    <span>Apostar Combinada</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: HISTORIAL */}
        {selectedTab === 'historial' && historialData && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Historial de Combinadas</h2>
              <p className="text-slate-400">
                Seguimiento completo de resultados • 
                Tasa global: {historialData.estadisticas_globales.tasa_acierto_global} • 
                ROI: {historialData.estadisticas_globales.roi_global > 0 ? '+' : ''}{historialData.estadisticas_globales.roi_global}%
              </p>
            </div>

            {/* Stats Globales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Acertadas</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {historialData.estadisticas_globales.combinadas_acertadas}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-rose-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Falladas</p>
                <p className="text-2xl font-bold text-rose-400">
                  {historialData.estadisticas_globales.combinadas_falladas}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">Tasa Acierto</p>
                <p className="text-2xl font-bold text-blue-400">
                  {historialData.estadisticas_globales.tasa_acierto_global}
                </p>
              </div>
              <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-4">
                <p className="text-slate-400 text-sm mb-1">ROI Global</p>
                <p className={`text-2xl font-bold ${historialData.estadisticas_globales.roi_global > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {historialData.estadisticas_globales.roi_global > 0 ? '+' : ''}{historialData.estadisticas_globales.roi_global}%
                </p>
              </div>
            </div>

            {/* Jornadas */}
            <div className="space-y-6">
              {historialData.jornadas.map((jornada, jIdx) => (
                <div key={jIdx} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{jornada.jornada}</h3>
                      <p className="text-sm text-slate-400">{jornada.fecha_inicio} - {jornada.fecha_fin}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      jornada.estado === 'finalizada' ? 'bg-blue-500/20 text-blue-400' :
                      jornada.estado === 'en_curso' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {jornada.estado === 'finalizada' ? 'Finalizada' :
                       jornada.estado === 'en_curso' ? 'En Curso' : 'Pendiente'}
                    </span>
                  </div>

                  {jornada.resumen && (
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-slate-700/20 rounded-lg">
                      <div>
                        <p className="text-xs text-slate-400">Tasa Acierto</p>
                        <p className="text-lg font-bold text-emerald-400">{jornada.resumen.tasa_acierto}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">ROI Jornada</p>
                        <p className={`text-lg font-bold ${jornada.resumen.roi_jornada > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {jornada.resumen.roi_jornada > 0 ? '+' : ''}{jornada.resumen.roi_jornada}%
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {jornada.combinadas.map((combo, cIdx) => (
                      <div
                        key={cIdx}
                        className={`border rounded-lg p-4 ${
                          combo.estado === 'acertada' ? 'bg-emerald-500/10 border-emerald-500/40' :
                          combo.estado === 'fallada' ? 'bg-rose-500/10 border-rose-500/40' :
                          'bg-slate-700/10 border-slate-600/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              combo.estado === 'acertada' ? 'bg-emerald-500' :
                              combo.estado === 'fallada' ? 'bg-rose-500' :
                              'bg-slate-500'
                            }`} />
                            <span className="font-semibold text-white">{combo.nombre}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">
                              Cuota: <span className="font-bold text-amber-400">{combo.cuota_total.toFixed(2)}</span>
                            </span>
                            {combo.estado === 'acertada' && combo.ganancia && (
                              <span className="text-sm font-bold text-emerald-400">
                                +{combo.ganancia}€
                              </span>
                            )}
                            {combo.estado === 'fallada' && (
                              <span className="text-sm font-bold text-rose-400">
                                -{combo.picks_totales ? combo.picks_acertados : 0}/{combo.picks_totales} picks
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{combo.picks.length} picks</span>
                          <span>•</span>
                          <span>Prob: {combo.probabilidad}%</span>
                          {combo.estado !== 'pendiente' && (
                            <>
                              <span>•</span>
                              <span className={combo.estado === 'acertada' ? 'text-emerald-400' : 'text-rose-400'}>
                                {combo.estado === 'acertada' ? '✓ Acertada' : '✗ Fallada'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="bg-slate-900/80 border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">© 2026 ProBets AI</p>
          <p className="text-slate-500 text-xs mt-2">Juega con responsabilidad</p>
        </div>
      </footer>
    </div>
  )
}
