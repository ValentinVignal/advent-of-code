import { readFileSync } from "node:fs";
import * as path from "node:path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

let grid = textInput.split("\n").map((line) => line.split(""));

const width = Math.max(...grid.map((line) => line.length));

grid = grid.map((line) => {
  if (line.length < width) {
    return [...line, ...new Array(width - line.length).fill(" ")];
  }
  return line;
});

const height = grid.length;

type XY = {
  x: number;
  y: number;
};

const addXY = (a: XY, b: XY): XY => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

type Door = {
  outer: XY;
  inner: XY;
};

const doorPositions = new Map<string, Door>();

const getLabelFromPosition = ({ x, y }: XY): string | null => {
  const char = grid[y][x];
  if (char !== ".") {
    throw new Error(
      `Expected a open passage . at position (${x}, ${y}), but found '${char}'`,
    );
  }
  // Check if there is a label next to it.
  for (const dXY of [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ]) {
    const neighbor = addXY({ x, y }, dXY);
    const neighborChar = grid[neighbor.y]?.[neighbor.x];
    if (neighborChar === undefined) continue;
    if ("A" <= neighborChar && neighborChar <= "Z") {
      const nextNeighbor = addXY(neighbor, dXY);
      const firstChar =
        grid[Math.min(neighbor.y, nextNeighbor.y)][
          Math.min(neighbor.x, nextNeighbor.x)
        ];
      const secondChar =
        grid[Math.max(neighbor.y, nextNeighbor.y)][
          Math.max(neighbor.x, nextNeighbor.x)
        ];
      const label = firstChar + secondChar;
      return label;
    }
  }
  return null;
};

const findDoors = (): void => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = grid[y][x];
      if (char !== ".") continue;

      const label = getLabelFromPosition({ x, y });

      if (!label) continue;

      const isOuter = x === 2 || y === 2 || x === width - 3 || y === height - 3;

      const positions = doorPositions.get(label) ?? ({} as Door);
      if (isOuter) {
        positions.outer = { x, y };
      } else {
        positions.inner = { x, y };
      }
      doorPositions.set(label, positions as Door);
    }
  }
};

findDoors();

type State = XY & {
  level: number;
  steps: number;
};

const stateToString = ({ x, y, level }: State): string => `${x},${y},${level}`;

const findMinimumSteps = (): number => {
  const start = doorPositions.get("AA")!.outer;
  const end = doorPositions.get("ZZ")!.outer;

  const queue: State[] = [{ ...start, level: 0, steps: 0 }];
  const visited = new Set<string>();

  while (queue.length) {
    const state = queue.shift()!;

    const key = stateToString(state);
    if (visited.has(key)) continue;

    visited.add(key);

    if (end.x === state.x && end.y === state.y && state.level === 0)
      return state.steps;

    // Add the direct neighbor.
    for (const dXY of [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
    ]) {
      const neighbor = addXY(state, dXY);
      const char = grid[neighbor.y]?.[neighbor.x];
      if (char !== ".") continue;
      queue.push({ ...neighbor, level: state.level, steps: state.steps + 1 });
    }
    // Add the neighbors from doors.
    const label = getLabelFromPosition(state);
    if (!label) continue;
    if (label === "AA" || label === "ZZ") continue;

    const door = doorPositions.get(label)!;
    const isOuter = state.x === door.outer.x && state.y === door.outer.y;
    if (isOuter && state.level === 0) continue; // Can't go outer if we're at level 0.
    const neighbor = isOuter ? door.inner : door.outer;
    queue.push({
      ...neighbor,
      level: isOuter ? state.level - 1 : state.level + 1,
      steps: state.steps + 1,
    });
  }

  throw new Error("No path found from AA to ZZ");
};

const result = findMinimumSteps();

console.log(result); // 6300
