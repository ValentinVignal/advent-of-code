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

// Adds some padding.
minX -= 20;
maxX += 20;
minY -= 20;
maxY += 20;

const xLength = maxX - minX + 1;
const yLength = maxY - minY + 1;

const start = 500 - minX;

console.log(minX, maxX, minY, maxY, xLength, yLength, start);

/**
 * `x` and `y` are relative and in `[min, max]`.
 */
const relativeInput: Point[][] = parsedInput.map((l) => l.map((p) => ({ x: p.x - minX, y: p.y - minY })));



/**
 * The already occupied points.
 * 
 * - `0`: Free
 * - `1`: Sand
 * - `2`: Wall
 */
const map: (0 | 1 | 2)[][] = Array.from(Array(yLength), () => new Array(xLength).fill(0));

// Init the map.

for (const wall of relativeInput) {
  for (let i = 0; i < wall.length - 1; i++) {
    const start = wall[i];
    const end = wall[i + 1];
    if (start.x !== end.x) {
      for (let x = Math.min(start.x, end.x); x <= Math.max(start.x, end.x); x++) {
        map[start.y][x] = 2;
      }
    } else {
      for (let y = Math.min(start.y, end.y); y <= Math.max(start.y, end.y); y++) {
        map[y][start.x] = 2;
      }
    }
  }
}

const createSand = (): Point => ({ y: 0, x: start });



/** Sand number. */
let s = 1;
let position = createSand();

const newSand = (): Point => {
  map[position.y][position.x] = 1;
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
    hasReachedAbyss()
    || (!map[position.y + 1][position.x])
    || (position.x > 0 && !map[position.y + 1][position.x - 1])
    || (position.x < xLength - 1 && !map[position.y + 1][position.x + 1])
  );
}

const hasReachedAbyss = (): boolean => {
  return position.y === yLength - 1;
}


/**
 * 
 * @param position A position that can fall.
 * @returns The new position after falling.
 */
const fall = () => {
  if (!map[position.y + 1][position.x]) {
    position = { y: position.y + 1, x: position.x };
  } else if (position.x > 0 && !map[position.y + 1][position.x - 1]) {
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

  console.log('s', s, 'i', i);
  // console.log(map.map((l, y) => l.map((c, x) => {
  //   if (x === position.x && y === position.y) return '+';
  //   switch (c) {
  //     case 0: return '.';
  //     case 1: return 'o';
  //     case 2: return '#';
  //   }
  // }).join('')).join('@\n'));
}

while (true) {
  i++;
  log();
  if (hasReachedAbyss()) {
    break;
  }
  if (canFall()) {
    fall();
  } else {
    console.log('s', s);
    position = newSand();
  }
}


console.log(s - 1);



