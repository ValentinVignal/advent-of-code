import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Equation = {
  result: number;
  equation: number[];
};

const input: Equation[] = textInput.split("\n").map((line) => {
  const [resultText, equationText] = line.split(": ");
  const result = parseInt(resultText);
  const equation = equationText.split(" ").map((n) => parseInt(n));
  return { result, equation };
});

enum Operator {
  plus,
  multiply,
}

const canBeTrue = (equation: Equation): boolean => {
  const canBeTrueRec = (acc: number, remaining: number[]): boolean => {
    if (acc > equation.result) return false;
    if (!remaining.length) return acc === equation.result;
    for (const operator of [Operator.plus, Operator.multiply]) {
      const [nextNumber, ...nextRemaining] = remaining;
      const nextAcc =
        operator === Operator.plus ? acc + nextNumber : acc * nextNumber;
      if (canBeTrueRec(nextAcc, nextRemaining)) {
        return true;
      }
    }
    return false;
  };

  return canBeTrueRec(0, equation.equation);
};

const result = input
  .filter(canBeTrue)
  .reduce((acc, { result }) => acc + result, 0);

console.log(result); // 3598800864292
