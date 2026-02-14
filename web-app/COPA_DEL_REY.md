# 🏆 Cómo Añadir Partidos de Copa del Rey

## Partidos Actuales - Semifinales IDA (11-12 Febrero 2026)

Según la búsqueda web, las semifinales de Copa del Rey son:

### Semifinal 1
- **Athletic Club vs FC Barcelona**
- Fecha: 11 de febrero de 2026
- Estadio: San Mamés (Bilbao)

### Semifinal 2  
- **Real Sociedad vs Atlético de Madrid**
- Fecha: 12 de febrero de 2026
- Estadio: Reale Arena (San Sebastián)

## 📝 Cómo Añadir al Sistema

### Opción 1: Editar `scripts/betting_analyzer.py`

Añade esta lista después de `SEGUNDA_DIVISION_JORNADA_26`:

\`\`\`python
# Datos Copa del Rey - Semifinales IDA
COPA_DEL_REY_SEMIFINALES = [
    {
        "id": 17,
        "local": "Athletic Club",
        "visitante": "FC Barcelona",
        "fecha": "2026-02-11",
        "hora": "21:00",
        "estadio": "San Mamés",
        "liga": "Copa del Rey",
        "local_pos": 7,   # Posición en LaLiga
        "visitante_pos": 1,
        "local_forma": "VEEEV",
        "visitante_forma": "VVVVV",
        "local_goles_favor": 36,
        "local_goles_contra": 27,
        "visitante_goles_favor": 58,
        "visitante_goles_contra": 15,
        "local_ultimos_5": [3, 1, 1, 1, 3],
        "visitante_ultimos_5": [3, 3, 3, 3, 3],
        "torneo": "copa"
    },
    {
        "id": 18,
        "local": "Real Sociedad",
        "visitante": "Atlético Madrid",
        "fecha": "2026-02-12",
        "hora": "21:00",
        "estadio": "Reale Arena",
        "liga": "Copa del Rey",
        "local_pos": 4,
        "visitante_pos": 3,
        "local_forma": "EVEDE",
        "visitante_forma": "VVEVE",
        "local_goles_favor": 40,
        "local_goles_contra": 25,
        "visitante_goles_favor": 48,
        "visitante_goles_contra": 22,
        "local_ultimos_5": [1, 3, 1, 0, 1],
        "visitante_ultimos_5": [3, 3, 1, 3, 1],
        "torneo": "copa"
    }
]
\`\`\`

Luego actualiza el `__init__` de la clase:

\`\`\`python
def __init__(self):
    self.partidos = (PRIMERA_DIVISION_JORNADA_24 + 
                     SEGUNDA_DIVISION_JORNADA_26 + 
                     COPA_DEL_REY_SEMIFINALES)
    self.elo_ratings = {}
    self.initialize_elo()
\`\`\`

Y actualiza el reporte para incluir Copa:

\`\`\`python
def generar_reporte_completo(self) -> Dict:
    primera_division = []
    segunda_division = []
    copa_del_rey = []  # Nueva lista
    
    for partido in self.partidos:
        picks = self.generar_predicciones(partido)
        # ... código existente ...
        
        partido_data = {
            # ... datos del partido ...
        }
        
        if "LaLiga EA Sports" in partido["liga"]:
            primera_division.append(partido_data)
        elif "Copa del Rey" in partido["liga"]:
            copa_del_rey.append(partido_data)
        else:
            segunda_division.append(partido_data)
    
    return {
        # ... código existente ...
        "jornada": {
            "primera_division": { ... },
            "segunda_division": { ... },
        },
        "copa_del_rey": {
            "nombre": "Copa del Rey - Semifinales IDA",
            "partidos": copa_del_rey,
            "total_partidos": len(copa_del_rey)
        },
        # ... resto del código ...
    }
\`\`\`

### Opción 2: Añadir Cuotas Reales de Copa

Actualiza el diccionario `MARKET_ODDS`:

\`\`\`python
MARKET_ODDS = {
    # ... odds existentes ...
    
    # Copa del Rey - Semifinales
    17: {  # Athletic vs Barcelona
        "home": 3.50,
        "draw": 3.40,
        "away": 2.00,
        "btts_yes": 1.70,
        "over25": 1.85
    },
    18: {  # Real Sociedad vs Atlético Madrid
        "home": 2.60,
        "draw": 3.20,
        "away": 2.80,
        "btts_yes": 1.65,
        "over25": 1.75
    }
}
\`\`\`

## 🔄 Ejecutar el Análisis

\`\`\`bash
# Desde la raíz del proyecto
python3 scripts/betting_analyzer.py

# Copiar resultados
cp picks_fixed.json public/data/picks_complete.json
\`\`\`

## 📊 Verificar en la Web

La interfaz ya está preparada para mostrar Copa del Rey:
- ✅ Botón "Copa del Rey" en el selector de competiciones
- ✅ Color morado/rosa para Copa
- ✅ Filtrado automático de partidos

## 🎯 Datos que Necesitas para Nuevos Partidos

Para cada partido de Copa necesitas:

1. **Equipos**: Nombre local y visitante
2. **Fecha y Hora**: En formato "YYYY-MM-DD" y "HH:MM"
3. **Estadio**: Nombre del estadio
4. **Posiciones**: Posición actual en LaLiga de ambos equipos
5. **Forma**: Últimos 5 resultados (V/E/D)
6. **Goles**: Total goles a favor y en contra en la temporada
7. **Cuotas de Mercado**: home, draw, away, btts_yes, over25

## 📅 Próximos Partidos de Copa del Rey

### Semifinales VUELTA (3-4 Marzo 2026)
- Barcelona vs Athletic Club
- Atlético Madrid vs Real Sociedad

Para añadirlos, usa el mismo formato con:
- `"torneo": "copa"`
- `"liga": "Copa del Rey - Semifinales VUELTA"`

### Final (18-19 Abril 2026)
- Ganador SF1 vs Ganador SF2
- Estadio: La Cartuja (Sevilla)

## 🔍 Fuentes de Datos

- **Estadísticas**: BeSoccer, Transfermarkt, SofaScore
- **Cuotas**: Bet365, Codere, William Hill
- **Clasificación**: LaLiga.com oficial
- **Partidos**: RFEF.es

## ⚠️ Notas Importantes

1. **ELO**: Se calcula basado en posición en LaLiga
2. **Forma**: Incluye todos los partidos recientes (liga + copa)
3. **Goles**: Usar estadísticas de TODA la temporada
4. **Cuotas**: Actualizar con odds REALES antes de publicar

## 🚀 Automatización Futura

Para automatizar la recolección de datos de Copa:

1. Integrar con API de resultados (ej: API-Football)
2. Scraping de RFEF.es o BeSoccer
3. Webhook que se dispare cuando hay nuevo sorteo

---

*Para más información, ver `scripts/betting_analyzer.py` líneas 100-200*
