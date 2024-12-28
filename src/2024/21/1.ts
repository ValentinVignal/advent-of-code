import { readFileSync } from "fs";
import * as path from "path";

const example = true;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "A";

type KeyPadButton = "^" | "v" | "<" | ">" | "A";

type Code = Digit[];

type Optional<T> = T | null;

const codes: Code[] = textInput
  .split("\n")
  .map((line) => line.split("").filter(Boolean) as Digit[]);

enum FirstToMove {
  vertical = "vertical",
  horizontal = "horizontal",
}

type ShortestPath = {
  vertical: number;
  horizontal: number;
  firstToMove: Optional<FirstToMove>;
};

const numericKeyPad = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [null, "0", "A"],
] as const;

const directionalKeyPad = [
  [null, "^", "A"],
  ["<", "v", ">"],
] as const;

type XY = {
  x: number;
  y: number;
};

/**
 * Gives the position of a digit on the numeric key pad.
 */
const numericPadButtonPositionMap = new Map<Digit, XY>();

for (const [y, row] of numericKeyPad.entries()) {
  for (const [x, button] of row.entries()) {
    if (button === null) continue;
    numericPadButtonPositionMap.set(button, { x, y });
  }
}

/**
 * Gives the position of a button on the directional key pad.
 */
const directionalKeyPadButtonPositionMap = new Map<KeyPadButton, XY>();
for (const [y, row] of directionalKeyPad.entries()) {
  for (const [x, button] of row.entries()) {
    if (button === null) continue;
    directionalKeyPadButtonPositionMap.set(button, { x, y });
  }
}

const findShortestNumericPath = (from: XY, to: XY): ShortestPath => {
  const horizontal = to.x - from.x;
  const vertical = to.y - from.y;
  let firstToMove: Optional<FirstToMove> = null;

  if (
    horizontal &&
    vertical &&
    !Math.min(from.x, to.x) &&
    Math.max(from.y, to.y) === 3
  ) {
    // It needs to avoid the bottom left gap.
    if (vertical < 0) {
      firstToMove = FirstToMove.vertical;
    } else {
      firstToMove = FirstToMove.horizontal;
    }
  }

  return { horizontal, vertical, firstToMove };
};

const findShortestDirectionalPath = (from: XY, to: XY): ShortestPath => {
  const horizontal = to.x - from.x;
  const vertical = to.y - from.y;
  let firstToMove: Optional<FirstToMove> = null;

  if (
    horizontal &&
    vertical &&
    !Math.min(from.x, to.x) &&
    !Math.max(from.y, to.y)
  ) {
    // It needs to avoid the top left gap.
    if (vertical < 0) {
      firstToMove = FirstToMove.horizontal;
    } else {
      firstToMove = FirstToMove.vertical;
    }
  }

  return { horizontal, vertical, firstToMove };
};

const transformShortestPathToKeyPadCode = (
  shortestPath: ShortestPath[]
): KeyPadButton[][] => {
  if (!shortestPath.length) return [[]];
  const [{ horizontal, vertical, firstToMove }, ...rest] = shortestPath;

  const restResult = transformShortestPathToKeyPadCode(rest);

  const verticalMoves = (vertical > 0 ? "v" : "^")
    .repeat(Math.abs(vertical))
    .split("")
    .filter(Boolean) as KeyPadButton[];
  const horizontalMoves = (horizontal > 0 ? ">" : "<")
    .repeat(Math.abs(horizontal))
    .split("")
    .filter(Boolean) as KeyPadButton[];

  const firstKeyPadCode: KeyPadButton[][] = [];
  if (firstToMove !== FirstToMove.horizontal && vertical) {
    firstKeyPadCode.push([...verticalMoves, ...horizontalMoves, "A"]);
  }
  if (firstToMove !== FirstToMove.vertical && horizontal) {
    firstKeyPadCode.push([...horizontalMoves, ...verticalMoves, "A"]);
  }
  if (!horizontal && !vertical) {
    firstKeyPadCode.push(["A"]);
  }

  const keyPadCode: KeyPadButton[][] = [];
  for (const first of firstKeyPadCode) {
    for (const rest of restResult) {
      keyPadCode.push([...first, ...rest]);
    }
  }

  return keyPadCode;
};

const findShortestPathForKeyPad = (
  keyPadCode: KeyPadButton[]
): ShortestPath[] => {
  let position = directionalKeyPadButtonPositionMap.get("A")!;
  const shortestPath: ShortestPath[] = [];

  for (const button of keyPadCode) {
    const nextPosition = directionalKeyPadButtonPositionMap.get(button)!;
    const path = findShortestDirectionalPath(position, nextPosition);
    shortestPath.push(path);
    position = nextPosition;
  }
  return shortestPath;
};

const findShortestPathForCode = (code: Code): ShortestPath[] => {
  let position = numericPadButtonPositionMap.get("A")!;

  const shortestPath: ShortestPath[] = [];
  for (const digit of code) {
    const nextPosition = numericPadButtonPositionMap.get(digit)!;
    const path = findShortestNumericPath(position, nextPosition);

    shortestPath.push(path);
    position = nextPosition;
  }

  return shortestPath;
};

const keepSmallestKeyPadCombinations = (
  moves: KeyPadButton[][]
): KeyPadButton[][] => {
  const minPressCount = Math.min(
    ...moves.map((combinations) => combinations.length)
  );
  return moves.filter((combinations) => combinations.length === minPressCount);
};

const findPresses = (code: Code): KeyPadButton[][] => {
  const numericPath = findShortestPathForCode(code);
  const keyPadCodes = keepSmallestKeyPadCombinations(
    transformShortestPathToKeyPadCode(numericPath)
  );
  const pathOnKeyPad = keyPadCodes.map(findShortestPathForKeyPad);
  const keyPadCodes2 = keepSmallestKeyPadCombinations(
    pathOnKeyPad
      .map(transformShortestPathToKeyPadCode)
      .reduce((acc, val) => acc.concat(val), [])
  );
  const pathOnKeyPad2 = keyPadCodes2.map(findShortestPathForKeyPad);
  const finalPresses = pathOnKeyPad2
    .map(transformShortestPathToKeyPadCode)
    .reduce((acc, val) => acc.concat(val), []);
  return keepSmallestKeyPadCombinations(finalPresses);
};

const getNumeric = (code: Code): number => {
  return parseInt(code.slice(0, 3).join(""));
};

let result = 0;

for (const code of codes) {
  const presses = findPresses(code);
  const minPressCount = Math.min(
    ...presses.map((combinations) => combinations.length)
  );
  console.log(minPressCount, getNumeric(code));
  result += minPressCount * getNumeric(code);
}

// 204430 < x
console.log(result);
