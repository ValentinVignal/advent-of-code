import { readFileSync } from "fs";
import { Plot, plot } from "nodeplotlib";
import * as path from "path";
import { findLineByLeastSquares } from "../../utils/linearLeastSquare";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

console.log(textInput);

type Tile = "#" | "." | "S";

const input: Tile[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

console.log("dimension", input[0].length, input.length);

const numberOfRocks = input
  .map((line) => line.filter((x) => x === "#").length)
  .reduce((a, b) => a + b, 0);
console.log("numberOfRocks", numberOfRocks);

type Position = {
  x: number;
  y: number;
};

const positionToString = (position: Position) => `${position.x},${position.y}`;

const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

let reachablePositions = new Set<string>();

for (const [y, line] of input.entries()) {
  for (const [x, tile] of line.entries()) {
    if (tile === "S") {
      reachablePositions.add(positionToString({ x, y }));
      break;
    }
  }
  if (reachablePositions.size) {
    break;
  }
}

const deltas = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

const totalSteps = 26501365;

const stepsToCompute = 500;
const stepsToSkip = 200;

const sizeHistory = [reachablePositions.size];

for (let step = 0; step < stepsToCompute; step++) {
  let newReachablePositions = new Set<string>();
  for (const position of reachablePositions.keys()) {
    const { x, y } = stringToPosition(position);
    for (const delta of deltas) {
      const newPosition = {
        x: x + delta.x,
        y: y + delta.y,
      };

      const basePosition = {
        x:
          ((newPosition.x % input[0].length) + input[0].length) %
          input[0].length,
        y: ((newPosition.y % input.length) + input.length) % input.length,
      };
      const tile = input[basePosition.y][basePosition.x];
      if (tile !== "#") {
        newReachablePositions.add(positionToString(newPosition));
      }
    }
  }

  reachablePositions = newReachablePositions;
  sizeHistory.push(reachablePositions.size);
}

const diffs: number[] = [];
const diffs2: number[] = [];
const diffDiffs: number[] = [];
for (const [index, size] of sizeHistory.entries()) {
  const diff = size - sizeHistory[index - 1];
  const diff2 = size - sizeHistory[index - 2];
  const diffDiff = diff - diffs[index - 1];
  diffs.push(diff);
  diffs2.push(diff2);
  diffDiffs.push(diffDiff);
  console.log(
    index,
    size,
    "diff",
    diff,
    "diff2",
    diff2,
    "diffDiff",
    diffDiff,
    "diff-diff2",
    diff2 - (sizeHistory[index - 2] - sizeHistory[index - 4])
  );
}

const { m, b } = findLineByLeastSquares(
  [...sizeHistory.keys()].slice(stepsToSkip),
  sizeHistory.slice(stepsToSkip)
);

const data: Plot[] = [
  {
    x: [...sizeHistory.keys()],
    y: sizeHistory,
    type: "scatter",
  },
  {
    x: [...sizeHistory.keys()],
    y: [...sizeHistory.keys()].map((x) => m * x + b),
    type: "scatter",
  },
];

plot(data);
plot([
  {
    x: [...sizeHistory.keys()],
    y: sizeHistory.map((x) => Math.log(x)),
    type: "scatter",
  },
]);

plot([
  {
    x: [...diffs.keys()],
    y: diffs,
    type: "scatter",
  },
]);
plot([
  {
    x: [...diffs2.keys()],
    y: diffs2,
    type: "scatter",
  },
]);

plot([
  {
    x: [...diffDiffs.keys()],
    y: diffDiffs,
    type: "scatter",
  },
]);

plot([
  {
    x: [...diffDiffs.keys()],
    y: diffDiffs.map((x, i) => x / i),
    type: "scatter",
  },
]);

let period = 0;

const numberOfPeriodsToVerify = 3;

let found = false;
while (found) {
  period++;
  let isCorrect = true;
  for (let i = 0; i < period; i++) {
    if (!isCorrect) {
      break;
    }
    for (let di = 1; di < numberOfPeriodsToVerify; di++) {
      if (diffDiffs[i] !== diffDiffs[i - di * period]) {
        isCorrect = false;
        break;
      }
    }
  }
}

console.log("period", period);

// x < 615069200571494
