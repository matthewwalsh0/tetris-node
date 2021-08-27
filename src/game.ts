import {Piece} from './piece';
import {Tiles} from './tiles';

const WIDTH: number = 10;
const HEIGHT: number = 24;
const INTERVAL_FRAME = 16;
const INTERVAL_GRAVITY: number = 62 * INTERVAL_FRAME;
const INTERVAL_FPS: number = 1000;
const ROW_SCORES: number[] = [0, 40, 100, 300, 1200];
const GRAVITY_SCORE: number = 1;

export class Game {
  tiles: Tiles;
  currentPiece: Piece;
  currentX: number;
  currentY: number;
  frameCount: number;
  score: number;
  fps: number;

  constructor() {
    this.tiles = new Tiles(WIDTH, HEIGHT);
    this.currentPiece = new Piece();
    this.currentX = 5;
    this.currentY = 0;
    this.frameCount = 0;
    this.score = 0;
    this.fps = 0;
  }

  async start() {
    Game.setIntervalFactoringDuration(() => {
      this.tryMove(0, 1, false, false);
      this.score += GRAVITY_SCORE;
    }, INTERVAL_GRAVITY);

    Game.setIntervalFactoringDuration(() => {
      this.display();
      this.frameCount++;
    }, INTERVAL_FRAME);

    Game.setIntervalFactoringDuration(() => {
      this.fps = this.frameCount;
      this.frameCount = 0;
    }, INTERVAL_FPS);
  }

  private tryMove(
      xChange: number, yChange: number, rotatedRight: boolean,
      rotatedLeft: boolean): boolean {
    const originalX: number = this.currentX;
    const originalY: number = this.currentY;
    let newX: number = this.currentX + xChange;
    let newY: number = this.currentY + yChange;

    if (this.currentPiece.isCollision(this.tiles, newX, originalY)) {
      newX = originalX;

      if (rotatedRight) {
        this.currentPiece.rotateLeft();
      } else if (rotatedLeft) {
        this.currentPiece.rotateRight();
      }
    }

    if (this.currentPiece.isCollision(this.tiles, newX, newY)) {
      if (newY == 0) return false;

      this.currentPiece.draw(this.tiles, originalX, originalY);
      this.currentPiece = new Piece();

      newX = 5;
      newY = 0;
    }

    this.currentX = newX;
    this.currentY = newY;

    Game.checkFullRows(this.tiles, this.score);

    return true;
  }

  private display() {
    console.clear();
    const displayTiles = this.tiles.clone();

    this.currentPiece.draw(displayTiles, this.currentX, this.currentY);

    console.log('Score: %d\nFPS: %d\n', this.score, this.fps);
    console.log(Array.from({length: WIDTH + 2}, (x, i) => '#').join(''));

    for (var y = 0; y < HEIGHT; y++) {
      let line = '#';

      for (var x = 0; x < WIDTH; x++) {
        const value = displayTiles.get(x, y);
        let output = value == 0 ? ' ' : value;

        line += output;
      }

      line += '#';

      console.log(line);
    }

    console.log(Array.from({length: WIDTH + 2}, (x, i) => '#').join(''));
  }

  private static checkFullRows(tiles: Tiles, score: number) {
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

    score += ROW_SCORES[completeRows];
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

  private static setIntervalFactoringDuration(
      callback: Function, interval: number) {
    const start = new Date();
    callback();
    const duration = Game.elapsedSince(start);
    const newInterval = duration > interval ? 0 : interval - duration;

    setTimeout(() => {
      Game.setIntervalFactoringDuration(callback, interval);
    }, newInterval);
  }

  private static elapsedSince(since: Date): number {
    return new Date().getTime() - since.getTime();
  }
}
