import { readFileSync } from "fs";
import * as path from "path";

// cspell:ignore Joltage

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Bank = number[];

const banks: Bank[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    return line.split("").map(Number);
  });

const findLargestPossibleJoltage = (bank: Bank): number => {
  const maxDigit = Math.max(...bank);
  const indexMaxDigit = bank.indexOf(maxDigit);
  if (indexMaxDigit === bank.length - 1) {
    const secondMaxDigit = Math.max(...bank.slice(0, indexMaxDigit));
    return 10 * secondMaxDigit + maxDigit;
  } else {
    const maxSecondDigit = Math.max(...bank.slice(indexMaxDigit + 1));
    return 10 * maxDigit + maxSecondDigit;
  }
};

const result = banks.reduce((acc, bank) => {
  const bankResult = findLargestPossibleJoltage(bank);
  return acc + bankResult;
}, 0);

console.log("Result:", result); // 17158
