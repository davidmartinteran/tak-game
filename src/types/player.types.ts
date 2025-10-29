// Player and stone-related types

export enum Player {
  PLAYER1 = 'player1',
  PLAYER2 = 'player2'
}

export enum StoneType {
  FLAT = 'flat',
  WALL = 'wall',
  CAPSTONE = 'capstone'
}

export interface Stone {
  id: string;
  type: StoneType;
  owner: Player;
}

export interface PlayerReserve {
  flatStones: number;
  capstones: number;
}
