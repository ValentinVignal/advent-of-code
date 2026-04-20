import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput.split("").filter(Boolean).map(Number);

const inputOffset = Number(input.slice(0, 7).join(""));

const repeatedInput: number[] = [];

for (let i = inputOffset; i < 10000 * input.length; i++) {
  repeatedInput.push(input[i % input.length]);
}

const applyPhase = (input: number[]): number[] => {
  const result: number[] = [];

  for (let i = input.length - 1; i >= 0; i--) {
    let sum = result[result.length - 1] ?? 0;
    result.push((sum + input[i]) % 10);
  }

  return result.reverse();
};

let result = repeatedInput;

for (let i = 1; i <= 100; i++) {
  result = applyPhase(result);
}

// x != 00000000
// 03594282 < x < 97230334
console.log(result.slice(0, 8).join("")); // 79723033
