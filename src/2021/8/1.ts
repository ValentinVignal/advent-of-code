import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((line) => {
  return line.split(' | ')[1].split(' ').map((n) => n.length);
})

const result = input.reduce((acc, curr) => {
  return acc + curr.reduce((acc, curr) => {
    return [2, 4, 3, 7].includes(curr) ? acc + 1 : acc;
  }, 0);
}, 0);

console.log(result); // 445
