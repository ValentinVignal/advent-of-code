import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Char = "." | "#";

type Grid = Char[][];

const input: Grid[] = textInput.split("\n\n").map((grid) => {
  return grid
    .split("\n")
    .map((line) => line.split("").filter(Boolean) as Char[]);
});

const locks = input.filter((grid) => grid[0][0] === "#");
const keys = input.filter((grid) => grid[0][0] === ".");

const getHeights = (grid: Grid): number[] => {
  const heights: number[] = [];
  for (let y = 0; y < grid[0].length; y++) {
    const height = grid.map((row) => row[y]).filter((c) => c === "#").length;
    heights.push(height);
  }
  return heights;
};

const fits = (lock: Grid, key: Grid): boolean => {
  const lockHeights = getHeights(lock);
  const keyHeights = getHeights(key);
  return lockHeights.every((lockHeight, i) => lockHeight + keyHeights[i] <= 7);
};

let count = 0;

for (const lock of locks) {
  for (const key of keys) {
    if (fits(lock, key)) {
      count++;
    }
  }
}

console.log(count); // 3196
