// UI state slice - manages UI-specific state (selections, highlights, modals)

import { StateCreator } from 'zustand';
import { UIState, Position, StoneType, Move } from '../../types';

export interface UISlice {
  // UI state
  uiState: UIState;

  // Selection management
  selectPosition: (position: Position) => void;
  selectStoneType: (stoneType: StoneType) => void;
  clearSelection: () => void;
  setHighlightedPositions: (positions: Position[]) => void;

  // Modal management
  setShowingVictoryModal: (showing: boolean) => void;

  // Animation management
  setAnimatingMoves: (moves: Move[]) => void;

  // UI state reset
  resetUIState: () => void;
}

// Helper function to create initial UI state
export const createInitialUIState = (): UIState => ({
  selectedPosition: null,
  selectedStoneType: null,
  highlightedPositions: [],
  draggedStones: [],
  animatingMoves: [],
  showingVictoryModal: false,
  victoryType: null,
  winningPath: [],
});

export const createUISlice: StateCreator<UISlice> = (set, get) => ({
  // Initial state
  uiState: createInitialUIState(),

  // Selection management
  selectPosition: (position: Position) => {
    const { uiState } = get();
    set({
      uiState: {
        ...uiState,
        selectedPosition: position,
      },
    });
  },

  selectStoneType: (stoneType: StoneType) => {
    const { uiState } = get();
    // Note: Valid positions would be calculated by moveSlice
    set({
      uiState: {
        ...uiState,
        selectedStoneType: stoneType,
        highlightedPositions: [], // Will be set by integration layer
      },
    });
  },

  clearSelection: () => {
    const { uiState } = get();
    set({
      uiState: {
        ...uiState,
        selectedPosition: null,
        selectedStoneType: null,
        highlightedPositions: [],
        draggedStones: [],
      },
    });
  },

  setHighlightedPositions: (positions: Position[]) => {
    const { uiState } = get();
    set({
      uiState: {
        ...uiState,
        highlightedPositions: positions,
      },
    });
  },

  // Modal management
  setShowingVictoryModal: (showing: boolean) => {
    const { uiState } = get();
    set({
      uiState: {
        ...uiState,
        showingVictoryModal: showing,
      },
    });
  },

  // Animation management
  setAnimatingMoves: (moves: Move[]) => {
    const { uiState } = get();
    set({
      uiState: {
        ...uiState,
        animatingMoves: moves,
      },
    });
  },

  // UI state reset
  resetUIState: () => {
    set({ uiState: createInitialUIState() });
  },
});
