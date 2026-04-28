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

for (const dy of [-1, 0, 1]) {
  for (const dx of [-1, 0, 1]) {
    const newX = start!.x + dx;
    const newY = start!.y + dy;
    if (Math.abs(dx) + Math.abs(dy) <= 1) {
      grid[newY][newX] = "#";
    }
  }
}

const starts = [
  { x: start!.x - 1, y: start!.y - 1 },
  { x: start!.x + 1, y: start!.y - 1 },
  { x: start!.x - 1, y: start!.y + 1 },
  { x: start!.x + 1, y: start!.y + 1 },
];

const keys = new Set<string>();

for (const line of grid) {
  for (const char of line) {
    if (char >= "a" && char <= "z") {
      keys.add(char);
    }
  }
}

type State = {
  positions: XY[];
  collectedKeys: Set<string>;
};

const stateToString = (state: State): string => {
  const keysArray = Array.from(state.collectedKeys).sort();
  const positionsArray = state.positions
    .map((pos) => `${pos.x},${pos.y}`)
    .join(";");
  return `${positionsArray}:${keysArray.join("")}`;
};

const getNeighbors = function* (xys: XY[]): Generator<XY[]> {
  for (const xy of xys) {
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
        const newPositions = xys.map((pos) =>
          pos.x === xy.x && pos.y === xy.y ? { x: newX, y: newY } : pos,
        );
        yield newPositions;
      }
    }
  }
};

type StateWithCount = State & {
  count: number;
};

const visit = (): number => {
  const queue: StateWithCount[] = [
    {
      positions: starts,
      collectedKeys: new Set(),
      count: 0,
    },
  ];
  let visited = new Map<string, number>();

  let i = 0;
  while (queue.length) {
    if (i++ % 1000000 === 0) {
      console.log(
        `Queue length: ${queue.length}, visited states: ${visited.size} - ${i} iterations - collected keys: ${queue[0].collectedKeys.size}`,
      );
    }
    const state = queue.shift()!;

    const stateKey = stateToString(state);
    if (visited.has(stateKey)) {
      continue;
    }

    visited.set(stateKey, state.count);

    if (state.collectedKeys.size === keys.size) {
      return state.count;
    }

    for (const neighbor of getNeighbors(state.positions)) {
      const cells = neighbor.map((pos) => grid[pos.y][pos.x]);
      const isBlockedByDoor = cells.some(
        (cell) =>
          cell >= "A" &&
          cell <= "Z" &&
          !state.collectedKeys.has(cell.toLowerCase()),
      );
      if (isBlockedByDoor) {
        continue; // Door is locked
      }

      const newCollectedKeys = new Set(state.collectedKeys);
      for (const cell of cells) {
        if (cell >= "a" && cell <= "z") {
          newCollectedKeys.add(cell); // Collect the key
        }
      }

      const newState: State = {
        positions: neighbor,
        collectedKeys: newCollectedKeys,
      };

      queue.push({
        ...newState,
        count: state.count + 1,
      });
    }
  }
  throw new Error("No solution found");
};

const result = visit();

console.log(result); //
