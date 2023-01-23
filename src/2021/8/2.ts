import { readFileSync } from 'fs';
import * as path from 'path';

const textInput = readFileSync(path.join(__dirname, 'input.txt'), 'utf-8');

type Signal = {
  digits: string[][];
  output: string[][];
}

const input: Signal[] = textInput.split('\n').filter(Boolean).map((line) => {
  const [digits, output] = line.split(' | ').map((l) => l.split(' ').map((n) => n.split('')));
  return {
    digits,
    output,
  }
})

const stringToDigit = (s: string[], digits: string[][]): number => {
  switch (s.length) {
    case 2: return 1;
    case 4: return 4;
    case 3: return 7;
    case 7: return 8;
    case 5: {
      // It can be 2, 3, 5.
      const one = digits.find((d) => d.length === 2)!;
      if (one.every((d) => s.includes(d))) {
        // Only 3 has all the digits of 1.
        return 3;
      } else {
        // It can be 2 or 5.
        const four = digits.find((d) => d.length === 4)!;
        if (four.filter((d) => s.includes(d)).length === 3) {
          // Only 5 shares 3 segments with 4
          return 5;
        } else {
          return 2;
        }
      }
    }
    case 6: {
      // I can be 0, 6, 9.
      const one = digits.find((d) => d.length === 2)!;
      if (!one.every((d) => s.includes(d))) {
        // Only 6 doesn't have all the segments of 1.
        return 6;
      } else {
        // It can be 0 or 9.
        const four = digits.find((d) => d.length === 4)!;
        if (four.every((d) => s.includes(d))) {
          // Only 9 has all the digits of 4.
          return 9;
        } else {
          return 0;
        }
      }

    }
    default:
      throw new Error(`Unknown digit: ${s}`);
  }
}

const result = input.reduce((acc, { digits, output }) => {
  const parsedOutputDigits = output.map((o) => stringToDigit(o, digits));
  const parsedOutput = parseInt(parsedOutputDigits.join(''), 10);
  return acc + parsedOutput;
}, 0);

console.log(result); // 1043101
