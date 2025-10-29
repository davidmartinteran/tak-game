# TAK Game - Nueva Arquitectura

## 📋 Resumen de la Refactorización

Este documento describe la arquitectura refactorizada del juego TAK, implementada para mejorar la mantenibilidad, escalabilidad y organización del código.

---

## 🏗️ Estructura del Proyecto

```
src/
├── types/                    # Definiciones de tipos organizadas por dominio
│   ├── player.types.ts      # Player, StoneType, Stone, PlayerReserve
│   ├── board.types.ts       # Position, Stack, Board
│   ├── move.types.ts        # PlaceMove, StackMove, Move, MoveValidation
│   ├── game.types.ts        # GameState, GameConfig
│   ├── ui.types.ts          # UIState
│   └── index.ts             # Barrel export de todos los tipos
│
├── store/                    # Estado global con Zustand (patrón Slices)
│   ├── slices/              # Slices modulares del store
│   │   ├── boardSlice.ts    # Estado y operaciones del tablero
│   │   ├── gameFlowSlice.ts # Flujo del juego, turnos, victorias
│   │   ├── moveSlice.ts     # Ejecución y validación de movimientos
│   │   ├── uiSlice.ts       # Estado de la interfaz de usuario
│   │   └── persistenceSlice.ts # Guardado y carga de partidas
│   ├── index.ts             # Store combinado
│   └── gameStore.old.ts     # Backup del store anterior (856 líneas)
│
├── components/               # Componentes React organizados por categoría
│   ├── game/                # Componentes específicos del juego
│   │   ├── GameFlowManager.tsx
│   │   └── index.ts
│   │
│   ├── layout/              # Componentes de layout
│   │   ├── ErrorBoundary.tsx
│   │   ├── LazyComponents.tsx
│   │   └── index.ts
│   │
│   └── ui/                  # Componentes de interfaz reutilizables
│       ├── board/           # Componentes del tablero
│       │   ├── Square.tsx
│       │   ├── Stone.tsx
│       │   └── index.ts
│       │
│       ├── animations/      # Componentes de animación
│       │   ├── StackMovementAnimationManager.tsx
│       │   ├── StackMovementDemo.tsx
│       │   └── index.ts
│       │
│       ├── feedback/        # Modales, toasts, notificaciones
│       │   ├── Toast.tsx
│       │   ├── EnhancedToast.tsx
│       │   ├── Modal.tsx
│       │   ├── VictoryModal.tsx
│       │   ├── VictoryCelebration.tsx
│       │   └── index.ts
│       │
│       ├── hud/             # HUD del juego
│       │   ├── HUD.tsx
│       │   ├── PlayerHUD.tsx
│       │   ├── GameStatus.tsx
│       │   ├── MoveHistory.tsx
│       │   ├── StackMoveSelector.tsx
│       │   └── index.ts
│       │
│       ├── common/          # Componentes comunes reutilizables
│       │   ├── Button.tsx
│       │   ├── LoadingState.tsx
│       │   ├── GamePersistenceSettings.tsx
│       │   └── index.ts
│       │
│       └── index.ts
│
├── utils/                    # Utilidades y lógica de negocio
│   ├── gameLogic.ts         # Clase GameBoard y configuración
│   ├── moveValidator.ts     # Validación de movimientos
│   ├── victoryDetector.ts   # Detección de condiciones de victoria
│   ├── performanceMonitor.ts
│   ├── responsive.ts
│   └── __tests__/
│
├── services/                 # Servicios de la aplicación
│   ├── GamePersistenceService.ts  # Persistencia de partidas
│   ├── MoveHistoryService.ts      # Historial de movimientos
│   ├── HapticService.ts           # Feedback háptico
│   ├── ErrorHandlingService.ts
│   ├── AccessibilityService.ts
│   └── __tests__/
│
├── hooks/                    # Custom React hooks
│   ├── useStackMovementAnimations.ts
│   ├── useStoneAnimations.ts
│   ├── useToast.ts
│   └── __tests__/
│
├── contexts/                 # React Contexts
│   ├── SettingsContext.tsx
│   ├── ToastContext.tsx
│   └── ErrorContext.tsx
│
├── constants/                # Constantes de la aplicación
│   ├── colors.ts
│   ├── gameConfig.ts
│   ├── theme.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
├── styles/                   # Estilos globales
│   ├── commonStyles.ts
│   └── index.ts
│
└── screens/                  # Pantallas de navegación
    └── MenuScreen.tsx

app/                          # Expo Router screens (navegación)
├── _layout.tsx              # Layout raíz con providers
├── index.tsx                # Pantalla principal/menú
├── board-size.tsx           # Selección de tamaño de tablero
├── game.tsx                 # Pantalla del juego
├── settings.tsx             # Configuración
├── about.tsx                # Acerca de
└── +not-found.tsx           # Página 404
```

