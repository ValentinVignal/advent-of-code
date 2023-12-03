import { readFileSync } from "fs";
import * as path from "path";
import { sum } from "../../utils/array";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
const numbers = new Set<Digit>(
  Array.from(Array(10).keys()).map((n) => n.toString() as Digit)
);

const engine = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => [...line.split("").filter(Boolean), "."]);

const isAdjacent = (line: number, column: number): boolean => {
  for (const dx of [-1, 0, 1]) {
    for (const dy of [-1, 0, 1]) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      const char = engine[line + dy]?.[column + dx];
      if (char && !numbers.has(char as Digit) && char !== ".") {
        return true;
      }
    }
  }
  return false;
};

type LineAcc = {
  currentNumber: number;
  sum: number;
  isAdjacent: boolean;
};

const result = sum(
  engine.map((line, lineIndex) => {
    return line.reduce<LineAcc>(
      (acc, char, columnIndex) => {
        const newAcc = { ...acc };
        if (numbers.has(char as Digit)) {
          newAcc.isAdjacent =
            newAcc.isAdjacent || isAdjacent(lineIndex, columnIndex);
          newAcc.currentNumber = newAcc.currentNumber * 10 + parseInt(char);
        } else {
          if (newAcc.isAdjacent) {
            newAcc.sum += newAcc.currentNumber;
          }
          if (char === ".") {
            newAcc.isAdjacent = false;
          }
          newAcc.currentNumber = 0;
        }
        return newAcc;
      },
      { currentNumber: 0, sum: 0, isAdjacent: false }
    ).sum;
  })
);

// 511086 < x < 515767 < 585700
console.log(result); // 512794
