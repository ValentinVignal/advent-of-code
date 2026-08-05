import { readFileSync } from "node:fs";
import * as path from "node:path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8",
);

type Tile = "." | "#";

type Level = Tile[][];

const input: Level = textInput
  .split("\n")
  .map((line) => line.split("") as Tile[]);

type Levels = Level[];
let levels: Levels = [input];

const hasBugOnExternalEdge = (level: Level): boolean => {
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (![0, 4].includes(y) && ![0, 4].includes(x)) {
        // Not an external edge
        continue;
      }
      if (level[y][x] === "#") return true;
    }
  }
  return false;
};

const hasBugOnInternalEdge = (level: Level): boolean => {
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (![1, 3].includes(y) && ![1, 3].includes(x)) {
        // Not an external edge
        continue;
      }
      if (x !== 2 && y !== 2) continue;
      if (level[y][x] === "#") return true;
    }
  }
  return false;
};

const createEmptyLevel = (): Level => {
  return Array.from(input, () => Array.from(input[0], () => "."));
};

const getSameLevelAdjacentCount = (
  level: Level,
  x: number,
  y: number,
): number => {
  let count = 0;
  for (const [dx, dy] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ] as const) {
    const j = y + dy;
    const i = x + dx;
    if (j < 0 || 4 < j || i < 0 || 4 < i || (i === 2 && j == 2)) {
      continue;
    }
    if (level[j][i] === "#") {
      count++;
    }
  }
  return count;
};

const getLowerLevelAdjacentCount = (
  levels: Levels,
  indexLevel: number,
  x: number,
  y: number,
): number => {
  let count = 0;
  if (y === 0) {
    if (levels[indexLevel - 1][1][2] === "#") {
      count++;
    }
  } else if (y === 4) {
    if (levels[indexLevel - 1][3][2] === "#") {
      count++;
    }
  }
  if (x === 0) {
    if (levels[indexLevel - 1][2][1] === "#") {
      count++;
    }
  } else if (x === 4) {
    if (levels[indexLevel - 1][2][3] === "#") {
      count++;
    }
  }
  return count;
};

const getHigherLevelAdjacentCount = (
  levels: Levels,
  indexLevel: number,
  x: number,
  y: number,
): number => {
  let count = 0;
  if (y === 1 && x === 2) {
    count += levels[indexLevel + 1][0].reduce(
      (acc, tile) => acc + (tile === "#" ? 1 : 0),
      0,
    );
  } else if (y === 3 && x === 2) {
    count += levels[indexLevel + 1][4].reduce(
      (acc, tile) => acc + (tile === "#" ? 1 : 0),
      0,
    );
  } else if (y === 2 && x === 1) {
    count += levels[indexLevel + 1].reduce(
      (acc, tiles) => acc + (tiles[0] === "#" ? 1 : 0),
      0,
    );
  } else {
    if (!(y === 2 && x === 3)) {
      throw new Error(
        `Invalid coordinates for higher level adjacent count: x=${x}, y=${y}`,
      );
    }
    count += levels[indexLevel + 1].reduce(
      (acc, tiles) => acc + (tiles[4] === "#" ? 1 : 0),
      0,
    );
  }
  return count;
};

const getAdjacentBugsCount = (
  levels: Levels,
  indexLevel: number,
  x: number,
  y: number,
): number => {
  let count = getSameLevelAdjacentCount(levels[indexLevel], x, y);

  if ([0, 4].includes(y) || [0, 4].includes(x)) {
    // It is on the external edge.
    if (indexLevel > 0) {
      count += getLowerLevelAdjacentCount(levels, indexLevel, x, y);
    }
  } else if (x === 2 || y === 2) {
    // It is on the internal edge.
    if (indexLevel < levels.length - 1) {
      count += getHigherLevelAdjacentCount(levels, indexLevel, x, y);
    }
  }
  return count;
};

const computeMinute = (levels: Levels): Levels => {
  const paddedLevels = structuredClone(levels);

  if (hasBugOnExternalEdge(paddedLevels[0])) {
    paddedLevels.splice(0, 0, createEmptyLevel());
  }
  if (hasBugOnInternalEdge(levels[levels.length - 1])) {
    paddedLevels.push(createEmptyLevel());
  }
  const newLevels = structuredClone(paddedLevels);

  for (let [indexLevel, level] of newLevels.entries()) {
    for (let [y, row] of level.entries()) {
      for (let [x, tile] of row.entries()) {
        if (x === 2 && y === 2) {
          continue;
        }
        const adjacentBugsCount = getAdjacentBugsCount(
          paddedLevels,
          indexLevel,
          x,
          y,
        );
        if (tile === "#") {
          if (adjacentBugsCount !== 1) {
            row[x] = ".";
          }
        } else {
          if ([1, 2].includes(adjacentBugsCount)) {
            row[x] = "#";
          }
        }
      }
    }
  }

  return newLevels;
};

for (let minute = 0; minute < (example ? 10 : 200); minute++) {
  levels = computeMinute(levels);
}

const result = levels
  .flat(2)
  .reduce(
    (previousValue, currentValue) =>
      previousValue + (currentValue === "#" ? 1 : 0),
    0,
  );

// 1861 < x
console.log(result); // 1916
