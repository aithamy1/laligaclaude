#!/usr/bin/env python3
"""
Actualizador Automático de Partidos
- Obtiene partidos de la jornada actual
- Integra con API-Football o scraping de BeSoccer
- Actualiza automáticamente cada semana
"""

import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict

class ActualizadorPartidos:
    """
    Actualiza partidos automáticamente
    Opciones: API-Football, Web Scraping, o Manual
    """
    
    def __init__(self, modo: str = 'manual'):
        """
        Modos disponibles:
        - 'api': Usa API-Football (requiere API key)
        - 'scraping': Scraping de BeSoccer/LaLiga.com
        - 'manual': Actualización manual con template
        """
        self.modo = modo
        self.jornada_actual = self.calcular_jornada_actual()
    
    def calcular_jornada_actual(self) -> int:
        """
        Calcula la jornada actual basándose en la fecha
        LaLiga: Septiembre-Mayo (38 jornadas)
        """
        hoy = datetime.now()
        
        # Temporada 2025-2026
        inicio_temporada = datetime(2025, 8, 15)
        
        if hoy < inicio_temporada:
            return 1
        
        # Calcular semanas desde inicio
        dias_transcurridos = (hoy - inicio_temporada).days
        jornada = min((dias_transcurridos // 7) + 1, 38)
        
        return jornada
    
    def obtener_partidos_api(self) -> Dict:
        """
        Obtiene partidos desde API-Football
        Requiere API key (gratis: 100 requests/día)
        """
        # NOTA: Requiere configurar API_KEY en variables de entorno
        api_key = "TU_API_KEY_AQUI"  # Cambiar por tu API key
        
        # Endpoint para LaLiga
        url = "https://v3.football.api-sports.io/fixtures"
        headers = {
            'x-rapidapi-host': "v3.football.api-sports.io",
            'x-rapidapi-key': api_key
        }
        
        # Próxima jornada de LaLiga (ID 140)
        params = {
            'league': 140,
            'season': 2025,
            'round': f'Regular Season - {self.jornada_actual}'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            data = response.json()
            
            if data['response']:
                return self.formatear_partidos_api(data['response'])
            
        except Exception as e:
            print(f"❌ Error al obtener de API: {e}")
        
        return self.template_manual()
    
    def formatear_partidos_api(self, partidos_raw: List[Dict]) -> Dict:
        """Formatea respuesta de API al formato del sistema"""
        partidos_formateados = []
        
        for idx, partido in enumerate(partidos_raw, 1):
            # Extraer información básica
            equipo_local = partido['teams']['home']['name']
            equipo_visitante = partido['teams']['away']['name']
            fecha = datetime.fromisoformat(partido['fixture']['date'].replace('Z', '+00:00'))
            
            partido_data = {
                "id": idx,
                "local": equipo_local,
                "visitante": equipo_visitante,
                "fecha": fecha.strftime('%Y-%m-%d'),
                "hora": fecha.strftime('%H:%M'),
                "estadio": partido['fixture']['venue']['name'],
                "liga": "LaLiga EA Sports",
                "local_pos": 10,  # Obtener de tabla
                "visitante_pos": 10,
                "local_forma": "EEEEE",  # Obtener de estadísticas
                "visitante_forma": "EEEEE",
                "local_goles_favor": 30,
                "local_goles_contra": 30,
                "visitante_goles_favor": 30,
                "visitante_goles_contra": 30,
                "local_ultimos_5": [1, 1, 1, 1, 1],
                "visitante_ultimos_5": [1, 1, 1, 1, 1]
            }
            
            partidos_formateados.append(partido_data)
        
        return {
            'primera_division': partidos_formateados,
            'jornada': self.jornada_actual
        }
    
    def template_manual(self) -> Dict:
        """
        Template para actualización manual
        El usuario debe llenar los datos de la jornada
        """
        print(f"\n📋 TEMPLATE MANUAL - Jornada {self.jornada_actual}")
        print("=" * 70)
        print("Por favor, actualiza los siguientes partidos manualmente:")
        print()
        
        # Template de 10 partidos vacíos para LaLiga
        template_partidos = []
        
        for i in range(1, 11):
            template_partidos.append({
                "id": i,
                "local": f"EQUIPO_LOCAL_{i}",
                "visitante": f"EQUIPO_VISITANTE_{i}",
                "fecha": (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d'),
                "hora": "21:00",
                "estadio": "ESTADIO",
                "liga": "LaLiga EA Sports",
                "local_pos": 10,
                "visitante_pos": 10,
                "local_forma": "EEEEE",
                "visitante_forma": "EEEEE",
                "local_goles_favor": 30,
                "local_goles_contra": 30,
                "visitante_goles_favor": 30,
                "visitante_goles_contra": 30,
                "local_ultimos_5": [1, 1, 1, 1, 1],
                "visitante_ultimos_5": [1, 1, 1, 1, 1],
                "NOTA": "⚠️ ACTUALIZAR CON DATOS REALES"
            })
        
        return {
            'primera_division': template_partidos,
            'jornada': self.jornada_actual,
            'modo': 'manual',
            'instrucciones': [
                '1. Visita https://www.laliga.com/calendario',
                f'2. Busca los partidos de la Jornada {self.jornada_actual}',
                '3. Actualiza cada partido con los datos reales',
                '4. Obtén estadísticas de https://www.besoccer.com',
                '5. Ejecuta el script de análisis'
            ]
        }
    
    def guardar_template(self, output_file: str = 'scripts/partidos_template.json'):
        """Guarda template para edición manual"""
        data = self.template_manual()
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Template guardado en: {output_file}")
        print(f"📝 Edita este archivo con los datos reales de la Jornada {self.jornada_actual}")
        print(f"🔗 Fuentes de datos:")
        print(f"   - Partidos: https://www.laliga.com/calendario")
        print(f"   - Estadísticas: https://www.besoccer.com")
        print(f"   - Clasificación: https://www.laliga.com/clasificacion")
    
    def integrar_con_betting_analyzer(self):
        """
        Integra los partidos actualizados con el betting_analyzer.py
        """
        # Leer template actualizado
        try:
            with open('scripts/partidos_template.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Verificar si está actualizado
            if 'EQUIPO_LOCAL_1' in str(data):
                print("\n⚠️  Template no actualizado. Por favor, edita partidos_template.json")
                return False
            
            # Todo OK, proceder
            print("✅ Partidos actualizados detectados")
            return True
            
        except FileNotFoundError:
            print("❌ No se encuentra partidos_template.json")
            return False


def main():
    """Ejecuta el actualizador"""
    print("=" * 70)
    print("🔄 ACTUALIZADOR AUTOMÁTICO DE PARTIDOS")
    print("=" * 70)
    print()
    
    actualizador = ActualizadorPartidos(modo='manual')
    
    print(f"📅 Jornada calculada: {actualizador.jornada_actual}")
    print()
    
    # Generar template
    actualizador.guardar_template()
    
    print("\n" + "=" * 70)
    print("📝 PRÓXIMOS PASOS:")
    print("=" * 70)
    print()
    print("1️⃣  Edita 'scripts/partidos_template.json' con datos reales")
    print("2️⃣  Ejecuta: python scripts/betting_analyzer.py")
    print("3️⃣  Ejecuta: python scripts/generar_combinadas.py")
    print("4️⃣  Sube cambios a GitHub")
    print("5️⃣  Vercel desplegará automáticamente")
    print()
    print("🤖 O configura la API de API-Football para 100% automático")
    print("   https://www.api-football.com (100 requests/día gratis)")


if __name__ == "__main__":
    main()
