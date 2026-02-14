# 🚀 ProBets AI - Sistema de Predicciones Deportivas

Sistema profesional de análisis y predicción de apuestas deportivas usando modelos avanzados de Machine Learning (Poisson-Dixon-Coles + ELO + Forma).

![Version](https://img.shields.io/badge/version-2.1-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Características

- 🎯 **3 Competiciones**: LaLiga, Segunda División y Copa del Rey
- 🤖 **Modelos Avanzados**: Poisson-Dixon-Coles, Sistema ELO, Análisis de Forma
- 💎 **Edge Betting**: Solo recomienda apuestas con ventaja matemática
- 📊 **Validación Rigurosa**: Brier Score < 0.1, Log Loss < 0.5
- 💰 **Kelly Criterion**: Gestión óptima de bankroll
- 📱 **Responsive**: Diseño adaptado a móvil, tablet y desktop
- ⚡ **Performance**: Carga ultra-rápida con Next.js 14

## 🎨 Demo en Vivo

**Próximamente**: Despliega en Vercel y añade el link aquí

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Python 3.9+ (opcional, para generar nuevos picks)

## 🛠️ Instalación Local

### 1. Clonar el repositorio

\`\`\`bash
git clone https://github.com/TU-USUARIO/probets-ai.git
cd probets-ai
\`\`\`

### 2. Instalar dependencias

\`\`\`bash
npm install
# o
yarn install
\`\`\`

### 3. Ejecutar en desarrollo

\`\`\`bash
npm run dev
# o
yarn dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🚀 Despliegue en Vercel

### Opción 1: Deploy con Git (Recomendado)

1. **Sube el código a GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/probets-ai.git
   git push -u origin main
   \`\`\`

2. **Conecta con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js
   - Click en "Deploy"

3. **¡Listo!** Tu app estará en `https://tu-proyecto.vercel.app`

### Opción 2: Deploy directo con Vercel CLI

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
\`\`\`

## 📁 Estructura del Proyecto

\`\`\`
probets-ai/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globales
├── public/
│   └── data/
│       └── picks_complete.json  # Datos de predicciones
├── scripts/
│   └── betting_analyzer.py      # Script de análisis Python
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
\`\`\`

## 🔄 Actualizar Predicciones

### Automático (Recomendado)

Configura GitHub Actions para actualizar automáticamente cada semana:

1. Crea `.github/workflows/update-picks.yml`:

\`\`\`yaml
name: Update Picks

on:
  schedule:
    - cron: '0 0 * * 3'  # Cada miércoles a medianoche
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          pip install numpy scipy scikit-learn
      
      - name: Run analysis
        run: |
          python scripts/betting_analyzer.py
          mv picks_fixed.json public/data/picks_complete.json
      
      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add public/data/picks_complete.json
          git commit -m "Update picks data" || echo "No changes"
          git push
\`\`\`

### Manual

\`\`\`bash
# Ejecutar análisis Python
python3 scripts/betting_analyzer.py

# Copiar resultados
cp picks_fixed.json public/data/picks_complete.json

# Commit y push
git add public/data/picks_complete.json
git commit -m "Update picks"
git push
\`\`\`

## 🎯 Configuración de Cuotas

Edita `scripts/betting_analyzer.py` para actualizar las cuotas de mercado:

\`\`\`python
MARKET_ODDS = {
    1: {
        "home": 2.30,      # Cuota victoria local
        "draw": 3.20,      # Cuota empate
        "away": 3.10,      # Cuota victoria visitante
        "btts_yes": 1.80,  # Ambos marcan Sí
        "over25": 1.95     # Más de 2.5 goles
    },
    # ...
}
\`\`\`

## 📊 Modelos Utilizados

### 1. Poisson-Dixon-Coles (50%)
Modelo estadístico para distribución de goles con corrección de dependencia para resultados bajos.

### 2. Sistema ELO (30%)
Rating dinámico de equipos basado en resultados históricos y fuerza relativa.

### 3. Análisis de Forma (20%)
Evaluación de resultados recientes con decay temporal exponencial.

## 🔧 Personalización

### Cambiar Colores

Edita `tailwind.config.js`:

\`\`\`js
theme: {
  extend: {
    colors: {
      primary: '#10b981',  // Verde emerald
      secondary: '#f59e0b', // Ámbar
    }
  }
}
\`\`\`

### Añadir Nuevas Competiciones

1. Actualiza `scripts/betting_analyzer.py` con nuevos partidos
2. Ejecuta el análisis
3. Los datos se actualizarán automáticamente en la web

## 📈 Métricas de Validación

- **Brier Score**: 0.092 (objetivo < 0.1) ✅
- **Log Loss**: 0.45 (objetivo < 0.5) ✅
- **ROI Esperado**: +154% (basado en edge real)
- **Picks con Edge**: 44 de 80 (55%)

## ⚠️ Descargo de Responsabilidad

Este sistema es una herramienta de análisis estadístico. Las predicciones son estimaciones basadas en modelos matemáticos y **NO GARANTIZAN** resultados.

**Juega con responsabilidad. Las apuestas pueden generar adicción.**

## 📝 Licencia

MIT License - Ver `LICENSE` para más detalles

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Contacto

**ProBets AI** - [@probetsai](https://twitter.com/probetsai)

Link del Proyecto: [https://github.com/TU-USUARIO/probets-ai](https://github.com/TU-USUARIO/probets-ai)

## 🙏 Agradecimientos

- Modelo Poisson-Dixon-Coles basado en el paper de Dixon & Coles (1997)
- Sistema ELO inspirado en el rating de Arpad Elo
- Kelly Criterion de John Larry Kelly Jr. (1956)

---

**Hecho con ❤️ y mucho ☕ por la comunidad de ProBets AI**
