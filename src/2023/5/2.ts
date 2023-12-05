import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const seedRanges = textInput
  .split("\n")[0]
  .split(": ")[1]
  .split(" ")
  .map(Number)
  .filter(Boolean);

const instructionLines = textInput.split("\n").slice(1).filter(Boolean);

type Transform = {
  minSource: number;
  minDestination: number;
  rangeLength: number;
};

const transforms: Transform[][] = [];

for (const line of instructionLines) {
  if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(line[0])) {
    transforms.push([]);
    continue;
  }

  const numbers = line.split(" ").map(Number);
  transforms[transforms.length - 1].push({
    minDestination: numbers[0],
    minSource: numbers[1],
    rangeLength: numbers[2],
  });
}

const transformSeed = (seed: number): number => {
  let value = seed;
  for (const transform of transforms) {
    for (const { minSource, minDestination, rangeLength } of transform) {
      if (value >= minSource && value < minSource + rangeLength) {
        value = minDestination + (value - minSource);
        break;
      }
    }
  }
  return value;
};

let min: number = Infinity;
for (let i = 0; i < seedRanges.length; i += 2) {
  for (let j = seedRanges[i]; j < seedRanges[i] + seedRanges[i + 1]; j++) {
    if (j % 10000000 === 0)
      console.log(
        `Seed rang ${i + 1} / ${seedRanges.length} - seed range ${
          (100 * (j - seedRanges[i])) / seedRanges[i + 1]
        }% - min for now ${min}`
      );
    const location = transformSeed(j);
    if (min > location) min = location;
  }
}

// x != 1872593670
console.log(min); // 20283860
