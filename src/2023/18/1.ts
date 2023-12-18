import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Direction = "U" | "D" | "L" | "R";

type Step = {
  direction: Direction;
  length: number;
};
const steps: Step[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((stepText) => {
    const [direction, lengthText] = stepText.split(" ");
    return {
      direction: direction as Direction,
      length: Number(lengthText),
    };
  });

type Position = {
  x: number;
  y: number;
};

let edges: Position[] = [{ x: 0, y: 0 }];

let position = edges[0];
for (const step of steps) {
  for (let i = 0; i < step.length; i++) {
    position = {
      x:
        position.x +
        (step.direction === "L" ? -1 : step.direction === "R" ? 1 : 0),
      y:
        position.y +
        (step.direction === "U" ? -1 : step.direction === "D" ? 1 : 0),
    };
    edges.push(position);
  }
}

edges.pop();

const minX = Math.min(...edges.map((edge) => edge.x));
const minY = Math.min(...edges.map((edge) => edge.y));

edges = edges.map((edge) => ({
  x: edge.x - minX,
  y: edge.y - minY,
}));

const height = Math.max(...edges.map((edge) => edge.y)) + 1;
const width = Math.max(...edges.map((edge) => edge.x)) + 1;

const size = Math.max(height, width);

type Edge = {
  next: Direction;
  previous: Direction;
};

type EdgeString = "LR" | "DU" | "LU" | "DL" | "RU" | "DR";

const edgeToString = (edge: Edge): EdgeString => {
  return [edge.previous, edge.next].sort().join("") as EdgeString;
};

type Grid = (Edge | null)[][];

const grid: Grid = Array.from({ length: size }, () =>
  Array.from({ length: size }, () => null)
);

for (const [index, edge] of edges.entries()) {
  const nextEdge = edges[(index + 1) % edges.length];
  const previousEdge = edges[(index - 1 + edges.length) % edges.length];
  grid[edge.y][edge.x] = {
    next:
      nextEdge.x === edge.x + 1
        ? "R"
        : nextEdge.x === edge.x - 1
          ? "L"
          : nextEdge.y === edge.y + 1
            ? "D"
            : "U",
    previous:
      previousEdge.x === edge.x - 1
        ? "L"
        : previousEdge.x === edge.x + 1
          ? "R"
          : previousEdge.y === edge.y - 1
            ? "U"
            : "D",
  };
}

let result = 0;
for (let diagonal = 0; diagonal < 2 * size - 1; diagonal++) {
  let isIn = false;
  for (let d = 0; d < diagonal + 1; d++) {
    const x = diagonal - d;
    const y = d;
    if (grid[y]?.[x]) {
      result += 1;
      const edgeString = edgeToString(grid[y][x]!);
      if (["LU", "DR"].includes(edgeString)) {
        isIn = !isIn;
      }
      isIn = !isIn;
    } else if (isIn) {
      result += 1;
    }
  }
}

const printGrid = (grid: Grid) => {
  console.log(
    grid
      .map((line) => {
        return line
          .map((tile) => {
            if (!tile) return ".";
            const tileString = edgeToString(tile);
            switch (tileString) {
              case "LR":
                return "-";
              case "DU":
                return "|";
              case "LU":
                return "J";
              case "DL":
                return "7";
              case "RU":
                return "L";
              case "DR":
                return "F";
              default:
                throw new Error(`Unknown tile ${tile}`);
            }
          })
          .join("");
      })
      .join("\n")
  );
};

printGrid(grid);

console.log(result); // 35244
