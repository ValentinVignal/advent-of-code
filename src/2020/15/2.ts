import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const list = textInput.split(",").map(Number);

const lastSpokenIndices = new Map<number, number>();
for (let i = 0; i < list.length - 1; i++) {
  lastSpokenIndices.set(list[i], i + 1);
}

for (let turn = list.length; turn <= 30000000 - 1; turn++) {
  const lastSpoken = list[list.length - 1];
  const lastSpokenIndex = lastSpokenIndices.get(lastSpoken);
  let result: number;
  if (lastSpokenIndex === undefined) {
    result = 0;
  } else {
    result = turn - lastSpokenIndex;
  }
  lastSpokenIndices.set(lastSpoken, turn);
  list.push(result);
}

const result = list[list.length - 1];

// x != 0
console.log(result); // 1437692
