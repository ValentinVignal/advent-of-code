import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((l) => parseInt(l));

let increases = 0;
for (let index = 0; index < input.length - 1; index++) {
  if (input[index] < input[index + 1]) {
    increases++;
  }
}

console.log(increases); // 1387
