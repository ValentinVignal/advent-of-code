import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const list = textInput.split(",").map(Number);

for (let turn = list.length + 1; turn <= 2020; turn++) {
  const lastSpoken = list[list.length - 1];
  const lastSpokenIndex = list
    .slice(0, list.length - 1)
    .lastIndexOf(lastSpoken);
  if (lastSpokenIndex === -1) {
    list.push(0);
  } else {
    list.push(list.length - 1 - lastSpokenIndex);
  }
}

const result = list[list.length - 1];

console.log(result); // 866
