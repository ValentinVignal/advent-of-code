import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "S" | "|" | "-" | "L" | "J" | "7" | " F";

const grid = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split("").filter(Boolean) as Tile[];
  });

type Point = { x: number; y: number };

let start: Point;

grid.forEach((line, y) => {
  line.forEach((tile, x) => {
    if (tile === "S") {
      start = { x, y };
    }
  });
});

start = start!;

let point = start;

const visited = [start];

const pointEquals = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

while (visited.length == 1 || !pointEquals(point, start)) {
  const potentialNext: Point[] = [];
  const currentSymbol = grid[point.y][point.x];
  if (["|", "L", "J", "S"].includes(currentSymbol)) {
    const up = grid[point.y - 1]?.[point.x];

    if (["|", "7", "F", "S"].includes(up)) {
      potentialNext.push({ x: point.x, y: point.y - 1 });
    }
  }
  if (["|", "7", "F", "S"].includes(currentSymbol)) {
    const down = grid[point.y + 1]?.[point.x];

    if (["|", "L", "J", "S"].includes(down)) {
      potentialNext.push({ x: point.x, y: point.y + 1 });
    }
  }
  if (["-", "F", "L", "S"].includes(currentSymbol)) {
    const right = grid[point.y][point.x + 1];

    if (["-", "7", "J", "S"].includes(right)) {
      potentialNext.push({ x: point.x + 1, y: point.y });
    }
  }
  if (["-", "7", "J", "S"].includes(currentSymbol)) {
    const left = grid[point.y][point.x - 1];

    if (["-", "F", "L", "S"].includes(left)) {
      potentialNext.push({ x: point.x - 1, y: point.y });
    }
  }
  for (const next of potentialNext) {
    if (
      !visited[visited.length - 2] ||
      !pointEquals(visited[visited.length - 2], next)
    ) {
      point = next;
      visited.push(next);
      break;
    }
  }
}

const result = (visited.length - 1) / 2;
console.log(result); // 6725
