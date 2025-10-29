// Main exports for the Tak game

// Types (enums and type definitions)
export { Player, StoneType } from './types';
export type {
  Stone,
  PlayerReserve,
  Position,
  Stack,
  Board,
  PlaceMove,
  StackMove,
  Move,
  MoveValidation,
  GameState,
  GameConfig,
  UIState
} from './types';

// Store
export { useGameStore } from './store';
export type { GameStore } from './store';

// Components (avoid name conflicts with types)
// Export components with explicit names to avoid conflicts
export {
  // Board components with aliases
  BoardComponent,
  Square,
  StackComponent,
  StoneComponent,
  // Layout components
  ErrorBoundary,
  // Game components
  GameBoard,
  GameFlowManager,
  // UI components are exported individually to avoid conflicts
} from './components';

// Utils
export * from './utils';

// Constants
export * from './constants';

// Styles
export * from './styles';