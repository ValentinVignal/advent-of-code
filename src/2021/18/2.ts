import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type SnailNumber = [number | SnailNumber, number | SnailNumber];

const numbers: SnailNumber[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line));

const splitNumber = (n: number): [number, number] => {
  return [Math.floor(n / 2), Math.ceil(n / 2)];
};

const arrayEquals = (a: any[], b: any[]): boolean => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

const enableLog = false;

const log = (s: any): void => {
  if (enableLog) console.log(s);
};

const logSnailNumber = (n: SnailNumber | number): void => {
  if (!enableLog) return;
  const getString = (n: SnailNumber | number): string => {
    if (typeof n === "number") return n.toString();
    return `[${getString(n[0])},${getString(n[1])}]`;
  };
  console.log(getString(n));
};

type BooleanDigit = 0 | 1;

const reduce = (n: SnailNumber): void => {
  const getAtLocation = (location: BooleanDigit[]): SnailNumber | number => {
    let current: SnailNumber | number = n;
    for (const digit of location) {
      current = (current as SnailNumber)[digit];
    }
    return current;
  };

  const getParentLocation = (location: BooleanDigit[]): BooleanDigit[] => {
    return location.slice(0, -1);
  };

  const addToPrevious = (location: BooleanDigit[], toAdd: number): void => {
    let previousLocation = [...location].reverse();

    while (previousLocation.length && previousLocation[0] === 0) {
      previousLocation.shift();
    }
    if (!previousLocation.length) return;
    previousLocation[0] = 0;
    previousLocation.reverse();

    let previous = getAtLocation(previousLocation) as SnailNumber | number;
    while (typeof previous !== "number") {
      previousLocation.push(1);
      previous = previous[1];
    }

    if (arrayEquals(previousLocation, location)) {
      previousLocation[previousLocation.length - 1] = 0;
    }

    const parentOfPreviousLocation = getParentLocation(previousLocation);
    if (parentOfPreviousLocation.length) {
      const parentOfPrevious = getAtLocation(
        parentOfPreviousLocation
      ) as SnailNumber;
      parentOfPrevious[previousLocation[previousLocation.length - 1]] =
        previous + toAdd;
    } else {
      // This is the first number;
      n[0] = previous + toAdd;
    }
  };

  const addToNext = (location: BooleanDigit[], toAdd: number): void => {
    let nextLocation = [...location].reverse();

    while (nextLocation.length && nextLocation[0] === 1) {
      nextLocation.shift();
    }
    if (!nextLocation.length) return;
    nextLocation[0] = 1;
    nextLocation.reverse();

    let next = getAtLocation(nextLocation) as SnailNumber | number;
    while (typeof next !== "number") {
      nextLocation.push(0);
      next = next[0];
    }
    if (arrayEquals(nextLocation, location)) {
      nextLocation[nextLocation.length - 1] = 1;
    }

    const parentOfNextLocation = getParentLocation(nextLocation);
    if (parentOfNextLocation.length) {
      const parentOfNext = getAtLocation(parentOfNextLocation) as SnailNumber;
      parentOfNext[nextLocation[nextLocation.length - 1]] = next + toAdd;
    } else {
      // This is the last number;
      n[1] = next + toAdd;
    }
  };

  const explode = (location: BooleanDigit[]): boolean => {
    if (location.length === 4) {
      log("need to explode:");
      logSnailNumber(n);

      const [first, second] = getAtLocation(location) as [number, number];
      log(`Explode [${first},${second}] at ${location.toString()}`);
      const parentLocation = getParentLocation(location);
      (getAtLocation(parentLocation) as SnailNumber)[
        location[location.length - 1]
      ] = 0;
      addToPrevious(location, first);
      addToNext(location, second);
      log("after explode:");
      logSnailNumber(n);
      return true;
    } else {
      const current = getAtLocation(location) as SnailNumber;
      if (typeof current[0] !== "number") {
        if (explode([...location, 0])) {
          return true;
        }
      }
      if (typeof current[1] !== "number") {
        return explode([...location, 1]);
      }
      return false;
    }
  };

  const split = (n: SnailNumber): boolean => {
    if (typeof n[0] === "number" && n[0] >= 10) {
      n[0] = splitNumber(n[0]);
      return true;
    } else if (typeof n[0] !== "number" && split(n[0])) {
      return true;
    } else if (typeof n[1] === "number" && n[1] >= 10) {
      n[1] = splitNumber(n[1]);
      return true;
    } else if (typeof n[1] !== "number" && split(n[1])) {
      return true;
    }
    return false;
  };

  let hasChanged = true;
  while (hasChanged) {
    if (explode([])) {
      hasChanged = true;
    } else {
      const before = structuredClone(n);
      if (split(n)) {
        log("need to split:");
        logSnailNumber(before);
        log("After split:");
        logSnailNumber(n);
        hasChanged = true;
      } else {
        hasChanged = false;
      }
    }
  }
};

const add = (a: SnailNumber, b: SnailNumber): SnailNumber => {
  let n = structuredClone([a, b] as SnailNumber);
  reduce(n);
  return n;
};

const getMagnitude = (n: SnailNumber | number): number => {
  if (typeof n === "number") return n;
  return 3 * getMagnitude(n[0]) + 2 * getMagnitude(n[1]);
};

let max = 0;

for (const numberA of numbers) {
  for (const numberB of numbers) {
    const result = add(numberA, numberB);
    const magnitude = getMagnitude(result);
    max = Math.max(max, magnitude);
  }
}

// 3979 < 4005 < 4505 < x < 4613
console.log(max); // 4583
