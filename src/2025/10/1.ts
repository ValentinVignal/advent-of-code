import { readFileSync } from "fs";
import * as path from "path";

const example = false;
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

type MachineState = {
  state: boolean[];
  presses: number;
  tapped: number[];
};

const findFewestPresses = (machine: Machine): number => {
  let min = Infinity;
  const queue: MachineState[] = [
    { state: machine.lights.map(() => false), presses: 0, tapped: [] },
  ];

  const seen = new Set<string>();

  while (queue.length) {
    const current = queue.shift()!;

    if (seen.has(current.tapped.join(","))) {
      continue;
    }

    if (current.presses >= min) {
      continue;
    }

    if (
      current.state.every((light, index) => light === machine.lights[index])
    ) {
      min = Math.min(min, current.presses);
      continue;
    }

    for (const [buttonIndex, button] of machine.buttons.entries()) {
      if (current.tapped.includes(buttonIndex)) {
        continue;
      }
      const newState = {
        presses: current.presses + 1,
        state: current.state.map((light, i) =>
          button.includes(i) ? !light : light
        ),
        tapped: [...current.tapped, buttonIndex].sort((a, b) => a - b),
      };
      queue.push(newState);
    }
    seen.add(current.tapped.join(","));
  }
  return min;
};

const results = input.map((machine) => {
  return findFewestPresses(machine);
});

const result = results.reduce((a, b) => a + b, 0);

console.log("Result:", result); // 415
