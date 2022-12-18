import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8').trim();

type Position = {
  x: number;
  y: number;
  z: number;
}

// enum Face {
//   Top,
//   Bottom,
//   Left,
//   Right,
//   Front,
//   Back,
// }

const drops: Position[] = textInput.split('\n').filter(Boolean).map((line) => {
  const [x, y, z] = line.split(',').map(Number);
  return { x, y, z };
});

const dropsString = drops.map(({ x, y, z }) => `${x},${y},${z}`);




// class Grid {
//   /**
//    * The already occupied points.
//    * 
//    * - `0`: Free
//    * - `1`: Exposed
//    * - `2`: Hidden
//    */
//   _grid: {
//     [x: number]: {
//       [y: number]: {
//         [z: number]: {
//           [f: number]: (0 | 1 | 2)
//         }
//       }
//     }
//   } = {};


//   set({ x, y, z }: Position): void {
//     if (!this._grid[x]) {
//       this._grid[x] = {};
//     }
//     if (!this._grid[x][y]) {
//       this._grid[x][y] = {};
//     }
//     if (!this._grid[x][y][z]) {
//       this._grid[x][y][z] = {};
//     }

//   }
// }

// const grid = new Grid();


let surface = 0;

const deltas: Position[] = [
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
];

console.log(drops.length, 6 * drops.length, 3 * drops.length);
for (const drop of drops) {
  for (const delta of deltas) {
    const otherDrop = { x: drop.x + delta.x, y: drop.y + delta.y, z: drop.z + delta.z };
    const otherDropString = `${otherDrop.x},${otherDrop.y},${otherDrop.z}`;
    if (!dropsString.includes(otherDropString)) {
      surface++;
    }
  }
}


// ? < x < 6354 < 6355 < 7878
console.log(surface);
