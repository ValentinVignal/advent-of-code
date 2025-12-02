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
  if (rotation.direction === "R") {
    value += rotation.distance;
  } else {
    value -= rotation.distance;
  }

  if (value % 100 === 0) {
    countOf0++;
  }
}

const result = countOf0;

console.log("Result:", result); // 1074
