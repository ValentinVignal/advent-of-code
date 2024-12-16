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
  visited: Set<string>;
};

const xyToString = (state: XY) => `${state.x},${state.y}`;

const stateToString = (state: State) =>
  `${xyToString(state)}-${state.direction}`;

const queue: State[] = [
  {
    ...start,
    direction: Direction.Right,
    score: 0,
    visited: new Set([xyToString(start)]),
  },
];

let bestScore = Infinity;

let bestStates: State[] = [];

const bestScorePerTile = new Map<string, number>();

let i = 0;

while (queue.length) {
  i++;
  if (i % 10000 === 0) {
    console.log("i", i, "queue", queue.length, "bestScore", bestScore);
  }
  const state = queue.shift()!;

  if (state.score > bestScore) {
    continue;
  }

  const localBestScore = bestScorePerTile.get(stateToString(state)) ?? Infinity;
  if (localBestScore < state.score) {
    continue;
  } else if (localBestScore > state.score) {
    bestScorePerTile.set(stateToString(state), state.score);
  }

  const moveForwardXY = {
    x: state.x + [0, 1, 0, -1][state.direction],
    y: state.y + [-1, 0, 1, 0][state.direction],
  };

  const moveForwardNextStep = {
    ...structuredClone(state),
    ...moveForwardXY,
    score: state.score + 1,
    visited: new Set([...state.visited, xyToString(moveForwardXY)]),
  };

  let newStates = [
    {
      ...structuredClone(state),
      direction: (state.direction + 1) % 4,
      score: state.score + 1000,
    },
    {
      ...structuredClone(state),
      direction: (state.direction + 3) % 4,
      score: state.score + 1000,
    },
  ];

  const moveForwardStepTile = map[moveForwardNextStep.y][moveForwardNextStep.x];
  if (
    moveForwardStepTile === "." &&
    !state.visited.has(xyToString(moveForwardNextStep))
  ) {
    newStates.push(moveForwardNextStep);
  } else if (moveForwardStepTile === "E") {
    if (bestScore < moveForwardNextStep.score) {
      continue;
    } else if (bestScore === moveForwardNextStep.score) {
      bestStates.push(moveForwardNextStep);
    } else {
      bestScore = moveForwardNextStep.score;
      bestStates = [moveForwardNextStep];
    }
  }

  queue.push(...newStates.filter((state) => state.score <= bestScore));
  queue.sort((a, b) => a.score - b.score);
}

const result = new Set(
  bestStates.map((state) => [...state.visited.values()]).flat()
).size;

console.log(result); // 435
