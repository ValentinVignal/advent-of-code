import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const reports = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split(" ").map(Number);
  });

const isSafe = (report: number[], canRemove: boolean): boolean => {
  let diff: number | null = null;
  for (let i = 1; i < report.length; i++) {
    const newDiff = report[i] - report[i - 1];
    diff ??= newDiff;
    let stillSafe = true;
    if (Math.sign(diff) !== Math.sign(newDiff)) {
      stillSafe = false;
    }
    const absDiff = Math.abs(newDiff);
    if (absDiff < 1 || absDiff > 3) {
      stillSafe = false;
    }
    if (stillSafe) continue;
    if (!canRemove) return false;
    const newReport0 = [...report];
    newReport0.splice(i - 1, 1);
    const newReport1 = [...report];
    newReport1.splice(i, 1);
    stillSafe = isSafe(newReport0, false) || isSafe(newReport1, false);
    if (stillSafe) return true;
    const newReport = report.slice(1);
    return isSafe(newReport, false);
  }
  return true;
};

const safeReports = reports.filter((report) => {
  return isSafe(report, true);
});

const result = safeReports.length;

// x != 348
console.log(result); // 354
