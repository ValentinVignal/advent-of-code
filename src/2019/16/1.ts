import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput.split("").filter(Boolean).map(Number);

const phaseBase = [0, 1, 0, -1];

const applyPhase = (input: number[]): number[] => {
  const result: number[] = [];

  for (let i = 0; i < input.length; i++) {
    let sum = 0;

    for (let j = 0; j < input.length; j++) {
      const inputNumber = input[j];
      const phaseIndex = Math.floor((j + 1) / (i + 1)) % phaseBase.length;
      const phaseNumber = phaseBase[phaseIndex];
      const product = inputNumber * phaseNumber;
      sum += product;
    }

    result.push(Math.abs(sum) % 10);
  }

  return result;
};

let result = input;

for (let i = 1; i <= 100; i++) {
  result = applyPhase(result);
}

console.log(result.slice(0, 8).join("")); // 36627552
