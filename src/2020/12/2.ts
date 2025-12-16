import { readFileSync } from "fs";
import * as path from "path";

const example = false;

const textInput = readFileSync(
  path.join(__dirname, `input${example ? "-example" : ""}.txt`),
  "utf-8"
);

enum Action {
  North = "N",
  South = "S",
  East = "E",
  West = "W",
  Left = "L",
  Right = "R",
  Forward = "F",
}

type Instruction = {
  action: Action;
  value: number;
};

const instructions: Instruction[] = textInput.split("\n").map((line) => {
  const action = line[0] as Action;
  const value = parseInt(line.substring(1));
  return { action, value };
});

type Position = {
  x: number;
  y: number;
};

type State = {
  boat: Position;
  waypoint: Position;
};

let state: State = { boat: { x: 0, y: 0 }, waypoint: { x: 10, y: 1 } };

const runInstruction = (instruction: Instruction): void => {
  const newState = structuredClone(state);
  switch (instruction.action) {
    case Action.North:
      newState.waypoint.y += instruction.value;
      break;
    case Action.South:
      newState.waypoint.y -= instruction.value;
      break;
    case Action.East:
      newState.waypoint.x += instruction.value;
      break;
    case Action.West:
      newState.waypoint.x -= instruction.value;
      break;
    case Action.Left:
      for (let i = 0; i < (instruction.value / 90) % 4; i++) {
        const tempX = newState.waypoint.x;
        newState.waypoint.x = -newState.waypoint.y;
        newState.waypoint.y = tempX;
      }
      break;
    case Action.Right:
      for (let i = 0; i < (instruction.value / 90) % 4; i++) {
        const tempX = newState.waypoint.x;
        newState.waypoint.x = newState.waypoint.y;
        newState.waypoint.y = -tempX;
      }
      break;
    case Action.Forward:
      newState.boat.x += instruction.value * state.waypoint.x;
      newState.boat.y += instruction.value * state.waypoint.y;
      break;
  }
  state = newState;
};

for (const instruction of instructions) {
  runInstruction(instruction);
}

const result = Math.abs(state.boat.x) + Math.abs(state.boat.y);

// 9727 < 18713 < x
console.log(result); // 107281
