import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n')[0].split(',').map(Number);

let state: number[] = Array(9).fill(0);

for (const value of input) {
  state[value]++;
}

const days = 256;

for (let day = 1; day <= days; day++) {
  const newState = Array(9).fill(0);
  for (let day = 0; day < 9; day++) {
    const numberOfFishes = state[day];
    if (day === 0) {
      newState[6] += numberOfFishes;
      newState[8] += numberOfFishes;
    } else {
      newState[day - 1] += numberOfFishes;
    }
  }
  state = newState;
}

const result = state.reduce((acc, value) => acc + value, 0);

console.log(result); // 1732731810807
