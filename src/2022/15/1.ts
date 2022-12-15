import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Point = { x: number; y: number };
type Pair = { s: Point, b: Point };

const pointFromString = (s: string): Point => {
  const [x, y] = s.split(', y=').map((x) => parseInt(x));
  return { x, y };
}

const pairs: Pair[] = textInput.split('\n').filter((l) => l).map((line) => {
  const [s, b] = line.substring(12).split(': closest beacon is at x=').map((s) => pointFromString(s));
  return { s, b }

});



class Grid {
  _grid: {
    [x: number]: {
      [y: number]: true,
    }
  } = {};

  get(x: number, y: number): boolean {
    return this._grid[x]?.[y] ?? false;
  }

  set(x: number, y: number): void {
    if (!this._grid[x]) {
      this._grid[x] = {};
    }
    this._grid[x][y] = true;
  }

  lineX(x: number): number[] {
    return Object.keys(this._grid[x]).map((y) => parseInt(y));
  }

  lineY(y: number): number[] {
    const result: number[] = [];
    for (const [xString, yGrid] of Object.entries(this._grid)) {
      if (Object.keys(yGrid).map((y) => parseInt(y)).includes(y)) {
        result.push(parseInt(xString));
      }
    };
    return result;
  }
}

/**
 * The line number for the output. 
 */
const yLine = 2000000;


const distance = (a: Point, b: Point): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
const grid = new Grid();
grid.set(0, 0);

const points = new Set<number>();

for (const { s, b } of pairs) {
  // We are counting positions with no beacon.
  const beaconDistance = distance(s, b);
  const distanceToLine = distance(s, { x: s.x, y: yLine });
  const delta = beaconDistance - distanceToLine;
  if (delta >= 0) {
    for (let d = -delta; d <= delta; d++) {
      points.add(s.x + d);
    }
  }
}

// Remove the already known beacons
for (const { b } of pairs) {
  if (b.y === yLine) {
    points.delete(b.x);
  }
}


//  3835228 < x < Infinity
//  3835227
//  2237091
//  1963837
//  1963836

console.log(points.size);

