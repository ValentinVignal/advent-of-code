import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const preambleLength = example ? 5 : 25;

const input = textInput.split("\n").map(Number);

let result: number;

for (let i = preambleLength; i < input.length; i++) {
  const preamble = input.slice(i - preambleLength, i);
  const number = input[i];

  let isValid = false;
  for (let j = 0; j < preamble.length; j++) {
    inner: for (let k = j + 1; k < preamble.length; k++) {
      if (preamble[j] + preamble[k] === number) {
        isValid = true;
        break inner;
      }
    }
  }
  if (!isValid) {
    result = number;
    break;
  }
}

console.log("result:", result!); // 104054607
