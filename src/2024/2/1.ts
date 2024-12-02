import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const reports = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split(" ").map(Number);
  });

const safeReports = reports.filter((report) => {
  let diff: number | null = null;
  for (let i = 1; i < report.length; i++) {
    const newDiff = report[i] - report[i - 1];
    diff ??= newDiff;
    if (Math.sign(diff) !== Math.sign(newDiff)) {
      return false;
    }
    const absDiff = Math.abs(newDiff);
    if (absDiff < 1 || absDiff > 3) {
      return false;
    }
  }
  return true;
});

const result = safeReports.length;

// x != 334
console.log(result); // 287
