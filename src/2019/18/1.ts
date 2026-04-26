import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const grid = textInput.split("\n").map((line) => line.split(""));

type XY = {
  x: number;
  y: number;
};

let start: XY;

for (let y = 0; y < grid.length; y++) {
  for (let x = 0; x < grid[y].length; x++) {
    if (grid[y][x] === "@") {
      start = { x, y };
    }
  }
}

const keys = new Set<string>();

for (const line of grid) {
  for (const char of line) {
    if (char >= "a" && char <= "z") {
      keys.add(char);
    }
  }
}

type State = {
  position: XY;
  collectedKeys: Set<string>;
};

const stateToString = (state: State): string => {
  const keysArray = Array.from(state.collectedKeys).sort();
  return `${state.position.x},${state.position.y}:${keysArray.join("")}`;
};

const getNeighbors = function* (xy: XY): Generator<XY> {
  for (const [dx, dy] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]) {
    const newX = xy.x + dx;
    const newY = xy.y + dy;
    if (
      newX >= 0 &&
      newX < grid[0].length &&
      newY >= 0 &&
      newY < grid.length &&
      grid[newY][newX] !== "#"
    ) {
      yield { x: newX, y: newY };
    }
  }
};

let visited = new Map<string, number>();

const visit = (state: State, count: number): number => {
  const stateKey = stateToString(state);
  if (visited.has(stateKey) && visited.get(stateKey)! <= count) {
    return Infinity;
  }

  visited.set(stateKey, count);

  if (state.collectedKeys.size === keys.size) {
    return count;
  }

  let minSteps = Infinity;

  for (const neighbor of getNeighbors(state.position)) {
    const cell = grid[neighbor.y][neighbor.x];
    if (
      cell >= "A" &&
      cell <= "Z" &&
      !state.collectedKeys.has(cell.toLowerCase())
    ) {
      continue; // Door is locked
    }

    const newCollectedKeys = new Set(state.collectedKeys);
    if (cell >= "a" && cell <= "z") {
      newCollectedKeys.add(cell); // Collect the key
    }

    const newState: State = {
      position: neighbor,
      collectedKeys: newCollectedKeys,
    };

    const steps = visit(newState, count + 1);
    minSteps = Math.min(minSteps, steps);
  }

  return minSteps;
};

const result = visit(
  {
    position: start!,
    collectedKeys: new Set(),
  },
  0,
);

console.log(result); // 4246
