import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "." | "S" | "|" | "-" | "L" | "J" | "7" | "F";

const grid = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split("").filter(Boolean) as Tile[];
  });

type Point = { x: number; y: number };

enum TileType {
  Pipe,
  Inside,
  Outside,
}

let start: Point;

grid.forEach((line, y) => {
  line.forEach((tile, x) => {
    if (tile === "S") {
      start = { x, y };
    }
  });
});

const classifiedGrid: (TileType | null)[][] = Array.from(
  { length: grid.length },
  () => Array(grid[0].length).fill(null)
);

start = start!;

let point = start;

const visited = [start];

const pointEquals = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

type NextPoint = {
  point: Point;
  direction: Direction;
};

const classifyTile = (point: NextPoint): void => {
  classifiedGrid[point.point.y][point.point.x] = TileType.Pipe;

  const setTile = (point: Point, type: TileType) => {
    if (classifiedGrid[point.y]?.[point.x] === null) {
      classifiedGrid[point.y][point.x] = type;
    }
  };

  switch (point.direction) {
    case Direction.Up:
      switch (grid[point.point.y][point.point.x]) {
        case "|":
          setTile({ x: point.point.x - 1, y: point.point.y }, TileType.Outside);
          setTile({ x: point.point.x + 1, y: point.point.y }, TileType.Inside);
          break;
        case "F":
          setTile({ x: point.point.x - 1, y: point.point.y }, TileType.Outside);
          setTile(
            { x: point.point.x - 1, y: point.point.y + 1 },
            TileType.Outside
          );
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Outside);
          break;
        case "7":
          setTile({ x: point.point.x + 1, y: point.point.y }, TileType.Inside);
          setTile(
            { x: point.point.x + 1, y: point.point.y + 1 },
            TileType.Inside
          );
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Inside);
          break;
      }
      break;
    case Direction.Down:
      switch (grid[point.point.y][point.point.x]) {
        case "|":
          setTile({ x: point.point.x - 1, y: point.point.y }, TileType.Inside);
          setTile({ x: point.point.x + 1, y: point.point.y }, TileType.Outside);

          break;
        case "L":
          setTile({ x: point.point.x - 1, y: point.point.y }, TileType.Inside);
          setTile(
            { x: point.point.x - 1, y: point.point.y + 1 },
            TileType.Inside
          );
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Inside);
          break;
        case "J":
          setTile({ x: point.point.x + 1, y: point.point.y }, TileType.Outside);
          setTile(
            { x: point.point.x + 1, y: point.point.y + 1 },
            TileType.Outside
          );
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Outside);
          break;
      }
      break;
    case Direction.Left:
      switch (grid[point.point.y][point.point.x]) {
        case "-":
          setTile({ x: point.point.x, y: point.point.y - 1 }, TileType.Inside);
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Outside);
          break;
        case "F":
          setTile({ x: point.point.x, y: point.point.y - 1 }, TileType.Inside);
          setTile(
            { x: point.point.x - 1, y: point.point.y - 1 },
            TileType.Inside
          );
          setTile({ x: point.point.x - 1, y: point.point.y }, TileType.Inside);
          break;
        case "L":
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Outside);
          setTile(
            { x: point.point.x - 1, y: point.point.y + 1 },
            TileType.Outside
          );
          setTile({ x: point.point.x - 1, y: point.point.y }, TileType.Outside);
          break;
      }
      break;
    case Direction.Right:
      switch (grid[point.point.y][point.point.x]) {
        case "-":
          setTile({ x: point.point.x, y: point.point.y - 1 }, TileType.Outside);
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Inside);
          break;
        case "7":
          setTile({ x: point.point.x, y: point.point.y - 1 }, TileType.Outside);
          setTile(
            { x: point.point.x + 1, y: point.point.y - 1 },
            TileType.Outside
          );
          setTile({ x: point.point.x + 1, y: point.point.y }, TileType.Outside);
          break;
        case "J":
          setTile({ x: point.point.x, y: point.point.y + 1 }, TileType.Inside);
          setTile(
            { x: point.point.x + 1, y: point.point.y + 1 },
            TileType.Inside
          );
          setTile({ x: point.point.x + 1, y: point.point.y }, TileType.Inside);
          break;
      }
      break;
  }
};

