import { readFileSync } from "fs";
import * as path from "path";

const example = true;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Button = number[];

type Machine = {
  joltage: number[];
  buttons: Button[];
};

const scalarProduct = (a: number[], b: number[]): number => {
  return a.reduce((sum, val, index) => sum + val * b[index], 0);
};

const input: Machine[] = textInput
  .trim()
  .split("\n")
  .map((line) => {
    const [a, b] = line.split(" {");
    const joltage = b
      .substring(0, b.length - 1)
      .split(",")
      .map(Number);
    const buttons = a
      .split("] ")[1]
      .split(" ")
      .map((block) => {
        return block
          .substring(1, block.length - 1)
          .split(",")
          .map(Number);
      })
      .sort((a, b) => scalarProduct(b, joltage) - scalarProduct(a, joltage));

    return { joltage, buttons };
  });

type Vector = number[];
type Matrix = number[][];

const addVectors = (a: Vector, b: Vector): Vector => {
  return a.map((val, index) => val + b[index]);
};

const multiplyMatrixVector = (matrix: Matrix, vector: Vector): Vector => {
  return matrix.map((row) => scalarProduct(row, vector));
};

const multiplyVectorScalar = (matrix: Vector, scalar: number): Vector => {
  return matrix.map((val) => val * scalar);
};

const getButtonsMatrix = (machine: Machine): Matrix => {
  const matrix = Array.from({ length: machine.joltage.length }, () =>
    Array(machine.buttons.length).fill(0)
  );

  for (const [buttonIndex, button] of machine.buttons.entries()) {
    for (const joltageIndex of button) {
      matrix[joltageIndex][buttonIndex] = 1;
    }
  }
  return matrix;
};

const norm1Matrix = (matrix: Matrix): number => {
  return matrix.reduce((max, row) => {
    const rowSum = row.reduce((sum, val) => sum + Math.abs(val), 0);
    return Math.max(max, rowSum);
  }, 0);
};

const getDelta = (a: Matrix, r: Vector): Vector => {
  const m = a[0].length;
  const n = a.length;

  const getL1 = (): Vector => {
    const delta: Vector = Array(m).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        delta[j] += a[i][j] * Math.sign(r[i]);
      }
    }

    return delta;
  };

  const getL2 = (): Vector => {
    return Array(m).fill(1);
  };

  const l1 = getL1();
  const l2 = getL2();

  const delta = addVectors(l1, l2);
  return delta;
};

const forcePositiveNumberVector = (vector: Vector): Vector => {
  return vector.map((val) => Math.max(0, val));
};

// const forceIntegerVector = (vector: Vector): Vector => {
//   return vector.map((val) => Math.round(val));
// };

const findButtonCombination = (
  machine: Machine
): { joltage: Vector; presses: Vector } => {
  /** Number of buttons */
  const m = machine.buttons.length;
  /** Number of lights */
  // const n = machine.joltage.length;

  const a = getButtonsMatrix(machine);

  const y = multiplyVectorScalar(machine.joltage, -1);

  let x = Array(m).fill(10);
  let r = addVectors(multiplyMatrixVector(a, x), y);

  let iteration = 0;
  while (norm1Matrix([r]) > 0.0001) {
    iteration++;
    const learningRate = 10 / iteration;
    const delta = getDelta(a, r);

    x = addVectors(x, multiplyVectorScalar(delta, -learningRate));
    r = addVectors(multiplyMatrixVector(a, x), y);
    x = forcePositiveNumberVector(x);
  }
  return { joltage: multiplyMatrixVector(a, x), presses: x };
};

const combinations = input.map(findButtonCombination);
console.log(combinations);

const presses = combinations.map((combination) =>
  combination.presses.reduce((sum, val) => sum + Math.round(val), 0)
);

const result = presses.reduce((sum, val) => sum + Math.round(val), 0);

console.log(result);
