import {ScoreEntry} from './scores';
import {Tiles} from './tiles';

export interface GUI {
  display(
      tiles: Tiles, score: number, highScores: ScoreEntry[],
      difficulty: number): void;
  inputName(): Promise<string>;
  moveLeft(): boolean;
  moveRight(): boolean;
  moveDown(): boolean;
  rotateRight(): boolean;
  rotateLeft(): boolean;
}