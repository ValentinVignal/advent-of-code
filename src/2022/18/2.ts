import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8').trim();

type Position = {
  x: number;
  y: number;
  z: number;
}


const drops: Position[] = textInput.split('\n').filter(Boolean).map((line) => {
  const [x, y, z] = line.split(',').map(Number);
  return { x: x + 1, y: y + 1, z: z + 1 };
});

const positionToString = ({ x, y, z }: Position) => `${x},${y},${z}`;

const dropsString = drops.map(positionToString);

const max: Position = { x: 0, y: 0, z: 0 };

// Get the max position to create the grid.
for (const { x, y, z } of drops) {
  if (x > max.x) {
    max.x = x;
  }
  if (y > max.y) {
    max.y = y;
  }
  if (z > max.z) {
    max.z = z;
  }
}

console.log(max);

const grid = Array.from(
  { length: max.x + + 2 },
  () => Array.from(
    { length: max.y + 2 },
    () => Array.from(
      { length: max.z + 2 }, () => false
    )
  )
);

const queue: Position[] = [{ x: 0, y: 0, z: 0 }];

let surface = 0;

const deltas: Position[] = [
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
];

while (queue.length) {
  const { x, y, z } = queue.shift()!;
  if (grid[x][y][z]) continue;
  grid[x][y][z] = true;
  for (const delta of deltas) {
    const otherDrop = { x: x + delta.x, y: y + delta.y, z: z + delta.z };
    if (otherDrop.x < 0 || otherDrop.y < 0 || otherDrop.z < 0 || otherDrop.x > max.x + 1 || otherDrop.y > max.y + 1 || otherDrop.z > max.z + 1) continue;
    const otherDropString = positionToString(otherDrop);

    if (dropsString.includes(otherDropString)) {
      surface++;
    } else if (!grid[otherDrop.x][otherDrop.y][otherDrop.z]) {
      queue.push(otherDrop);
    }
  }
}



// 1858 < 2470 < 2473 < x < ?
console.log(surface);
