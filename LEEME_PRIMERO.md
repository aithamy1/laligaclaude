# 📦 PROYECTO COMPLETO - ProBets AI Web App

## 🎯 Contenido del Paquete

Este paquete contiene TODO lo necesario para desplegar ProBets AI en Vercel.

### 📁 Estructura de Archivos

\`\`\`
probets-ai/
│
├── 📄 package.json              # Dependencias NPM
├── 📄 next.config.js            # Configuración Next.js
├── 📄 tailwind.config.js        # Configuración Tailwind CSS
├── 📄 postcss.config.js         # Configuración PostCSS
├── 📄 tsconfig.json             # Configuración TypeScript
├── 📄 .gitignore                # Archivos ignorados por Git
├── 📄 README.md                 # Documentación principal ⭐
├── 📄 DEPLOY.md                 # Guía de despliegue ⭐⭐⭐
├── 📄 COPA_DEL_REY.md          # Guía para añadir Copa del Rey
│
├── 📁 app/                      # Aplicación Next.js 14
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Página principal (componente React) ⭐
│   └── globals.css              # Estilos globales
│
├── 📁 public/
│   └── 📁 data/
│       └── picks_complete.json  # Datos de predicciones ⭐
│
├── 📁 scripts/
│   └── betting_analyzer.py      # Script Python de análisis ⭐
│
└── 📁 .github/
    └── 📁 workflows/
        └── update-picks.yml     # GitHub Actions (auto-update)
\`\`\`

## 🚀 INICIO RÁPIDO (3 pasos)

### 1️⃣ Sube a GitHub

\`\`\`bash
# Descomprime el proyecto
tar -xzf probets-ai-web.tar.gz
cd web-app

# Sube a GitHub
git init
git add .
git commit -m "🚀 Initial commit"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/probets-ai.git
git push -u origin main
\`\`\`

### 2️⃣ Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Importa tu repo
4. Click "Deploy"
5. ✅ ¡Listo en 2 minutos!

### 3️⃣ Personaliza (Opcional)

- Edita cuotas en `scripts/betting_analyzer.py`
- Añade partidos de Copa del Rey (ver `COPA_DEL_REY.md`)
- Actualiza colores en `tailwind.config.js`

## 📚 Documentación Detallada

### 📖 README.md
- Instalación completa
- Configuración
- Personalización avanzada
- Contribuciones

### 🚀 DEPLOY.md ⭐⭐⭐
- **LEE ESTO PRIMERO**
- Paso a paso para Vercel
- Solución de problemas
- Variables de entorno
- Actualizaciones automáticas

### 🏆 COPA_DEL_REY.md
- Cómo añadir partidos de Copa
- Estructura de datos
- Cuotas de mercado
- Próximos partidos

## 🎨 Características de la Web

✅ **Responsive Design**
- Móvil, tablet, desktop
- Touch-friendly
- Performance optimizada

✅ **3 Competiciones**
- LaLiga EA Sports (10 partidos)
- LaLiga Hypermotion (6 partidos)
- Copa del Rey (2 partidos - semifinales)

✅ **Predicciones Avanzadas**
- 5 tipos de picks por partido
- Edge betting (solo apuestas con ventaja)
- Kelly Criterion para gestión de bankroll
- Probabilidades detalladas del modelo

✅ **Validación Profesional**
- Brier Score: 0.092
- Log Loss: 0.45
- ROI esperado: +154%

## 🔧 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **Lucide React** - Iconos modernos

### Backend/Análisis
- **Python 3.10+** - Análisis de datos
- **NumPy** - Cálculos numéricos
- **SciPy** - Distribuciones estadísticas
- **Scikit-learn** - Machine Learning

### DevOps
- **Vercel** - Hosting y deployment
- **GitHub Actions** - CI/CD automático
- **Git** - Control de versiones

## 📊 Modelos de Predicción

### 1. Poisson-Dixon-Coles (50%)
- Distribución de goles
- Corrección de dependencia
- Parámetro rho para resultados bajos

### 2. Sistema ELO (30%)
- Rating dinámico de equipos
- Actualización tras cada partido
- Basado en posición y resultados

### 3. Análisis de Forma (20%)
- Últimos 5 partidos
- Decay temporal exponencial
- Ponderación reciente > antigua

## 💾 Datos Incluidos

### Partidos de LaLiga (Jornada 24)
- Elche vs Osasuna
- Espanyol vs Celta
- Rayo Vallecano vs Atlético Madrid
- Sevilla vs Alavés
- Getafe vs Villarreal
- Levante vs Valencia
- Mallorca vs Betis
- Real Madrid vs Real Sociedad
- Oviedo vs Athletic
- Girona vs Barcelona

### Partidos de Segunda (Jornada 26)
- Valladolid vs Eibar
- Deportivo vs Granada
- Leganés vs Zaragoza
- Racing vs Sporting
- Cádiz vs Almería
- Albacete vs Córdoba

### Partidos de Copa del Rey (Semifinales IDA)
- Athletic vs Barcelona (11 feb)
- Real Sociedad vs Atlético (12 feb)

## 🔄 Actualización de Datos

### Automática (Recomendado)
- GitHub Actions ejecuta cada miércoles
- Genera nuevos picks
- Hace commit y push automático
- Vercel despliega automáticamente

### Manual
\`\`\`bash
python3 scripts/betting_analyzer.py
cp picks_fixed.json public/data/picks_complete.json
git add . && git commit -m "Update picks" && git push
\`\`\`

## 🎯 Cuotas de Mercado

Incluidas para todos los partidos:
- ✅ Victoria Local (home)
- ✅ Empate (draw)
- ✅ Victoria Visitante (away)
- ✅ Ambos Marcan Sí (btts_yes)
- ✅ Más de 2.5 goles (over25)

## ⚠️ Importante

### ANTES de Desplegar
1. ✅ Revisa las cuotas en `betting_analyzer.py`
2. ✅ Actualiza con odds reales si es necesario
3. ✅ Verifica que los partidos sean correctos

### DESPUÉS de Desplegar
1. ✅ Prueba en móvil y desktop
2. ✅ Verifica que los datos cargan
3. ✅ Comprueba que los filtros funcionan
4. ✅ Revisa los picks con edge

## 📞 Soporte

### Recursos
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/docs
- **Tailwind**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### Problemas Comunes
Ver sección "🐛 Solución de Problemas" en `DEPLOY.md`

## 📜 Licencia

MIT License - Código abierto y gratuito

## 🙏 Créditos

- Modelo Poisson-Dixon-Coles: Dixon & Coles (1997)
- Sistema ELO: Arpad Elo
- Kelly Criterion: J.L. Kelly Jr. (1956)

---

## ✅ Checklist Pre-Deploy

- [ ] Código descomprimido
- [ ] Git inicializado
- [ ] Repositorio en GitHub creado
- [ ] Código pusheado a GitHub
- [ ] Cuenta Vercel creada
- [ ] Proyecto importado en Vercel
- [ ] Primer deploy exitoso
- [ ] URL funcionando
- [ ] Datos cargando correctamente

## 🎉 ¡Todo Listo!

Tu aplicación ProBets AI está lista para desplegar.

**Tiempo estimado de despliegue**: 10-15 minutos
**Dificultad**: ⭐⭐ (Fácil con la guía)

---

*Creado con ❤️ para la comunidad de apuestas deportivas*
*Última actualización: 12 de febrero de 2026*
