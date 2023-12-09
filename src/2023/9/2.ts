import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const inputs = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split(" ").filter(Boolean).map(Number);
  });

const extrapolate = (inputs: number[]): number => {
  const diffs = [inputs] as number[][];

  while (diffs[diffs.length - 1].some((x) => x)) {
    const diff = [];
    const lastDiff = diffs[diffs.length - 1];
    for (let i = 0; i < lastDiff.length - 1; i++) {
      diff.push(lastDiff[i + 1] - lastDiff[i]);
    }
    diffs.push(diff);
  }

  for (let i = diffs.length - 1; i >= 0; i--) {
    if (i === diffs.length - 1) {
      diffs[i].splice(0, 0, 0);
    } else {
      const currentDiff = diffs[i];
      const nextDiff = diffs[i + 1];
      currentDiff.splice(0, 0, currentDiff[0] - nextDiff[0]);
    }
  }

  return diffs[0][0];
};

const results = inputs.map(extrapolate);

const result = results.reduce((acc, x) => acc + x, 0);

console.log(result); // 1955513104
