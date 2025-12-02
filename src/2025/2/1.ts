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
    if (idStr.length % 2) {
      continue;
    }

    const mid = idStr.length / 2;
    const firstHalf = idStr.slice(0, mid);
    const secondHalf = idStr.slice(mid);
    if (firstHalf === secondHalf) {
      sumInvalidIDs += id;
    }
  }
}

console.log("Result:", sumInvalidIDs); // 5398419778
