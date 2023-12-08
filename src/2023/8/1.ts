import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Direction = "R" | "L";

const directions = textInput
  .split("\n\n")[0]
  .split("")
  .filter(Boolean) as Direction[];

type LeftRight = {
  R: string;
  L: string;
};

const map = new Map<string, LeftRight>();

const lines = textInput.split("\n\n")[1].split("\n").filter(Boolean);

for (const line of lines) {
  const [from, to] = line.split(" = ");
  const [left, right] = to.split("(")[1].split(")")[0].split(", ");
  map.set(from, { R: right, L: left });
}

let stepIndex = 0;
let currentNode = "AAA";

while (currentNode !== "ZZZ") {
  const direction = directions[stepIndex % directions.length];
  currentNode = map.get(currentNode)![direction];
  stepIndex++;
}

console.log(stepIndex);
