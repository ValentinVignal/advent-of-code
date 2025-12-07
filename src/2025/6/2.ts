import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

const textInputCharMatrix = textInput.split("\n").map((line) => line.split(""));

console.log(textInputCharMatrix.length, textInputCharMatrix[0].length);

const textInputCharTransposedMatrix = textInputCharMatrix[0].map(
  (_, colIndex) => textInputCharMatrix.map((row) => row[colIndex])
);
type Operator = "+" | "*";

type Problem = {
  operands: number[];
  operator: Operator;
};

const problems: Problem[] = textInputCharTransposedMatrix
  .map((line) => {
    const joined = line.join("");

    if (!joined.trim()) {
      return "";
    }
    return joined;
  })
  .join("\n")
  .split("\n\n")
  .map((block) => {
    const lines = block.split("\n");
    const operator = lines[0][lines[0].length - 1] as Operator;
    const operandsStringsMatrix = lines.map((line) =>
      line.slice(0, -1).split("")
    );
    const operandsStrings = operandsStringsMatrix.map((chars) =>
      chars.join("").trim()
    );
    return {
      operands: operandsStrings.map(Number),
      operator,
    };
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

const result = problems.map(solveProblem).reduce((acc, curr) => acc + curr, 0);

console.log(result); // 9876636978528
