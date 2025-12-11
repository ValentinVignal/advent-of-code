import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const input = textInput.split("\n").map(Number);

const ordered = [...input].sort((a, b) => a - b);

const deviceJoltage = ordered[ordered.length - 1] + 3;

let differenceOf1 = 0;
let differenceOf3 = 0;

for (const [index, value] of [...ordered, deviceJoltage].entries()) {
  const previousValue = index === 0 ? 0 : ordered[index - 1];
  const difference = value - previousValue;
  if (difference === 1) {
    differenceOf1++;
  } else if (difference === 3) {
    differenceOf3++;
  }
}

const result = differenceOf1 * differenceOf3;

console.log(`Difference of 1: ${differenceOf1}`);
console.log(`Difference of 3: ${differenceOf3}`);
// 1820 < x
console.log(result); // 1890
