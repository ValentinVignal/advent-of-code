import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  min: number;
  max: number;
};

const [rangeText] = textInput.split("\n\n");

const ranges = rangeText.split("\n").map((line) => {
  const [minStr, maxStr] = line.split("-");
  return {
    min: parseInt(minStr, 10),
    max: parseInt(maxStr, 10),
  } as Range;
});

type Ranges = Range[];

let orderedRanges: Ranges = [];

for (let [index, newRange] of ranges.entries()) {
  console.log(`Processing range ${index + 1} of ${ranges.length}`);
  const newRanges: Ranges = [];
  if (!orderedRanges.length) {
    orderedRanges = [newRange];
    continue;
  }
  let inserted = false;
  inner: for (const [index, range] of orderedRanges.entries()) {
    if (range.max < newRange.min) {
      newRanges.push(range);
    } else if (range.min > newRange.max) {
      newRanges.push(newRange, range, ...orderedRanges.slice(index + 1));
      inserted = true;
      break inner;
    } else {
      // They overlap.

      if (newRange.max <= range.max) {
        // The existing range extends beyond the new range.
        newRanges.push({
          min: Math.min(newRange.min, range.min),
          max: range.max,
        });
        inserted = true;
        newRanges.push(...orderedRanges.slice(index + 1));
        break inner;
      } else {
        // The new range extends beyond the existing range.
        newRanges.push({
          min: Math.min(newRange.min, range.min),
          max: range.max,
        });
        newRange = {
          min: range.max + 1,
          max: newRange.max,
        };
        continue inner;
      }
    }
  }

  if (!inserted) {
    newRanges.push(newRange);
  }

  orderedRanges = newRanges;
}

const result = orderedRanges.reduce((acc, range) => {
  return acc + (range.max - range.min + 1);
}, 0);

// 208506469950249 < x
console.log(result); // 344486348901788
