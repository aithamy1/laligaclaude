#!/usr/bin/env python3
"""
Sistema Automático de Generación de Combinadas
- Sin repeticiones de partidos/picks entre combinadas
- Solo picks con 70%+ de probabilidad
- Guarda automáticamente en historial
"""

import json
import random
from datetime import datetime
from typing import List, Dict, Set, Tuple
from itertools import combinations

class CombinadorAutomatico:
    """Genera combinadas inteligentes sin repeticiones"""
    
    def __init__(self, picks_file: str = 'picks_complete.json'):
        with open(picks_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        self.picks_disponibles = []
        self.combinadas_generadas = []
        self.picks_usados_global = set()  # Para evitar repeticiones globales
        
    def extraer_picks_alta_probabilidad(self):
        """Extrae solo picks con 70%+ de confianza y que tengan cuota"""
        picks_filtrados = []
        
        # Procesar Primera División
        for partido in self.data['jornada']['primera_division']['partidos']:
            for pick in partido['picks']:
                if pick['confianza'] >= 70.0 and pick.get('cuota_mercado') and pick.get('apostar'):
                    pick_id = f"{partido['local']}_vs_{partido['visitante']}_{pick['tipo']}_{pick['prediccion']}"
                    picks_filtrados.append({
                        'id': pick_id,
                        'partido': f"{partido['local']} vs {partido['visitante']}",
                        'competicion': 'LaLiga',
                        'pick_tipo': pick['tipo'],
                        'prediccion': pick['prediccion'],
                        'confianza': pick['confianza'],
                        'cuota': pick['cuota_mercado'],
                        'fecha': partido['fecha'],
                        'hora': partido['hora']
                    })
        
        # Procesar Segunda División
        for partido in self.data['jornada']['segunda_division']['partidos']:
            for pick in partido['picks']:
                if pick['confianza'] >= 70.0 and pick.get('cuota_mercado') and pick.get('apostar'):
                    pick_id = f"{partido['local']}_vs_{partido['visitante']}_{pick['tipo']}_{pick['prediccion']}"
                    picks_filtrados.append({
                        'id': pick_id,
                        'partido': f"{partido['local']} vs {partido['visitante']}",
                        'competicion': 'Segunda',
                        'pick_tipo': pick['tipo'],
                        'prediccion': pick['prediccion'],
                        'confianza': pick['confianza'],
                        'cuota': pick['cuota_mercado'],
                        'fecha': partido['fecha'],
                        'hora': partido['hora']
                    })
        
        # Procesar Copa del Rey si existe
        if 'copa_del_rey' in self.data and self.data['copa_del_rey']:
            for partido in self.data['copa_del_rey']['partidos']:
                for pick in partido['picks']:
                    if pick['confianza'] >= 70.0 and pick.get('cuota_mercado') and pick.get('apostar'):
                        pick_id = f"{partido['local']}_vs_{partido['visitante']}_{pick['tipo']}_{pick['prediccion']}"
                        picks_filtrados.append({
                            'id': pick_id,
                            'partido': f"{partido['local']} vs {partido['visitante']}",
                            'competicion': 'Copa del Rey',
                            'pick_tipo': pick['tipo'],
                            'prediccion': pick['prediccion'],
                            'confianza': pick['confianza'],
                            'cuota': pick['cuota_mercado'],
                            'fecha': partido['fecha'],
                            'hora': partido['hora']
                        })
        
        # Ordenar por confianza descendente
        picks_filtrados.sort(key=lambda x: x['confianza'], reverse=True)
        
        print(f"✅ {len(picks_filtrados)} picks con 70%+ confianza y cuota disponible")
        return picks_filtrados
    
    def generar_combinada(self, num_picks: int, picks_pool: List[Dict], 
                         picks_prohibidos: Set[str]) -> Dict:
        """
        Genera UNA combinada sin usar picks prohibidos
        """
        # Filtrar picks disponibles (no usados)
        picks_disponibles = [p for p in picks_pool if p['id'] not in picks_prohibidos]
        
        if len(picks_disponibles) < num_picks:
            print(f"⚠️  Solo quedan {len(picks_disponibles)} picks, no se puede crear combinada de {num_picks}")
            return None
        
        # Estrategia: NO repetir partidos en la misma combinada
        partidos_usados = set()
        picks_seleccionados = []
        
        for pick in picks_disponibles:
            # Extraer nombre del partido base (sin "vs")
            partido_key = pick['partido']
            
            # Si este partido ya está en la combinada, saltar
            if partido_key in partidos_usados:
                continue
            
            picks_seleccionados.append(pick)
            partidos_usados.add(partido_key)
            
            if len(picks_seleccionados) == num_picks:
                break
        
        if len(picks_seleccionados) < num_picks:
            print(f"⚠️  No hay suficientes partidos diferentes para {num_picks} picks")
            return None
        
        # Calcular cuota total y probabilidad
        cuota_total = 1.0
        prob_combinada = 1.0
        
        for pick in picks_seleccionados:
            cuota_total *= pick['cuota']
            prob_combinada *= (pick['confianza'] / 100)
        
        # Marcar estos picks como usados globalmente
        for pick in picks_seleccionados:
            picks_prohibidos.add(pick['id'])
        
        return {
            'picks': picks_seleccionados,
            'cuota_total': round(cuota_total, 2),
            'probabilidad': round(prob_combinada * 100, 1),
            'num_picks': num_picks
        }
    
    def generar_todas_combinadas(self):
        """
        Genera múltiples combinadas con CERO repeticiones
        """
        picks_pool = self.extraer_picks_alta_probabilidad()
        
        if len(picks_pool) < 3:
            print("❌ No hay suficientes picks con 70%+ confianza")
            return []
        
        picks_prohibidos = set()
        combinadas = []
        
        # Estrategia de generación:
        # 1. Combinadas pequeñas (3-4 picks) - cuotas ~5-15
        # 2. Combinadas medianas (5-6 picks) - cuotas ~15-30
        # 3. Combinadas grandes (7-8 picks) - cuotas ~30-50+
        
        estrategias = [
            (3, "Value Safe", "safe"),
            (4, "Medium Value", "medium"),
            (3, "Quick Win", "safe"),
            (5, "Power Combo", "medium"),
            (4, "Smart Pick", "medium"),
            (6, "High Stakes", "high"),
            (5, "Risk-Reward", "medium-high"),
            (7, "Monster Combo", "ultra-high"),
        ]
        
        combo_id = 1
        
        for num_picks, nombre_base, categoria in estrategias:
            combo = self.generar_combinada(num_picks, picks_pool, picks_prohibidos)
            
            if combo is None:
                print(f"⏭️  Saltando combinada {nombre_base} (no hay picks disponibles)")
                continue
            
            # Calcular ROI esperado
            roi_esperado = (combo['cuota_total'] - 1) * combo['probabilidad']
            
            # Calcular Kelly sugerido (conservador)
            kelly = ((combo['cuota_total'] - 1) * (combo['probabilidad'] / 100) - 
                    (1 - combo['probabilidad'] / 100)) / (combo['cuota_total'] - 1)
            kelly_sugerido = max(0, min(kelly * 0.25, 5.0))  # Max 5%
            
            combinada_data = {
                'id': f"comb_{combo_id:03d}",
                'nombre': f"{nombre_base} - Cuota {combo['cuota_total']}",
                'cuota_total': combo['cuota_total'],
                'probabilidad': combo['probabilidad'],
                'num_picks': combo['num_picks'],
                'picks': [
                    {
                        'partido': p['partido'],
                        'competicion': p['competicion'],
                        'pick': f"{p['pick_tipo']}: {p['prediccion']}",
                        'cuota': p['cuota'],
                        'confianza': p['confianza'],
                        'fecha': p['fecha'],
                        'hora': p['hora']
                    }
                    for p in combo['picks']
                ],
                'edge_promedio': round(sum(p['confianza'] for p in combo['picks']) / len(combo['picks']) - 50, 1),
                'kelly_sugerido': round(kelly_sugerido, 1),
                'roi_esperado': round(roi_esperado, 1),
                'categoria': categoria,
                'estado': 'pendiente',
                'fecha_creacion': datetime.now().isoformat()
            }
            
            combinadas.append(combinada_data)
            combo_id += 1
            
            print(f"✅ Generada: {combinada_data['nombre']} | Prob: {combo['probabilidad']}% | Picks: {num_picks}")
        
        return combinadas
    
    def guardar_combinadas(self, combinadas: List[Dict], output_file: str = 'combinadas.json'):
        """Guarda combinadas en formato JSON"""
        
        estadisticas = {
            'total_combinadas': len(combinadas),
            'cuota_minima': min(c['cuota_total'] for c in combinadas) if combinadas else 0,
            'cuota_maxima': max(c['cuota_total'] for c in combinadas) if combinadas else 0,
            'probabilidad_promedio': round(sum(c['probabilidad'] for c in combinadas) / len(combinadas), 1) if combinadas else 0,
            'roi_promedio': round(sum(c['roi_esperado'] for c in combinadas) / len(combinadas), 1) if combinadas else 0,
            'picks_totales': sum(c['num_picks'] for c in combinadas)
        }
        
        data = {
            'fecha_generacion': datetime.now().isoformat(),
            'jornada_actual': 'Jornada 24-26',
            'combinadas': combinadas,
            'estadisticas': estadisticas,
            'nota': 'Todas las combinadas usan picks DIFERENTES. Sin repeticiones.'
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Guardado en {output_file}")
        print(f"📊 Estadísticas:")
        print(f"   - Total combinadas: {estadisticas['total_combinadas']}")
        print(f"   - Cuota mín/máx: {estadisticas['cuota_minima']}/{estadisticas['cuota_maxima']}")
        print(f"   - Probabilidad promedio: {estadisticas['probabilidad_promedio']}%")
        print(f"   - ROI promedio: {estadisticas['roi_promedio']}%")
    
    def agregar_a_historial(self, combinadas: List[Dict], historial_file: str = 'historial.json'):
        """
        Agrega automáticamente las combinadas al historial
        """
        try:
            with open(historial_file, 'r', encoding='utf-8') as f:
                historial = json.load(f)
        except FileNotFoundError:
            historial = {
                'ultima_actualizacion': datetime.now().isoformat(),
                'jornadas': [],
                'estadisticas_globales': {
                    'jornadas_analizadas': 0,
                    'combinadas_totales': 0,
                    'combinadas_acertadas': 0,
                    'combinadas_falladas': 0,
                    'combinadas_pendientes': 0,
                    'tasa_acierto_global': 0.0,
                    'roi_global': 0.0
                }
            }
        
        # Buscar jornada actual o crear nueva
        jornada_actual = None
        for jornada in historial['jornadas']:
            if jornada['estado'] == 'en_curso' or jornada['estado'] == 'pendiente':
                jornada_actual = jornada
                break
        
        if not jornada_actual:
            # Crear nueva jornada
            jornada_actual = {
                'jornada': 'Jornada 24-26',
                'fecha_inicio': '2026-02-13',
                'fecha_fin': '2026-02-16',
                'estado': 'pendiente',
                'combinadas_creadas': 0,
                'combinadas_resueltas': 0,
                'combinadas_pendientes': 0,
                'roi_actual': 0.0,
                'combinadas': []
            }
            historial['jornadas'].insert(0, jornada_actual)
        
        # Agregar combinadas a la jornada actual
        for combo in combinadas:
            combo_historial = {
                'id': combo['id'],
                'nombre': combo['nombre'],
                'cuota': combo['cuota_total'],
                'probabilidad': combo['probabilidad'],
                'estado': 'pendiente',
                'fecha_creacion': combo['fecha_creacion'],
                'picks_totales': combo['num_picks'],
                'picks_acertados': 0,
                'picks': [
                    {
                        'partido': p['partido'],
                        'pick': p['pick'],
                        'cuota': p['cuota'],
                        'estado': 'pendiente',
                        'resultado_real': None
                    }
                    for p in combo['picks']
                ]
            }
            
            jornada_actual['combinadas'].append(combo_historial)
        
        # Actualizar contadores
        jornada_actual['combinadas_creadas'] = len(jornada_actual['combinadas'])
        jornada_actual['combinadas_pendientes'] = len(jornada_actual['combinadas'])
        
        # Actualizar estadísticas globales
        total_pendientes = sum(
            len([c for c in j['combinadas'] if c.get('estado') == 'pendiente'])
            for j in historial['jornadas']
        )
        
        historial['estadisticas_globales']['combinadas_pendientes'] = total_pendientes
        historial['estadisticas_globales']['combinadas_totales'] += len(combinadas)
        historial['ultima_actualizacion'] = datetime.now().isoformat()
        
        # Guardar
        with open(historial_file, 'w', encoding='utf-8') as f:
            json.dump(historial, f, ensure_ascii=False, indent=2)
        
        print(f"\n📚 Historial actualizado: {len(combinadas)} combinadas añadidas")


def main():
    """Ejecuta el generador automático"""
    print("=" * 70)
    print("🤖 GENERADOR AUTOMÁTICO DE COMBINADAS SIN REPETICIONES")
    print("=" * 70)
    print()
    
    # Crear generador
    generador = CombinadorAutomatico('public/data/picks_complete.json')
    
    # Generar combinadas
    combinadas = generador.generar_todas_combinadas()
    
    if not combinadas:
        print("❌ No se pudieron generar combinadas")
        return
    
    # Guardar combinadas
    generador.guardar_combinadas(combinadas, 'public/data/combinadas.json')
    
    # Agregar al historial automáticamente
    generador.agregar_a_historial(combinadas, 'public/data/historial.json')
    
    print("\n" + "=" * 70)
    print("✅ PROCESO COMPLETADO")
    print("=" * 70)
    print("\nArchivos generados:")
    print("  📄 public/data/combinadas.json")
    print("  📄 public/data/historial.json (actualizado)")
    print()
    print("🎯 Todas las combinadas usan picks ÚNICOS (sin repetir)")
    print("✅ Solo picks con 70%+ de probabilidad")
    print("📊 Automáticamente guardadas en historial")


if __name__ == "__main__":
    main()
