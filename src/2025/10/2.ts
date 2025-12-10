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
  })
  .slice(12, 13);

type MachineState = {
  state: number[];
  presses: number;
};

const isStateValid = (machine: Machine, state: MachineState): boolean =>
  state.state.every((joltage, index) => joltage <= machine.joltage[index]);

const isStateFinal = (machine: Machine, state: MachineState): boolean =>
  state.state.every((joltage, index) => joltage === machine.joltage[index]);

const stateToString = (state: MachineState): string => {
  return `${state.state.join(",")}`;
};

const findFewestPresses = (machine: Machine): number => {
  const queue = [
    {
      state: machine.joltage.map(() => 0),
      presses: 0,
    },
  ];
  const visited = new Set<string>();

  while (queue.length) {
    const current = queue.shift()!;

    const stateKey = stateToString(current);
    if (visited.has(stateKey)) {
      continue;
    }

    visited.add(stateKey);

    if (isStateFinal(machine, current)) {
      return current.presses;
    }

    const newStates: MachineState[] = machine.buttons.map((button) => {
      const newState = structuredClone(current);
      for (const lightIndex of button) {
        newState.state[lightIndex]++;
      }
      newState.presses++;
      return newState;
    });

    for (const newState of newStates) {
      if (isStateValid(machine, newState)) {
        queue.push(newState);
      }
    }
  }
  throw new Error("No solution found");
};

const results = input.map((machine, index) => {
  console.log(`Processing machine ${index + 1}/${input.length}`);
  return findFewestPresses(machine);
});

const result = results.reduce((a, b) => a + b, 0);

console.log("Result:", result);
