import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "#" | "." | "S";

const input: Tile[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

type Position = {
  x: number;
  y: number;
};

const positionToString = (position: Position) => `${position.x},${position.y}`;

const stringToPosition = (str: string): Position => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

let reachablePositions = new Set<string>();

for (const [y, line] of input.entries()) {
  for (const [x, tile] of line.entries()) {
    if (tile === "S") {
      reachablePositions.add(positionToString({ x, y }));
      break;
    }
  }
  if (reachablePositions.size) {
    break;
  }
}

const deltas = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

for (let step = 0; step < 64; step++) {
  let newReachablePositions = new Set<string>();
  for (const position of reachablePositions.values()) {
    const { x, y } = stringToPosition(position);
    for (const delta of deltas) {
      const newPosition = {
        x: x + delta.x,
        y: y + delta.y,
      };
      const tile = input[newPosition.y]?.[newPosition.x];
      if ([".", "S"].includes(tile)) {
        newReachablePositions.add(positionToString(newPosition));
      }
    }
  }
  reachablePositions = newReachablePositions;
}

console.log(reachablePositions.size);
