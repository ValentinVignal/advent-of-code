import { readFileSync } from "fs";
import * as path from "path";

const example = false;

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

type Key<T extends string> = `${T}${T}`;

const fromToKey = <T extends string>(from: T, to: T): Key<T> => `${from}${to}`;

/**
 * Gives the number of presses needed to click on a button starting from another
 * button on the numeric key pad.
 */
const countNumericKeyPad = new Map<Key<Digit>, number>();
/**
 * Gives the number of presses needed to click on a button starting from another
 * button on the first directional key pad.
 */
const countDirectionKeyPad1 = new Map<Key<KeyPadButton>, number>();
/**
 * Gives the number of presses needed to click on a button starting from another
 * button on the second direction key pad.
 */
const countDirectionKeyPad2 = new Map<Key<KeyPadButton>, number>();

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
 * Gives the possible keypad button to press do a move.
 */
const moveToKeyPadCode = (move: Move): KeyPadButton[][] => {
  const { horizontal, vertical, firstDirection } = move;

  const verticalMoves = (vertical > 0 ? "v" : "^")
    .repeat(Math.abs(vertical))
    .split("")
    .filter(Boolean) as KeyPadButton[];
  const horizontalMoves = (horizontal > 0 ? ">" : "<")
    .repeat(Math.abs(horizontal))
    .split("")
    .filter(Boolean) as KeyPadButton[];

  const code: KeyPadButton[][] = [];
  if (firstDirection !== FirstDirection.horizontal && vertical) {
    code.push([...verticalMoves, ...horizontalMoves, "A"]);
  }
  if (firstDirection !== FirstDirection.vertical && horizontal) {
    code.push([...horizontalMoves, ...verticalMoves, "A"]);
  }
  if (!horizontal && !vertical) {
    code.push(["A"]);
  }

  return code;
};

const getCountDirectionalKeyPad2 = (
  from: KeyPadButton,
  to: KeyPadButton
): number => {
  const key = fromToKey(from, to);

  if (countDirectionKeyPad2.has(key)) return countDirectionKeyPad2.get(key)!;

  // We need to compute it.
  const fromXY = directionalKeyPadButtonPositionMap.get(from)!;
  const toXY = directionalKeyPadButtonPositionMap.get(to)!;
  const move = findMoveDirectional(fromXY, toXY);
  const possibleCodes = moveToKeyPadCode(move);
  const count = Math.min(...possibleCodes.map((code) => code.length));

  countDirectionKeyPad2.set(key, count);
  return count;
};

const getCountDirectionalKeyPadCode2 = (code: KeyPadButton[]): number => {
  let count = 0;
  let from: KeyPadButton = "A";
  for (const to of code) {
    count += getCountDirectionalKeyPad2(from, to);
    from = to;
  }

  return count;
};

const getCountDirectionalKeyPad1 = (
  from: KeyPadButton,
  to: KeyPadButton
): number => {
  const key = fromToKey(from, to);

  if (countDirectionKeyPad1.has(key)) return countDirectionKeyPad1.get(key)!;

  // We need to compute it.
  const fromXY = directionalKeyPadButtonPositionMap.get(from)!;
  const toXY = directionalKeyPadButtonPositionMap.get(to)!;
  const move = findMoveDirectional(fromXY, toXY);
  const possibleCodes = moveToKeyPadCode(move);
  const count = Math.min(...possibleCodes.map(getCountDirectionalKeyPadCode2));

  countDirectionKeyPad1.set(key, count);
  return count;
};

const getCountDirectionalKeyPadCode1 = (code: KeyPadButton[]): number => {
  let count = 0;
  let from: KeyPadButton = "A";
  for (const to of code) {
    count += getCountDirectionalKeyPad1(from, to);
    from = to;
  }

  return count;
};

/**
 * Gives the number of presses needed to click on a button starting from another
 * one.
 */
const getCountNumericKeyPad = (from: Digit, to: Digit): number => {
  const key = fromToKey(from, to);

  if (countNumericKeyPad.has(key)) return countNumericKeyPad.get(key)!;

  // We need to compute it.
  const fromXY = numericPadButtonPositionMap.get(from)!;
  const toXY = numericPadButtonPositionMap.get(to)!;
  const move = findMoveNumeric(fromXY, toXY);
  const possibleCodes = moveToKeyPadCode(move);
  const count = Math.min(...possibleCodes.map(getCountDirectionalKeyPadCode1));

  countNumericKeyPad.set(key, count);
  return count;
};

/** Returns the count of presses needed to enter a code. */
const getCountFromCode = (code: Code): number => {
  let count = 0;
  let from: Digit = "A";
  for (const to of code) {
    count += getCountNumericKeyPad(from, to);
    from = to;
  }

  return count;
};

/** Returns the numeric part of the code. */
const getNumeric = (code: Code): number => {
  return parseInt(code.slice(0, 3).join(""));
};

const complexities = codes.map((code) => {
  const numeric = getNumeric(code);
  const count = getCountFromCode(code);
  return count * numeric;
});

const result = complexities.reduce((sum, complexity) => sum + complexity, 0);

console.log(result); // 206798
