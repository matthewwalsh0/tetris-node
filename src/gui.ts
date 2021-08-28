import {Tiles} from './tiles';

export interface GUI {
  display(tiles: Tiles, score: number): void;
  moveLeft(): boolean;
  moveRight(): boolean;
  moveDown(): boolean;
  rotateRight(): boolean;
  rotateLeft(): boolean;
}