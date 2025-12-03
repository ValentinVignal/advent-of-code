import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Range = {
  min: number;
  max: number;
};

type Line = {
  range: Range;
  letter: string;
  password: string;
};

const lines: Line[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [rule, password] = line.split(": ").map((part) => part.trim());
    const [rangePart, letter] = rule.split(" ");
    const [min, max] = rangePart.split("-").map(Number);
    return { range: { min, max }, letter, password };
  });

const isValidPassword = (line: Line): boolean => {
  const countInPassword = line.password
    .split("")
    .filter((char) => char === line.letter).length;
  return countInPassword >= line.range.min && countInPassword <= line.range.max;
};

const validLines = lines.filter(isValidPassword);

console.log("Number of valid passwords:", validLines.length); // 445
