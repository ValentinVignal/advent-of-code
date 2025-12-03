import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const numbers = textInput.split("\n").filter(Boolean).map(Number);

let result: number;

for (const [aIndex, a] of numbers.entries()) {
  for (const [bIndex, b] of numbers.slice(aIndex + 1).entries()) {
    for (const c of numbers.slice(aIndex + bIndex + 2)) {
      if (a + b + c === 2020) {
        result = a * b * c;
        break;
      }
    }
  }
}

console.log(result!); // 283025088
