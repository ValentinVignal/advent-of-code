import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

const input = textInput.split("\n").map(Number);

const ordered = [...input].sort((a, b) => a - b);

const deviceJoltage = ordered[ordered.length - 1] + 3;
const orderedExtended = [0, ...ordered, deviceJoltage];

const cache = new Map<number, number>();

const countCombinations = (index: number): number => {
  if (cache.has(index)) {
    return cache.get(index)!;
  }

  if (index === orderedExtended.length - 1) {
    return 1;
  }

  const possibleNextRelativeIndexes = orderedExtended
    .slice(index + 1)
    .filter((value) => value <= orderedExtended[index] + 3);

  const subCombinations = possibleNextRelativeIndexes.map(
    (_, relativeIndex) => {
      return countCombinations(index + relativeIndex + 1);
    }
  );
  const totalCombinations = subCombinations.reduce((a, b) => a + b, 0);

  cache.set(index, totalCombinations);
  return totalCombinations;
};

const combinationCount = countCombinations(0);

console.log(combinationCount); // 49607173328384
