// Board and position-related types

import { Player, Stone } from './player.types';

export interface Position {
  row: number;
  col: number;
}

export interface Stack {
  stones: Stone[];
  controlledBy: Player | null;
}

export interface Board {
  size: number;
  squares: (Stack | null)[][];
}
