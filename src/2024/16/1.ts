import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, `input.txt`), "utf-8");

type Tile = "." | "S" | "E" | "#";

const map = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as Tile[]);

type XY = {
  x: number;
  y: number;
};

let start!: XY;

outer: for (let y = 0; y < map.length; y++) {
  for (let x = 0; x < map[y].length; x++) {
    if (map[y][x] === "S") {
      start = { x, y };
      break outer;
    }
  }
}

enum Direction {
  Up,
  Right,
  Down,
  Left,
}

type State = XY & {
  direction: Direction;
  score: number;
};

const queue: State[] = [{ ...start, direction: Direction.Right, score: 0 }];

const visited = new Map<string, number>();

const stateToString = (state: State) =>
  `${state.x},${state.y},${state.direction}`;

let bestScore = Infinity;

let i = 0;

while (!Number.isFinite(bestScore)) {
  i++;
  if (i % 10000 === 0) {
    console.log("i", i, "queue", queue.length, "bestScore", bestScore);
  }
  const state = queue.shift()!;

  if (visited.get(stateToString(state)) ?? Infinity <= state.score) {
    continue;
  } else {
    visited.set(stateToString(state), state.score);
  }

  const moveForwardNextStep = {
    ...state,
    x: state.x + [0, 1, 0, -1][state.direction],
    y: state.y + [-1, 0, 1, 0][state.direction],
    score: state.score + 1,
  };

  let newStates = [
    {
      ...state,
      direction: (state.direction + 1) % 4,
      score: state.score + 1000,
    },
    {
      ...state,
      direction: (state.direction + 3) % 4,
      score: state.score + 1000,
    },
  ];

  const moveForwardStepTile = map[moveForwardNextStep.y][moveForwardNextStep.x];
  if (moveForwardStepTile === ".") {
    newStates.push(moveForwardNextStep);
  } else if (moveForwardStepTile === "E") {
    bestScore = moveForwardNextStep.score;
    break;
  }

  newStates = newStates.filter((newState) => {
    if (visited.get(stateToString(newState)) ?? Infinity <= newState.score) {
      return false;
    }
    return true;
  });

  queue.push(...newStates);
  queue.sort((a, b) => a.score - b.score);
}

console.log(bestScore); // 72400
