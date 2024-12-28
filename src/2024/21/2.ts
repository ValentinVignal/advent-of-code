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

const numberOfDirectionalKeyPads = 25;

const codes: NumericCode[] = textInput
  .split("\n")
  .map((line) => line.split("").filter(Boolean) as Digit[]);

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

const equalsXY = (a: XY, b: XY): boolean => a.x === b.x && a.y === b.y;

/**
 * Gives the position of a digit on the numeric key pad.
 */
const numericPadButtonPositionMap = new Map<Digit | null, XY>();

for (const [y, row] of numericKeyPad.entries()) {
  for (const [x, button] of row.entries()) {
    numericPadButtonPositionMap.set(button, { x, y });
  }
}

/**
 * Gives the position of a button on the directional key pad.
 */
const directionalKeyPadButtonPositionMap = new Map<KeyPadButton | null, XY>();
for (const [y, row] of directionalKeyPad.entries()) {
  for (const [x, button] of row.entries()) {
    directionalKeyPadButtonPositionMap.set(button, { x, y });
  }
}

type NumericalKey = `${Digit}${Digit}`;
type DirectionalKey = `${KeyPadButton}${KeyPadButton}${number}`;

const fromToNumericKey = (from: Digit, to: Digit): NumericalKey =>
  `${from}${to}`;
const fromToDirectionalKey = (
  from: KeyPadButton,
  to: KeyPadButton,
  depth: number
): DirectionalKey => `${from}${to}${depth}`;

/**
 * Gives the number of presses needed to click on a button starting from another
 * button on the numeric key pad.
 */
const countNumericKeyPad = new Map<NumericalKey, number>();

/**
 * Gives the number of presses needed to click on a button starting from another
 * button on the first directional key pad.
 */
const countDirectionKeyPads = new Map<DirectionalKey, number>();

const generateKeyPadCodes = (
  from: XY,
  to: XY,
  forbiddenXY: XY
): KeyPadCode[] => {
  const codes: KeyPadCode[] = [];

  const vertical = to.y - from.y;
  const horizontal = to.x - from.x;

  const verticalChar = vertical > 0 ? "v" : ("^" as KeyPadButton);
  const horizontalChar = horizontal > 0 ? ">" : ("<" as KeyPadButton);

  const verticalAbs = Math.abs(vertical);
  const horizontalAbs = Math.abs(horizontal);

  const generate = (
    acc: KeyPadCode,
    currentXY: XY,
    remainingVertical: number,
    remainingHorizontal: number
  ) => {
    if (equalsXY(currentXY, forbiddenXY)) return;
    if (!remainingVertical && !remainingHorizontal) {
      codes.push([...acc, "A"]);
      return;
    }

    if (remainingVertical) {
      const nextVertical = remainingVertical - 1;
      const nextAcc = [...acc, verticalChar];
      generate(
        nextAcc,
        { ...currentXY, y: currentXY.y + Math.sign(vertical) },
        nextVertical,
        remainingHorizontal
      );
    }

    if (remainingHorizontal) {
      const nextHorizontal = remainingHorizontal - 1;
      const nextAcc = [...acc, horizontalChar];
      generate(
        nextAcc,
        { ...currentXY, x: currentXY.x + Math.sign(horizontal) },
        remainingVertical,
        nextHorizontal
      );
    }
  };

  generate([], from, verticalAbs, horizontalAbs);

  return codes;
};

const getCountDirectionalKeyPad = (
  from: KeyPadButton,
  to: KeyPadButton,
  depth: number
): number => {
  const key = fromToDirectionalKey(from, to, depth);

  if (countDirectionKeyPads.has(key)) return countDirectionKeyPads.get(key)!;

  // We need to compute it.
  const fromXY = directionalKeyPadButtonPositionMap.get(from)!;
  const toXY = directionalKeyPadButtonPositionMap.get(to)!;
  const possibleCodes = generateKeyPadCodes(
    fromXY,
    toXY,
    directionalKeyPadButtonPositionMap.get(null)!
  );
  const lengths = possibleCodes.map((code) => {
    if (!depth) return code.length;
    return getCountDirectionalKeyPadCode(code, depth - 1);
  });
  const count = Math.min(...lengths);

  countDirectionKeyPads.set(key, count);
  return count;
};

const getCountDirectionalKeyPadCode = (
  code: KeyPadCode,
  depth: number
): number => {
  let count = 0;
  let from: KeyPadButton = "A";
  for (const to of code) {
    count += getCountDirectionalKeyPad(from, to, depth);
    from = to;
  }

  return count;
};

/**
 * Gives the number of presses needed to click on a button starting from another
 * one.
 */
const getCountNumericKeyPad = (from: Digit, to: Digit): number => {
  const key = fromToNumericKey(from, to);

  if (countNumericKeyPad.has(key)) return countNumericKeyPad.get(key)!;

  // We need to compute it.
  const fromXY = numericPadButtonPositionMap.get(from)!;
  const toXY = numericPadButtonPositionMap.get(to)!;
  const possibleCodes = generateKeyPadCodes(
    fromXY,
    toXY,
    numericPadButtonPositionMap.get(null)!
  );
  const count = Math.min(
    ...possibleCodes.map((code) =>
      getCountDirectionalKeyPadCode(code, numberOfDirectionalKeyPads - 1)
    )
  );

  countNumericKeyPad.set(key, count);
  return count;
};

/** Returns the count of presses needed to enter a code. */
const getCountFromCode = (code: NumericCode): number => {
  let count = 0;
  let from: Digit = "A";
  for (const to of code) {
    count += getCountNumericKeyPad(from, to);
    from = to;
  }

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
console.log(result); // 251508572750680

// Correct answers for example inputs:
// 154115708116294
// lengths:
// 82050061710
// 72242026390
// 81251039228
// 80786362258
// 77985628636
