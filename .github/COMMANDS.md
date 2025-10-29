# 🛠️ Comandos Útiles - TAK Game CI/CD

Referencia rápida de comandos para gestionar tu CI/CD.

---

## 📱 EAS Build Commands

### Ver Builds Recientes
```bash
# Lista últimos 10 builds
eas build:list

# Lista últimos 20 builds
eas build:list --limit 20

# Solo builds de Android
eas build:list --platform android

# Solo builds de iOS
eas build:list --platform ios
```

### Ver Detalles de un Build
```bash
# Ver detalles + logs
eas build:view [BUILD-ID]

# Ejemplo:
eas build:view abc123-def456-ghi789
```

### Cancelar Build
```bash
# Cancelar build en progreso
eas build:cancel [BUILD-ID]
```

### Build Manual
```bash
# Preview (APK)
eas build --platform android --profile preview

# Preview sin esperar
eas build --platform android --profile preview --no-wait

# Production (AAB)
eas build --platform android --profile production

# Ambas plataformas
eas build --platform all --profile production

# Build local (requiere Android SDK)
eas build --platform android --profile preview --local
```

---

## 📦 NPM Scripts

### Desarrollo
```bash
# Iniciar servidor
npm start

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

### Testing
```bash
# Ejecutar tests
npm test

# Tests en watch mode
npm run test:watch

# Tests con coverage
npm test -- --coverage

# Linter
npm run lint
```

### Builds
```bash
# Build web
npm run build:web

# Build preview APK
npm run build:preview

# Build producción (AAB/IPA)
npm run build:production
```

---

## 🔄 Git & Versioning

### Commits Convencionales
```bash
# Nueva funcionalidad
git commit -m "feat: descripción"

# Bug fix
git commit -m "fix: descripción"

# Cambios en CI/CD
git commit -m "chore: descripción"

# Documentación
git commit -m "docs: descripción"

# Refactoring
git commit -m "refactor: descripción"

# Tests
git commit -m "test: descripción"
```

### Versioning Semántico
```bash
# Patch (1.0.0 → 1.0.1) - Bug fixes
npm version patch
git push origin main --tags

# Minor (1.0.0 → 1.1.0) - Nuevas funcionalidades
npm version minor
git push origin main --tags

# Major (1.0.0 → 2.0.0) - Cambios breaking
npm version major
git push origin main --tags

# Custom version
npm version 1.2.3
git push origin main --tags
```

### Tags Manuales
```bash
# Crear tag
git tag v1.0.0

# Crear tag con mensaje
git tag -a v1.0.0 -m "Release 1.0.0"

# Push tags
git push origin --tags

# Eliminar tag local
git tag -d v1.0.0

# Eliminar tag remoto
git push origin --delete v1.0.0
```

---

## 🌐 GitHub Actions

### Trigger Manual
```bash
# Usando GitHub CLI (gh)
gh workflow run preview-build.yml
gh workflow run release-build.yml
gh workflow run web-deploy.yml

# Con inputs
gh workflow run preview-build.yml -f platform=android
gh workflow run release-build.yml -f version=1.0.1 -f platform=all
```

### Ver Workflows
```bash
# Listar workflows
gh workflow list

# Ver runs recientes
gh run list

# Ver logs de un run
gh run view [RUN-ID]

# Ver logs en tiempo real
gh run watch

# Cancelar run
gh run cancel [RUN-ID]
```

### Ver Status
```bash
# Ver status de workflows
gh workflow view preview-build.yml
gh workflow view release-build.yml
gh workflow view web-deploy.yml
```

---

## 📊 Monitoring

### Check Build Status
```bash
# EAS CLI
eas build:list --status finished --limit 5
eas build:list --status in-progress

# GitHub CLI
gh run list --workflow preview-build.yml
gh run list --workflow release-build.yml
```

### Logs
```bash
# Ver logs de build en EAS
eas build:view [BUILD-ID]

# Ver logs de workflow en GitHub
gh run view [RUN-ID] --log

# Descargar logs
gh run view [RUN-ID] --log > build-logs.txt
```

---

## 🔧 Configuration

### Update EAS Configuration
```bash
# Ver configuración actual
cat eas.json

# Validar configuración
eas build:configure
```

### Environment Variables
```bash
# Ver variables de entorno
eas env:list

# Agregar variable
eas env:create

# Actualizar variable
eas env:update [KEY]

# Eliminar variable
eas env:delete [KEY]
```

### Secrets
```bash
# Ver secrets (usando GitHub CLI)
gh secret list

