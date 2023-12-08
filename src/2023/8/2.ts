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

/**
 * [step][ghost]
 */
let nodes = [[...map.keys()].filter((key) => key[2] === "A")];

const nGhosts = nodes[0].length;

while (stepIndex < 2000000) {
  const direction = directions[stepIndex % directions.length];
  stepIndex++;
  const currentNodes = nodes[nodes.length - 1];
  nodes.push(
    currentNodes.map((currentNode) => map.get(currentNode)![direction])
  );
}

const mainOffset = 1000000;

const firstOffsetZ: number[] = [];
const secondOffsetZ: number[] = [];

for (let ghost = 0; ghost < nGhosts; ghost++) {
  let o = 0;

  while (nodes[mainOffset + o][ghost][2] !== "Z") {
    o++;
  }
  firstOffsetZ.push(o);
  o++;

  while (nodes[mainOffset + o][ghost][2] !== "Z") {
    o++;
  }
  secondOffsetZ.push(o);
}

const periods = secondOffsetZ.map((s, i) => s - firstOffsetZ[i]);

let maxPeriodGhost: number = 0;
let maxPeriod = 0;

periods.forEach((period, ghost) => {
  if (period > maxPeriod) {
    maxPeriod = period;
    maxPeriodGhost = ghost;
  }
});

const start = mainOffset + firstOffsetZ[maxPeriodGhost];

/**
 * [ghost][periodGhost]
 */
const ghostPatterns: string[][] = [];
for (let ghost = 0; ghost < nGhosts; ghost++) {
  ghostPatterns.push(
    nodes.slice(start, start + periods[ghost]).map((s) => s[ghost])
  );
}

let step = start;
const getCurrentNodes = (): string[] => {
  let i = step - start;
  const currentNodes = ghostPatterns.map(
    (pattern, ghost) => pattern[i % periods[ghost]]
  );
  return currentNodes;
};

let currentNodes = getCurrentNodes();

while (currentNodes.some((currentNode) => currentNode[2] !== "Z")) {
  const delta = maxPeriod;
  step += delta;
  currentNodes = getCurrentNodes();
}

// 208333022651 < 5555281018468 < x
console.log(step); // x = 22289513667691
