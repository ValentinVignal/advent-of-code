import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split(',').filter(Boolean).map(Number);

const min = Math.min(...input);
const max = Math.max(...input);

let minPosition = min;
let minFuel = Infinity;

for (let i = min; i <= max; i++) {
  const fuel = input.reduce((acc, x) => {
    const distance = Math.abs(x - i);
    const fuel = distance * (distance + 1) / 2
    return acc + fuel;
  }, 0);
  if (fuel < minFuel) {
    minFuel = fuel;
    minPosition = i;
  }
}

console.log(minPosition)

// x < 96592329
console.log(minFuel); // 96592275
