import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Square = "." | "/" | "\\" | "|" | "-";

type Position = { x: number; y: number };
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
type Beam = Position & { direction: Direction };

const grid: Square[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Square[]);

const beams: Set<Direction>[][] = Array.from({ length: grid.length }, () =>
  Array.from({ length: grid[0].length }, () => new Set<Direction>())
);

const beamsToProcess: Beam[] = [
  {
    x: 0,
    y: 0,
    direction: Direction.Right,
  },
];

while (beamsToProcess.length) {
  const { x, y, direction } = beamsToProcess.shift()!;
  if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) continue;
  if (beams[y][x].has(direction)) {
    continue;
  }
  beams[y][x].add(direction);
  const square = grid[y][x];
  switch (direction) {
    case Direction.Up:
      switch (square) {
        case "/":
          beamsToProcess.push({ x: x + 1, y, direction: Direction.Right });
          break;
        case "\\":
          beamsToProcess.push({ x: x - 1, y, direction: Direction.Left });
          break;
        case "-":
          beamsToProcess.push({ x: x + 1, y, direction: Direction.Right });
          beamsToProcess.push({ x: x - 1, y, direction: Direction.Left });
          break;
        default:
          beamsToProcess.push({ x, y: y - 1, direction: Direction.Up });
          break;
      }
      break;
    case Direction.Down:
      switch (square) {
        case "/":
          beamsToProcess.push({ x: x - 1, y, direction: Direction.Left });
          break;
        case "\\":
          beamsToProcess.push({ x: x + 1, y, direction: Direction.Right });
          break;
        case "-":
          beamsToProcess.push({ x: x + 1, y, direction: Direction.Right });
          beamsToProcess.push({ x: x - 1, y, direction: Direction.Left });
          break;
        default:
          beamsToProcess.push({ x, y: y + 1, direction: Direction.Down });
          break;
      }
      break;
    case Direction.Left:
      switch (square) {
        case "/":
          beamsToProcess.push({ x, y: y + 1, direction: Direction.Down });
          break;
        case "\\":
          beamsToProcess.push({ x, y: y - 1, direction: Direction.Up });
          break;
        case "|":
          beamsToProcess.push({ x, y: y + 1, direction: Direction.Down });
          beamsToProcess.push({ x, y: y - 1, direction: Direction.Up });
          break;
        default:
          beamsToProcess.push({ x: x - 1, y, direction: Direction.Left });
          break;
      }
      break;
    case Direction.Right:
      switch (square) {
        case "/":
          beamsToProcess.push({ x, y: y - 1, direction: Direction.Up });
          break;
        case "\\":
          beamsToProcess.push({ x, y: y + 1, direction: Direction.Down });
          break;
        case "|":
          beamsToProcess.push({ x, y: y + 1, direction: Direction.Down });
          beamsToProcess.push({ x, y: y - 1, direction: Direction.Up });
          break;
        default:
          beamsToProcess.push({ x: x + 1, y, direction: Direction.Right });
          break;
      }
      break;
  }
}

const result = beams
  .map((line) => line.filter((set) => set.size).length)
  .reduce((a, b) => a + b, 0);

console.log(result); // 7199
