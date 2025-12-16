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

enum Direction {
  East,
  South,
  West,
  North,
}

type State = Position & {
  direction: Direction;
};

let state: State = { x: 0, y: 0, direction: Direction.East };

const runInstruction = (instruction: Instruction): void => {
  const newState = structuredClone(state);
  switch (instruction.action) {
    case Action.North:
      newState.y += instruction.value;
      break;
    case Action.South:
      newState.y -= instruction.value;
      break;
    case Action.East:
      newState.x += instruction.value;
      break;
    case Action.West:
      newState.x -= instruction.value;
      break;
    case Action.Left:
      newState.direction =
        (newState.direction + (3 * instruction.value) / 90) % 4;
      break;
    case Action.Right:
      newState.direction = (newState.direction + instruction.value / 90) % 4;
      break;
    case Action.Forward:
      switch (state.direction) {
        case Direction.North:
          newState.y += instruction.value;
          break;
        case Direction.South:
          newState.y -= instruction.value;
          break;
        case Direction.East:
          newState.x += instruction.value;
          break;
        case Direction.West:
          newState.x -= instruction.value;
          break;
      }
      break;
  }
  state = newState;
};

for (const instruction of instructions) {
  runInstruction(instruction);
}

const result = Math.abs(state.x) + Math.abs(state.y);

// x < 1462 < 3909
// x != 736
console.log(result); // 1106
