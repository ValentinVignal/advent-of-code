import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((l) => parseInt(l));

let increases = 0;
for (let index = 0; index < input.length - 3; index++) {
  // 2 consecutive windows shared index + 1 and index + 2 numbers, so we only
  // need to compare index and index + 3.
  if (input[index] < input[index + 3]) {
    increases++;
  }
}

console.log(increases); // 1362
