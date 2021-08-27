import chalk from 'chalk';
import readline from 'readline';

import {Piece} from './piece';
import {Tiles} from './tiles';

const WIDTH: number = 10;
const HEIGHT: number = 24;
const INTERVAL_FRAME = 16;
const INTERVAL_GRAVITY: number = 62 * INTERVAL_FRAME;
const INTERVAL_FPS: number = 1000;
const INTERVAL_INPUT: number = 3 * INTERVAL_FRAME;
const ROW_SCORES: number[] = [0, 40, 100, 300, 1200];
const GRAVITY_SCORE: number = 1;

const PIECE_COLOURS: Function[] = [
  chalk.white.bgWhite, chalk.cyan.bgCyanBright, chalk.blue.bgBlue,
  chalk.rgb(255, 165, 0).bgRgb(255, 165, 0), chalk.yellow.bgYellow,
  chalk.green.bgGreen, chalk.rgb(128, 0, 128).bgRgb(128, 0, 128),
  chalk.red.bgRed
];

class PendingInput {
  xChange: number = 0;
  yChange: number = 0;
  rotateRight: boolean = false;
  rotateLeft: boolean = false;

  constructor(
      xChange: number, yChange: number, rotateRight: boolean,
      rotateLeft: boolean) {
    this.xChange = xChange;
    this.yChange = yChange;
    this.rotateRight = rotateRight;
    this.rotateLeft = rotateLeft;
  }
}

export class Game {
  tiles: Tiles;
  currentPiece: Piece;
  currentX: number;
  currentY: number;
  frameCount: number;
  score: number;
  fps: number;
  end: boolean;
  pendingInput?: PendingInput;

  constructor() {
    this.tiles = new Tiles(WIDTH, HEIGHT);
    this.currentPiece = new Piece();
    this.currentX = 5;
    this.currentY = 0;
    this.frameCount = 0;
    this.score = 0;
    this.fps = 0;
    this.end = false;
  }

  async start() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (this.pendingInput) return;

      if (key.ctrl && key.name === 'c') {
        process.exit();
      } else if (key.name === 'right' || key.name === 'd') {
        this.pendingInput = new PendingInput(1, 0, false, false);
      } else if (key.name === 'left' || key.name === 'a') {
        this.pendingInput = new PendingInput(-1, 0, false, false);
      } else if (key.name === 'down' || key.name === 's') {
        this.pendingInput = new PendingInput(0, 1, false, false);
      } else if (key.name === 'e') {
        this.pendingInput = new PendingInput(0, 0, true, false);
      } else if (key.name === 'q') {
        this.pendingInput = new PendingInput(0, 0, false, true);
      }
    });

    this.setIntervalFactoringDuration(() => {
      if (this.pendingInput) {
        this.tryMove(
            this.pendingInput.xChange, this.pendingInput.yChange,
            this.pendingInput.rotateRight, this.pendingInput.rotateLeft);
        this.pendingInput = undefined;
      }
    }, INTERVAL_INPUT);

    this.setIntervalFactoringDuration(() => {
      this.tryMove(0, 1, false, false);
      this.score += GRAVITY_SCORE;
    }, INTERVAL_GRAVITY);

    this.setIntervalFactoringDuration(() => {
      this.display();
      this.frameCount++;
    }, INTERVAL_FRAME);

    this.setIntervalFactoringDuration(() => {
      this.fps = this.frameCount;
      this.frameCount = 0;
    }, INTERVAL_FPS);
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

    Game.checkFullRows(this.tiles, this.score)
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
        let output = value == 0 ? ' ' : PIECE_COLOURS[value]('#');

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

  private static elapsedSince(since: Date): number {
    return new Date().getTime() - since.getTime();
  }
}
