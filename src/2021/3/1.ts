import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean);

const lineLength = input[0].length;
const lineNumber = input.length;

const oneCounts = Array(lineLength).fill(0);

for (const line of input) {
  for (let i = 0; i < lineLength; i++) {
    if (line[i] === '1') {
      oneCounts[i]++;
    }
  }
}

let gamma = 0
let epsilon = 0;

for (let n = 0; n < lineLength; n++) {
  const oneCount = oneCounts[n];
  const zeroCount = lineNumber - oneCount;
  const value = (2 ** (lineLength - 1 - n));
  if (oneCount > zeroCount) {
    gamma += value
  } else {
    epsilon += value;
  }
}

console.log(gamma * epsilon); // 3882564
