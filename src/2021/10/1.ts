import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

const input = textInput.split('\n').filter(Boolean).map((line) => line.split(''));

const illegals: string[] = []

for (const line of input) {
  const expected: string[] = [];
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
        illegals.push(char);
        break;
      }
    }
  }
}

const charToPoint = (char: string) => {
  switch (char) {
    case ')': return 3;
    case ']': return 57;
    case '}': return 1197;
    case '>': return 25137;
    default: throw new Error('Invalid char');
  }
}

const result = illegals.map(charToPoint).reduce((a, b) => a + b, 0);

console.log(result); // 369105
