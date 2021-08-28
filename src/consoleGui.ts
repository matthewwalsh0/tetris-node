import blessed from 'blessed';

import {ScoreEntry} from './scores';
import {Tiles} from './tiles';

const PIECE_COLOURS: string[] =
    ['white', 'cyan', 'blue', '#FFA500', 'yellow', 'green', '#800080', 'red'];

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
  }

  display(tiles: Tiles, score: number, highScores: ScoreEntry[]) {
    const screen = blessed.screen({smartCSR: true, dockBorders: true});
    screen.title = 'Tetris';

    const singleWidth = (2 / screen.cols) * 100;
    const singleHeight = (1 / screen.rows) * 100;

    const background = blessed.box({
      width: (singleWidth * tiles.width + 4) + '%',
      height: (singleHeight * tiles.height + 4) + '%',
      tags: true,
      border: 'line',
      style: {border: {fg: '#f0f0f0'}}
    });

    screen.append(background);

    const scoreBox = blessed.box({
      left: (singleWidth * tiles.width + 3) + '%',
      width: 'shrink',
      height: 'shrink',
      tags: true,
      border: 'line',
      style: {border: {fg: '#f0f0f0'}},
      content: 'SCORE\n' + score
    });

    screen.append(scoreBox);

    if (highScores.length) {
      const highScoreBox = blessed.box({
        left: (singleWidth * tiles.width + 3) + '%',
        top: (singleHeight * 3) + '%',
        width: 'shrink',
        height: 'shrink',
        tags: true,
        border: 'line',
        style: {border: {fg: '#f0f0f0'}},
        content: 'HIGH SCORES\n' +
            highScores.map(score => score.name + ' | ' + score.value).join('\n')
      });

      screen.append(highScoreBox);
    }

    for (var y = 0; y < tiles.height; y++) {
      for (var x = 0; x < tiles.width; x++) {
        const character: number = tiles.get(x, y);
        if (character === 0) continue;

        const left: number = (x + 1) * singleWidth;
        const top: number = y * singleHeight;

        const pieceBox = blessed.box({
          top: top + '%',
          left: left + '%',
          width: singleWidth + '%',
          height: singleHeight + '%',
          tags: true,
          style: {bg: PIECE_COLOURS[character]}
        });

        screen.append(pieceBox);
      }
    }

    background.key(['d', 'right'], (ch, key) => {
      this.isRightPressed = true;
    });

    background.key(['a', 'left'], (ch, key) => {
      this.isLeftPressed = true;
    });

    background.key(['s', 'down'], (ch, key) => {
      this.isDownPressed = true;
    });

    background.key('e', (ch, key) => {
      this.isRotateRightPressed = true;
    });

    background.key('q', (ch, key) => {
      this.isRotateLeftPressed = true;
    });

    background.key(['escape', 'C-c'], (ch, key) => {
      return process.exit();
    });

    background.focus();
    screen.render();
  }

  async inputName(): Promise<string> {
    return new Promise(resolve => {
      var screen = blessed.screen({});

      var prompt = blessed.prompt({
        left: 'center',
        top: 'center',
        height: 'shrink',
        width: 'shrink',
        border: 'line'
      });

      screen.append(prompt);
      screen.render();

      prompt.input('Enter your name:', '', (error, value) => resolve(value));
    });
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
}