# Agregar secret
gh secret set EXPO_TOKEN < token.txt

# Eliminar secret
gh secret remove EXPO_TOKEN
```

---

## 🚀 Deployment

### Deploy Preview
```bash
# Automático: push a main/develop
git push origin main

# Manual: trigger workflow
gh workflow run preview-build.yml -f platform=android
```

### Deploy Production
```bash
# Automático: crear tag
npm version patch
git push origin main --tags

# Manual: trigger workflow
gh workflow run release-build.yml -f version=1.0.1 -f platform=all
```

### Deploy Web
```bash
# Automático: push a main
git push origin main

# Manual: trigger workflow
gh workflow run web-deploy.yml

# O build local y deploy manual
npm run build:web
# Luego sube dist/ a tu hosting
```

---

## 📱 Distribution

### Obtener Link de Descarga
```bash
# Via EAS Dashboard
# https://expo.dev/accounts/[USER]/projects/tak-game/builds

# Via CLI
eas build:list --limit 1
# Copia el URL del build
```

### Compartir con Testers
```bash
# Método 1: Link directo
# Copia link desde Expo Dashboard → Share

# Método 2: QR Code
# Escanea QR desde Expo Dashboard

# Método 3: GitHub Release
# https://github.com/USER/TAK-GAME/releases/latest
```

---

## 🔍 Debugging

### Check Git Status
```bash
# Ver estado actual
git status

# Ver commits recientes
git log --oneline -5

# Ver tags
git tag -l

# Ver branches
git branch -a
```

### Check Package Info
```bash
# Ver versión actual
npm version

# Ver dependencias
npm list --depth=0

# Ver outdated packages
npm outdated
```

### Check Build Info
```bash
# Ver configuración de Expo
npx expo config

# Ver doctor (diagnóstico)
npx expo-doctor

# Ver info del proyecto
eas project:info
```

---

## 🆘 Troubleshooting

### Fix Git Issues
```bash
# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer cambios en archivos
git restore [file]

# Forzar sincronización con remoto
git fetch origin
git reset --hard origin/main
```

### Fix Build Issues
```bash
# Limpiar cache de npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de Expo
npx expo start --clear

# Regenerar configuración de EAS
eas build:configure
```

### Fix Workflow Issues
```bash
# Re-run workflow fallido
gh run rerun [RUN-ID]

# Re-run solo jobs fallidos
gh run rerun [RUN-ID] --failed

# Ver por qué falló
gh run view [RUN-ID] --log
```

---

## 📚 Help Commands

```bash
# Ayuda de EAS
eas --help
eas build --help
eas build:list --help

# Ayuda de GitHub CLI
gh --help
gh workflow --help
gh run --help

# Ayuda de npm
npm help
npm help version
npm help scripts
```

---

## 🎯 Quick Actions

### Flujo Completo: Desarrollo → Testing
```bash
# 1. Desarrollar
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# 2. Esperar build (10-15 min)
# 3. Descargar desde: https://expo.dev

# 4. Si hay problemas, ver logs
gh run list --workflow preview-build.yml
gh run view [RUN-ID] --log
```

### Flujo Completo: Release
```bash
# 1. Preparar release
npm test
npm run lint

# 2. Actualizar versión
npm version patch  # o minor, o major

# 3. Push con tags
git push origin main --tags

# 4. Esperar build (15-20 min)
# 5. Ver release: https://github.com/USER/TAK-GAME/releases
```

---

## 💡 Pro Tips

### Alias Útiles
Agrega a tu `.bashrc` o `.zshrc`:

```bash
# EAS shortcuts
alias eb="eas build"
alias ebl="eas build:list"
alias ebv="eas build:view"

# Git shortcuts
alias gs="git status"
alias gp="git push origin main"
alias gpt="git push origin main --tags"

# NPM shortcuts
alias nr="npm run"
alias nt="npm test"
alias nb="npm run build:preview"
```

### Watch Build Progress
```bash
# Terminal 1: Watch GitHub Actions
watch -n 5 'gh run list --workflow preview-build.yml | head -5'

# Terminal 2: Watch EAS builds
watch -n 10 'eas build:list --limit 3'
```

### One-liner para Release
```bash
npm test && npm run lint && npm version patch && git push origin main --tags
```

---

¿Comando no encontrado? Consulta la documentación:
- [QUICK_START_CICD.md](../QUICK_START_CICD.md)
- [CI_CD_SETUP.md](../CI_CD_SETUP.md)
