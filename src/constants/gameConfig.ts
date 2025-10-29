import { GameConfig } from '../types';

export const GAME_CONFIGS: Record<string, GameConfig> = {
  '3x3': {
    boardSize: 3,
    flatStones: 10,
    capstones: 0,
  },
  '4x4': {
    boardSize: 4,
    flatStones: 15,
    capstones: 0,
  },
  '5x5': {
    boardSize: 5,
    flatStones: 21,
    capstones: 1,
  },
  '6x6': {
    boardSize: 6,
    flatStones: 30,
    capstones: 1,
  },
  '8x8': {
    boardSize: 8,
    flatStones: 50,
    capstones: 2,
  },
};

export const DEFAULT_CONFIG = GAME_CONFIGS['5x5'];