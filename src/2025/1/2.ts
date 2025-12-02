import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Direction = "R" | "L";
type Rotation = {
  direction: Direction;
  distance: number;
};

const rotations: Rotation[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return {
      direction: line[0] as Direction,
      distance: parseInt(line.slice(1), 10),
    };
  });

let value = 50;

let countOf0 = 0;

for (const rotation of rotations) {
  const previousValue = value;
  if (rotation.direction === "R") {
    value += rotation.distance;
  } else {
    value -= rotation.distance;
  }
  const previousHundred = Math.floor(previousValue / 100);
  const currentHundred = Math.floor(value / 100);
  if (previousHundred !== currentHundred) {
    countOf0 += Math.abs(currentHundred - previousHundred);
    if (!(value % 100) && rotation.direction === "L") {
      countOf0++;
    }
    if (!(previousValue % 100) && rotation.direction === "L") {
      countOf0--;
    }
  } else if (!(value % 100)) {
    countOf0++;
  }
}

const result = countOf0;

// 3008 < 6159 < 6160 < x
console.log("Result:", result); // 6254
