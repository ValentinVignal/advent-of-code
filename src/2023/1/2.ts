import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const lines = textInput.split("\n").filter(Boolean);

const possibleNNumbers = [
  ...Array.from({ length: 10 }, (_, index) => index.toString()),
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

const reversePossibleNNumbers = possibleNNumbers.map((n) => n.split("").reverse().join(""));

const stringToNumber = (string: string): number => {
  if (!Number.isNaN(parseInt(string))) {
    return parseInt(string);
  }

  return possibleNNumbers.indexOf(string) - 9;
};

const sum = lines.reduce((acc, line) => {
  const indexes = possibleNNumbers
    .map((n) => line.indexOf(n))
    .map((index) => (index !== -1 ? index : Infinity));
  const minIndex = Math.min(...indexes);
  const firstNumberString = possibleNNumbers[indexes.indexOf(minIndex)];

  const reversedLine = line.split("").reverse().join("");
  const reversedIndexes = reversePossibleNNumbers
    .map((n) => reversedLine.indexOf(n))
    .map((index) => (index !== -1 ? index : Infinity));
  const reversedMinIndex = Math.min(...reversedIndexes);
  const secondNumberString =
    possibleNNumbers[reversedIndexes.indexOf(reversedMinIndex)];
  const n =
    stringToNumber(firstNumberString) * 10 + stringToNumber(secondNumberString);

  return acc + n;
}, 0);

// 49667 < 50141 < x
console.log(sum); // 54591