while (visited.length == 1 || !pointEquals(point, start)) {
  const potentialNext: NextPoint[] = [];
  const currentSymbol = grid[point.y][point.x];
  if (["|", "L", "J", "S"].includes(currentSymbol)) {
    const up = grid[point.y - 1]?.[point.x];

    if (["|", "7", "F", "S"].includes(up)) {
      potentialNext.push({
        point: { x: point.x, y: point.y - 1 },
        direction: Direction.Up,
      });
    }
  }
  if (["|", "7", "F", "S"].includes(currentSymbol)) {
    const down = grid[point.y + 1]?.[point.x];

    if (["|", "L", "J", "S"].includes(down)) {
      potentialNext.push({
        point: { x: point.x, y: point.y + 1 },
        direction: Direction.Down,
      });
    }
  }
  if (["-", "F", "L", "S"].includes(currentSymbol)) {
    const right = grid[point.y][point.x + 1];

    if (["-", "7", "J", "S"].includes(right)) {
      potentialNext.push({
        point: { x: point.x + 1, y: point.y },
        direction: Direction.Right,
      });
    }
  }
  if (["-", "7", "J", "S"].includes(currentSymbol)) {
    const left = grid[point.y][point.x - 1];

    if (["-", "F", "L", "S"].includes(left)) {
      potentialNext.push({
        point: { x: point.x - 1, y: point.y },
        direction: Direction.Left,
      });
    }
  }
  for (const next of potentialNext) {
    if (
      !visited[visited.length - 2] ||
      !pointEquals(visited[visited.length - 2], next.point)
    ) {
      point = next.point;
      visited.push(point);
      classifyTile(next);
      break;
    }
  }
}

const classifyPoint = (point: Point): void => {
  if (classifiedGrid[point.y]?.[point.x] !== null) return;
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (Math.abs(dx) === Math.abs(dy)) continue;
      const x = point.x + dx;
      const y = point.y + dy;
      const neighbor = classifiedGrid[y]?.[x];
      if (
        neighbor !== null &&
        [TileType.Outside, TileType.Inside].includes(neighbor)
      ) {
        classifiedGrid[point.y][point.x] = neighbor;
        return;
      }
    }
  }
};

const printGrid = (grid: (TileType | null)[][]) => {
  const txt = grid
    .map((line) => {
      return line
        .map((tile) => {
          switch (tile) {
            case TileType.Inside:
              return "\x1b[36mI\x1b[0m";
            case TileType.Outside:
              return "\x1b[31mO\x1b[0m";
            case TileType.Pipe:
              return "\x1b[32mP\x1b[0m";
            default:
              return " ";
          }
        })
        .join("");
    })
    .join("\n");

  console.log(txt);
};

const isProcessedGrid: boolean[][] = Array.from({ length: grid.length }, () =>
  Array(grid[0].length).fill(false)
);

const toProcess = [start];

while (toProcess.length) {
  const point = toProcess.shift()!;
  if (point.x === 0 && point.y === 0) {
    console.log("point 0.0", point);
    console.log(isProcessedGrid[point.y]?.[point.x]);
    console.log(classifiedGrid[point.y]?.[point.x]);
  }
  if (isProcessedGrid[point.y]?.[point.x] !== false) continue;
  classifyPoint(point);
  isProcessedGrid[point.y][point.x] = true;
  toProcess.push(
    { x: point.x - 1, y: point.y },
    { x: point.x + 1, y: point.y },
    { x: point.x, y: point.y - 1 },
    { x: point.x, y: point.y + 1 }
  );
}

let insideCount = 0;
let outsideCount = 0;

classifiedGrid.forEach((line) => {
  line.forEach((tile) => {
    if (tile === TileType.Inside) {
      insideCount++;
    } else if (tile === TileType.Outside) {
      outsideCount++;
    }
  });
});

printGrid(classifiedGrid);

// 381 < 382 < x < 387
console.log("insideCount", insideCount, "outsideCount", outsideCount); // 383
