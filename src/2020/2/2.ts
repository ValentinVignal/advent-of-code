import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Position = {
  first: number;
  last: number;
};

type Line = {
  position: Position;
  letter: string;
  password: string;
};

const lines: Line[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [rule, password] = line.split(": ").map((part) => part.trim());
    const [rangePart, letter] = rule.split(" ");
    const [first, last] = rangePart.split("-").map(Number);
    return { position: { first, last }, letter, password };
  });

const isValidPassword = (line: Line): boolean => {
  const firstPositionMatches =
    line.password[line.position.first - 1] === line.letter;
  const lastPositionMatches =
    line.password[line.position.last - 1] === line.letter;
  return (
    (firstPositionMatches || lastPositionMatches) &&
    firstPositionMatches !== lastPositionMatches
  );
};

const validLines = lines.filter(isValidPassword);

// x < 740
console.log("Number of valid passwords:", validLines.length); // 491
