import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const input = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean));

let result = 0;
for (let i = 1; i < input.length - 1; i++) {
  for (let j = 1; j < input[i].length - 1; j++) {
    const root = input[i][j];
    if (root !== "A") continue;

    const corners = [
      input[i - 1][j - 1],
      input[i - 1][j + 1],
      input[i + 1][j + 1],
      input[i + 1][j - 1],
    ].join("");

    if (!["MMSS", "MSSM", "SSMM", "SMMS"].includes(corners)) continue;

    result++;
  }
}

console.log(result); // 1974
