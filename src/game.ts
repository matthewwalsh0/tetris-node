import {GUI} from './gui';
import {Piece} from './piece';
import {Tiles} from './tiles';

const WIDTH: number = 10;
const HEIGHT: number = 24;
const INTERVAL_FRAME = 16;
const INTERVAL_GRAVITY: number = 62 * INTERVAL_FRAME;
const INTERVAL_INPUT: number = 3 * INTERVAL_FRAME;
const ROW_SCORES: number[] = [0, 40, 100, 300, 1200];
const GRAVITY_SCORE: number = 1;

export class Game {
  tiles: Tiles;
  currentPiece: Piece;
  currentX: number;
  currentY: number;
  score: number;
  end: boolean;
  gui: GUI;

  constructor(gui: GUI) {
    this.gui = gui;

    this.tiles = new Tiles(WIDTH, HEIGHT);
    this.currentPiece = new Piece();
    this.currentX = 5;
    this.currentY = 0;
    this.score = 0;
    this.end = false;
  }

  async start() {
    this.setIntervalFactoringDuration(
        this.onInputInterval.bind(this), INTERVAL_INPUT);

    this.setIntervalFactoringDuration(
        this.onGravityInterval.bind(this), INTERVAL_GRAVITY);
  }

  private onInputInterval() {
    const xChange: number = this.gui.moveRight() ? 1 :
        this.gui.moveLeft()                      ? -1 :
                                                   0;

    const yChange: number = this.gui.moveDown() ? 1 : 0;

    const rotateRight: boolean = this.gui.rotateRight();
    const rotateLeft: boolean = this.gui.rotateLeft();

    const pendingInput =
        xChange != 0 || yChange != 0 || rotateRight || rotateLeft;

    if (!pendingInput) return;

    this.tryMove(xChange, yChange, rotateRight, rotateLeft);
    this.display();
  }

  private onGravityInterval() {
    this.tryMove(0, 1, false, false);
    this.score += GRAVITY_SCORE;
    this.display();
  }

  private tryMove(
      xChange: number, yChange: number, rotateRight: boolean,
      rotateLeft: boolean) {
    const originalX: number = this.currentX;
    const originalY: number = this.currentY;
    let newX: number = this.currentX + xChange;
    let newY: number = this.currentY + yChange;

    if (rotateRight) {
      this.currentPiece.rotateRight();
    } else if (rotateLeft) {
      this.currentPiece.rotateLeft();
    }

    if (this.currentPiece.isCollision(this.tiles, newX, originalY)) {
      newX = originalX;

      if (rotateRight) {
        this.currentPiece.rotateLeft();
      } else if (rotateLeft) {
        this.currentPiece.rotateRight();
      }
    }

    if (this.currentPiece.isCollision(this.tiles, newX, newY)) {
      if (originalY == 0) {
        this.end = true;
        process.stdin.removeAllListeners();
        return;
      }

      this.currentPiece.draw(this.tiles, originalX, originalY);
      this.currentPiece = new Piece();

      newX = 5;
      newY = 0;
    }

    this.currentX = newX;
    this.currentY = newY;

    const completeRows: number = Game.checkFullRows(this.tiles);
    this.score += ROW_SCORES[completeRows];
  }

  private display() {
    const displayTiles = this.tiles.clone();
    this.currentPiece.draw(displayTiles, this.currentX, this.currentY);

    this.gui.display(displayTiles, this.score);
  }

  private setIntervalFactoringDuration(callback: Function, interval: number) {
    if (this.end) return;

    const start = new Date();
    callback();
    const duration = Game.elapsedSince(start);
    const newInterval = duration > interval ? 0 : interval - duration;

    setTimeout(() => {
      this.setIntervalFactoringDuration(callback, interval);
    }, newInterval);
  }

  private static checkFullRows(tiles: Tiles): number {
    let completeRows: number = 0;
    let foundRow: boolean = true;

    while (foundRow) {
      foundRow = false;

      for (var y = HEIGHT - 1; y >= 0; y--) {
        if (!Game.isRowFull(tiles, y)) continue;

        foundRow = true;
        completeRows++;
        Game.clearRow(tiles, y);

        if (y == 0) break;

        for (var y2 = y - 1; y2 >= 0; y2--) {
          Game.shiftRowDown(tiles, y2);
        }

        break;
      }
    }

    return completeRows;
  }

  private static clearRow(tiles: Tiles, y: number) {
    for (var x = 0; x < WIDTH; x++) {
      tiles.set(x, y, 0);
    }
  }

  private static shiftRowDown(tiles: Tiles, y: number) {
    for (var x = 0; x < WIDTH; x++) {
      const current = tiles.get(x, y);
      tiles.set(x, y, 0);
      tiles.set(x, y + 1, current);
    }
  }

  private static isRowFull(tiles: Tiles, y: number): boolean {
    for (var x = 0; x < WIDTH; x++) {
      const tile: number = tiles.get(x, y);
      if (tile == 0) return false;
    }

    return true;
  }

  private static elapsedSince(since: Date): number {
    return new Date().getTime() - since.getTime();
  }
}
