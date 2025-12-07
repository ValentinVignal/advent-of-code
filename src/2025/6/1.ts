import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const inputMatrix = textInput
  .split("\n")
  .map((line) => line.split(/\s+/).filter(Boolean));
const transposedMatrix = inputMatrix[0].map((_, colIndex) =>
  inputMatrix.map((row) => row[colIndex])
);

type Operator = "+" | "*";

type Problem = {
  operands: number[];
  operator: Operator;
};

const input = transposedMatrix.map((line) => {
  const operator = line[line.length - 1] as Operator;
  const operands = line.slice(0, line.length - 1).map(Number);
  return { operands, operator } as Problem;
});

function solveProblem(problem: Problem): number {
  const { operands, operator } = problem;
  if (operator === "+") {
    return operands.reduce((acc, curr) => acc + curr, 0);
  } else if (operator === "*") {
    return operands.reduce((acc, curr) => acc * curr, 1);
  }
  throw new Error(`Unsupported operator: ${operator}`);
}

const result = input.map(solveProblem).reduce((acc, curr) => acc + curr, 0);

console.log(result); // 5322004718681
