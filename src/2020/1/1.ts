import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const numbers = textInput.split("\n").filter(Boolean).map(Number);

let result: number;

for (const [aIndex, a] of numbers.entries()) {
  for (const b of numbers.slice(aIndex + 1)) {
    if (a + b === 2020) {
      result = a * b;
      break;
    }
  }
}

console.log(result!); // 870331
