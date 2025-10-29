# GitHub Actions Workflows

Este directorio contiene los workflows automatizados de CI/CD para TAK Game.

## 📋 Workflows Disponibles

### 1. Preview Build (`preview-build.yml`)
**Trigger:** Push a `main`/`develop`, Pull Requests, Manual

**Propósito:** Generar builds de prueba rápidos para testing

**Qué hace:**
- ✅ Ejecuta linter y tests
- 📱 Genera APK para Android
- 🍎 Genera IPA para iOS (si se solicita)
- 💬 Comenta en PR con información del build
- 📦 Publica en canal `preview` de Expo

**Resultado:** APK descargable en 10-15 minutos

**Status:** ![Preview Build](https://github.com/YOUR-USERNAME/TAK-GAME/workflows/Preview%20Build/badge.svg)

---

### 2. Release Build (`release-build.yml`)
**Trigger:** Tags `v*.*.*`, Manual

**Propósito:** Generar builds de producción para publicar en tiendas

**Qué hace:**
- ✅ Ejecuta tests (obligatorios)
- 📝 Actualiza versión automáticamente
- 📱 Genera AAB para Google Play Store
- 🍎 Genera IPA para App Store
- 🎉 Crea GitHub Release
- 📊 Incrementa versión automáticamente

**Resultado:** Archivos listos para publicar en tiendas

**Status:** ![Release Build](https://github.com/YOUR-USERNAME/TAK-GAME/workflows/Release%20Build/badge.svg)

---

### 3. Web Deploy (`web-deploy.yml`)
**Trigger:** Push a `main`, Manual

**Propósito:** Desplegar versión web a GitHub Pages

**Qué hace:**
- 🌐 Build para web
- 🚀 Deploy a GitHub Pages
- ✨ Disponible instantáneamente

**Resultado:** App web disponible en `https://YOUR-USERNAME.github.io/TAK-GAME`

**Status:** ![Web Deploy](https://github.com/YOUR-USERNAME/TAK-GAME/workflows/Deploy%20Web/badge.svg)

---

## 🎯 Uso Rápido

### Generar Build de Testing
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```
→ Se genera automáticamente un APK de preview

### Generar Build de Producción
```bash
npm version patch  # o minor, o major
git push origin main --tags
```
→ Se genera AAB/IPA y crea GitHub Release

### Deploy Web
```bash
git push origin main
```
→ Se despliega automáticamente a GitHub Pages

---

## 🔧 Configuración Requerida

### GitHub Secrets

| Secret | Descripción | Requerido Para | Obtener en |
|--------|-------------|----------------|------------|
| `EXPO_TOKEN` | Token de autenticación de Expo | Preview & Release | [Expo Settings](https://expo.dev/settings/access-tokens) |
| `GITHUB_TOKEN` | Token de GitHub (automático) | Release & Web | Proporcionado automáticamente |

### GitHub Pages (Opcional)

1. Ve a `Settings` → `Pages`
2. Source: Deploy from branch
3. Branch: `gh-pages` → `/ (root)`
4. Save

---

## 📊 Flujo de Trabajo Visual

```
┌─────────────────┐
│   Developer     │
│   git push      │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  GitHub Actions     │
│  Detecta cambios    │
└────────┬────────────┘
         │
         ├──────────────────────┬──────────────────────┐
         ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Preview Build   │  │  Release Build   │  │   Web Deploy     │
│  (cada push)     │  │  (tags)          │  │  (cada push)     │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Expo Dashboard  │  │ GitHub Release   │  │  GitHub Pages    │
│  APK descargable │  │ AAB/IPA + notas  │  │  Web app live    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────┐
│              Compartir con usuarios/testers                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚨 Troubleshooting

### Build falla con "Authentication failed"
**Causa:** EXPO_TOKEN no configurado o inválido
**Solución:**
```bash
# Regenerar token en: https://expo.dev/settings/access-tokens
# Actualizar secret en: GitHub Settings → Secrets → EXPO_TOKEN
```

### Build falla en tests
**Causa:** Tests no pasan
**Solución:**
```bash
# Ejecutar tests localmente
npm test

# Corregir errores y push nuevamente
```

### No aparece build en Expo Dashboard
**Causa:** Build en cola o falló
**Solución:**
```bash
# Ver status en GitHub Actions
# O ejecutar: eas build:list
```

### GitHub Pages no se actualiza
**Causa:** Branch gh-pages no existe o no está configurado
**Solución:**
```bash
# Verificar que el workflow se ejecutó exitosamente
# Settings → Pages → Verificar configuración
```

---

## 📖 Documentación Adicional

- [Guía Rápida](../QUICK_START_CICD.md) - Setup en 5 minutos
- [Guía Completa](../CI_CD_SETUP.md) - Documentación detallada
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 🎉 Tips Pro

### Badge de Status en README
```markdown
![Build Status](https://github.com/YOUR-USERNAME/TAK-GAME/workflows/Preview%20Build/badge.svg)
```

### Ejecutar Workflow Manualmente
1. Ve a: Actions → Workflow
2. Click "Run workflow"
3. Selecciona opciones
4. Click "Run workflow"

### Ver Logs en Vivo
```bash
# Terminal
eas build:view [BUILD-ID]

# O en GitHub
Actions → Click en workflow → Ver logs
```

### Cancelar Build
```bash
# En GitHub: Actions → Click en workflow → Cancel
# O en terminal: eas build:cancel [BUILD-ID]
```
