import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  min: number;
  max: number;
};

const [rangeText, idsText] = textInput.split("\n\n");

const ranges = rangeText.split("\n").map((line) => {
  const [minStr, maxStr] = line.split("-");
  return {
    min: parseInt(minStr, 10),
    max: parseInt(maxStr, 10),
  } as Range;
});

const ids = idsText.split("\n").map((line) => parseInt(line, 10));

const validIds = ids.filter((id) => {
  return ranges.some((range) => id >= range.min && id <= range.max);
});

const result = validIds.length;

console.log(result); // 739
