import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Tile = "#" | "." | "S";

const repeat = (input: any[]) => [
  ...input,
  ...input,
  ...input,
  ...input,
  ...input,
];

const input: Tile[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

const extendedInput = structuredClone(
  repeat(input).map((line) => repeat(line))
);

/**
 * The size of the square of the map.
 *
 * `131`
 */
const size = input.length;

/**
 * The half size of the map (minus one) because the size is odd.
 *
 * `65`.
 */
const halfSize = (size - 1) / 2;

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

for (const [y, line] of extendedInput.entries()) {
  for (const [x, tile] of line.entries()) {
    if (2 * size <= x && x < 3 * size && 2 * size <= y && y < 3 * size) {
      if (tile === "S") {
        reachablePositions.add(positionToString({ x, y }));
        break;
      }
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

for (let step = 0; step < size * 2 + halfSize; step++) {
  let newReachablePositions = new Set<string>();
  for (const position of reachablePositions.values()) {
    const { x, y } = stringToPosition(position);
    for (const delta of deltas) {
      const newPosition = {
        x: x + delta.x,
        y: y + delta.y,
      };
      const tile = extendedInput[newPosition.y]?.[newPosition.x];
      if ([".", "S"].includes(tile)) {
        newReachablePositions.add(positionToString(newPosition));
      }
    }
  }
  reachablePositions = newReachablePositions;
}

const reachablePositionsArray: Position[] = [
  ...reachablePositions.values(),
].map(stringToPosition);

console.log("reachablePositions in extended input", reachablePositions.size); // 94138

const steps = 26501365;

/**
 * The number of possible tiles in the odds maps.
 *
 * `7483`
 */
const tilesOdd = reachablePositionsArray.filter(({ x, y }) => {
  return 2 * size <= x && x < 3 * size && 2 * size <= y && y < 3 * size;
}).length;

/**
 * The number of possible tiles in the even maps.
 *
 * `6568`
 */
const tilesEven = reachablePositionsArray.filter(({ x, y }) => {
  return size <= x && x < 2 * size && size <= y && y < 2 * size;
}).length;

/**
 * The number of maps that are started from the origin map (origin map is `1`).
 *
 * `202301`
 */
const mapLength = (steps - halfSize) / size + 1;

/**
 * The number of full squares in each directions.
 *
 * `202300`.
 */
const fullSquareLength = mapLength - 1;

/**
 * The number of full even squares.
 *
 * `40925290000`.
 */
const numberOfFullEvenSquares = fullSquareLength ** 2;
/**
 * The number of full odd squares.
 *
 * `40924885401`.
 */
const numberOfFullOddSquares = fullSquareLength ** 2 - 2 * fullSquareLength + 1;

/**
 * The number of possible tiles that are in full maps.
 *
 * `575038222175683`
 */
const possibleTilesFullMaps =
  numberOfFullEvenSquares * tilesEven + numberOfFullOddSquares * tilesOdd;

/**
 * The number in the 4 corners.
 *
 * `22594`
 */
const corners = reachablePositionsArray.filter(({ x, y }) => {
  if (2 * size <= x && x < 3 * size) {
    // Top or bottom corners.
    return y < size || 4 * size <= y;
  } else if (2 * size <= y && y < 3 * size) {
    // Left or right corners.
    return x < size || 4 * size <= x;
  }
  return false;
}).length;

/**
 * The number of tiles in the almost full edges (odd).
 *
 * `2657197365`
 */
const almostFullEdges =
  reachablePositionsArray.filter(({ x, y }) => {
    if (size <= x && x < 2 * size) {
      // Top left or bottom left edges.
      return (size <= y && y < 2 * size) || (3 * size <= y && y < 4 * size);
    } else if (2 * size <= y && y < 3 * size) {
      // Top right and bottom right edges.
      return (size <= y && y < 2 * size) || (3 * size <= y && y < 4 * size);
    }
    return false;
  }).length *
  (fullSquareLength - 1);

/**
 * The number of tiles in the almost empty edges (even).
 *
 * `772179100`
 */
const almostEmptyEdges =
  reachablePositionsArray.filter(({ x, y }) => {
    if (x < size) {
      // Top left or bottom left edges.
      return (size <= y && y < 2 * size) || (3 * size <= y && y < 4 * size);
    } else if (4 * size <= x) {
      // Top right and bottom right edges.
      return (size <= y && y < 2 * size) || (3 * size <= y && y < 4 * size);
    }
    return false;
  }).length * fullSquareLength;

console.log(
  "possibleTilesFullMaps",
  possibleTilesFullMaps,
  "corners",
  corners,
  "almostFullEdges",
  almostFullEdges,
  "almostEmptyEdges",
  almostEmptyEdges
);

const result =
  possibleTilesFullMaps + corners + almostFullEdges + almostEmptyEdges;

// x < 615066203655018 < 615067001132434
// x != 575041651574742
console.log(result);
