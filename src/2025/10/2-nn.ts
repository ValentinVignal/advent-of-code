import { readFileSync } from "fs";
import * as path from "path";

// https://en.wikipedia.org/wiki/Integer_programming
// https://en.wikipedia.org/wiki/Diophantine_equation
// https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm
// https://en.wikipedia.org/wiki/Gaussian_elimination
// https://en.wikipedia.org/wiki/Branch_and_bound

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

const forcePositiveNumberVector = (vector: Vector): Vector => {
  return vector.map((val) => Math.max(0, val));
};

const findButtonCombination = (
  machine: Machine
): { joltage: Vector; presses: Vector } => {
  /** Number of buttons */
  const n = machine.buttons.length;
  /** Number of lights */
  // const n = machine.joltage.length;

  const a = getButtonsMatrix(machine);

  let x = Array(n).fill(0);
  const y = multiplyVectorScalar(machine.joltage, -1);
  let r = addVectors(multiplyMatrixVector(a, x), y);

  /** Returns the total loss */
  const getLoss = (): number => {
    /** The norm 2 loss that measures the squared error */
    const getL2 = (): number => {
      return scalarProduct(r, r);
    };

    /** The "positive" loss that penalizes negative values */
    const getLp = () => {
      return x.reduce((sum, val) => {
        if (val > 0) {
          return sum;
        }
        return sum + Math.exp(-val) - 1;
      }, 0);
    };

    /** The "natural" loss that encourages integer values */
    const getLn = () => {
      return x.reduce((sum, val) => {
        const round = Math.round(val);
        const sign = Math.sign(val - round);
        const value = 1 / (Math.abs(val - round + sign * 0.5) + 0.0001);
        return sum + value;
      }, 0);
    };
    return getL2() + getLp() + getLn();
  };

  const getDelta = (): Vector => {
    const getDeltaL2 = (): Vector => {
      const delta: Vector = Array(n).fill(0);

      for (let i = 0; i < machine.joltage.length; i++) {
        for (let j = 0; j < n; j++) {
          delta[j] += 2 * a[i][j] * r[i];
        }
      }

      return delta;
    };

    const getDeltaLp = (): Vector => {
      const delta: Vector = Array(n).fill(0);

      for (let j = 0; j < n; j++) {
        if (x[j] >= 0) {
          delta[j] += 0;
        } else {
          delta[j] += -Math.exp(-x[j]);
        }
      }
      return delta;
    };

    const getDeltaLn = (): Vector => {
      const delta: Vector = Array(n).fill(0);

      for (let j = 0; j < n; j++) {
        const round = Math.round(x[j]);
        const sign = Math.sign(x[j] - round);
        const denom = Math.abs(x[j] - round + sign * 0.5) + 0.0001;
        delta[j] += -sign / (denom * denom);
      }
      return delta;
    };

    const deltaL2 = getDeltaL2();
    const deltaLp = getDeltaLp();
    const deltaLn = getDeltaLn();

    const delta = addVectors(addVectors(deltaL2, deltaLp), deltaLn);
    return delta;
  };

  let iteration = 0;
  while (getLoss() > 0.0001) {
    iteration++;
    if (!(iteration % 10000)) {
      console.log("Iteration:", iteration, "Loss:", getLoss());
    }
    const learningRate = 0.01 * (100 / (100 + iteration));
    const delta = getDelta();

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
