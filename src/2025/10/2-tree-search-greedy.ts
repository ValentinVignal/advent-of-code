import { readFileSync } from "fs";
import * as path from "path";

const example = false;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Button = number[];

type Machine = {
  joltage: number[];
  buttons: Button[];
  buttonMatrix: number[][];
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
    const buttonMatrix = Array.from({ length: buttons.length }, (_, index) => {
      const buttonVector = Array(joltage.length).fill(0);
      const button = buttons[index];
      for (let index = 0; index < joltage.length; index++) {
        if (button.includes(index)) {
          buttonVector[index] = 1;
        }
      }
      return buttonVector;
    });

    return { joltage, buttons, buttonMatrix };
  });

type MachineState = Machine & {
  state: number[];
  presses: number[];
};

type Vector = number[];

const multiplyVectorScalar = (matrix: Vector, scalar: number): Vector => {
  return matrix.map((val) => val * scalar);
};

const addVectors = (a: Vector, b: Vector): Vector => {
  return a.map((val, index) => val + b[index]);
};

const scalarProduct = (a: Vector, b: Vector): number => {
  return a.reduce((sum, val, index) => sum + val * b[index], 0);
};

const isStateValid = (state: MachineState): boolean =>
  state.state.every((joltage, index) => joltage <= state.joltage[index]);

const isStateFinal = (state: MachineState): boolean =>
  state.state.every((joltage, index) => joltage === state.joltage[index]);

const states: MachineState[] = input.map((machine) => ({
  ...machine,
  state: Array(machine.joltage.length).fill(0),
  presses: Array(machine.buttons.length).fill(0),
}));

const stateToString = (state: MachineState): string => {
  return `${state.state.join(",")}`;
};

const findFewestPresses = (machine: MachineState): number => {
  const cache = new Map<string, number>();
  const findFewestPressesRecursive = (machineState: MachineState): number => {
    const stateKey = stateToString(machineState);
    if (cache.has(stateKey)) {
      return cache.get(stateKey)!;
    }

    if (isStateFinal(machineState)) {
      cache.set(stateKey, 0);
      return 0;
    }
    if (!isStateValid(machineState)) {
      return Infinity;
    }

    const remainderVector = addVectors(
      machineState.joltage,
      multiplyVectorScalar(machineState.state, -1)
    );

    const orderedButtons = machineState.buttonMatrix
      .map((button, index) => ({ button, index }))
      .sort((a, b) => {
        return (
          scalarProduct(b.button, remainderVector) -
          scalarProduct(a.button, remainderVector)
        );
      });

    for (const button of orderedButtons) {
      const newState = structuredClone(machineState);
      newState.presses[button.index]++;
      for (const [lightIndex, value] of button.button.entries()) {
        if (value === 1) {
          newState.state[lightIndex]++;
        }
      }
      const result = findFewestPressesRecursive(newState);
      if (isFinite(result)) {
        const pressesCounts = 1 + result;
        cache.set(stateKey, result + 1);
        return pressesCounts;
      }
    }
    cache.set(stateKey, Infinity);
    return Infinity;
  };

  return findFewestPressesRecursive(machine);
};

const results = states.map((state, index) => {
  console.log(`Processing machine ${index + 1} / ${states.length}`);
  return findFewestPresses(state);
});

console.log(results);

const result = results.reduce((a, b) => a + b, 0);

console.log("Result:", result);