---

## 🎯 Patrón de Arquitectura

### Arquitectura en Capas

```
┌─────────────────────────────────────┐
│   UI Layer (Screens, Components)   │
├─────────────────────────────────────┤
│   State Layer (Store, Contexts)    │
├─────────────────────────────────────┤
│   Business Logic (Utils, Services) │
├─────────────────────────────────────┤
│   Domain Layer (Types)             │
└─────────────────────────────────────┘
```

---

## 🔄 Zustand Store con Patrón Slices

### Antes (gameStore.ts - 856 líneas)
```typescript
// Un solo archivo monolítico con toda la lógica
export const useGameStore = create<GameStore>((set, get) => ({
  // 856 líneas de código...
}));
```

### Después (Modular)

#### 1. **boardSlice.ts** (~60 líneas)
- Gestiona el estado del tablero
- Operaciones básicas: getStack, getTopStone, isEmpty, etc.

#### 2. **gameFlowSlice.ts** (~170 líneas)
- Control de flujo del juego
- Gestión de turnos y fases
- Detección de victoria
- Inicialización y reset del juego

#### 3. **moveSlice.ts** (~200 líneas)
- Ejecución de movimientos
- Validación de movimientos
- Historial y undo/redo
- Animaciones de movimiento

#### 4. **uiSlice.ts** (~90 líneas)
- Estado de la UI (selecciones, highlights)
- Gestión de modales
- Estado de animaciones

#### 5. **persistenceSlice.ts** (~50 líneas)
- Guardado y carga de partidas
- Verificación de partidas guardadas
- Limpieza de datos guardados

#### 6. **index.ts** - Store Combinado (~400 líneas)
- Combina todos los slices
- Implementa métodos cross-slice
- Mantiene retrocompatibilidad con la API anterior

**Beneficios:**
- ✅ Código más mantenible y testeable
- ✅ Separación clara de responsabilidades
- ✅ Fácil de extender con nuevos slices
- ✅ Mejor performance (solo re-renderiza lo necesario)

---

## 📦 Sistema de Tipos por Dominio

### Antes (types/index.ts - ~100 líneas)
```typescript
// Todos los tipos mezclados en un solo archivo
export enum Player { ... }
export interface GameState { ... }
export interface UIState { ... }
// ...
```

### Después (Organizados por Dominio)

```typescript
// types/player.types.ts
export enum Player { ... }
export enum StoneType { ... }
export interface Stone { ... }

// types/board.types.ts
export interface Position { ... }
export interface Stack { ... }
export interface Board { ... }

// types/move.types.ts
export interface PlaceMove { ... }
export interface StackMove { ... }
export type Move = PlaceMove | StackMove;

// types/game.types.ts
export interface GameState { ... }
export interface GameConfig { ... }

// types/ui.types.ts
export interface UIState { ... }
```

**Uso con Barrel Exports:**
```typescript
// Los consumidores siguen importando desde types/
import { Player, StoneType, GameState, Position } from '@/types';
```

---

## 🧩 Organización de Componentes

### Estructura Jerárquica

```
components/
├── game/        → Lógica específica del juego TAK
├── layout/      → Estructura y manejo de errores
└── ui/          → Componentes reutilizables
    ├── board/      → Elementos del tablero
    ├── animations/ → Sistema de animaciones
    ├── feedback/   → Modales y notificaciones
    ├── hud/        → Información en pantalla
    └── common/     → Botones, loaders, etc.
```

### Barrel Exports
Cada carpeta tiene un `index.ts` que re-exporta sus componentes:

