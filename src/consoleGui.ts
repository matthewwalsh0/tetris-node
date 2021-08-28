import chalk from 'chalk';
import readline from 'readline';

import {Tiles} from './Tiles';

const CHARACTER_BORDER: string = '#';
const CHARACTER_BLOCK: string = '#';

const PIECE_COLOURS: Function[] = [
  chalk.white.bgWhite, chalk.cyan.bgCyanBright, chalk.blue.bgBlue,
  chalk.rgb(255, 165, 0).bgRgb(255, 165, 0), chalk.yellow.bgYellow,
  chalk.green.bgGreen, chalk.rgb(128, 0, 128).bgRgb(128, 0, 128),
  chalk.red.bgRed
];

export class ConsoleGUI {
  private isLeftPressed: boolean;
  private isRightPressed: boolean;
  private isDownPressed: boolean;
  private isRotateRightPressed: boolean;
  private isRotateLeftPressed: boolean;

  constructor() {
    this.isLeftPressed = false;
    this.isRightPressed = false;
    this.isDownPressed = false;
    this.isRotateRightPressed = false;
    this.isRotateLeftPressed = false;

    this.initKeyHandlers();
  }

  display(tiles: Tiles, score: number) {
    const horizontalBorder: string =
        Array.from({length: tiles.width + 2}, (x, i) => CHARACTER_BORDER)
            .join('');

    console.clear();
    console.log('Score: %d\n', score);
    console.log(horizontalBorder);

    for (var y = 0; y < tiles.height; y++) {
      let line = CHARACTER_BORDER;

      for (var x = 0; x < tiles.width; x++) {
        const value = tiles.get(x, y);
        let output = value == 0 ? ' ' : PIECE_COLOURS[value](CHARACTER_BLOCK);

        line += output;
      }

      line += CHARACTER_BORDER;

      console.log(line);
    }

    console.log(horizontalBorder);
  }

  moveRight(): boolean {
    const value = this.isRightPressed;
    this.isRightPressed = false;
    return value;
  }

  moveLeft(): boolean {
    const value = this.isLeftPressed;
    this.isLeftPressed = false;
    return value;
  }

  moveDown(): boolean {
    const value = this.isDownPressed;
    this.isDownPressed = false;
    return value;
  }

  rotateRight(): boolean {
    const value = this.isRotateRightPressed;
    this.isRotateRightPressed = false;
    return value;
  }

  rotateLeft(): boolean {
    const value = this.isRotateLeftPressed;
    this.isRotateLeftPressed = false;
    return value;
  }

  private initKeyHandlers() {
    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', this.onKeyPress.bind(this));
  }

  private onKeyPress(str: any, key: any) {
    if (this.isPendingInput()) return;

    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else if (key.name === 'right' || key.name === 'd') {
      this.isRightPressed = true;
    } else if (key.name === 'left' || key.name === 'a') {
      this.isLeftPressed = true;
    } else if (key.name === 'down' || key.name === 's') {
      this.isDownPressed = true;
    } else if (key.name === 'e') {
      this.isRotateRightPressed = true;
    } else if (key.name === 'q') {
      this.isRotateLeftPressed = true;
    }
  }

  private isPendingInput(): boolean {
    return this.isRightPressed || this.isLeftPressed || this.isDownPressed ||
        this.isRotateRightPressed || this.isRotateLeftPressed;
  }
}