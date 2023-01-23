import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((line) => {
  return line.split('').map(Number);
});

const basinSizes: number[] = [];

const pointToString = (x: number, y: number) => `${x},${y}`;

for (let x = 0; x < input[0].length; x++) {
  for (let y = 0; y < input.length; y++) {
    const value = input[y][x];
    let isLowPoint = true;
    if (x > 0 && input[y][x - 1] <= value) {
      isLowPoint = false;
    } else if (x < input[0].length - 1 && input[y][x + 1] <= value) {
      isLowPoint = false;
    } else if (y > 0 && input[y - 1][x] <= value) {
      isLowPoint = false;
    } else if (y < input.length - 1 && input[y + 1][x] <= value) {
      isLowPoint = false;
    }
    if (isLowPoint) {
      // We need to find its basin.
      const basin = new Set<string>();
      const queue = [{ x, y }];
      while (queue.length) {
        const { x, y } = queue.shift()!;
        basin.add(pointToString(x, y));
        for (const delta of [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }] as const) {
          const newX = x + delta.x;
          const newY = y + delta.y;
          if (newX >= 0 && newX < input[0].length && newY >= 0 && newY < input.length) {
            if (input[newY][newX] < 9 && !basin.has(pointToString(newX, newY))) {
              queue.push({ x: newX, y: newY });
            }
          }
        }
      }

      basinSizes.push(basin.size);
    }
  }
}

const result = basinSizes.sort((a, b) => b - a).slice(0, 3).reduce((a, b) => a * b, 1);

console.log(result); // 949905

