import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Char = "." | "#";

type Pattern = Char[][];

const patterns = textInput
  .split("\n\n")
  .filter(Boolean)
  .map((patternText) => {
    return patternText
      .split("\n")
      .filter(Boolean)
      .map((line) => line.split("").filter(Boolean) as Char[]);
  });

const arrayEquals = <T>(a: T[], b: T[]): boolean => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

const hasRowMirror = (pattern: Pattern, index: number): boolean => {
  const maxDx = Math.min(index + 1, pattern.length - index - 1);

  return Array.from({ length: maxDx }, (_, i) => i).every((i) => {
    return arrayEquals(pattern[index - i], pattern[index + 1 + i]);
  });
};

const hasColumnMirror = (pattern: Pattern, index: number): boolean => {
  const maxDx = Math.min(index + 1, pattern[0].length - index - 1);

  return Array.from({ length: maxDx }, (_, i) => i).every((i) => {
    return arrayEquals(
      pattern.map((line) => line[index - i]),
      pattern.map((line) => line[index + 1 + i])
    );
  });
};

const values = patterns.map((pattern) => {
  let res = 0;

  for (let index = 0; index < pattern[0].length - 1; index++) {
    if (hasColumnMirror(pattern, index)) {
      res += index + 1;
    }
  }
  for (let index = 0; index < pattern.length - 1; index++) {
    if (hasRowMirror(pattern, index)) {
      res += 100 * (index + 1);
    }
  }
  return res;
});

const result = values.reduce((acc, value) => acc + value, 0);

console.log(result); // 26957
