import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "@";

const grid: Tile[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.trim().split("") as Tile[]);

let result = 0;

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
    if (adjacentCount < 4) result++;
  }
}

// x < 20000
console.log("Result:", result); // 1604
