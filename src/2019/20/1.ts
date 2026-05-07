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

const doorPositions = new Map<string, [XY] | [XY, XY]>();

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

      const positions = doorPositions.get(label) ?? ([] as XY[]);
      positions.push({ x, y });
      doorPositions.set(label, positions as [XY] | [XY, XY]);
    }
  }
};

findDoors();

type State = XY & {
  steps: number;
};

const xyToString = ({ x, y }: XY): string => `${x},${y}`;

const findMinimumSteps = (): number => {
  const start = doorPositions.get("AA")![0];
  const end = doorPositions.get("ZZ")![0];

  const queue: State[] = [{ ...start, steps: 0 }];
  const visited = new Set<string>();

  while (queue.length) {
    const state = queue.shift()!;

    const key = xyToString(state);
    if (visited.has(key)) continue;

    visited.add(key);

    if (end.x === state.x && end.y === state.y) return state.steps;

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
      queue.push({ ...neighbor, steps: state.steps + 1 });
    }
    // Add the neighbors from doors.
    const label = getLabelFromPosition(state);
    if (!label) continue;
    if (label === "AA" || label === "ZZ") continue;
    const neighbor = doorPositions
      .get(label)!
      .find((position) => position.x !== state.x || position.y !== state.y)!;
    queue.push({ ...neighbor, steps: state.steps + 1 });
  }
  throw new Error("No path found from AA to ZZ");
};

const result = findMinimumSteps();

console.log(result); // 522
