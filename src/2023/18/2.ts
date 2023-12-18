import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Direction = "U" | "D" | "L" | "R";

type Step = {
  direction: Direction;
  length: number;
};

const regexp = /.*\(#(\w{5})(\d)\)/;

const steps: Step[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((stepText) => {
    const [_, lengthText, directionText] = stepText.match(regexp)!;
    let direction: Direction;
    switch (directionText) {
      case "0":
        direction = "R";
        break;
      case "1":
        direction = "D";
        break;
      case "2":
        direction = "L";
        break;
      case "3":
        direction = "U";
        break;
    }
    return {
      direction: direction!,
      length: parseInt(lengthText, 16),
    };
  });

type Position = {
  x: number;
  y: number;
};

let corners: Position[] = [{ x: 0, y: 0 }];

let position = corners[0];
for (const step of steps) {
  position = {
    x:
      position.x +
      (step.direction === "L"
        ? -step.length
        : step.direction === "R"
          ? step.length
          : 0),
    y:
      position.y +
      (step.direction === "U"
        ? -step.length
        : step.direction === "D"
          ? step.length
          : 0),
  };
  corners.push(position);
}

corners.pop();

const minX = Math.min(...corners.map((edge) => edge.x));
const minY = Math.min(...corners.map((edge) => edge.y));

corners = corners.map((edge) => ({
  x: edge.x - minX,
  y: edge.y - minY,
}));

type Edge = {
  next: Direction;
  previous: Direction;
};

type EdgeString = "LR" | "DU" | "LU" | "DL" | "RU" | "DR";

const edgeToString = (edge: Edge, sorted: boolean = true): EdgeString => {
  let array = [edge.previous, edge.next];
  if (sorted) array.sort();
  return array.join("") as EdgeString;
};

const grid = new Map<string, Edge | null>();

const positionToKey = (position: Position) => `${position.x},${position.y}`;

for (const [index, corner] of corners.entries()) {
  const nextCorner = corners[(index + 1) % corners.length];
  const previousCorner = corners[(index - 1 + corners.length) % corners.length];
  grid.set(positionToKey(corner), {
    next:
      nextCorner.x > corner.x
        ? "R"
        : nextCorner.x < corner.x
          ? "L"
          : nextCorner.y > corner.y
            ? "D"
            : "U",
    previous:
      previousCorner.x < corner.x
        ? "L"
        : previousCorner.x > corner.x
          ? "R"
          : previousCorner.y < corner.y
            ? "U"
            : "D",
  });
}

const xWithCorners = [...new Set(corners.map((edge) => edge.x))].sort(
  (a, b) => a - b
);
const yWithCorners = [...new Set(corners.map((edge) => edge.y))].sort(
  (a, b) => a - b
);

const printGrid = (): void => {
  const gridString: string[][] = Array.from(
    { length: yWithCorners.length },
    (_, y) =>
      Array.from({ length: xWithCorners.length }, (_, x) => {
        const current = grid.get(
          positionToKey({ x: xWithCorners[x], y: yWithCorners[y] })
        );
        if (!current) {
          return ".";
        }
        const tileString = edgeToString(current);
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
            throw new Error(`Unknown tile ${JSON.stringify(current)}`);
        }
      })
  );
  console.log(gridString.map((line) => line.join("")).join("\n"));
};

console.log("before");
printGrid();

for (const [indexX, x] of xWithCorners.entries()) {
  for (const [indexY, y] of yWithCorners.entries()) {
    const current = grid.get(positionToKey({ x, y }));
    if (current) {
      // It is already processed.
      continue;
    }
    // It is not corner. It can only be a straight line or an empty space.
    const above =
      indexY <= 0
        ? null
        : grid.get(positionToKey({ x, y: yWithCorners[indexY - 1] }));

    if (above && edgeToString(above).includes("D")) {
      grid.set(positionToKey({ x, y }), {
        previous: above.next === "D" ? "U" : "D",
        next: above.next === "D" ? "D" : "U",
      });
      continue;
    }

    const left =
      indexX <= 0
        ? null
        : grid.get(positionToKey({ x: xWithCorners[indexX - 1], y }));

    if (left && edgeToString(left).includes("R")) {
      grid.set(positionToKey({ x, y }), {
        previous: left.next === "R" ? "L" : "R",
        next: left.next === "R" ? "R" : "L",
      });
      continue;
    }
  }
  // This is an empty space, there is nothing to do.
}

console.log("after");
printGrid();

let result = 0;

for (const [indexX, x] of xWithCorners.entries()) {
  let lastY: number = -1;
  let wasIn = false;
  let width = indexX === 0 ? 1 : x - xWithCorners[indexX - 1];
  for (const y of yWithCorners) {
    const height = y - lastY;
    const area = width * height;
    const current = grid.get(positionToKey({ x, y }));
    if (!current) {
      // It is not processed.
      continue;
    }
    const edgeString = edgeToString(current);
    if (edgeString === "LR") {
      if (wasIn) {
        result += area;
      } else {
        result += width;
      }
      wasIn = !wasIn;
      lastY = y;
    } else if (edgeString === "DU") {
      // Let's continue to go down on the edge.
      continue;
    } else {
      // It is a corner.
      switch (edgeString) {
        case "DL":
          if (wasIn) {
            result += area;
          } else {
            result += width;
          }
          wasIn = !wasIn;
          break;
        case "DR":
          if (wasIn) {
            result += area;
          } else {
            result += 1;
          }
          break;
        case "LU":
          if (wasIn) {
            result += area;
          } else {
            result += height + width - 1;
          }
          wasIn = !wasIn;
          break;
        case "RU": {
          if (wasIn) {
            result += area;
          } else {
            result += height;
          }
          break;
        }
      }
    }

    lastY = y;
  }
}

console.log(result); // 85070763635666
