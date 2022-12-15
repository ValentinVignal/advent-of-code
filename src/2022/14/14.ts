import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Point = { x: number; y: number };

const parsedInput: Point[][] = textInput
  .split('\n').filter((l) => l)
  .map(
    (l) => l.split(' -> ')
      .filter((c) => c)
      .map(
        (d) => {
          const [x, y] = d.split(',').map((x) => parseInt(x));
          return { x, y };
        }
      )
  );

let minX = Infinity;
let maxX = 0;
let minY = Infinity;
let maxY = 0;

for (const y of parsedInput) {
  for (const x of y) {
    minX = Math.min(x.x, minX);
    maxX = Math.max(x.x, maxX);
    minY = Math.min(x.y, minY);
    maxY = Math.max(x.y, maxY);
  }
}


const start = 500;

const groundY = maxY + 2;

class Grid {
  /**
   * The already occupied points.
   * 
   * - `0`: Free
   * - `1`: Sand
   * - `2`: Wall
   */
  _grid: {
    [_: number]: {
      [_: number]: (0 | 1 | 2),
    }
  } = {};

  get(x: number, y: number): 0 | 1 | 2 {
    return this._grid[x]?.[y] ?? 0;
  }

  set(x: number, y: number, value: 1 | 2 = 1): void {
    if (!this._grid[x]) {
      this._grid[x] = {};
    }
    this._grid[x][y] = value;
  }
}

const map = new Grid();


// Init the map.
for (const wall of parsedInput) {
  for (let i = 0; i < wall.length - 1; i++) {
    const start = wall[i];
    const end = wall[i + 1];
    if (start.x !== end.x) {
      for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
        map.set(x, start.y, 2);
      }
    } else {
      for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
        map.set(start.x, y, 2);
      }
    }
  }
}

const createSand = (): Point => ({ x: start, y: 0 });


/** Sand number. */
let s = 1;
let position = createSand();

const newSand = (): Point => {
  map.set(position.x, position.y);
  s++;
  return createSand();
};

/**
 * 
 * @param position 
 * @returns `true` if the sand can fall lower.
 */
const canFall = (): boolean => {
  return (
    !hasReachedGround() && (
      !map.get(position.x, position.y + 1)
      || !map.get(position.x - 1, position.y + 1)
      || !map.get(position.x + 1, position.y + 1))
  );
}

const hasReachedGround = (): boolean => {
  return position.y === groundY - 1;
}


/**
 * 
 * @param position A position that can fall.
 * @returns The new position after falling.
 */
const fall = () => {
  if (!map.get(position.x, position.y + 1)) {
    position = { y: position.y + 1, x: position.x };
  } else if (!map.get(position.x - 1, position.y + 1)) {
    position = { y: position.y + 1, x: position.x - 1 };
  } else {
    position = { y: position.y + 1, x: position.x + 1 };
  }
}


let i = 0;
const log = (): void => {
  // console.clear();
  // var lines = process.stdout.getWindowSize()[1];
  // for (let i = 0; i < lines; i++) {
  //   console.log('\r\n');
  // }

  if (!(s % 10000000)) {
    console.log('s', s, 'i', i);
  }
  // console.log(map.map((l, y) => l.map((c, x) => {
  //   if (x === position.x && y === position.y) return '+';
  //   switch (c) {
  //     case 0: return '.';
  //     case 1: return 'o';
  //     case 2: return '#';
  //   }
  // }).join('')).join('@\n'));
}

const hasReachedLimit = (): boolean => {
  return position.x === start && position.y === 0 && !canFall();
}

while (true) {
  i++;
  if (hasReachedLimit()) {
    break;
  }
  if (canFall()) {
    fall();
  } else {
    log();
    position = newSand();
  }
}


console.log(s - 1);



