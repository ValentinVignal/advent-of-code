import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((line) => {
  return line.split('').map(Number);
});

const lowPoints: number[] = [];

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
      lowPoints.push(value);
    }
  }
}

const result = lowPoints.reduce((a, b) => a + (b + 1), 0);

// x < 1728
console.log(result); // 518


