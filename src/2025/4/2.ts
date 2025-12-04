import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "@";

const grid: Tile[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.trim().split("") as Tile[]);

const removeRoles = (): number => {
  const toBeRemovedIndexes: { x: number; y: number }[] = [];

  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, tile] of row.entries()) {
      if (tile === ".") continue;
      let adjacentCount = 0;
      for (let r = rowIndex - 1; r <= rowIndex + 1; r++) {
        for (let c = colIndex - 1; c <= colIndex + 1; c++) {
          if (
            r >= 0 &&
            r < grid.length &&
            c >= 0 &&
            c < row.length &&
            !(r === rowIndex && c === colIndex) &&
            grid[r][c] === "@"
          ) {
            adjacentCount++;
          }
        }
      }
      if (adjacentCount < 4) {
        toBeRemovedIndexes.push({ x: colIndex, y: rowIndex });
      }
    }
  }

  for (const { x, y } of toBeRemovedIndexes) {
    grid[y][x] = ".";
  }

  return toBeRemovedIndexes.length;
};

let result = 0;
let hasChanges = true;
while (hasChanges) {
  const removedCount = removeRoles();
  result += removedCount;
  hasChanges = removedCount > 0;
}

console.log("Result:", result); // 9397
