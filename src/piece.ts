import {Tiles} from './tiles';

const PARTS: number[][] = [
  [0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 3, 0, 3, 3, 3, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 5, 5, 0, 5, 5, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 6, 0, 0, 6, 6, 6, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 7, 7, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0]
];

export class Piece {
  private parts: number[] = [];
  private rotation: number = 0;

  constructor() {
    const partIndex = Piece.getRandomInt(0, PARTS.length - 1);
    this.parts = [...PARTS[partIndex]];
  }

  rotateRight() {
    this.rotation = this.rotation == 3 ? 0 : this.rotation + 1;
  }

  rotateLeft() {
    this.rotation = this.rotation == 0 ? 3 : this.rotation - 1;
  }

  draw(tiles: Tiles, tileX: number, tileY: number) {
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 4; x++) {
        const index = this.getIndex(x, y);
        const character = this.parts[index];

        if (character == 0) continue;
        if (tileX + x < 0 || tileY + y < 0) continue;

        tiles.set(tileX + x, tileY + y, character);
      }
    }
  }

  isCollision(tiles: Tiles, tileX: number, tileY: number): boolean {
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 4; x++) {
        const index = this.getIndex(x, y);
        const local = this.parts[index];

        if (local == 0) continue;

        if (tileY + y == tiles.height || tileX + x == tiles.width ||
            tileX + x == -1)
          return true;

        const current = tiles.get(tileX + x, tileY + y);

        if (current != 0) return true;
      }
    }

    return false;
  }

  private getIndex(x: number, y: number): number {
    switch (this.rotation) {
      case 0:
        return y * 4 + x;
      case 1:
        return 12 + y - (4 * x);
      case 2:
        return 15 - (4 * y) - x;
      case 3:
        return 3 - y + (4 * x);
      default:
        return 0;
    }
  }

  private static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - 1 - min) + min);
  }
}
