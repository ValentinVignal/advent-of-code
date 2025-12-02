import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  start: number;
  end: number;
};

const ranges: Range[] = textInput.split(",").map((rangeText) => {
  const [startStr, endStr] = rangeText.split("-");
  return {
    start: parseInt(startStr, 10),
    end: parseInt(endStr, 10),
  };
});

let sumInvalidIDs = 0;

for (const range of ranges) {
  for (let id = range.start; id <= range.end; id++) {
    const idStr = id.toString();
    if (idStr.length === 1) {
      continue;
    }

    for (let patternLength = 1; patternLength < idStr.length; patternLength++) {
      if (
        Math.floor(idStr.length / patternLength) * patternLength !==
        idStr.length
      ) {
        continue;
      }

      const patterns: string[] = [];
      for (let i = 0; i < idStr.length; i += patternLength) {
        patterns.push(idStr.slice(i, i + patternLength));
      }

      const allEqual = patterns.every((pattern) => pattern === patterns[0]);
      if (allEqual) {
        sumInvalidIDs += id;
        break;
      }
    }
  }
}

console.log("Result:", sumInvalidIDs); // 15704845910
