#!/bin/bash

# TAK Game - CI/CD Setup Script
# Este script te guía en el proceso de configuración del CI/CD

set -e

echo "🚀 TAK Game - CI/CD Setup"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
echo -e "${BLUE}Verificando dependencias...${NC}"
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}EAS CLI no encontrado. Instalando...${NC}"
    npm install -g eas-cli
    echo -e "${GREEN}✓ EAS CLI instalado${NC}"
else
    echo -e "${GREEN}✓ EAS CLI ya instalado${NC}"
fi

echo ""
echo "📋 Pasos a seguir:"
echo ""

# Step 1: Expo Login
echo -e "${BLUE}Paso 1: Login en Expo${NC}"
echo "  Ejecuta: eas login"
echo "  (Crea una cuenta si no tienes)"
echo ""
read -p "¿Ya hiciste login? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Por favor ejecuta: eas login${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Login completado${NC}"
echo ""

# Step 2: EAS Init
echo -e "${BLUE}Paso 2: Inicializar proyecto en Expo${NC}"
echo "  Ejecutando: eas init"
echo ""
eas init
echo -e "${GREEN}✓ Proyecto inicializado${NC}"
echo ""

# Step 3: Get Project ID
echo -e "${BLUE}Paso 3: Project ID${NC}"
echo "  IMPORTANTE: Guarda el Project ID que aparece arriba"
echo ""
read -p "Presiona Enter para continuar..."
echo ""

# Step 4: Create Expo Token
echo -e "${BLUE}Paso 4: Crear token de Expo${NC}"
echo "  1. Abre: https://expo.dev/settings/access-tokens"
echo "  2. Click 'Create Token'"
echo "  3. Nombre: 'GitHub Actions'"
echo "  4. Copia el token"
echo ""
read -p "¿Ya creaste el token? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Por favor crea el token y vuelve a ejecutar este script${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Token creado${NC}"
echo ""

# Step 5: GitHub Secret
echo -e "${BLUE}Paso 5: Configurar GitHub Secret${NC}"
echo "  1. Ve a: https://github.com/$( git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\).git/\1/' )/settings/secrets/actions"
echo "  2. Click 'New repository secret'"
echo "  3. Name: EXPO_TOKEN"
echo "  4. Value: [pega el token que copiaste]"
echo "  5. Click 'Add secret'"
echo ""
read -p "¿Ya configuraste el secret? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Por favor configura el secret y vuelve a ejecutar este script${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Secret configurado${NC}"
echo ""

# Step 6: Commit and Push
echo -e "${BLUE}Paso 6: Commit y Push${NC}"
echo "  Vamos a hacer commit de los archivos de CI/CD y hacer push"
echo ""
read -p "¿Proceder? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    git commit -m "chore: setup CI/CD pipelines

- Add EAS build configuration
- Add GitHub Actions workflows (preview, release, web)
- Add CI/CD documentation
- Add build scripts to package.json"

    git push origin main
    echo -e "${GREEN}✓ Push completado${NC}"
else
    echo -e "${YELLOW}Recuerda hacer commit y push manualmente${NC}"
fi
echo ""

# Summary
echo ""
echo -e "${GREEN}🎉 ¡Setup completado!${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Ve a: https://github.com/$( git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\).git/\1/' )/actions"
echo "2. Observa el workflow ejecutándose (Preview Build)"
echo "3. Espera 10-15 minutos"
echo "4. Ve a: https://expo.dev → Encuentra tu build"
echo "5. Descarga el APK"
echo "6. ¡Comparte con tus amigos!"
echo ""
echo -e "${BLUE}Documentación:${NC}"
echo "  - Guía rápida: QUICK_START_CICD.md"
echo "  - Guía completa: CI_CD_SETUP.md"
echo "  - Resumen: DEPLOYMENT_SUMMARY.md"
echo ""
echo -e "${GREEN}¡Listo para lanzar! 🚀${NC}"
