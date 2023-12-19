import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const grid = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean).map(Number));

type Position = {
  x: number;
  y: number;
};

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

type State = Position & {
  direction: Direction;
  straightCount: number;
  heatLoss: number;
};

type Result = {
  direction: Direction;
  straightCount: number;
  heatLoss: number;
};

const heatLosses: Result[][][] = Array.from({ length: grid.length }, () =>
  Array.from({ length: grid[0].length }, () => [])
);

heatLosses[0][1].push({
  direction: Direction.Right,
  straightCount: 1,
  heatLoss: grid[0][1],
});
heatLosses[1][0].push({
  direction: Direction.Down,
  straightCount: 1,
  heatLoss: grid[1][0],
});

const toProcess: State[] = [];
const addNextToProcess = (state: State) => {
  for (const deltaDirection of [
    Direction.Up,
    Direction.Down,
    Direction.Right,
    Direction.Left,
  ]) {
    if (deltaDirection === state.direction && state.straightCount === 3) {
      // If the straight line is longer than 3, we don't process.
      continue;
    }
    if (
      (state.direction === Direction.Up && deltaDirection === Direction.Down) ||
      (state.direction === Direction.Down && deltaDirection === Direction.Up) ||
      (state.direction === Direction.Left &&
        deltaDirection === Direction.Right) ||
      (state.direction === Direction.Right && deltaDirection === Direction.Left)
    ) {
      // The crucible cannot reverse direction.
      continue;
    }
    const deltaXY = {
      x:
        deltaDirection === Direction.Left
          ? 1
          : deltaDirection === Direction.Right
            ? -1
            : 0,
      y:
        deltaDirection === Direction.Up
          ? 1
          : deltaDirection === Direction.Down
            ? -1
            : 0,
    };
    const newPosition = {
      x: state.x + deltaXY.x,
      y: state.y + deltaXY.y,
    };
    if (
      newPosition.x < 0 ||
      newPosition.x >= grid[0].length ||
      newPosition.y < 0 ||
      newPosition.y >= grid.length
    ) {
      // If we end up outside the map, don't process.
      continue;
    }
    toProcess.push({
      ...newPosition,
      direction: deltaDirection,
      straightCount:
        deltaDirection === state.direction ? state.straightCount + 1 : 1,
      heatLoss: state.heatLoss + grid[newPosition.y][newPosition.x],
    });
  }
  toProcess.sort((a, b) => {
    return a.heatLoss - b.heatLoss;
  });
};

addNextToProcess({ ...heatLosses[0][1][0], x: 1, y: 0 });
addNextToProcess({ ...heatLosses[1][0][0], x: 0, y: 1 });

while (!heatLosses[heatLosses.length - 1][heatLosses[0].length - 1].length) {
  const toBeProcessed = toProcess.shift()!;
  const alreadyExistingResults = heatLosses[toBeProcessed.y][toBeProcessed.x];
  const potentialSameIndex = alreadyExistingResults.findIndex(
    (existing) =>
      existing.direction === toBeProcessed.direction &&
      existing.straightCount <= toBeProcessed.straightCount
  );
  if (potentialSameIndex !== -1) continue;

  alreadyExistingResults.push({
    direction: toBeProcessed.direction,
    heatLoss: toBeProcessed.heatLoss,
    straightCount: toBeProcessed.straightCount,
  });
  addNextToProcess(toBeProcessed);
}

const result =
  heatLosses[heatLosses.length - 1][heatLosses[0].length - 1][0].heatLoss;

console.log(result); // 724
