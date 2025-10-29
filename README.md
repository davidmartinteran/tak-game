# TAK Game 🎲

Un juego de mesa digital de estrategia abstracta para 2 jugadores, desarrollado con React Native y Expo.

## Acerca del Juego

TAK es un juego de estrategia donde los jugadores compiten para:
- **Victoria Principal**: Conectar dos lados opuestos del tablero con un "camino" de piedras planas o capstones
- **Victoria Secundaria**: Controlar la mayoría de piedras planas cuando el tablero se llena

**Características:**
- Tableros de 3×3 hasta 8×8
- 3 tipos de piedras: planas, muros y capstones
- Sistema de apilamiento y movimiento
- Guardado automático de partidas
- Historial de movimientos con undo/redo
- Animaciones fluidas y feedback háptico
- Soporte multiplataforma (iOS, Android, Web)

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npx expo start

# Ejecutar en Android
npx expo start --android

# Ejecutar en iOS
npx expo start --ios

# Ejecutar en Web
npx expo start --web
```

### Scripts Disponibles

```bash
npm start       # Iniciar servidor de desarrollo
npm run android # Ejecutar en Android
npm run ios     # Ejecutar en iOS
npm run web     # Ejecutar en navegador
npm test        # Ejecutar tests
npm run lint    # Ejecutar linter
```

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular y escalable. Para información detallada, consulta [ARCHITECTURE.md](./ARCHITECTURE.md).

### Stack Tecnológico

- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Estado**: Zustand (patrón Slices)
- **Navegación**: Expo Router
- **Testing**: Jest + React Testing Library
- **Animaciones**: React Native Reanimated
- **Persistencia**: AsyncStorage

### Estructura del Proyecto

```
src/
├── types/           # Tipos organizados por dominio
├── store/           # Estado global (Zustand slices)
├── components/      # Componentes React organizados
│   ├── game/       # Lógica del juego
│   ├── layout/     # Layout y estructura
│   └── ui/         # Componentes UI reutilizables
├── utils/          # Utilidades y lógica de negocio
├── services/       # Servicios (persistencia, haptics, etc.)
├── hooks/          # Custom React hooks
├── contexts/       # React Contexts
└── constants/      # Constantes de la app

app/                # Expo Router screens
├── _layout.tsx    # Layout raíz
├── index.tsx      # Menú principal
├── game.tsx       # Pantalla del juego
└── settings.tsx   # Configuración
```

## 🎯 Características Principales

- ✅ **Múltiples tamaños de tablero** (3×3 a 8×8)
- ✅ **Sistema de tipos de piedras** (planas, muros, capstones)
- ✅ **Detección automática de victoria**
- ✅ **Guardado automático** de partidas
- ✅ **Historial completo** de movimientos
- ✅ **Undo/Redo** ilimitado
- ✅ **Animaciones fluidas**
- ✅ **Feedback háptico**
- ✅ **Soporte multiplataforma** (iOS, Android, Web)
- ✅ **Accesibilidad** integrada

## 📝 Reglas del Juego

Consulta [GameRules.md](./GameRules.md) para las reglas completas del juego TAK.

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm test -- --watch

# Ejecutar tests con coverage
npm test -- --coverage
```

## 📚 Documentación

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura detallada del proyecto
- [GameRules.md](./GameRules.md) - Reglas del juego TAK

## 🔧 Desarrollo

### Agregar Nuevos Componentes

1. Determina la categoría (game/layout/ui/...)
2. Crea el archivo en la carpeta apropiada
3. Actualiza el `index.ts` de la carpeta
4. Importa usando barrel exports

### Agregar Nuevos Slices al Store

1. Crea archivo en `src/store/slices/`
2. Define interface y createSlice
3. Combina en `src/store/index.ts`

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Asegúrate de que los tests pasen
4. Crea un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT.

## 🔗 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TAK Game Official Site](https://cheapass.com/tak/)
