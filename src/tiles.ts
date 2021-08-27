export class Tiles {
  width: number;
  height: number;

  private tiles: number[] = [];

  constructor(width: number, height: number, values: number[] = []) {
    this.width = width;
    this.height = height;

    if (values.length == 0) {
      for (var index = 0; index < width * height; index++) {
        this.tiles[index] = 0;
      }
    } else {
      this.tiles = values;
    }
  }

  get(x: number, y: number): number {
    return this.tiles[y * this.width + x];
  }

  set(x: number, y: number, tile: number) {
    this.tiles[y * this.width + x] = tile;
  }

  clone(): Tiles {
    return new Tiles(this.width, this.height, [...this.tiles]);
  }
}
