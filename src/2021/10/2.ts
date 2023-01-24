import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((line) => line.split(''));

type ClosingChar = ')' | ']' | '}' | '>';

const completions: ClosingChar[][] = [];

for (const line of input) {
  const expected: ClosingChar[] = [];
  let isCorrupted = false;
  for (const char of line) {
    if (char === '(') {
      expected.push(')');
    } else if (char === '[') {
      expected.push(']');
    } else if (char === '{') {
      expected.push('}');
    } else if (char === '<') {
      expected.push('>');
    } else {
      // This is a closing token.
      const e = expected.pop();
      if (e === char) {
        continue;
      } else {
        // This is an corrupted line, we can skip it.
        isCorrupted = true;
        break;
      }
    }
  }
  if (!isCorrupted) {
    completions.push(expected.reverse())
  }
}

const charToPoint = (char: ClosingChar) => {
  switch (char) {
    case ')': return 1;
    case ']': return 2;
    case '}': return 3;
    case '>': return 4;
  }
}

const scores = completions.map((completion) => {
  return completion.reduce(
    (acc, char) => (5 * acc) + charToPoint(char),
    0);
}).sort((a, b) => a - b);

const result = scores[Math.floor(scores.length / 2)];

// 858540414 < x
console.log(result); // 3999363569
