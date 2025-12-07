import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "^" | "." | "S";

const grid = textInput.split("\n").map((line) => line.split("") as Tile[]);

type Position = {
  x: number;
  y: number;
};

const positionToString = (pos: Position): string => `${pos.x},${pos.y}`;

const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

let positions = new Set<string>();

positions.add(positionToString({ y: 1, x: grid[0].indexOf("S") }));

let splitCount = 0;

for (let y = 2; y < grid.length; y++) {
  const newPositions = new Set<string>();
  for (const posStr of positions) {
    const pos = stringToPosition(posStr);
    if (grid[y][pos.x] === ".") {
      newPositions.add(positionToString({ x: pos.x, y }));
    } else {
      splitCount++;
      if (pos.x - 1 >= 0) {
        newPositions.add(positionToString({ x: pos.x - 1, y }));
      }
      if (pos.x + 1 < grid[0].length) {
        newPositions.add(positionToString({ x: pos.x + 1, y }));
      }
    }
  }
  positions = newPositions;
}

console.log(splitCount); // 1619
