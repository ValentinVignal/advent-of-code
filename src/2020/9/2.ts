import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const preambleLength = example ? 5 : 25;

const input = textInput.split("\n").map(Number);

let invalidNumber: number;

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
    invalidNumber = number;
    break;
  }
}

invalidNumber!;

let range: number[];

for (let start = 0; start < input.length; start++) {
  inner: for (let end = start + 1; end < input.length; end++) {
    const sum = input.slice(start, end + 1).reduce((a, b) => a + b, 0);
    if (sum === invalidNumber!) {
      range = input.slice(start, end);
    } else if (sum > invalidNumber!) {
      break inner;
    } else {
      continue;
    }
  }
}

console.log(range!);

const min = Math.min(...range!);
const max = Math.max(...range!);

const result = min + max;

console.log("result:", result); // 13935797
