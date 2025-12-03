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
  const digits: number[] = [];

  let previousIndex = -1;
  for (let digitPosition = 0; digitPosition < 12; digitPosition++) {
    const possibleDigits = bank.slice(
      previousIndex + 1,
      bank.length - 12 + digitPosition + 1
    );
    const digit = Math.max(...possibleDigits);
    digits.push(digit);
    previousIndex = previousIndex + 1 + possibleDigits.indexOf(digit);
  }

  return digits.reduce(
    (acc, value, index) => acc + value * 10 ** (11 - index),
    0
  );
};

const result = banks.reduce((acc, bank) => {
  const bankResult = findLargestPossibleJoltage(bank);
  return acc + bankResult;
}, 0);

console.log("Result:", result); // 170449335646486
