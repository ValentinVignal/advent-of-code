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

for (const pos of starts) {
  grid[pos.y][pos.x] = "@";
}

const keys = new Set<string>();

for (const line of grid) {
  for (const char of line) {
    if (char >= "a" && char <= "z") {
      keys.add(char);
    }
  }
}

const getGraph = (): Map<string, Map<string, number>> => {
  const graph = new Map<string, Map<string, number>>();

  const pointsOfInterest: XY[] = [...starts];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const char = grid[y][x];
      if (
        (char >= "a" && char <= "z") ||
        char === "@" ||
        (char >= "A" && char <= "Z")
      ) {
        pointsOfInterest.push({ x, y });
      }
    }
  }

  for (const point of pointsOfInterest) {
    const char = grid[point.y][point.x];
    const startKey =
      char === "@"
        ? `@${starts.findIndex(
            (start) => start.x === point.x && start.y === point.y,
          )}`
        : char;
    const visited = new Set<string>();
    const queue: { pos: XY; dist: number }[] = [{ pos: point, dist: 0 }];

    while (queue.length) {
      const { pos, dist } = queue.shift()!;
      const key = `${pos.x},${pos.y}`;
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      const cell = grid[pos.y][pos.x];
      if (
        (cell >= "a" && cell <= "z") ||
        cell === "@" ||
        (cell >= "A" && cell <= "Z")
      ) {
        const endKey =
          cell === "@"
            ? `@${starts.findIndex(
                (start) => start.x === pos.x && start.y === pos.y,
              )}`
            : cell;
        if (startKey !== endKey) {
          if (!graph.has(startKey)) {
            graph.set(startKey, new Map());
          }
          graph.get(startKey)!.set(endKey, dist);
          continue;
        }
      }

      for (const [dx, dy] of [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]) {
        const newX = pos.x + dx;
        const newY = pos.y + dy;
        if (
          newX >= 0 &&
          newX < grid[0].length &&
          newY >= 0 &&
          newY < grid.length &&
          grid[newY][newX] !== "#"
        ) {
          queue.push({ pos: { x: newX, y: newY }, dist: dist + 1 });
        }
      }
    }
  }

  return graph;
};

const graph = getGraph();

const keyToBit = (key: string): number => {
  if (key >= "a" && key <= "z") {
    return 1 << (key.charCodeAt(0) - "a".charCodeAt(0));
  }
  throw new Error(`Invalid key: ${key}`);
};

const keyBit = (key: string): number => {
  return 1 << keyToBit(key)!;
};

const hasKey = (mask: number, key: string): boolean => {
  return (mask & keyBit(key)) !== 0;
};

const addKey = (mask: number, key: string): number => {
  return mask | keyBit(key);
};

const allKeysMask = Array.from(keys).reduce(
  (mask, key) => addKey(mask, key),
  0,
);

type State = {
  positions: string[];
  collectedKeys: number;
};

const stateToString = (state: State): string => {
  const positionsArray = state.positions.join(";");
  return `${positionsArray}:${state.collectedKeys}`;
};

const getNeighbors = function* (
  positions: string[],
): Generator<{ positions: string[]; distance: number }> {
  for (const position of positions) {
    const neighbors = graph.get(position);
    if (!neighbors) {
      continue;
    }
    for (const [neighbor, distance] of neighbors) {
      const newPositions = positions.map((pos) =>
        pos === position ? neighbor : pos,
      );
      yield { positions: newPositions, distance };
    }
  }
};

type StateWithCount = State & {
  count: number;
};

const visit = (): number => {
  const queue: StateWithCount[] = [
    {
      positions: ["@0", "@1", "@2", "@3"],
      collectedKeys: 0,
      count: 0,
    },
  ];
  let visited = new Map<string, number>();

  let i = 0;
  while (queue.length) {
    if (i++ % 1000 === 0) {
      console.log(
        `Queue length: ${queue.length}, visited states: ${
          visited.size
        } - ${i} iterations - collected keys: ${queue[0].collectedKeys.toString(
          2,
        )}`,
      );
    }
    const index = queue.findIndex(
      (state) => state.count === Math.min(...queue.map((s) => s.count)),
    );
    const state = queue.splice(index, 1)[0];

    const stateKey = stateToString(state);
    if (visited.has(stateKey)) {
      continue;
    }

    visited.set(stateKey, state.count);

    if (state.collectedKeys === allKeysMask) {
      return state.count;
    }

    for (const neighbor of getNeighbors(state.positions)) {
      const isBlockedByDoor = neighbor.positions.some(
        (cell) =>
          cell >= "A" &&
          cell <= "Z" &&
          !hasKey(state.collectedKeys, cell.toLowerCase()),
      );
      if (isBlockedByDoor) {
        continue; // Door is locked
      }

      let newCollectedKeys = state.collectedKeys;
      for (const cell of neighbor.positions) {
        if (cell >= "a" && cell <= "z") {
          newCollectedKeys = addKey(newCollectedKeys, cell); // Collect the key
        }
      }

      const newState: StateWithCount = {
        positions: neighbor.positions,
        collectedKeys: newCollectedKeys,
        count: state.count + neighbor.distance,
      };

      queue.push(newState);
    }
  }
  throw new Error("No solution found");
};

const result = visit();

console.log(result); //
