import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

console.log(textInput);

type Tile = "#" | "." | "S";

const input: Tile[][] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

const steps = 26501365;
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
console.log("size", size, "halfSize", halfSize, "steps", steps);

type Zone<T> = {
  middle: T;
  topLeft: T;
  topRight: T;
  bottomRight: T;
  bottomLeft: T;
};

/**
 * The number of possible tiles in each zone. For even and odd steps.
 */
const possibleTilesPerZone: Zone<[number, number]> = {
  middle: [0, 0],
  topLeft: [0, 0],
  topRight: [0, 0],
  bottomRight: [0, 0],
  bottomLeft: [0, 0],
};

const numberOfRocks = input
  .map((line) => line.filter((x) => x === "#").length)
  .reduce((a, b) => a + b, 0);

for (const [y, line] of input.entries()) {
  for (const [x, tile] of line.entries()) {
    const isOdd = (x + y) % 2;
    const isRock = tile === "#";
    if (isRock) continue;
    if (y < halfSize - x) {
      possibleTilesPerZone.topLeft[isOdd]++;
    } else if (y > x + halfSize) {
      possibleTilesPerZone.bottomLeft[isOdd]++;
    } else if (y < x - halfSize) {
      possibleTilesPerZone.topRight[isOdd]++;
    } else if (y > size + halfSize - x) {
      possibleTilesPerZone.bottomRight[isOdd]++;
    } else {
      possibleTilesPerZone.middle[isOdd]++;
    }
  }
}

/** The number of tiles without rocks on even maps.
 *
 * `7545`
 */
const possibleTileEvenMap =
  possibleTilesPerZone.bottomLeft[0] +
  possibleTilesPerZone.topRight[0] +
  possibleTilesPerZone.bottomRight[0] +
  possibleTilesPerZone.topLeft[0] +
  possibleTilesPerZone.middle[0];
/** The number of tiles without rocks on odd maps.
 *
 * `7484`
 */
const possibleTileOddMap =
  possibleTilesPerZone.bottomLeft[1] +
  possibleTilesPerZone.topRight[1] +
  possibleTilesPerZone.bottomRight[1] +
  possibleTilesPerZone.topLeft[1] +
  possibleTilesPerZone.middle[1];

console.log(
  "numberOfRocks",
  numberOfRocks,
  "possibleTileEvenMap",
  possibleTileEvenMap,
  "possibleTileOddMap",
  possibleTileOddMap
);

console.log("possibleTilesPerZone", possibleTilesPerZone);
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

console.log("mapLength", mapLength, "fullSquareLength", fullSquareLength);
console.log(
  "numberOfFullEvenSquares",
  numberOfFullEvenSquares,
  "numberOfFullOddSquares",
  numberOfFullOddSquares
);

/**
 * The number of possible tiles that are in full maps.
 *
 * `615063155391084`
 */
const possibleTilesFullMaps =
  numberOfFullEvenSquares * possibleTileEvenMap +
  numberOfFullOddSquares * possibleTileOddMap;

/**
 * The number of possible tiles in the corners.
 *
 * `22596`
 */
const possibleTilesInCorners =
  4 * possibleTilesPerZone.middle[1] +
  2 *
    (possibleTilesPerZone.topLeft[1] +
      possibleTilesPerZone.topRight[1] +
      possibleTilesPerZone.bottomLeft[1] +
      possibleTilesPerZone.bottomRight[1]);

/**
 * The number of possible tiles in the almost full edges.
 *
 * `3086284554`
 */
const almostFullEdges =
  4 * (mapLength - 2) * possibleTilesPerZone.middle[1] +
  3 *
    (mapLength - 2) *
    (possibleTilesPerZone.topLeft[1] +
      possibleTilesPerZone.topRight[1] +
      possibleTilesPerZone.bottomLeft[1] +
      possibleTilesPerZone.bottomRight[1]);

/**
 * The number of possible tiles in the almost empty edges.
 *
 * `759434200`
 */
const almostEmptyEdges =
  (mapLength - 1) *
  (possibleTilesPerZone.bottomLeft[0] +
    possibleTilesPerZone.bottomRight[0] +
    possibleTilesPerZone.topLeft[0] +
    possibleTilesPerZone.topRight[0]);

console.log(
  "possibleTilesFullMaps",
  possibleTilesFullMaps,
  "possibleTilesInCorners",
  possibleTilesInCorners,
  "almostFullEdges",
  almostFullEdges,
  "almostEmptyEdges",
  almostEmptyEdges
);

const result =
  possibleTilesFullMaps +
  possibleTilesInCorners +
  almostFullEdges +
  almostEmptyEdges;

// x < 615066203655018 < 615067001132434
console.log("result", result);
