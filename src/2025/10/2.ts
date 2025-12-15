import { readFileSync } from "fs";
import * as path from "path";

// https://en.wikipedia.org/wiki/Linear_least_squares

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
      });

    return { joltage, buttons };
  });

type Vector = number[];
type Matrix = number[][];

// const addVectors = (a: Vector, b: Vector): Vector => {
//   return a.map((val, index) => val + b[index]);
// };

const multiplyMatrixVector = (matrix: Matrix, vector: Vector): Vector => {
  return matrix.map((row) => scalarProduct(row, vector));
};

// const multiplyVectorScalar = (matrix: Vector, scalar: number): Vector => {
//   return matrix.map((val) => val * scalar);
// };

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

// const norm1Matrix = (matrix: Matrix): number => {
//   return matrix.reduce((max, row) => {
//     const rowSum = row.reduce((sum, val) => sum + Math.abs(val), 0);
//     return Math.max(max, rowSum);
//   }, 0);
// };

// const getDelta = (a: Matrix, r: Vector): Vector => {
//   const m = a[0].length;
//   const n = a.length;

//   const getL1 = (): Vector => {
//     const delta: Vector = Array(m).fill(0);

//     for (let i = 0; i < n; i++) {
//       for (let j = 0; j < m; j++) {
//         delta[j] += a[i][j] * Math.sign(r[i]);
//       }
//     }

//     return delta;
//   };

//   const getL2 = (): Vector => {
//     return Array(m).fill(1);
//   };

//   const l1 = getL1();
//   const l2 = getL2();

//   const delta = addVectors(l1, l2);
//   return delta;
// };

// const forcePositiveNumberVector = (vector: Vector): Vector => {
//   return vector.map((val) => Math.max(0, val));
// };

const invertSquareMatrix = (matrix: Matrix): Matrix => {
  const n = matrix.length;
  const identity: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );

  const augmented: Matrix = matrix.map((row, i) => [...row, ...identity[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    const pivot = augmented[i][i];
    if (pivot === 0) {
      throw new Error("Matrix is singular and cannot be inverted.");
    }
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  const inverse: Matrix = augmented.map((row) => row.slice(n));
  return inverse;
};

const transposeMatrix = (matrix: Matrix): Matrix => {
  const transposed: Matrix = Array.from({ length: matrix[0].length }, () =>
    Array(matrix.length).fill(0)
  );

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }

  return transposed;
};

const multiplyMatrixMatrix = (a: Matrix, b: Matrix): Matrix => {
  const result: Matrix = Array.from({ length: a.length }, () =>
    Array(b[0].length).fill(0)
  );

  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < a[0].length; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
};

const findButtonCombination = (machine: Machine): Vector => {
  const A = getButtonsMatrix(machine);
  const AT = transposeMatrix(A);
  const B = multiplyMatrixMatrix(AT, A);
  const BInv = invertSquareMatrix(B);
  const pseudoInverse = multiplyMatrixMatrix(BInv, AT);

  let presses: Vector = multiplyMatrixVector(pseudoInverse, machine.joltage);
  return presses;
};

const combinations = input.map(findButtonCombination);
console.log(combinations);

const presses = combinations.map((combination) =>
  combination.reduce((sum, val) => sum + Math.round(val), 0)
);

const result = presses.reduce((sum, val) => sum + Math.round(val), 0);

console.log(result);
