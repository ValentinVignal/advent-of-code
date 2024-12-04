import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean));

const xmas = "XMAS";

let result = 0;
for (let i = 0; i < input.length; i++) {
  for (let j = 0; j < input[i].length; j++) {
    const root = input[i][j];
    if (root !== "X") continue;

    const xDeltas: number[] = [];
    const yDeltas: number[] = [];
    if (i >= 3) {
      xDeltas.push(-1);
    }
    xDeltas.push(0);
    if (i < input.length - 3) {
      xDeltas.push(1);
    }
    if (j >= 3) {
      yDeltas.push(-1);
    }
    yDeltas.push(0);
    if (j < input[i].length - 3) {
      yDeltas.push(1);
    }

    for (const xDelta of xDeltas) {
      for (const yDelta of yDeltas) {
        if (xDelta === 0 && yDelta === 0) continue;
        for (let k = 1; k <= 3; k++) {
          const x = i + xDelta * k;
          const y = j + yDelta * k;
          if (input[x][y] !== xmas[k]) {
            break;
          }
          if (k === 3) {
            result++;
          }
        }
      }
    }
  }
}

console.log(result); // 2642
