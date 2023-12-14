import { readFileSync } from "fs";
import * as path from "path";

const textInput = readFileSync(path.join(__dirname, "input.txt"), "utf-8");

type State = "." | "#" | "O";

type Platform = State[][];

const platform = textInput
  .split("\n")
  .filter(Boolean)
  .map((line) => line.split("").filter(Boolean) as State[]);

let tiltedPlatform = platform;

type Position = { x: number; y: number };

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

const cycle = (platform: Platform): Platform => {
  const isValidPosition = (position: Position): boolean => {
    return (
      position.x >= 0 &&
      position.x < platform[0].length &&
      position.y >= 0 &&
      position.y < platform.length
    );
  };

  let tiltedPlatform = platform;
  for (const direction of [
    Direction.Up,
    Direction.Left,
    Direction.Down,
    Direction.Right,
  ]) {
    const newTiltedPlatform = Array.from({ length: platform.length }, () =>
      Array(platform[0].length).fill(".")
    );
    const getNextPosition = (position: Position): Position => {
      return {
        x:
          position.x +
          (direction === Direction.Left
            ? -1
            : direction === Direction.Right
              ? 1
              : 0),
        y:
          position.y +
          (direction === Direction.Up
            ? -1
            : direction === Direction.Down
              ? 1
              : 0),
      };
    };

    for (let dy = 0; dy < platform.length; dy++) {
      const y = direction === Direction.Down ? platform.length - dy - 1 : dy;
      for (let dx = 0; dx < platform[0].length; dx++) {
        const x =
          direction === Direction.Right ? platform[0].length - dx - 1 : dx;
        const state = tiltedPlatform[y][x];
        if (state === ".") continue;
        if (state === "#") {
          newTiltedPlatform[y][x] = state;
          continue;
        }
        let position = { x, y };
        let nextPosition = getNextPosition(position);

        while (
          isValidPosition(nextPosition) &&
          newTiltedPlatform[nextPosition.y][nextPosition.x] === "."
        ) {
          position = nextPosition;
          nextPosition = getNextPosition(position);
        }
        newTiltedPlatform[position.y][position.x] = "O";
      }
    }
    tiltedPlatform = newTiltedPlatform;
  }
  return tiltedPlatform;
};

type PLatformWithLoad = { platform: Platform; load: number };

const getLoad = (platform: Platform): number => {
  return platform
    .map((row, index, array) => {
      return (
        row.filter((state) => state === "O").length * (array.length - index)
      );
    })
    .reduce((a, b) => a + b, 0);
};

const states: PLatformWithLoad[] = [
  {
    platform,
    load: getLoad(platform),
  },
];

const cycleNumber = 1000000000;

const smallerCycleNumber = 1000;

for (let c = 0; c < smallerCycleNumber; c++) {
  tiltedPlatform = cycle(tiltedPlatform);
  states.push({
    platform: tiltedPlatform,
    load: getLoad(tiltedPlatform),
  });
}

// Find the period.

let periodLength = 1;

const verifyPeriod = (): boolean => {
  for (let repeat = 0; repeat < 3; repeat++) {
    for (let i = 0; i < periodLength; i++) {
      if (
        states[states.length - periodLength * repeat - 1 - i].load !==
        states[states.length - 1 - i].load
      ) {
        return false;
      }
    }
  }
  return true;
};

while (!verifyPeriod()) {
  periodLength++;
}

const period = states.slice(-periodLength);

const index = (cycleNumber - smallerCycleNumber - 1) % periodLength;

const result = period[index].load;

console.log(result); // 94876
