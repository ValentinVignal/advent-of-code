import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const state = textInput.split('\n')[0].split(',').map(Number);

const days = 80;

for (let day = 1; day <= days; day++) {
  const stateLength = state.length;
  for (let i = 0; i < stateLength; i++) {
    if (state[i] > 0) {
      state[i]--;
    } else {
      state[i] = 6;
      state.push(8);
    }
  }
}

const result = state.length;

console.log(result); // 386755
