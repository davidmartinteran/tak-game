# 🚀 Guía Rápida - CI/CD TAK Game

## ⚡ Setup en 5 Minutos

### 1️⃣ Crear Cuenta y Token de Expo (2 min)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo (crea cuenta si no tienes)
eas login

# Inicializar proyecto
eas init
```

📝 **Guarda el Project ID que aparece**

### 2️⃣ Crear Token para GitHub (1 min)

1. Ve a: https://expo.dev/settings/access-tokens
2. Click "Create Token"
3. Nombre: `GitHub Actions`
4. Click "Create"
5. 📋 **Copia el token** (lo necesitas para el siguiente paso)

### 3️⃣ Configurar GitHub Secret (1 min)

1. Ve a tu repo: `https://github.com/TU-USUARIO/TAK-GAME`
2. Click en `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. **Name:** `EXPO_TOKEN`
5. **Value:** Pega el token que copiaste
6. Click `Add secret`

### 4️⃣ Habilitar GitHub Pages (Opcional - para web) (1 min)

1. En tu repo: `Settings` → `Pages`
2. **Source:** Deploy from a branch
3. **Branch:** `gh-pages` → `/ (root)`
4. Click `Save`

---

## 🎯 ¡Ya está listo! Ahora puedes:

### Opción A: Build Automático (Push)

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
```

✅ Se generará automáticamente un APK descargable en 10-15 minutos

### Opción B: Build Manual (Click)

1. Ve a: `https://github.com/TU-USUARIO/TAK-GAME/actions`
2. Click en `Preview Build`
3. Click en `Run workflow`
4. Selecciona plataforma (android/ios/all)
5. Click `Run workflow`

### Opción C: Release Version (Tag)

```bash
npm version patch  # 1.0.0 → 1.0.1
git push origin main --tags
```

✅ Genera build de producción + GitHub Release

---

## 📱 Descargar Tu App

### Después de que el build termine:

1. **Ve a Expo Dashboard:**
   ```
   https://expo.dev/accounts/[TU-USUARIO]/projects/tak-game/builds
   ```

2. **Encuentra tu build** (el más reciente estará arriba)

3. **Opciones para compartir:**
   - Click en `Download` → Descarga directa
   - Click en `Share` → Obtén link para compartir
   - Escanea el QR Code → Descarga en móvil

---

## 🔍 Ver Estado del Build

### GitHub Actions (en tiempo real):
```
https://github.com/TU-USUARIO/TAK-GAME/actions
```

### Expo Dashboard:
```
https://expo.dev
```

### Terminal:
```bash
eas build:list --limit 5
```

---

## 📋 Comandos Útiles

```bash
# Ver builds recientes
eas build:list

# Ver detalles de un build
eas build:view [BUILD-ID]

# Build local para testing
npm run build:preview

# Build de producción
npm run build:production

# Build web
npm run build:web
```

---

## ❓ Solución Rápida de Problemas

### "Authentication failed"
```bash
# Regenera tu token en:
https://expo.dev/settings/access-tokens
# Actualiza el secret EXPO_TOKEN en GitHub
```

### "Build failed"
```bash
# Ver logs completos:
# 1. GitHub Actions → Click en el workflow → Ver logs
# 2. O en Expo Dashboard → Click en el build → Ver logs
```

### "No puedo descargar"
```bash
# Espera a que el build esté en status "Finished"
# Los builds toman 10-15 minutos en completarse
```

---

## 🎉 ¡Eso es todo!

Cada push a `main` generará automáticamente una nueva versión descargable.

### Próximos pasos:
1. ✅ Haz tu primer push
2. ✅ Observa cómo se genera el build en GitHub Actions
3. ✅ Descarga desde Expo Dashboard
4. ✅ Comparte el link con tus amigos

---

## 📚 Documentación Completa

Para más detalles, consulta: [CI_CD_SETUP.md](./CI_CD_SETUP.md)

---

## 💡 Tips Pro

### Agregar Badge de Build Status a tu README:

```markdown
![Build Status](https://github.com/TU-USUARIO/TAK-GAME/workflows/Preview%20Build/badge.svg)
```

### Versioning Automático:

```bash
# Patch (bug fixes): 1.0.0 → 1.0.1
npm version patch && git push --tags

# Minor (new features): 1.0.0 → 1.1.0
npm version minor && git push --tags

# Major (breaking changes): 1.0.0 → 2.0.0
npm version major && git push --tags
```

### Testing Local Antes de Push:

```bash
# Ejecutar tests
npm test

# Ejecutar linter
npm run lint

# Build local (si tienes EAS configurado)
eas build --platform android --profile preview --local
```
