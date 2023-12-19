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

const printHeatLosses = (highlight: boolean = false): void => {
  const array = heatLosses.map((row) =>
    row.map((cell) => {
      const min = Math.min(...cell.map((c) => c.heatLoss));
      if (isFinite(min)) {
        return min.toLocaleString("en-US", {
          minimumIntegerDigits: 3,
          useGrouping: false,
        });
      }
      return " . ";
    })
  );

  if (highlight) {
    let position = { x: grid[0].length - 1, y: grid.length - 1 };
    while (position.x !== 0 && position.y !== 0) {
      const losses = heatLosses[position.y]?.[position.x];
      if (!losses) {
        break;
      }
      const lowestLossValue = Math.min(...losses.map((l) => l.heatLoss));
      const lowestLoss = losses.find((l) => l.heatLoss === lowestLossValue)!;
      array[position.y][position.x] = "\x1b[33m X \x1b[0m";
      position = {
        x:
          position.x +
          (lowestLoss.direction === Direction.Left
            ? -1
            : lowestLoss.direction === Direction.Right
              ? 1
              : 0),
        y:
          position.y +
          (lowestLoss.direction === Direction.Up
            ? -1
            : lowestLoss.direction === Direction.Down
              ? 1
              : 0),
      };
    }
  }
  console.log(array.map((row) => row.join(" ")).join("\n"));
  console.log();
};

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

let toProcess: State[] = [];
const addNextToProcess = (state: State) => {
  for (const deltaDirection of [
    Direction.Up,
    Direction.Down,
    Direction.Right,
    Direction.Left,
  ]) {
    if (deltaDirection !== state.direction && state.straightCount < 4) {
      // It needs 4 straight lines to change direction.
      continue;
    }
    if (deltaDirection === state.direction && state.straightCount === 10) {
      // If the straight line is longer than 10, we don't process.
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
          ? -1
          : deltaDirection === Direction.Right
            ? 1
            : 0,
      y:
        deltaDirection === Direction.Up
          ? -1
          : deltaDirection === Direction.Down
            ? 1
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
  if (toProcess.length > 5000) {
    toProcess = toProcess.slice(0, 5000);
  }
};

addNextToProcess({ ...heatLosses[0][1][0], x: 1, y: 0 });
addNextToProcess({ ...heatLosses[1][0][0], x: 0, y: 1 });

let i = 0;
while (
  !heatLosses[heatLosses.length - 1][heatLosses[0].length - 1].length ||
  !heatLosses[heatLosses.length - 1][heatLosses[0].length - 1].some(
    (heatLoss) => heatLoss.straightCount >= 4
  )
) {
  i++;
  if (i % 100000 === 0) {
    printHeatLosses();
  }

  const toBeProcessed = toProcess.shift()!;
  const alreadyExistingResults = heatLosses[toBeProcessed.y][toBeProcessed.x];
  const potentialSameIndex = alreadyExistingResults.findIndex(
    (existing) =>
      existing.direction === toBeProcessed.direction &&
      existing.straightCount === toBeProcessed.straightCount
  );
  if (potentialSameIndex !== -1) continue;

  alreadyExistingResults.push({
    direction: toBeProcessed.direction,
    heatLoss: toBeProcessed.heatLoss,
    straightCount: toBeProcessed.straightCount,
  });
  addNextToProcess(toBeProcessed);
}
printHeatLosses(true);

const result = heatLosses[heatLosses.length - 1][heatLosses[0].length - 1].find(
  (heatLoss) => heatLoss.straightCount >= 4
)!.heatLoss;

// 875 < x < 919 < 921
console.log(result); // 877
