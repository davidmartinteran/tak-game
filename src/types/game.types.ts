// Game state and configuration types

import { Board } from './board.types';
import { Move } from './move.types';
import { Player, PlayerReserve } from './player.types';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  reserves: Record<Player, PlayerReserve>;
  gamePhase: 'first-turn' | 'normal' | 'ended';
  winner: Player | 'draw' | null;
  moveHistory: Move[];
}

export interface GameConfig {
  boardSize: number;
  flatStones: number;
  capstones: number;
}
