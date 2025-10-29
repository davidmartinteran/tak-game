// Move-related types

import { Position } from './board.types';
import { StoneType } from './player.types';

export interface PlaceMove {
  type: 'place';
  stoneType: StoneType;
  position: Position;
  isOpponentStone?: boolean; // For first turn
}

export interface StackMove {
  type: 'move';
  from: Position;
  to: Position;
  stonesToMove: number;
  dropPattern: number[]; // How many stones to drop at each position
}

export type Move = PlaceMove | StackMove;

export interface MoveValidation {
  isValid: boolean;
  reason?: string;
  validTargets?: Position[];
}
