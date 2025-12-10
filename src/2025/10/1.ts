import { readFileSync } from "fs";
import * as path from "path";

const example = true;
const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

type Button = number[];

type Machine = {
  lights: boolean[];
  buttons: Button[];
};

const input: Machine[] = textInput
  .trim()
  .split("\n")
  .map((line) => {
    const [a, b] = line.split("] ");
    const lights = a
      .substring(1)
      .split("")
      .map((char) => char === "#");

    const buttons = b
      .split(" {")[0]
      .split(" ")
      .map((block) => {
        return block
          .substring(1, block.length - 1)
          .split(",")
          .map(Number);
      });

    return { lights, buttons };
  });

type MachineState = Machine & {
  state: boolean[];
};

const states: MachineState[] = input.map((machine) => ({
  ...machine,
  state: Array(machine.lights.length).fill(false),
}));

const stateToString = (state: MachineState): string => {
  return `${state.lights
    .map((light) => (light ? "#" : "."))
    .join("")}@${state.state
    .map((s) => (s ? "#" : "."))
    .join("")}@${state.buttons.map((buttons) => buttons.join(",")).join("-")}`;
};

const cache = new Map<string, number>();

const findFewestPresses = (machineState: MachineState): number => {
  const stateKey = stateToString(machineState);
  if (cache.has(stateKey)) {
    return cache.get(stateKey)!;
  }

  if (machineState.state.every((s, i) => s === machineState.lights[i])) {
    cache.set(stateKey, 0);
    return 0;
  }

  const newStates: MachineState[] = machineState.buttons.map((button) => {
    const newState = structuredClone(machineState);
    for (const lightIndex of button) {
      newState.state[lightIndex] = !newState.state[lightIndex];
    }
    return newState;
  });

  const pressesCounts = 1 + Math.min(...newStates.map(findFewestPresses));

  cache.set(stateKey, pressesCounts);
  return pressesCounts;
};

const results = states.map(findFewestPresses);

const result = results.reduce((a, b) => a + b, 0);

console.log("Result:", result);
