// UI state types

import { Position } from './board.types';
import { Move } from './move.types';
import { Stone, StoneType } from './player.types';

export interface UIState {
  selectedPosition: Position | null;
  selectedStoneType: StoneType | null;
  highlightedPositions: Position[];
  draggedStones: Stone[];
  animatingMoves: Move[];
  showingVictoryModal: boolean;
  victoryType?: 'road' | 'flat' | null;
  winningPath?: Position[];
}
