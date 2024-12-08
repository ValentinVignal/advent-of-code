import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type Equation = {
  result: number;
  equation: number[];
};

const input: Equation[] = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => {
    const [resultText, equationText] = line.split(": ");
    const result = parseInt(resultText);
    const equation = equationText
      .split(" ")
      .filter(Boolean)
      .map((n) => parseInt(n));
    return { result, equation };
  });

enum Operator {
  plus,
  multiply,
  concatenation,
}

const canBeTrue = (equation: Equation): boolean => {
  const canBeTrueRec = (acc: number, remaining: number[]): boolean => {
    if (acc > equation.result) return false;
    if (!remaining.length) {
      return acc - 1 < equation.result && acc + 1 > equation.result;
    }
    const [nextNumber, ...nextRemaining] = remaining;
    for (const operator of [
      Operator.plus,
      Operator.multiply,
      Operator.concatenation,
    ]) {
      let nextAcc: number;
      switch (operator) {
        case Operator.plus:
          nextAcc = acc + nextNumber;
          break;
        case Operator.multiply:
          nextAcc = acc * nextNumber;
          break;
        case Operator.concatenation:
          nextAcc = parseInt(acc.toString() + nextNumber.toString());
          break;
      }
      if (canBeTrueRec(nextAcc, nextRemaining)) {
        return true;
      }
    }
    return false;
  };

  const [firstNumber, ...remaining] = equation.equation;
  return canBeTrueRec(firstNumber, remaining);
};

const trues = input.filter(canBeTrue);

const result = trues.reduce((acc, { result }) => acc + result, 0);

// x != 340362531521793
console.log(result); // 340362529351427
