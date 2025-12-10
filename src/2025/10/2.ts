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

const input: Machine[] = textInput
  .trim()
  .split("\n")
  .map((line) => {
    const [a, b] = line.split(" {");
    const buttons = a
      .split("] ")[1]
      .split(" ")
      .map((block) => {
        return block
          .substring(1, block.length - 1)
          .split(",")
          .map(Number);
      });
    const joltage = b
      .substring(0, b.length - 1)
      .split(",")
      .map(Number);

    return { joltage, buttons };
  });

type MachineState = Machine & {
  state: number[];
};

const isStateValid = (state: MachineState): boolean =>
  state.state.every((joltage, index) => joltage <= state.joltage[index]);

const isStateFinal = (state: MachineState): boolean =>
  state.state.every((joltage, index) => joltage === state.joltage[index]);

const states: MachineState[] = input.map((machine) => ({
  ...machine,
  state: Array(machine.joltage.length).fill(0),
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
      console.log("Final state reached:", stateKey);
      cache.set(stateKey, 0);
      return 0;
    }
    if (!isStateValid(machineState)) {
      return Infinity;
    }

    const newStates: MachineState[] = machineState.buttons.map((button) => {
      const newState = structuredClone(machineState);
      for (const lightIndex of button) {
        newState.state[lightIndex]++;
      }
      return newState;
    });

    const pressesCounts =
      1 + Math.min(...newStates.map(findFewestPressesRecursive));

    cache.set(stateKey, pressesCounts);
    return pressesCounts;
  };

  return findFewestPressesRecursive(machine);
};

const results = states.map((machine, index) => {
  console.log(`Processing machine ${index + 1}/${states.length}`);
  return findFewestPresses(machine);
});

const result = results.reduce((a, b) => a + b, 0);

console.log("Result:", result);
