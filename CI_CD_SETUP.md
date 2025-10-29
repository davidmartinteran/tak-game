# CI/CD Setup Guide - TAK Game

Esta guía te ayudará a configurar el proceso de CI/CD para generar automáticamente versiones descargables de tu app TAK Game.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Flujos de Trabajo](#flujos-de-trabajo)
4. [Configuración de Secretos](#configuración-de-secretos)
5. [Uso del CI/CD](#uso-del-cicd)
6. [Descargar Builds](#descargar-builds)

---

## 🔧 Requisitos Previos

### 1. Cuenta de Expo
```bash
# Crear cuenta en https://expo.dev
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login
```

### 2. Configurar EAS Project
```bash
# Inicializar proyecto en Expo
eas init

# Nota: Guarda el Project ID que te proporciona
```

### 3. Crear Token de Expo
1. Ve a https://expo.dev/accounts/[tu-usuario]/settings/access-tokens
2. Crea un nuevo token con nombre "GitHub Actions"
3. Copia el token (lo necesitarás para GitHub Secrets)

---

## ⚙️ Configuración Inicial

### 1. Configurar GitHub Secrets

Ve a tu repositorio en GitHub: `Settings → Secrets and variables → Actions`

Agrega los siguientes secrets:

| Secret Name | Descripción | Dónde Obtenerlo |
|-------------|-------------|-----------------|
| `EXPO_TOKEN` | Token de autenticación de Expo | https://expo.dev/settings/access-tokens |
| `EAS_PROJECT_ID` | ID del proyecto EAS (opcional) | Después de ejecutar `eas init` |

**Pasos:**
```bash
# 1. En tu terminal local:
eas init

# 2. Copia el Project ID que aparece

# 3. En GitHub:
# Settings → Secrets → New repository secret
# Name: EXPO_TOKEN
# Value: [tu token de expo]

# 4. (Opcional) Agregar Project ID
# Name: EAS_PROJECT_ID
# Value: [tu project id]
```

### 2. Verificar app.json

Actualiza `app.json` si es necesario:

```json
{
  "expo": {
    "name": "TAK Game",
    "slug": "tak-game",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.takgame.app"
    },
    "android": {
      "package": "com.takgame.app"
    }
  }
}
```

### 3. Actualizar .gitignore

Asegúrate de que estos archivos están ignorados:
```
# .gitignore
dist/
.expo/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
android-service-account.json
```

---

## 🚀 Flujos de Trabajo

Tienes 2 workflows configurados:

### 1. **Preview Build** (`preview-build.yml`)

**Cuándo se ejecuta:**
- Push a `main` o `develop`
- Pull Requests
- Manualmente desde GitHub Actions

**Qué hace:**
- Ejecuta tests y linter
- Genera build APK para Android
- Publica en canal `preview` de Expo
- Comenta en PR con información del build

**Resultado:** APK descargable para testing

### 2. **Release Build** (`release-build.yml`)

**Cuándo se ejecuta:**
- Cuando creas un tag: `v1.0.0`, `v1.0.1`, etc.
- Manualmente desde GitHub Actions

**Qué hace:**
- Ejecuta tests (obligatorios)
- Actualiza versión en app.json
- Genera AAB para Google Play Store (Android)
- Genera IPA para App Store (iOS)
- Crea GitHub Release con notas

**Resultado:** Archivos listos para publicar en tiendas

---

## 🔐 Configuración de Secretos

### GitHub Secrets Requeridos

```bash
# 1. EXPO_TOKEN (OBLIGATORIO)
# Ve a: https://expo.dev/settings/access-tokens
# Crea nuevo token → Copia → Pega en GitHub Secrets

# 2. Para GitHub Releases (automático)
# GITHUB_TOKEN ya está disponible automáticamente
```

### Secretos Opcionales para Publicación Automática

**Para Android (Google Play):**
```bash
# GOOGLE_SERVICE_ACCOUNT_KEY
# 1. Ve a Google Cloud Console
# 2. Crea Service Account
# 3. Descarga JSON key
# 4. Pega contenido en GitHub Secret
```

**Para iOS (App Store):**
```bash
# APPLE_ID
# APPLE_APP_SPECIFIC_PASSWORD
# 1. Ve a appleid.apple.com
# 2. Genera app-specific password
# 3. Agrega a GitHub Secrets
```

---

## 💻 Uso del CI/CD

### Opción 1: Push Automático (Más Común)

```bash
# 1. Haz cambios en tu código
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Push a main/develop
git push origin main

# 3. ¡Listo! El build se genera automáticamente
# Ve a: https://github.com/tu-usuario/TAK-GAME/actions
```

### Opción 2: Manual Trigger

```bash
# 1. Ve a tu repo en GitHub
# 2. Actions → Preview Build (o Release Build)
# 3. Click en "Run workflow"
# 4. Selecciona branch y plataforma
# 5. Click "Run workflow"
```

### Opción 3: Crear Release con Tag

```bash
# 1. Actualiza versión
npm version patch  # 1.0.0 → 1.0.1
# o
npm version minor  # 1.0.0 → 1.1.0
# o
npm version major  # 1.0.0 → 2.0.0

# 2. Push tag
git push origin main --tags

# 3. ¡Listo! Se genera build de producción automáticamente
```

---

## 📱 Descargar Builds

### Método 1: Expo Dashboard (Recomendado)

```bash
# 1. Ve a: https://expo.dev/accounts/[tu-usuario]/projects/tak-game/builds

# 2. Verás lista de builds:
#    - Preview builds → APK para testers
#    - Production builds → AAB/IPA para tiendas

# 3. Click en build → Download

# 4. Para compartir con testers:
#    - Click en "Share" → Copia link
#    - Envía link a testers
#    - Ellos descargan e instalan directamente
```

### Método 2: QR Code para Testers

```bash
# En Expo Dashboard, cada build tiene:
# - Link directo de descarga
# - QR code para escanear
# - Enlace para compartir

# Los testers simplemente:
# 1. Abren el link en su teléfono
# 2. Descargan APK
# 3. Instalan (permiten instalación de fuentes desconocidas)
```

### Método 3: GitHub Releases

```bash
# Para builds de producción:
# 1. Ve a: https://github.com/tu-usuario/TAK-GAME/releases
# 2. Encuentra tu release (v1.0.0, v1.0.1, etc.)
# 3. Los links de descarga están en la descripción
# 4. Click en link → Te redirige a Expo
```

---

## 🎯 Ejemplo de Flujo Completo

### Escenario: Quieres generar una versión para que tus amigos prueben

```bash
# 1. Haz cambios en el código
git add .
git commit -m "fix: corregir error en tablero 5x5"
git push origin main

# 2. Espera 10-15 minutos (build en proceso)

# 3. Ve a Expo Dashboard
#    https://expo.dev/accounts/[tu-usuario]/projects/tak-game/builds

# 4. Encuentra el build más reciente (estará al principio)
#    Status: "Finished" (con checkmark verde)

# 5. Click en el build → Click "Share"

# 6. Copia el link y envíalo a tus amigos:
#    "Hey, prueba esta versión: https://expo.dev/artifacts/..."

# 7. Tus amigos:
#    - Abren el link en su teléfono Android
#    - Click "Download"
#    - Instalan APK
#    - ¡A jugar!
```

---

## 🔍 Monitoreo y Debugging

### Ver Status de Builds

```bash
# Opción 1: GitHub Actions
https://github.com/tu-usuario/TAK-GAME/actions

# Opción 2: EAS CLI
eas build:list --limit 10

# Opción 3: Expo Dashboard
https://expo.dev
```

### Logs de Build

```bash
# Ver logs en vivo desde terminal:
eas build:view [BUILD_ID]

# O en GitHub:
Actions → Click en el workflow → Ver logs
```

### Solución de Problemas Comunes

**Build falla con "Authentication failed":**
```bash
# Verifica que EXPO_TOKEN esté configurado correctamente
# Regenera token en: https://expo.dev/settings/access-tokens
```

**Build falla en tests:**
```bash
# Los tests deben pasar para release builds
# Para preview, puedes hacer que los tests no bloqueen
# (ya configurado con continue-on-error: true)
```

**No puedo descargar el build:**
```bash
# Asegúrate que el build está en status "Finished"
# Los builds "In Queue" o "In Progress" no están listos aún
```

---

## 📚 Recursos Adicionales

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions for Expo](https://docs.expo.dev/build/building-on-ci/)
- [Expo Application Services](https://expo.dev/eas)
- [Distributing Your App](https://docs.expo.dev/distribution/introduction/)

---

## 🎉 ¡Ya está todo configurado!

Ahora cada vez que hagas push, se generará automáticamente una nueva versión de tu app que podrás descargar y compartir.

**Next Steps:**
1. Haz tu primer push y observa cómo se genera el build
2. Comparte el link con tus testers
3. Cuando estés listo para publicar, crea un tag de versión

¿Preguntas? Abre un issue en el repositorio.
