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
const size = input.length;
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
 * The number of rocks in each zone. For even and odd steps.
 */
const rocksPerZone: Zone<[number, number]> = {
  middle: [0, 0],
  topLeft: [0, 0],
  topRight: [0, 0],
  bottomRight: [0, 0],
  bottomLeft: [0, 0],
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
/**
 * Number of rocks in the map for even maps.
 */
let numberOfRockEvenMap = 0;
/**
 * Number of tiles in the map for even maps.
 */
let possibleTileEvenMap = 0;
/**
 * Number of rocks in the map for odd maps.
 */
let numberOfRockOddMap = 0;
/**
 * Number of tiles in the map for odd maps.
 */
let possibleTileOddMap = 0;
for (const [y, line] of input.entries()) {
  for (const [x, tile] of line.entries()) {
    const isOdd = (x + y) % 2;
    const isRock = tile === "#";
    if (y < halfSize - x) {
      possibleTilesPerZone.topLeft[isOdd]++;
      if (isRock) {
        rocksPerZone.topLeft[isOdd]++;
      }
    } else if (y > x + halfSize) {
      possibleTilesPerZone.bottomLeft[isOdd]++;
      if (isRock) {
        rocksPerZone.bottomLeft[isOdd]++;
      }
    } else if (y < x - halfSize) {
      possibleTilesPerZone.topRight[isOdd]++;
      if (isRock) {
        rocksPerZone.topRight[isOdd]++;
      }
    } else if (y > size + halfSize - x) {
      possibleTilesPerZone.bottomRight[isOdd]++;
      if (isRock) {
        rocksPerZone.bottomRight[isOdd]++;
      }
    } else {
      possibleTilesPerZone.middle[isOdd]++;
      if (isRock) {
        rocksPerZone.middle[isOdd]++;
      }
    }
    if (!isOdd) {
      possibleTileEvenMap++;
    } else {
      possibleTileOddMap++;
    }
    if (tile === "#") {
      if (!isOdd) {
        numberOfRockEvenMap++;
      } else {
        numberOfRockOddMap++;
      }
    }
  }
}

/** The number of tiles without rocks on even maps. */
const effectivePossibleTileEvenMap = possibleTileEvenMap - numberOfRockEvenMap;
/** The number of tiles without rocks on odd maps. */
const effectivePossibleTileOddMap = possibleTileOddMap - numberOfRockOddMap;

console.log(
  "numberOfRocks",
  numberOfRocks,
  "even",
  numberOfRockEvenMap,
  "odd",
  numberOfRockOddMap,
  "possibleTileEvenMap",
  possibleTileEvenMap,
  "possibleTileOddMap",
  possibleTileOddMap,
  "effectivePossibleTileEvenMap",
  effectivePossibleTileEvenMap,
  "effectivePossibleTileOddMap",
  effectivePossibleTileOddMap
);

console.log("rocksPerZone", rocksPerZone);
console.log("possibleTilesPerZone", possibleTilesPerZone);
/**
 * The number of maps that are started from the origin map (origin map is `1`).
 */
const mapLength = (steps - halfSize) / size + 1;

/**
 * The number of full squares in each directions.
 */
const fullSquareLength = mapLength - 1;

/**
 * The number of full even squares.
 */
const numberOfFullEvenSquares = fullSquareLength ** 2;
/**
 * The number of full odd squares.
 */
const numberOfFullOddSquares = fullSquareLength ** 2 - 2 * fullSquareLength + 1;

console.log(
  "numberOfFullEvenSquares",
  numberOfFullEvenSquares,
  "numberOfFullOddSquares",
  numberOfFullOddSquares
);

const possibleTilesFullMaps =
  numberOfFullEvenSquares * effectivePossibleTileEvenMap +
  numberOfFullOddSquares * effectivePossibleTileOddMap;

console.log("possibleTilesFullMaps", possibleTilesFullMaps);

const effectivePossibleTilesPerZone: Zone<[number, number]> = {
  middle: [
    possibleTilesPerZone.middle[0] - rocksPerZone.middle[0],
    possibleTilesPerZone.middle[1] - rocksPerZone.middle[1],
  ],
  topLeft: [
    possibleTilesPerZone.topLeft[0] - rocksPerZone.topLeft[0],
    possibleTilesPerZone.topLeft[1] - rocksPerZone.topLeft[1],
  ],
  bottomLeft: [
    possibleTilesPerZone.bottomLeft[0] - rocksPerZone.bottomLeft[0],
    possibleTilesPerZone.bottomLeft[1] - rocksPerZone.bottomLeft[1],
  ],
  topRight: [
    possibleTilesPerZone.topRight[0] - rocksPerZone.topRight[0],
    possibleTilesPerZone.topRight[1] - rocksPerZone.topRight[1],
  ],
  bottomRight: [
    possibleTilesPerZone.bottomRight[0] - rocksPerZone.bottomRight[0],
    possibleTilesPerZone.bottomRight[1] - rocksPerZone.bottomRight[1],
  ],
};

const restMiddleEven =
  effectivePossibleTilesPerZone.middle[0] * 4 * (mapLength - 1);
console.log(3 * (mapLength - 2));
const restEven =
  (effectivePossibleTilesPerZone.bottomLeft[0] +
    effectivePossibleTilesPerZone.topRight[0] +
    effectivePossibleTilesPerZone.bottomRight[0] +
    effectivePossibleTilesPerZone.topLeft[0]) *
  (3 * (mapLength - 2) + 2);
const restOdd =
  (mapLength - 1) *
  (effectivePossibleTilesPerZone.bottomLeft[1] +
    effectivePossibleTilesPerZone.topLeft[0] +
    effectivePossibleTilesPerZone.bottomRight[1] +
    effectivePossibleTilesPerZone.topRight[0]);

const rest = restMiddleEven + restEven + restOdd;

console.log(
  "rest",
  rest,
  "restMiddleEven",
  restMiddleEven,
  "restEven",
  restEven,
  "restOdd",
  restOdd
);

const result = possibleTilesFullMaps + rest;

// x < 615066203655018
//     615069260801330
console.log("result", result);