```typescript
// components/ui/feedback/index.ts
export { default as Toast } from './Toast';
export { default as Modal } from './Modal';
export { default as VictoryModal } from './VictoryModal';

// Uso:
import { Toast, Modal, VictoryModal } from '@/components/ui/feedback';
```

---

## 🎨 Patrones de Diseño Implementados

### 1. **Slices Pattern** (Zustand)
- Divide el store en módulos independientes
- Cada slice maneja su dominio específico
- El store principal combina todos los slices

### 2. **Barrel Exports Pattern**
- Simplifica imports
- Mejora la experiencia del desarrollador
- Oculta la estructura interna de carpetas

### 3. **Service Pattern**
- Servicios singleton para funcionalidades transversales
- Ejemplos: GamePersistenceService, HapticService

### 4. **Context API** (React)
- Para estado global no relacionado con el juego
- SettingsContext, ToastContext, ErrorContext

### 5. **Custom Hooks**
- Encapsula lógica reutilizable
- useStackMovementAnimations, useToast, etc.

---

## 🔧 Guía de Migración

### Cambios en Imports

#### Store
```typescript
// Antes
import { useGameStore } from '../store/gameStore';

// Después
import { useGameStore } from '../store';
```

#### Componentes
```typescript
// Antes
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

// Después
import { Button } from '../components/ui/common';
import { Modal } from '../components/ui/feedback';

// O importar del barrel principal
import { Button, Modal } from '../components';
```

#### Tipos
```typescript
// Antes (funcionaba)
import { Player, GameState } from '../types';

// Después (sigue igual, pero mejor organizado internamente)
import { Player, GameState } from '../types';
```

---

## ✅ Ventajas de la Nueva Arquitectura

### 1. **Mantenibilidad**
- Archivos más pequeños y enfocados
- Fácil encontrar y modificar código
- Menos conflictos en git

### 2. **Escalabilidad**
- Agregar nuevos slices sin modificar código existente
- Componentes organizados por funcionalidad
- Fácil añadir nuevas features

### 3. **Testabilidad**
- Slices individuales más fáciles de testear
- Componentes aislados
- Mejor coverage de tests

### 4. **Performance**
- Re-renders más granulares con slices
- Lazy loading de componentes
- Optimizaciones por categoría

### 5. **Developer Experience**
- Imports más claros y concisos
- Autocomplete mejorado en IDEs
- Navegación de código más intuitiva

---

## 🚧 Estado Actual

### ✅ Completado
- [x] Tipos reorganizados por dominio
- [x] Store dividido en slices (5 slices)
- [x] Componentes reorganizados en subcarpetas
- [x] Barrel exports creados
- [x] Imports actualizados en 30+ archivos
- [x] Archivos legacy eliminados
- [x] Backup del store original creado

### ⚠️ Pendiente / Issues Conocidos
- [ ] Algunos tests fallan (componentes faltantes: Board, Stack, GameBoard)
- [ ] Linter puede tener errores por rutas actualizadas
- [ ] Algunos componentes referenced en tests no existen como archivos separados

### 🔄 Próximos Pasos
1. Crear componentes faltantes o actualizar tests
2. Ejecutar linter y corregir warnings
3. Validar que la app compile y ejecute correctamente
4. Actualizar documentación de componentes individuales

---

## 📚 Recursos Adicionales

- **Zustand Slices Pattern**: https://github.com/pmndrs/zustand#slices-pattern
- **React Component Organization**: Best practices for scaling
- **TypeScript Module Organization**: Domain-driven design

---

## 👨‍💻 Mantenimiento

### Agregar un Nuevo Slice
1. Crear archivo en `src/store/slices/newSlice.ts`
2. Definir interface y createSlice
3. Importar y combinar en `src/store/index.ts`
4. Actualizar tipo `GameStore`

### Agregar Nuevos Componentes
1. Determinar categoría (game/layout/ui/...)
2. Crear archivo en la carpeta apropiada
3. Actualizar `index.ts` de la carpeta
4. Usar desde cualquier lugar via barrel export

### Agregar Nuevos Tipos
1. Determinar dominio (player/board/move/game/ui)
2. Agregar en archivo `.types.ts` correspondiente
3. Exportar desde `types/index.ts`

---

**Fecha de Refactorización**: 2025-10-20
**Versión**: 1.0.0 (Post-Refactorización)
