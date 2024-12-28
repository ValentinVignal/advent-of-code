import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "A";

type KeyPadButton = "^" | "v" | "<" | ">" | "A";

type NumericCode = Digit[];

type KeyPadCode = KeyPadButton[];

type Optional<T> = T | null;

const numberOfDirectionalKeyPads = 25;

const codes: NumericCode[] = textInput
  .split("\n")
  .map((line) => line.split("").filter(Boolean) as Digit[]);

enum FirstDirection {
  vertical = "vertical",
  horizontal = "horizontal",
}

type Move = {
  vertical: number;
  horizontal: number;
  firstDirection: Optional<FirstDirection>;
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

type DirectionalKey = `${number}${KeyPadButton}${string}`;

const fromToDirectionalKey = (
  from: KeyPadButton,
  code: KeyPadCode,
  depth: number
): DirectionalKey => `${depth}${from}${code.join("")}`;

/**
 * Gives the number of presses needed to click on a button starting from another
 * button on the first directional key pad.
 */
const countDirectionKeyPads = new Map<DirectionalKey, number>();

const findMoveNumeric = (from: XY, to: XY): Move => {
  const horizontal = to.x - from.x;
  const vertical = to.y - from.y;
  let firstDirection: Optional<FirstDirection> = null;

  if (
    horizontal &&
    vertical &&
    !Math.min(from.x, to.x) &&
    Math.max(from.y, to.y) === 3
  ) {
    // It needs to avoid the bottom left gap.
    if (vertical < 0) {
      firstDirection = FirstDirection.vertical;
    } else {
      firstDirection = FirstDirection.horizontal;
    }
  }

  return { horizontal, vertical, firstDirection };
};

const findMoveDirectional = (from: XY, to: XY): Move => {
  const horizontal = to.x - from.x;
  const vertical = to.y - from.y;
  let firstDirection: Optional<FirstDirection> = null;

  if (
    horizontal &&
    vertical &&
    !Math.min(from.x, to.x) &&
    !Math.max(from.y, to.y)
  ) {
    // It needs to avoid the top left gap.
    if (vertical < 0) {
      firstDirection = FirstDirection.horizontal;
    } else {
      firstDirection = FirstDirection.vertical;
    }
  }

  return { horizontal, vertical, firstDirection };
};

/**
 * Gives the possible keypad button to press do a set of moves.
 */
const movesToKeyPadCodes = (moves: Move[]): KeyPadButton[][] => {
  if (!moves.length) return [[]];
  const [{ horizontal, vertical, firstDirection }, ...rest] = moves;

  const restResult = movesToKeyPadCodes(rest);

  const verticalMoves = (vertical > 0 ? "v" : "^")
    .repeat(Math.abs(vertical))
    .split("")
    .filter(Boolean) as KeyPadButton[];
  const horizontalMoves = (horizontal > 0 ? ">" : "<")
    .repeat(Math.abs(horizontal))
    .split("")
    .filter(Boolean) as KeyPadButton[];

  const firstKeyPadCode: KeyPadButton[][] = [];
  if (firstDirection !== FirstDirection.horizontal && vertical) {
    firstKeyPadCode.push([...verticalMoves, ...horizontalMoves, "A"]);
  }
  if (firstDirection !== FirstDirection.vertical && horizontal) {
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

const getCountDirectionalKeyPadCode = (
  from: KeyPadButton,
  code: KeyPadCode,
  depth: number
): number => {
  const key = fromToDirectionalKey(from, code, depth);
  if (countDirectionKeyPads.has(key)) return countDirectionKeyPads.get(key)!;

  const moves: Move[] = [];
  for (const to of code) {
    const fromXY = directionalKeyPadButtonPositionMap.get(from)!;
    const toXY = directionalKeyPadButtonPositionMap.get(to)!;
    const move = findMoveDirectional(fromXY, toXY);
    moves.push(move);
    from = to;
  }

  const possibleCodes = movesToKeyPadCodes(moves);
  const lengths = possibleCodes.map((code) => {
    if (!depth) return code.length;
    return getCountDirectionalKeyPadCode(from, code, depth - 1);
  });
  const count = Math.min(...lengths);

  countDirectionKeyPads.set(key, count);
  return count;
};

/** Returns the count of presses needed to enter a code. */
const getCountFromCode = (code: NumericCode): number => {
  let from: Digit = "A";
  const moves: Move[] = [];
  for (const to of code) {
    const fromXY = numericPadButtonPositionMap.get(from)!;
    const toXY = numericPadButtonPositionMap.get(to)!;
    const move = findMoveNumeric(fromXY, toXY);
    moves.push(move);
    from = to;
  }

  const possibleCodes = movesToKeyPadCodes(moves);

  const count = Math.min(
    ...possibleCodes.map((code) =>
      getCountDirectionalKeyPadCode("A", code, numberOfDirectionalKeyPads - 1)
    )
  );

  return count;
};

/** Returns the numeric part of the code. */
const getNumeric = (code: NumericCode): number => {
  return parseInt(code.slice(0, 3).join(""));
};

const complexities = codes.map((code) => {
  const numeric = getNumeric(code);
  const count = getCountFromCode(code);
  console.log(count, numeric);
  return count * numeric;
});

const result = complexities.reduce((sum, complexity) => sum + complexity, 0);

// 153191605803106 < x < 373023775945012
console.log(result);
