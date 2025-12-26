import { readFileSync } from "fs";
import * as path from "path";

// https://en.wikipedia.org/wiki/Linear_least_squares
// https://fr.wikipedia.org/wiki/%C3%89limination_de_Gauss-Jordan

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Button = number[];

type Machine = {
  joltage: number[];
  buttons: Button[];
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

const gaussJordanElimination = (augmentedMatrix: Matrix): Matrix => {
  const matrix = augmentedMatrix.map((row) => [...row]); // Deep copy
  const rowCount = matrix.length;
  const colCount = matrix[0].length - 1; // Exclude augmented column

  let currentRow = 0;

  for (let col = 0; col < colCount && currentRow < rowCount; col++) {
    // Find pivot row for this column
    let pivotRow = currentRow;
    let maxVal = Math.abs(matrix[currentRow][col]);

    for (let row = currentRow + 1; row < rowCount; row++) {
      const val = Math.abs(matrix[row][col]);
      if (val > maxVal) {
        maxVal = val;
        pivotRow = row;
      }
    }

    // If column is all zeros, skip to next column
    if (maxVal < 1e-10) {
      continue;
    }

    // Swap rows if needed
    if (pivotRow !== currentRow) {
      [matrix[currentRow], matrix[pivotRow]] = [
        matrix[pivotRow],
        matrix[currentRow],
      ];
    }

    // Scale pivot row to make leading coefficient 1
    const pivotValue = matrix[currentRow][col];
    for (let c = 0; c < matrix[currentRow].length; c++) {
      matrix[currentRow][c] /= pivotValue;
    }

    // Eliminate this column in all other rows
    for (let row = 0; row < rowCount; row++) {
      if (row !== currentRow) {
        const factor = matrix[row][col];
        for (let c = 0; c < matrix[row].length; c++) {
          matrix[row][c] -= factor * matrix[currentRow][c];
        }
      }
    }

    currentRow++;
  }

  return matrix;
};

const findButtonCombination = (machine: Machine): Vector => {
  // const maxJoltage = Math.max(...machine.joltage);
  const A = getButtonsMatrix(machine);
  const augmentedMatrix: Matrix = A.map((row, index) => [
    ...row,
    machine.joltage[index],
  ]);

  const reducedMatrix = gaussJordanElimination(augmentedMatrix);

  // Identify pivot columns (basic variables) and free variables
  const pivotColumns: number[] = [];
  const freeVariables: number[] = [];

  for (let row = 0; row < reducedMatrix.length; row++) {
    for (let col = 0; col < machine.buttons.length; col++) {
      if (reducedMatrix[row][col] === 1) {
        // Check if this is a leading 1 (all previous entries in row are 0)
        const isLeadingOne = reducedMatrix[row]
          .slice(0, col)
          .every((v) => Math.abs(v) < 1e-10);
        if (isLeadingOne) {
          pivotColumns.push(col);
          break;
        }
      }
    }
  }

  // Free variables are non-pivot columns
  for (let col = 0; col < machine.buttons.length; col++) {
    if (!pivotColumns.includes(col)) {
      freeVariables.push(col);
    }
  }

  // If no free variables, just read the solution
  if (freeVariables.length === 0) {
    const presses: Vector = Array(machine.buttons.length).fill(0);
    for (let row = 0; row < reducedMatrix.length; row++) {
      const pivotCol = pivotColumns[row];
      if (pivotCol !== undefined) {
        presses[pivotCol] = reducedMatrix[row][reducedMatrix[row].length - 1];
      }
    }
    return presses;
  }

  // Enumerate free variable values to find minimum
  const maxJoltage = Math.max(...machine.joltage);

  let bestSolution: Vector | null = null;
  let bestTotal = Infinity;

  // Generate all combinations of free variable values
  const generateCombinations = (
    index: number,
    currentValues: Map<number, number>
  ) => {
    if (index === freeVariables.length) {
      // Calculate basic variables from free variables
      const presses: Vector = Array(machine.buttons.length).fill(0);

      // Set free variables
      for (const [col, value] of currentValues) {
        presses[col] = value;
      }

      // Calculate basic variables
      for (let row = 0; row < reducedMatrix.length; row++) {
        const pivotCol = pivotColumns[row];
        if (pivotCol === undefined) continue;

        let value = reducedMatrix[row][reducedMatrix[row].length - 1]; // RHS

        // Subtract contributions from free variables
        for (let col = 0; col < machine.buttons.length; col++) {
          if (freeVariables.includes(col)) {
            value -= reducedMatrix[row][col] * presses[col];
          }
        }

        presses[pivotCol] = value;
      }

      // Check if all values are non-negative integers
      const isValid = presses.every(
        (v) => v >= -1e-10 && Math.abs(v - Math.round(v)) < 1e-10
      );

      if (isValid) {
        const total = presses.reduce((sum, v) => sum + Math.round(v), 0);
        if (total < bestTotal) {
          bestTotal = total;
          bestSolution = presses.map((v) => Math.round(v));
        }
      }

      return;
    }

    const freeVar = freeVariables[index];
    for (let value = 0; value <= maxJoltage; value++) {
      currentValues.set(freeVar, value);
      generateCombinations(index + 1, currentValues);
      currentValues.delete(freeVar);
    }
  };

  generateCombinations(0, new Map());

  if (bestSolution === null) {
    console.error("Failed for machine:", machine);
    console.error("Reduced matrix:");
    reducedMatrix.forEach((row, i) => {
      console.error(`Row ${i}:`, row.map((v) => v.toFixed(2)).join(" "));
    });
    console.error("Pivot columns:", pivotColumns);
    console.error("Free variables:", freeVariables);
    console.error("Max joltage used as bound:", maxJoltage);

    // Try manually with a specific free variable value
    console.error("\nTrying free variable = 0:");
    const testPresses: Vector = Array(machine.buttons.length).fill(0);
    for (let row = 0; row < reducedMatrix.length; row++) {
      const pivotCol = pivotColumns[row];
      if (pivotCol !== undefined) {
        testPresses[pivotCol] =
          reducedMatrix[row][reducedMatrix[row].length - 1];
      }
    }
    console.error("Result:", testPresses);
    console.error(
      "Valid?",
      testPresses.every((v) => v >= 0)
    );
  }

  return bestSolution!;
};

const combinations = input.map((value, index) => {
  console.log(`Processing machine ${index + 1} / ${input.length}`);
  return findButtonCombination(value);
});

const presses = combinations.map((combination) =>
  combination.reduce((sum, val) => sum + val, 0)
);

const result = presses.reduce((sum, val) => sum + Math.round(val), 0);

console.log(result); // 16663
