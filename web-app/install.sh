#!/bin/bash
# Script de instalación rápida para sistema automatizado

echo "=========================================="
echo "🚀 INSTALADOR AUTOMÁTICO"
echo "=========================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz de laligaclaude/"
    exit 1
fi

echo "📁 Creando estructura de directorios..."
mkdir -p scripts
mkdir -p .github/workflows
mkdir -p public/data

echo "📄 Copiando archivos..."

# Aquí el usuario debe copiar los archivos manualmente
echo ""
echo "✅ Estructura creada"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Copia estos archivos a tu repositorio:"
echo "   - generar_combinadas.py → scripts/"
echo "   - actualizar_partidos.py → scripts/"
echo "   - auto-update.yml → .github/workflows/"
echo ""
echo "2. Configura GitHub Actions:"
echo "   - Ve a Settings → Actions → General"
echo "   - Marca: Allow all actions"
echo "   - Marca: Read and write permissions"
echo ""
echo "3. Primera ejecución:"
echo "   python scripts/generar_combinadas.py"
echo ""
echo "4. Sube a GitHub:"
echo "   git add ."
echo "   git commit -m 'feat: Sistema automático'"
echo "   git push origin main"
echo ""
echo "=========================================="
echo "✨ ¡Todo listo para automatizar!"
echo "=========================================="
