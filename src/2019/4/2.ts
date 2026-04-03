import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  from: number;
  to: number;
};

const [from, to] = textInput.split("-").map(Number);
const range: Range = { from, to };

let count = 0;

const increases = (n: number): boolean => {
  const digits = n.toString().split("").map(Number);
  for (let i = 1; i < digits.length; i++) {
    if (digits[i - 1] > digits[i]) {
      return false;
    }
  }
  return true;
};

const hasAdjacent = (n: number): boolean => {
  const digits = n.toString().split("").map(Number);
  for (let i = 1; i < digits.length; i++) {
    if (digits[i - 1] === digits[i]) {
      if (i > 1 && digits[i - 2] === digits[i - 1]) {
        continue;
      }
      if (i < digits.length - 1 && digits[i + 1] === digits[i]) {
        continue;
      }
      return true;
    }
  }
  return false;
};

const matchCriteria = (n: number): boolean => {
  return increases(n) && hasAdjacent(n);
};

for (let i = range.from; i <= range.to; i++) {
  if (matchCriteria(i)) {
    count++;
  }
}

const result = count;

console.log(result); // 1172
