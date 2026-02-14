# 🚀 GUÍA RÁPIDA DE DESPLIEGUE EN VERCEL

## Paso 1: Preparar el código en GitHub

\`\`\`bash
# En tu terminal, dentro de la carpeta web-app/

# Inicializar Git
git init

# Añadir archivos
git add .

# Primer commit
git commit -m "🚀 Initial commit: ProBets AI"

# Crear repositorio en GitHub
# Ve a https://github.com/new
# Nombre: probets-ai
# NO inicialices con README (ya lo tienes)

# Conectar con GitHub (reemplaza TU-USUARIO)
git branch -M main
git remote add origin https://github.com/TU-USUARIO/probets-ai.git
git push -u origin main
\`\`\`

## Paso 2: Desplegar en Vercel

### Opción A: Interfaz Web (MÁS FÁCIL) ⭐

1. **Crear cuenta en Vercel**
   - Ve a [https://vercel.com/signup](https://vercel.com/signup)
   - Regístrate con tu cuenta de GitHub

2. **Importar proyecto**
   - Click en "Add New..." → "Project"
   - Busca tu repositorio `probets-ai`
   - Click en "Import"

3. **Configurar proyecto**
   - Framework Preset: **Next.js** (se detecta automáticamente)
   - Root Directory: **./web-app** (IMPORTANTE si el código está en subcarpeta)
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)
   - Install Command: `npm install` (por defecto)

4. **Deploy**
   - Click en "Deploy"
   - ⏱️ Espera 2-3 minutos
   - ✅ ¡Tu app estará en línea!

5. **Ver tu app**
   - URL: `https://probets-ai-TU-USUARIO.vercel.app`
   - Vercel te dará la URL exacta

### Opción B: Desde la Línea de Comandos

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Deploy
vercel --prod

# Sigue las instrucciones en pantalla
\`\`\`

## Paso 3: Dominio Personalizado (Opcional)

1. En Vercel Dashboard → Settings → Domains
2. Añade tu dominio (ej: `probetsai.com`)
3. Configura los DNS según las instrucciones de Vercel
4. ✅ En ~10 minutos estará activo

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a la rama `main`, Vercel desplegará automáticamente:

\`\`\`bash
# Hacer cambios
git add .
git commit -m "Update predictions"
git push

# Vercel despliega automáticamente
# Ver en: https://vercel.com/TU-USUARIO/probets-ai
\`\`\`

## 📊 Actualizar Datos de Predicciones

### Método 1: Manual Local

\`\`\`bash
# Generar nuevos picks
python3 scripts/betting_analyzer.py

# Copiar al proyecto
cp picks_fixed.json public/data/picks_complete.json

# Subir a GitHub
git add public/data/picks_complete.json
git commit -m "📊 Update picks - Jornada X"
git push
\`\`\`

### Método 2: Automático con GitHub Actions

Ya está configurado en `.github/workflows/update-picks.yml`

Se ejecutará:
- ✅ Cada miércoles a medianoche
- ✅ Manualmente desde GitHub Actions tab

## 🎯 URLs Importantes

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Tu App**: https://probets-ai.vercel.app (o tu dominio)
- **Analytics**: Vercel Dashboard → Analytics
- **Logs**: Vercel Dashboard → Deployments → [tu deploy] → Logs

## ⚙️ Variables de Entorno (Si las necesitas)

En Vercel Dashboard → Settings → Environment Variables:

\`\`\`
NEXT_PUBLIC_API_URL=https://tu-api.com
\`\`\`

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verifica que `package.json` esté en el root o configura Root Directory
- Revisa los logs en Vercel Dashboard

### Error: "Cannot find module"
- Asegúrate de que todas las dependencias estén en `package.json`
- Vercel ejecutará `npm install` automáticamente

### Los datos no se actualizan
- Verifica que `public/data/picks_complete.json` exista
- Haz hard refresh: Ctrl+Shift+R (Cmd+Shift+R en Mac)

### Página en blanco
- Revisa la consola del navegador (F12)
- Verifica los logs en Vercel

## 📞 Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Community**: https://github.com/vercel/next.js/discussions

---

## ✅ Checklist Final

- [ ] Código en GitHub
- [ ] Proyecto importado en Vercel
- [ ] Primer deploy exitoso
- [ ] App funcionando en URL de Vercel
- [ ] Datos de picks cargando correctamente
- [ ] (Opcional) Dominio personalizado configurado
- [ ] (Opcional) GitHub Actions para auto-update

**¡Felicidades! 🎉 Tu app está en línea.**

---

*Última actualización: 12 de febrero de 2026*
